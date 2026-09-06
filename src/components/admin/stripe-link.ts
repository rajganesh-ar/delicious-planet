/**
 * Deep link into the Stripe dashboard for a payment.
 *
 * Kept apart from lib/stripe.ts so that rendering an order in the admin does not
 * pull the Stripe SDK in behind it, and it must stay server-side because the mode is
 * read from the secret key: on the client `process.env.STRIPE_SECRET_KEY` is
 * inlined as undefined, which would quietly send every live payment to the test
 * dashboard.
 *
 * Absence of a live key means test mode. That is the safe way round — a test
 * link on a live payment 404s visibly, while a live link on a test payment shows
 * someone else's dashboard tab.
 */
export function stripePaymentUrl(paymentIntentId?: string | null): string | null {
  if (!paymentIntentId) return null
  const live = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')
  return `https://dashboard.stripe.com/${live ? '' : 'test/'}payments/${paymentIntentId}`
}
