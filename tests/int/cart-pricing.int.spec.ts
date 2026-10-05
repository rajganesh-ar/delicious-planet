// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import type { Product } from '../../src/payload-types'
import { priceCart } from '../../src/lib/cart-pricing'

/**
 * `priceCart` is the only thing standing between a POST from a browser and the
 * amount Stripe is asked to charge. Everything it rejects is money it stops
 * someone taking, so the rejections matter more here than the happy path.
 */

/** Minimal product stub — only the fields `priceCart` actually reads. */
function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Oscietra Caviar',
    slug: 'oscietra-caviar',
    _status: 'published',
    variants: [
      { id: 'v1', sku: 'CAV-30', size: '30g', price: 145, inStock: true },
      { id: 'v2', sku: 'CAV-125', size: '125g', price: 520, inStock: true },
      { id: 'v3', sku: 'CAV-OOS', size: '1kg', price: 3600, inStock: false },
    ],
    images: [],
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as unknown as Product
}

/** A Payload double exposing just the `findByID` that `priceCart` calls. */
function fakePayload(byId: Record<number, Product | null>): Payload {
  return {
    findByID: vi.fn(async ({ id }: { id: number }) => {
      const doc = byId[id]
      if (!doc) throw new Error('not found')
      return doc
    }),
  } as unknown as Payload
}

describe('priceCart', () => {
  it('prices from the product record, not from anything the caller sends', async () => {
    // The line carries no price at all — this is the property that stops a
    // crafted request buying a 520 AED tin for 0.01.
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: 'CAV-125', quantity: 2 },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.lines[0].unitAmount).toBe(520)
    expect(result.subtotal).toBe(1040)
    expect(result.currency).toBe('AED')
  })

  it('prices each variant separately rather than off the product', async () => {
    // The regression this guards: pricing off the product charged the 30g
    // amount for a 125g tin, because both lines shared one product id.
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: 'CAV-30', quantity: 1 },
      { productId: 1, variantSku: 'CAV-125', quantity: 1 },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.lines).toHaveLength(2)
    expect(result.lines.map((l) => l.unitAmount).sort((a, b) => a - b)).toEqual([145, 520])
    expect(result.subtotal).toBe(665)
  })

  it('merges a repeated line so the quantity cap cannot be split past', async () => {
    // Sending 60 + 60 as two lines must not slip through as two legal 60s.
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: 'CAV-30', quantity: 60 },
      { productId: 1, variantSku: 'CAV-30', quantity: 60 },
    ])

    expect(result.ok).toBe(false)
  })

  it('merges a repeated line when the total stays legal', async () => {
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: 'CAV-30', quantity: 2 },
      { productId: 1, variantSku: 'CAV-30', quantity: 3 },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0].quantity).toBe(5)
    expect(result.subtotal).toBe(725)
  })

  it('rejects an empty cart', async () => {
    expect((await priceCart(fakePayload({}), [])).ok).toBe(false)
  })

  it('rejects a line with no variant chosen', async () => {
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: '', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects a variant that does not belong to the product', async () => {
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: 'NOT-A-SKU', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects an out-of-stock variant', async () => {
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: 'CAV-OOS', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects a product that is not published', async () => {
    const result = await priceCart(fakePayload({ 1: product({ _status: 'draft' }) }), [
      { productId: 1, variantSku: 'CAV-30', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects a product that no longer exists', async () => {
    const result = await priceCart(fakePayload({}), [
      { productId: 99, variantSku: 'CAV-30', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it.each([
    ['zero', 0],
    ['negative', -3],
    ['fractional', 1.5],
    ['over the per-line cap', 100],
  ])('rejects a %s quantity', async (_label, quantity) => {
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId: 1, variantSku: 'CAV-30', quantity },
    ])
    expect(result.ok).toBe(false)
  })

  it.each([
    ['non-integer', 1.5],
    ['zero', 0],
    ['negative', -1],
  ])('rejects a %s product id', async (_label, productId) => {
    const result = await priceCart(fakePayload({ 1: product() }), [
      { productId, variantSku: 'CAV-30', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects a cart with too many distinct lines', async () => {
    const lines = Array.from({ length: 51 }, (_, i) => ({
      productId: 1,
      variantSku: `SKU-${i}`,
      quantity: 1,
    }))
    expect((await priceCart(fakePayload({ 1: product() }), lines)).ok).toBe(false)
  })

  it('rejects a variant with no price rather than charging zero', async () => {
    const unpriced = product({
      variants: [{ id: 'v1', sku: 'CAV-30', size: '30g', inStock: true }],
    } as unknown as Partial<Product>)

    const result = await priceCart(fakePayload({ 1: unpriced }), [
      { productId: 1, variantSku: 'CAV-30', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects a variant priced at zero', async () => {
    const free = product({
      variants: [{ id: 'v1', sku: 'CAV-30', size: '30g', price: 0, inStock: true }],
    } as unknown as Partial<Product>)

    const result = await priceCart(fakePayload({ 1: free }), [
      { productId: 1, variantSku: 'CAV-30', quantity: 1 },
    ])
    expect(result.ok).toBe(false)
  })

  it('rounds the subtotal so float drift cannot desync it from the Stripe total', async () => {
    const odd = product({
      variants: [{ id: 'v1', sku: 'ODD', size: '10g', price: 0.1, inStock: true }],
    } as unknown as Partial<Product>)

    const result = await priceCart(fakePayload({ 1: odd }), [
      { productId: 1, variantSku: 'ODD', quantity: 3 },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    // 0.1 * 3 is 0.30000000000000004 in IEEE 754.
    expect(result.subtotal).toBe(0.3)
  })
})
