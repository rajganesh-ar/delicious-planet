import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Order status is the one field in this system that several actors write to —
 * the Stripe webhook, the post-checkout confirmation route, and a human in the
 * admin clicking a fulfilment button. When something looks wrong three days
 * later ("why is this marked shipped?") the status column alone cannot answer
 * it, because it only remembers the last write.
 *
 * These hooks make every transition leave a trace, and stamp the two timestamps
 * that would otherwise be filled in by hand and therefore wrong.
 */

type TimelineRow = {
  event?: string | null
  note?: string | null
  at?: string | null
  by?: number | { id: number } | null
  id?: string | null
}

type OrderShape = {
  status?: string | null
  paymentStatus?: string | null
  timeline?: TimelineRow[] | null
  fulfillment?: {
    carrier?: string | null
    trackingNumber?: string | null
    shippedAt?: string | null
    deliveredAt?: string | null
  } | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const PAYMENT_LABEL: Record<string, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  invoice: 'Invoiced',
}

/** Relationships come back populated at some depths and as a bare id at others. */
const toUserId = (by: TimelineRow['by']): number | null => {
  if (typeof by === 'number') return by
  if (by && typeof by === 'object' && typeof by.id === 'number') return by.id
  return null
}

/**
 * Stamp `shippedAt` / `deliveredAt` off the status rather than asking for them.
 *
 * Both are only ever "the moment the status changed", so a separate date picker
 * is a second thing to remember and a second thing to get wrong. They stay
 * editable — a parcel handed to a courier yesterday can be corrected — but they
 * are never *blank* on an order that has shipped.
 */
export const stampFulfilmentDates: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) return data
  const incoming = data as OrderShape
  const previous = (originalDoc ?? {}) as OrderShape

  const status = incoming.status ?? previous.status
  const now = new Date().toISOString()

  // `fulfillment` is absent from a partial update (the Stripe webhook sends
  // three fields), so merge rather than replace — assigning a fresh object
  // would blank the carrier and tracking number the shop floor just entered.
  const fulfillment = { ...(previous.fulfillment ?? {}), ...(incoming.fulfillment ?? {}) }

  if (status === 'shipped' && !fulfillment.shippedAt) fulfillment.shippedAt = now
  if (status === 'delivered') {
    if (!fulfillment.shippedAt) fulfillment.shippedAt = now
    if (!fulfillment.deliveredAt) fulfillment.deliveredAt = now
  }

  incoming.fulfillment = fulfillment
  return data
}

/**
 * Append to the timeline whenever something a customer would notice changes.
 *
 * Written from `originalDoc` rather than from the submitted form, because the
 * webhook and the admin send very different shapes: a partial update carries no
 * `timeline` at all, and arrays are replaced wholesale on write, so basing the
 * new array on the incoming one would erase the history on every webhook.
 *
 * `by` is null for machine writes. That is the point — an order that moved to
 * `paid` with nobody attached moved because Stripe said so.
 *
 * An incoming `timeline` is never kept: it is replaced below. The admin form submits every field on
 * save, so a tab left open would otherwise write back a stale history over
 * entries the webhook added since — and the history is an audit trail, which
 * nobody should be able to edit. Events that change no field (a partial
 * refund) are passed in as `context.timelineEvent` instead.
 */
export const recordOrderTimeline: CollectionBeforeChangeHook = ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const incoming = data as OrderShape
  const previous = (originalDoc ?? {}) as OrderShape

  const at = new Date().toISOString()
  const by = typeof req?.user?.id === 'number' ? req.user.id : null
  const added: TimelineRow[] = []
  const log = (event: string, note?: string) => added.push({ event, note: note ?? null, at, by })

  const extra = context?.timelineEvent as { event?: string; note?: string } | undefined
  if (extra?.event) log(extra.event, extra.note)

  if (operation === 'create') {
    log('Order placed', incoming.status ? STATUS_LABEL[incoming.status] : undefined)
  } else {
    if (incoming.status && incoming.status !== previous.status) {
      log(
        `Status → ${STATUS_LABEL[incoming.status] ?? incoming.status}`,
        previous.status ? `was ${STATUS_LABEL[previous.status] ?? previous.status}` : undefined,
      )
    }

    if (incoming.paymentStatus && incoming.paymentStatus !== previous.paymentStatus) {
      log(
        `Payment → ${PAYMENT_LABEL[incoming.paymentStatus] ?? incoming.paymentStatus}`,
        previous.paymentStatus
          ? `was ${PAYMENT_LABEL[previous.paymentStatus] ?? previous.paymentStatus}`
          : undefined,
      )
    }

    const tracking = incoming.fulfillment?.trackingNumber
    if (tracking && tracking !== previous.fulfillment?.trackingNumber) {
      const carrier = incoming.fulfillment?.carrier ?? previous.fulfillment?.carrier
      log('Tracking added', [carrier, tracking].filter(Boolean).join(' · '))
    }
  }

  const history = (previous.timeline ?? []).map((row) => ({ ...row, by: toUserId(row.by) }))
  // Always rebuilt from the stored order, even when nothing was added, so
  // whatever timeline the request carried is replaced by the true one.
  // Newest first: the entry that explains the current state should not be at
  // the bottom of a year-old order.
  incoming.timeline = [...added, ...history].slice(0, 200)

  return data
}
