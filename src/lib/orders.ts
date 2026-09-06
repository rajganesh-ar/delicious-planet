import type { Payload } from 'payload'

/**
 * Marks an order paid.
 *
 * Shared by the Stripe webhook and the post-checkout confirmation route, which
 * race each other by design: the webhook is authoritative and handles the
 * asynchronous cases (a delayed bank debit, a browser closed on the Stripe
 * page), while the confirmation route covers the overwhelmingly common one
 * where the shopper lands back on the site first. Whichever arrives first wins
 * and the other becomes a no-op.
 *
 * Idempotence comes from the `paymentStatus` guard rather than from a lock: the
 * write is the same in both paths, so a genuine double-fire is harmless, and
 * skipping the update keeps a later manual status change (`shipped`,
 * `refunded`) from being stamped back to `processing` by a redelivered event.
 */
export async function markOrderPaid(
  payload: Payload,
  orderId: number,
  paymentIntentId: string | null,
): Promise<'updated' | 'already-paid' | 'missing'> {
  let current
  try {
    current = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return 'missing'
  }

  if (!current) return 'missing'
  if (current.paymentStatus === 'paid') return 'already-paid'

  await payload.update({
    collection: 'orders',
    id: orderId,
    overrideAccess: true,
    data: {
      status: 'processing',
      paymentStatus: 'paid',
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    },
  })

  return 'updated'
}

/** Reads an integer order id out of Stripe metadata, rejecting anything else. */
export function orderIdFromMetadata(meta: Record<string, string> | null | undefined): number | null {
  const id = Number(meta?.orderId)
  return Number.isInteger(id) && id > 0 ? id : null
}
