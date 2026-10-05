import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { NotFound, type Payload, type PayloadRequest } from 'payload'
import type { Order } from '@/payload-types'
import { notifyOrderPaid } from './email/notify'

/**
 * The payment states an order may move to `paid` from.
 *
 * Deliberately a short allow-list rather than "anything but paid". Stripe keeps
 * reporting a Checkout session as `paid` after it has been refunded, so a
 * reloaded success page or a redelivered `checkout.session.completed` arrives
 * for a refunded order looking exactly like a fresh payment. Treating that as
 * payable put refunded orders back under "To fulfil" and re-sent both emails.
 * `invoice` is excluded too: a trade order on terms is settled by staff, not by
 * a card session.
 */
const PAYABLE_FROM = new Set(['unpaid', 'failed'])

export type MarkOrderPaidResult = 'updated' | 'already-paid' | 'not-payable' | 'missing'

/**
 * Runs `fn` inside a transaction that holds a row lock on the order.
 *
 * The webhook and the confirmation route call markOrderPaid within milliseconds
 * of each other on most purchases. Without a lock both read `unpaid`, both
 * write, and the buyer and the shop each get two confirmations. `SELECT … FOR
 * UPDATE` makes the second caller wait for the first to commit, so it then
 * reads `paid` and backs off. The update itself still goes through Payload,
 * with this transaction's `req`, so the order hooks (timeline, fulfilment
 * dates) run as normal.
 *
 * An adapter without transactions (none in this project, but Payload allows
 * it) runs `fn` unlocked rather than failing.
 */
async function withOrderLock<T>(
  payload: Payload,
  orderId: number,
  fn: (req: Partial<PayloadRequest>) => Promise<T>,
): Promise<T> {
  const db = payload.db as unknown as PostgresAdapter
  const transactionID = typeof db.beginTransaction === 'function' ? await db.beginTransaction() : null
  if (!transactionID) return fn({})

  try {
    await db.sessions[transactionID].db.execute(
      sql`SELECT "id" FROM "orders" WHERE "id" = ${orderId} FOR UPDATE`,
    )
    const result = await fn({ transactionID })
    await db.commitTransaction(transactionID)
    return result
  } catch (err) {
    await db.rollbackTransaction(transactionID)
    throw err
  }
}

/**
 * Marks an order paid.
 *
 * Shared by the Stripe webhook and the post-checkout confirmation route, which
 * race each other by design: the webhook is authoritative and handles the
 * asynchronous cases (a delayed bank debit, a browser closed on the Stripe
 * page), while the confirmation route covers the overwhelmingly common one
 * where the shopper lands back on the site first. Whichever arrives first wins
 * and the other becomes a no-op — see withOrderLock for why that holds even
 * when they arrive together.
 *
 * Only an order that is still waiting for its money moves. Skipping everything
 * else keeps a later manual status change (`shipped`, `refunded`) from being
 * stamped back to `processing` by a redelivered event.
 */
export async function markOrderPaid(
  payload: Payload,
  orderId: number,
  paymentIntentId: string | null,
): Promise<MarkOrderPaidResult> {
  const result = await withOrderLock(payload, orderId, async (req) => {
    let current
    try {
      current = await payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
        overrideAccess: true,
        req,
      })
    } catch (err) {
      // Only a genuinely absent order is "missing". Anything else — a dropped
      // connection, a pool timeout — must surface, so the webhook answers 500
      // and Stripe retries instead of recording the event as handled.
      if (err instanceof NotFound) return 'missing' as const
      throw err
    }

    if (!current) return 'missing' as const
    if (current.paymentStatus === 'paid') return 'already-paid' as const
    if (!PAYABLE_FROM.has(current.paymentStatus)) return 'not-payable' as const

    await payload.update({
      collection: 'orders',
      id: orderId,
      overrideAccess: true,
      req,
      data: {
        status: 'processing',
        paymentStatus: 'paid',
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
      },
    })

    return 'updated' as const
  })

  // Sent after the transaction has committed, and only by the caller that made
  // the change — the lock turns the loser of the webhook/redirect race into
  // `already-paid`, which is what makes the confirmation exactly-once.
  //
  // Awaited rather than left floating: on a serverless host the function can be
  // frozen the moment the handler returns, which would drop an in-flight send.
  // notifyOrderPaid never rejects, so this cannot turn a paid order into a 500.
  if (result === 'updated') await notifyOrderPaid(payload, orderId)

  return result
}

export interface OrderTransition {
  data: Partial<Order>
  /** Passed to the order hooks, e.g. `{ timelineEvent }` to log an event that changes no field. */
  context?: Record<string, unknown>
}

/**
 * Applies a Stripe-driven change only if it still fits the order's current state.
 *
 * Stripe delivers events out of order and retries them for days, so "the
 * session expired" or "a payment attempt failed" can land after the order was
 * paid by another attempt, by another method, or by hand. `decide` sees the
 * order as it is now, under the same row lock markOrderPaid takes, and returns
 * the change to make or null to leave it alone.
 *
 * A deleted order is reported as `missing` rather than thrown: an event for an
 * order that no longer exists can never succeed, and throwing would make Stripe
 * retry it for three days.
 */
export async function transitionOrder(
  payload: Payload,
  orderId: number,
  decide: (current: Order) => OrderTransition | null,
): Promise<'updated' | 'skipped' | 'missing'> {
  return withOrderLock(payload, orderId, async (req) => {
    let current: Order
    try {
      current = await payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
        overrideAccess: true,
        req,
      })
    } catch (err) {
      if (err instanceof NotFound) return 'missing' as const
      throw err
    }

    const change = decide(current)
    if (!change) return 'skipped' as const

    await payload.update({
      collection: 'orders',
      id: orderId,
      overrideAccess: true,
      req,
      data: change.data,
      ...(change.context ? { context: change.context } : {}),
    })
    return 'updated' as const
  })
}

/**
 * `checkout.session.expired`: an abandoned checkout, possibly after a declined
 * card (which leaves the order `failed`). Only an order still waiting on its
 * session is cancelled — one paid since by phone or bank transfer and marked
 * paid by hand must survive the session timing out a day later.
 */
export function cancelIfAbandoned(order: Pick<Order, 'status' | 'paymentStatus'>): OrderTransition | null {
  const waiting = order.paymentStatus === 'unpaid' || order.paymentStatus === 'failed'
  return order.status === 'pending' && waiting
    ? { data: { status: 'cancelled', paymentStatus: 'failed' } }
    : null
}

/**
 * `payment_intent.payment_failed` / `checkout.session.async_payment_failed`.
 * Stripe does not guarantee delivery order, so a decline on a first card can
 * arrive after a second card succeeded; only an order that is still unpaid is
 * marked failed.
 */
export function failIfUnpaid(order: Pick<Order, 'paymentStatus'>): OrderTransition | null {
  return order.paymentStatus === 'unpaid' ? { data: { paymentStatus: 'failed' } } : null
}

/**
 * `charge.refunded`, which fires for partial refunds too. Only a full refund
 * closes the order; refunding one missing jar must not pull the rest of the
 * parcel out of the fulfilment queue, so a partial one is only logged.
 */
export function refundTransition(
  fullyRefunded: boolean,
  note: string,
): OrderTransition {
  return fullyRefunded
    ? { data: { status: 'refunded', paymentStatus: 'refunded' } }
    : { data: {}, context: { timelineEvent: { event: 'Partial refund', note } } }
}

/** Reads an integer order id out of Stripe metadata, rejecting anything else. */
export function orderIdFromMetadata(meta: Record<string, string> | null | undefined): number | null {
  const id = Number(meta?.orderId)
  return Number.isInteger(id) && id > 0 ? id : null
}
