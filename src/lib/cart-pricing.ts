import type { Payload } from 'payload'
import type { Product } from '@/payload-types'

export interface CartLineInput {
  productId: number
  quantity: number
}

export interface PricedLine {
  productId: number
  title: string
  imageUrl?: string
  quantity: number
  unitAmount: number
  currency: string
}

export type PricingResult =
  | { ok: true; lines: PricedLine[]; currency: string; subtotal: number }
  | { ok: false; error: string }

const MAX_LINES = 50
const MAX_QTY_PER_LINE = 99

/** Mirrors getPrice() on the storefront: products carry several currencies, the first is canonical. */
function canonicalPrice(product: Product): { amount: number; currency: string } | null {
  const price = product.prices?.[0]
  if (!price || typeof price.amount !== 'number' || !price.currency) return null
  return { amount: price.amount, currency: price.currency }
}

function firstImageUrl(product: Product): string | undefined {
  const image = product.images?.[0]?.image
  if (typeof image === 'object' && image !== null) {
    return image.sizes?.card?.url ?? image.url ?? undefined
  }
  return undefined
}

/**
 * Re-prices a cart from the product records.
 *
 * The browser tells us *what* is being bought, never *what it costs* — otherwise
 * anyone can POST an order for a 650 AED gift set at 0.01. Every amount that
 * reaches Stripe or the order record comes from here.
 */
export async function priceCart(
  payload: Payload,
  input: CartLineInput[],
): Promise<PricingResult> {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: 'Your cart is empty.' }
  }
  if (input.length > MAX_LINES) {
    return { ok: false, error: 'That is too many different items for a single order.' }
  }

  // Collapse duplicates so a repeated product can't slip past the per-line quantity cap.
  const merged = new Map<number, number>()
  for (const line of input) {
    const id = Number(line?.productId)
    const qty = Number(line?.quantity)
    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, error: 'Your cart contains an unrecognised product.' }
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ok: false, error: 'Please choose a quantity between 1 and 99 for each item.' }
    }
    merged.set(id, (merged.get(id) ?? 0) + qty)
  }

  const lines: PricedLine[] = []
  let currency: string | null = null

  for (const [productId, quantity] of merged) {
    if (quantity > MAX_QTY_PER_LINE) {
      return { ok: false, error: 'Please choose a quantity between 1 and 99 for each item.' }
    }

    let product: Product | null = null
    try {
      product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 1,
        overrideAccess: true,
      })
    } catch {
      product = null
    }

    if (!product || product._status !== 'published') {
      return { ok: false, error: 'One of the items in your cart is no longer available.' }
    }
    if (!product.inStock) {
      return { ok: false, error: `"${product.title}" is out of stock.` }
    }

    const price = canonicalPrice(product)
    if (!price) {
      return { ok: false, error: `"${product.title}" is not currently priced for online purchase.` }
    }

    if (currency === null) {
      currency = price.currency
    } else if (currency !== price.currency) {
      // A single Stripe session bills one currency; mixing them would misprice the order.
      return { ok: false, error: 'Your cart mixes currencies. Please order these items separately.' }
    }

    lines.push({
      productId,
      title: product.title,
      imageUrl: firstImageUrl(product),
      quantity,
      unitAmount: price.amount,
      currency: price.currency,
    })
  }

  if (!currency || lines.length === 0) {
    return { ok: false, error: 'Your cart is empty.' }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0)
  // Guard against float drift accumulating into a mismatch with the Stripe total.
  return { ok: true, lines, currency, subtotal: Math.round(subtotal * 100) / 100 }
}
