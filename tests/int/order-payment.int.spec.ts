// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { markOrderPaid, orderIdFromMetadata } from '../../src/lib/orders'

/**
 * The Stripe webhook and the post-checkout confirmation route both call
 * `markOrderPaid`, and on a normal purchase they race. These tests pin the
 * property that makes that safe: the second caller must change nothing.
 */

/** Shape of the single `payload.update` argument the assertions below read back. */
interface UpdateArgs {
  collection: string
  id: number
  overrideAccess?: boolean
  data: Record<string, unknown>
}

function fakePayload(orders: Record<number, { paymentStatus: string; status: string } | null>) {
  // Typed through its parameter so `update.mock.calls[0][0]` is an UpdateArgs
  // rather than the empty tuple an argument-less `vi.fn` infers.
  const update = vi.fn(async (_args: UpdateArgs) => ({}))
  const payload = {
    findByID: vi.fn(async ({ id }: { id: number }) => {
      const doc = orders[id]
      if (!doc) throw new Error('not found')
      return { id, ...doc }
    }),
    update,
  } as unknown as Payload
  return { payload, update }
}

describe('markOrderPaid', () => {
  it('marks an unpaid order paid and moves it to processing', async () => {
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'unpaid', status: 'pending' } })

    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('updated')
    expect(update).toHaveBeenCalledOnce()
    expect(update.mock.calls[0][0]).toMatchObject({
      collection: 'orders',
      id: 7,
      data: { status: 'processing', paymentStatus: 'paid', stripePaymentIntentId: 'pi_123' },
    })
  })

  it('does nothing when the order is already paid', async () => {
    // This is what makes the webhook/confirm race safe, and what stops a
    // redelivered Stripe event resetting an order that has since shipped.
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'paid', status: 'shipped' } })

    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('already-paid')
    expect(update).not.toHaveBeenCalled()
  })

  it('reports a missing order rather than throwing', async () => {
    const { payload, update } = fakePayload({})

    expect(await markOrderPaid(payload, 404, 'pi_123')).toBe('missing')
    expect(update).not.toHaveBeenCalled()
  })

  it('omits the payment intent when there is none to record', async () => {
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'unpaid', status: 'pending' } })

    await markOrderPaid(payload, 7, null)

    // Writing null would blank a value the webhook may already have set.
    expect(update.mock.calls[0][0].data).not.toHaveProperty('stripePaymentIntentId')
  })
})

describe('orderIdFromMetadata', () => {
  it('reads a positive integer id', () => {
    expect(orderIdFromMetadata({ orderId: '42' })).toBe(42)
  })

  it.each([
    ['missing metadata', undefined],
    ['no orderId', {}],
    ['a non-numeric id', { orderId: 'abc' }],
    ['zero', { orderId: '0' }],
    ['a negative id', { orderId: '-1' }],
    ['a fractional id', { orderId: '1.5' }],
    ['an empty string', { orderId: '' }],
  ])('rejects %s', (_label, meta) => {
    expect(orderIdFromMetadata(meta as Record<string, string> | undefined)).toBeNull()
  })
})
