import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  cancelIfAbandoned,
  failIfUnpaid,
  markOrderPaid,
  orderIdFromMetadata,
  refundTransition,
  transitionOrder,
} from '@/lib/orders'
import { formatMinorUnits, getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Stripe's signature is computed over the exact bytes it sent, so the body must
 * be read as raw text — parsing it first would invalidate the check.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET is not set.' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret)
  } catch (err) {
    // An unverifiable event is either a misconfigured secret or a forgery; either way, refuse it.
    return NextResponse.json(
      { error: `Signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config: await config })

  const orderIdFrom = (meta: Stripe.Metadata | null | undefined): number | null =>
    orderIdFromMetadata(meta)

  try {
    switch (event.type) {
      // Grouped because the payment_status guard below is what separates them:
      // on `completed` for a delayed method the session is still `unpaid` and
      // nothing happens, then the settlement arrives later as
      // `async_payment_succeeded` with that same session now `paid`.
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object
        const orderId = orderIdFrom(session.metadata)
        // `unpaid` here means an async method (e.g. bank debit) hasn't settled yet.
        if (orderId && session.payment_status === 'paid') {
          // Shared with /api/checkout/confirm, which races this handler on the
          // redirect. The helper's row lock makes whichever loses a no-op, and
          // its allow-list stops a redelivered event from reviving an order
          // that has since been refunded or moved on to `shipped`.
          await markOrderPaid(
            payload,
            orderId,
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          )
        }
        break
      }

      // Each of the next three changes an order only if it still fits the
      // order's current state — Stripe delivers out of order and retries for
      // days. The rules, and why, are on the decision functions in lib/orders.
      case 'checkout.session.expired': {
        const orderId = orderIdFrom(event.data.object.metadata)
        if (orderId) await transitionOrder(payload, orderId, cancelIfAbandoned)
        break
      }

      // A declined card, or a delayed method that bounces (which fires both).
      case 'payment_intent.payment_failed':
      case 'checkout.session.async_payment_failed': {
        const orderId = orderIdFrom(event.data.object.metadata)
        if (orderId) await transitionOrder(payload, orderId, failIfUnpaid)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const intentId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id
        if (intentId) {
          const { docs } = await payload.find({
            collection: 'orders',
            where: { stripePaymentIntentId: { equals: intentId } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
          })
          if (docs[0]) {
            const fullyRefunded = charge.refunded || charge.amount_refunded >= charge.amount
            const refunded = formatMinorUnits(charge.amount_refunded, charge.currency)
            const charged = formatMinorUnits(charge.amount, charge.currency)
            await transitionOrder(payload, docs[0].id, () =>
              refundTransition(fullyRefunded, `${refunded} of ${charged}`),
            )
          }
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    // Returning 500 tells Stripe to retry, which is what we want for a transient DB failure.
    payload.logger.error({ err, eventType: event.type }, 'Stripe webhook handling failed')
    return NextResponse.json({ error: 'Handler failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
