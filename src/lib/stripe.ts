import Stripe from 'stripe'

/**
 * Currencies Stripe expects in whole units rather than cents. None of the
 * storefront's five currencies are zero-decimal today, but getting this wrong
 * silently charges 100x, so it's worth encoding rather than assuming.
 */
const ZERO_DECIMAL = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG',
  'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
])

let cached: Stripe | null = null

/** Throws rather than returning null — a checkout route with no key is a bug, not a state to handle. */
export function getStripe(): Stripe {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set — add it to .env to enable card payments.')
  }
  cached = new Stripe(key)
  return cached
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Converts a display amount (e.g. 145.5 AED) into the integer minor units Stripe bills in. */
export function toMinorUnits(amount: number, currency: string): number {
  if (ZERO_DECIMAL.has(currency.toUpperCase())) return Math.round(amount)
  return Math.round(amount * 100)
}

/** The inverse of toMinorUnits, formatted for people: 2000 AED-fils → "AED 20.00". */
export function formatMinorUnits(amount: number, currency: string): string {
  const code = currency.toUpperCase()
  if (ZERO_DECIMAL.has(code)) return `${code} ${amount}`
  return `${code} ${(amount / 100).toFixed(2)}`
}
