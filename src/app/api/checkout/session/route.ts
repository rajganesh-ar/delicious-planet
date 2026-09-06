import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { generateOrderNumber } from '@/collections/Orders'
import { priceCart, type CartLineInput } from '@/lib/cart-pricing'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { getStripe, isStripeConfigured, toMinorUnits } from '@/lib/stripe'
import type { Order } from '@/payload-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface AddressInput {
  name?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface Body {
  items?: CartLineInput[]
  email?: string
  notes?: string
  type?: 'retail' | 'b2b'
  shippingAddress?: AddressInput
}

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

function cleanAddress(a: AddressInput | undefined) {
  return {
    name: a?.name?.trim() || '',
    line1: a?.line1?.trim() || '',
    line2: a?.line2?.trim() || '',
    city: a?.city?.trim() || '',
    state: a?.state?.trim() || '',
    postalCode: a?.postalCode?.trim() || '',
    country: a?.country?.trim() || '',
  }
}

/**
 * Every accepted call writes an order row and opens a Stripe Checkout session,
 * so the endpoint is throttled ahead of any of that work — including ahead of
 * body parsing, which is the only part an attacker controls the cost of.
 *
 * Ten a minute is far above real checkout behaviour (a shopper submits once,
 * maybe retries after a validation error) and far below what makes looping
 * worthwhile.
 */
const CHECKOUT_RATE_LIMIT = { limit: 10, windowMs: 60_000 }

export async function POST(req: Request) {
  const limit = rateLimit(`checkout:${clientKey(req)}`, CHECKOUT_RATE_LIMIT)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return bad('Malformed request.')
  }

  const address = cleanAddress(body.shippingAddress)
  if (!address.line1 || !address.city || !address.postalCode || !address.country) {
    return bad('Please fill in all required address fields.')
  }

  const orderType = body.type === 'b2b' ? 'b2b' : 'retail'
  const payload = await getPayload({ config: await config })

  // Trust the session cookie for identity, never a user id from the body.
  const { user } = await payload.auth({ headers: req.headers })
  const email = (user?.email ?? body.email ?? '').trim()
  if (!email) return bad('Please enter your email address.')

  // Checked before the order row exists, so a misconfigured deploy doesn't
  // leave a trail of unpayable pending orders.
  if (orderType !== 'b2b' && !isStripeConfigured()) {
    return bad('Card payments are not configured yet. Please contact us to complete this order.', 503)
  }

  const priced = await priceCart(payload, body.items ?? [])
  if (!priced.ok) return bad(priced.error)

  const { lines, currency, subtotal } = priced

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      orderNumber: generateOrderNumber(),
      user: user ? user.id : null,
      guestEmail: user ? null : email,
      // Snapshot what was bought. The product relationship is a convenience;
      // these fields are what keeps the order readable after a catalogue reload.
      items: lines.map((l) => ({
        product: l.productId,
        variantSku: l.variantSku,
        titleSnapshot: l.title,
        sizeSnapshot: l.size,
        quantity: l.quantity,
        unitAmount: l.unitAmount,
        currency: l.currency,
      })),
      totals: { subtotal, shipping: 0, tax: 0, total: subtotal },
      currency: currency as Order['currency'],
      status: 'pending',
      paymentStatus: orderType === 'b2b' ? 'invoice' : 'unpaid',
      type: orderType,
      shippingAddress: address,
      notes: body.notes?.trim() || null,
    },
  })

  // Trade orders are invoiced by the team, so there's nothing to charge here.
  if (orderType === 'b2b') {
    return NextResponse.json({ orderNumber: order.orderNumber, url: null })
  }

  const origin = new URL(req.url).origin

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      client_reference_id: String(order.id),
      metadata: { orderId: String(order.id), orderNumber: order.orderNumber },
      payment_intent_data: {
        metadata: { orderId: String(order.id), orderNumber: order.orderNumber },
      },
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: toMinorUnits(l.unitAmount, currency),
          product_data: {
            name: l.size ? `${l.title} — ${l.size}` : l.title,
            ...(l.imageUrl?.startsWith('http') ? { images: [l.imageUrl] } : {}),
          },
        },
      })),
      // `{CHECKOUT_SESSION_ID}` is a placeholder Stripe substitutes on redirect.
      // The success page hands it to /api/checkout/confirm, which verifies the
      // payment against Stripe rather than trusting the redirect — so an order
      // still reaches `paid` on the spot if the webhook is down or unconfigured.
      success_url: `${origin}/checkout/success?order=${encodeURIComponent(order.orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
    })

    await payload.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: { stripeCheckoutSessionId: session.id },
    })

    return NextResponse.json({ orderNumber: order.orderNumber, url: session.url })
  } catch (err) {
    // The order row already exists; mark it so it isn't mistaken for payable.
    await payload
      .update({
        collection: 'orders',
        id: order.id,
        overrideAccess: true,
        data: { status: 'cancelled', paymentStatus: 'failed' },
      })
      .catch(() => {})

    payload.logger.error({ err }, 'Stripe checkout session failed')
    return bad('We could not start the payment. Please try again.', 502)
  }
}
