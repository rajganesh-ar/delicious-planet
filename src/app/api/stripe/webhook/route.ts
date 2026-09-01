import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getStripe } from '@/lib/stripe'

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

  const orderIdFrom = (meta: Stripe.Metadata | null | undefined): number | null => {
    const raw = meta?.orderId
    const id = Number(raw)
    return Number.isInteger(id) && id > 0 ? id : null
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const orderId = orderIdFrom(session.metadata)
        // `unpaid` here means an async method (e.g. bank debit) hasn't settled yet.
        if (orderId && session.payment_status === 'paid') {
          await payload.update({
            collection: 'orders',
            id: orderId,
            overrideAccess: true,
            data: {
              status: 'processing',
              paymentStatus: 'paid',
              stripePaymentIntentId:
                typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : (session.payment_intent?.id ?? null),
            },
          })
        }
        break
      }

      case 'checkout.session.expired': {
        const orderId = orderIdFrom(event.data.object.metadata)
        if (orderId) {
          await payload.update({
            collection: 'orders',
            id: orderId,
            overrideAccess: true,
            data: { status: 'cancelled', paymentStatus: 'failed' },
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const orderId = orderIdFrom(event.data.object.metadata)
        if (orderId) {
          await payload.update({
            collection: 'orders',
            id: orderId,
            overrideAccess: true,
            data: { paymentStatus: 'failed' },
          })
        }
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
            overrideAccess: true,
          })
          if (docs[0]) {
            await payload.update({
              collection: 'orders',
              id: docs[0].id,
              overrideAccess: true,
              data: { status: 'refunded', paymentStatus: 'refunded' },
            })
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
