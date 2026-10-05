import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { generateOrderNumber } from '@/collections/Orders'
import { priceCart, type CartLineInput } from '@/lib/cart-pricing'
import { isValidEmail } from '@/lib/email-address'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { SITE_URL, SITE_URL_IS_CONFIGURED } from '@/lib/site-url'
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
  // No postal code requirement: UAE addresses have none, and requiring one made
  // every local shopper invent "00000".
  if (!address.line1 || !address.city || !address.country) {
    return bad('Please fill in all required address fields.')
  }

  const payload = await getPayload({ config: await config })

  // Trust the session cookie for identity, never a user id from the body.
  const { user } = await payload.auth({ headers: req.headers })
  const email = (user?.email ?? body.email ?? '').trim()
  if (!email) return bad('Please enter your email address.')
  // A typo the browser's type=email accepts ("name@gmailcom") would otherwise
  // fail inside payload.create below and reach the shopper as a 500.
  if (!isValidEmail(email)) return bad('Please check your email address — it looks incomplete.')

  // Checked before the order row exists, so a misconfigured deploy doesn't
  // leave a trail of unpayable pending orders.
  if (!isStripeConfigured()) {
    return bad('Card payments are not configured yet. Please contact us to complete this order.', 503)
  }

  const priced = await priceCart(payload, body.items ?? [])
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error, line: priced.line ?? null }, { status: 400 })
  }

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
      // Always a card order. This route is public, and it used to accept
      // `type: 'b2b'` from the request body, which skipped Stripe and wrote
      // `invoice` — a status the fulfilment queue and the revenue figures
      // treat as paid. Trade orders on terms are entered by staff in the admin.
      paymentStatus: 'unpaid',
      type: 'retail',
      shippingAddress: address,
      notes: body.notes?.trim() || null,
    },
  })

  /**
   * Where Stripe sends the buyer back to.
   *
   * Taken from configuration wherever it exists, and only from the request as a
   * development fallback. `new URL(req.url).origin` is derived from headers the
   * caller can influence through a proxy, and this value ends up in a live
   * Stripe session — so on a deployed environment it is the one input here that
   * must not be attacker-shaped. Reading it from the same constant the sitemap
   * and canonicals use also means the redirect cannot drift from the domain the
   * rest of the site claims to be on.
   *
   * The fallback exists because SITE_URL defaults to port 3000, which would send
   * a developer running on 3001 to the wrong place after paying.
   */
  const origin = SITE_URL_IS_CONFIGURED ? SITE_URL : new URL(req.url).origin

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
