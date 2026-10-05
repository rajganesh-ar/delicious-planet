// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import { NotFound, type Payload } from 'payload'
import {
  cancelIfAbandoned,
  failIfUnpaid,
  markOrderPaid,
  orderIdFromMetadata,
  refundTransition,
  transitionOrder,
} from '../../src/lib/orders'

/**
 * The Stripe webhook and the post-checkout confirmation route both call
 * `markOrderPaid`, and on a normal purchase they race. These tests pin the
 * properties that make that safe: the second caller must change nothing, and
 * an order that has already been refunded must never come back as paid.
 */

/** Shape of the single `payload.update` argument the assertions below read back. */
interface UpdateArgs {
  collection: string
  id: number
  overrideAccess?: boolean
  req?: { transactionID?: string }
  context?: Record<string, unknown>
  data: Record<string, unknown>
}

/**
 * Just enough of the Postgres adapter for withOrderLock: a transaction id, a
 * session whose `execute` records the lock statement, and commit/rollback.
 */
function fakeDb() {
  const calls: string[] = []
  const execute = vi.fn(async () => {
    calls.push('lock')
    return { rows: [] }
  })
  return {
    calls,
    execute,
    beginTransaction: vi.fn(async () => {
      calls.push('begin')
      return 'tx1'
    }),
    commitTransaction: vi.fn(async () => {
      calls.push('commit')
    }),
    rollbackTransaction: vi.fn(async () => {
      calls.push('rollback')
    }),
    sessions: { tx1: { db: { execute } } },
  }
}

type FakeOrder = { paymentStatus: string; status: string }

function fakePayload(orders: Record<number, FakeOrder | null>, opts: { findError?: Error } = {}) {
  const db = fakeDb()
  // Typed through its parameter so `update.mock.calls[0][0]` is an UpdateArgs
  // rather than the empty tuple an argument-less `vi.fn` infers.
  const update = vi.fn(async (_args: UpdateArgs) => {
    db.calls.push('update')
    return {}
  })
  const findByID = vi.fn(async ({ id }: { id: number; req?: { transactionID?: string } }) => {
    db.calls.push('read')
    if (opts.findError) throw opts.findError
    const doc = orders[id]
    if (!doc) throw new NotFound()
    // Enough of a real order for the confirmation emails to render. These
    // tests are about the payment transition, not the message — see
    // order-email.int.spec.ts for that — but markOrderPaid notifies on its way
    // through, and a half-built double would fail there instead.
    return {
      id,
      orderNumber: `DP-TEST-${id}`,
      currency: 'AED',
      items: [],
      totals: { subtotal: 0, total: 0 },
      ...doc,
    }
  })
  const payload = {
    db,
    findByID,
    update,
    findGlobal: vi.fn(async () => ({})),
    sendEmail: vi.fn(async () => undefined),
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  } as unknown as Payload
  return { payload, update, findByID, db }
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

  it('accepts a retry after a declined card', async () => {
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'failed', status: 'pending' } })

    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('updated')
    expect(update).toHaveBeenCalledOnce()
  })

  it('does nothing when the order is already paid', async () => {
    // This is what makes the webhook/confirm race safe, and what stops a
    // redelivered Stripe event resetting an order that has since shipped.
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'paid', status: 'shipped' } })

    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('already-paid')
    expect(update).not.toHaveBeenCalled()
  })

  it('never revives a refunded order', async () => {
    // Stripe still reports a refunded session as `paid`, so reloading the
    // success page, or a redelivered `checkout.session.completed`, looks
    // exactly like a fresh payment. It used to put the order back under
    // "To fulfil" and re-send both confirmation emails.
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'refunded', status: 'refunded' } })

    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('not-payable')
    expect(update).not.toHaveBeenCalled()
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })

  it('leaves an invoiced trade order to staff', async () => {
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'invoice', status: 'processing' } })

    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('not-payable')
    expect(update).not.toHaveBeenCalled()
  })

  it('reports a missing order rather than throwing', async () => {
    const { payload, update } = fakePayload({})

    expect(await markOrderPaid(payload, 404, 'pi_123')).toBe('missing')
    expect(update).not.toHaveBeenCalled()
  })

  it('rethrows a database error so Stripe retries, and rolls back', async () => {
    // A dropped connection used to be reported as "missing", which the webhook
    // answered with 200 — so Stripe never retried and a charged order stayed
    // unpaid.
    const { payload, db } = fakePayload({}, { findError: new Error('connection reset') })

    await expect(markOrderPaid(payload, 7, 'pi_123')).rejects.toThrow('connection reset')
    expect(db.calls).toEqual(['begin', 'lock', 'read', 'rollback'])
  })

  it('locks the order row before reading it, and emails only after commit', async () => {
    const { payload, db, findByID, update } = fakePayload({
      7: { paymentStatus: 'unpaid', status: 'pending' },
    })

    await markOrderPaid(payload, 7, 'pi_123')

    // The final read is the confirmation email loading the order — after the
    // commit, so it can never describe a payment that was rolled back.
    expect(db.calls).toEqual(['begin', 'lock', 'read', 'update', 'commit', 'read'])
    // The read and the write join the locked transaction rather than opening
    // their own — otherwise the lock protects nothing.
    expect(findByID.mock.calls[0][0].req).toEqual({ transactionID: 'tx1' })
    expect(update.mock.calls[0][0].req).toEqual({ transactionID: 'tx1' })
    expect(payload.sendEmail).toHaveBeenCalled()
  })

  it('omits the payment intent when there is none to record', async () => {
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'unpaid', status: 'pending' } })

    await markOrderPaid(payload, 7, null)

    // Writing null would blank a value the webhook may already have set.
    expect(update.mock.calls[0][0].data).not.toHaveProperty('stripePaymentIntentId')
  })
})

describe('transitionOrder', () => {
  it('skips the write when the decision is null', async () => {
    const { payload, update, db } = fakePayload({ 7: { paymentStatus: 'paid', status: 'processing' } })

    expect(await transitionOrder(payload, 7, failIfUnpaid)).toBe('skipped')
    expect(update).not.toHaveBeenCalled()
    expect(db.calls.at(-1)).toBe('commit')
  })

  it('treats an event for a deleted order as handled', async () => {
    // Throwing here made the webhook answer 500, and Stripe retried an event
    // that could never succeed for three days.
    const { payload } = fakePayload({})

    expect(await transitionOrder(payload, 404, failIfUnpaid)).toBe('missing')
  })

  it('passes the decision through, context included', async () => {
    const { payload, update } = fakePayload({ 7: { paymentStatus: 'paid', status: 'processing' } })

    await transitionOrder(payload, 7, () => refundTransition(false, 'AED 20.00 of AED 300.00'))

    expect(update.mock.calls[0][0]).toMatchObject({
      data: {},
      context: { timelineEvent: { event: 'Partial refund', note: 'AED 20.00 of AED 300.00' } },
    })
  })
})

describe('Stripe event decisions', () => {
  it('cancels an abandoned checkout, including one with a declined card', () => {
    expect(cancelIfAbandoned({ status: 'pending', paymentStatus: 'unpaid' })?.data).toEqual({
      status: 'cancelled',
      paymentStatus: 'failed',
    })
    expect(cancelIfAbandoned({ status: 'pending', paymentStatus: 'failed' })).not.toBeNull()
  })

  it('does not cancel an order paid another way before the session expired', () => {
    expect(cancelIfAbandoned({ status: 'processing', paymentStatus: 'paid' })).toBeNull()
    expect(cancelIfAbandoned({ status: 'pending', paymentStatus: 'invoice' })).toBeNull()
  })

  it('ignores a late decline for an order that has since been paid', () => {
    expect(failIfUnpaid({ paymentStatus: 'paid' })).toBeNull()
    expect(failIfUnpaid({ paymentStatus: 'unpaid' })?.data).toEqual({ paymentStatus: 'failed' })
  })

  it('closes the order only on a full refund', () => {
    expect(refundTransition(true, '').data).toEqual({ status: 'refunded', paymentStatus: 'refunded' })
    expect(refundTransition(false, 'AED 20.00 of AED 300.00').data).toEqual({})
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
