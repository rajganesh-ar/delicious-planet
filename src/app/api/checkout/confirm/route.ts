import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { markOrderPaid, orderIdFromMetadata } from '@/lib/orders'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { getStripe, isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Confirms a completed Stripe Checkout session when the shopper lands back on
 * the site.
 *
 * Why this exists: the webhook used to be the *only* path from `unpaid` to
 * `paid`. If it was misconfigured — no endpoint registered for the production
 * domain, or a missing signing secret — every order stayed `pending` forever
 * while the buyer was shown "your payment has gone through". Nothing in the
 * system noticed. This route closes that gap by confirming against Stripe on
 * the redirect, so the webhook becomes a backstop for the asynchronous cases
 * rather than a single point of failure.
 *
 * Security: the caller supplies only a session id. Payment status and the order
 * id both come back from Stripe, never from the request — so a guessed or
 * replayed id can at most re-confirm an order that Stripe already says is paid.
 */
export async function GET(req: Request) {
  // Cheap for us, but it is an unauthenticated call into the Stripe API, so it
  // gets the same treatment as the session route.
  const limit = rateLimit(`confirm:${clientKey(req)}`, { limit: 20, windowMs: 60_000 })
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  const sessionId = new URL(req.url).searchParams.get('session_id')?.trim()
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id.' }, { status: 400 })

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 })
  }

  let session
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId)
  } catch {
    // An id Stripe does not recognise. Nothing to confirm, and no reason to
    // distinguish "wrong id" from "not ours" for the caller.
    return NextResponse.json({ error: 'Unknown checkout session.' }, { status: 404 })
  }

  const orderId = orderIdFromMetadata(session.metadata)
  if (!orderId) {
    return NextResponse.json({ error: 'Session is not linked to an order.' }, { status: 404 })
  }

  const paid = session.payment_status === 'paid'

  if (!paid) {
    // Genuinely not settled yet — an async payment method, or an abandoned
    // session. The webhook will finish this one; say so rather than guessing.
    return NextResponse.json({
      paid: false,
      orderNumber: session.metadata?.orderNumber ?? null,
      status: session.payment_status,
    })
  }

  const payload = await getPayload({ config: await config })
  const intentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)

  const result = await markOrderPaid(payload, orderId, intentId)

  if (result === 'missing') {
    payload.logger.error({ orderId, sessionId }, 'Confirmed Stripe session has no matching order')
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  // A refunded order, revisited from history: Stripe still calls the session
  // paid, but the order is closed and must not read as freshly confirmed.
  if (result === 'not-payable') {
    return NextResponse.json({
      paid: false,
      orderNumber: session.metadata?.orderNumber ?? null,
      status: 'closed',
    })
  }

  return NextResponse.json({
    paid: true,
    orderNumber: session.metadata?.orderNumber ?? null,
    status: 'paid',
  })
}
