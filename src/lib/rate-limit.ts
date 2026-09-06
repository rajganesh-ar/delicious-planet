/**
 * A small fixed-window rate limiter for public write endpoints.
 *
 * Deliberately in-process and dependency-free. That is a real limitation: each
 * serverless instance keeps its own counter, so the effective ceiling is
 * `limit × instances` rather than `limit`. It is not a defence against a
 * distributed attacker, and it is not the place to enforce a billing quota.
 *
 * What it does buy is the thing actually missing today — a single client can no
 * longer sit in a loop opening Stripe Checkout sessions and writing an order
 * row per request. Put a shared store (Redis/Upstash) behind this if the site
 * ever needs a hard guarantee; the call signature is meant to survive that swap.
 */

interface Window {
  count: number
  /** Epoch ms at which this window expires and the count resets. */
  resetAt: number
}

const windows = new Map<string, Window>()

/**
 * Bounds the map so a stream of unique keys (spoofed IPs) cannot grow it
 * without limit. Well past any legitimate concurrent-visitor count.
 */
const MAX_TRACKED_KEYS = 10_000

function prune(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key)
  }
}

export interface RateLimitOptions {
  /** Requests permitted per window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  ok: boolean
  /** Whole seconds until the window resets — the value for `Retry-After`. */
  retryAfter: number
  remaining: number
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = windows.get(key)

  if (!existing || existing.resetAt <= now) {
    // Prune on window creation rather than on every call: expiry is the only
    // thing that makes an entry collectable, so there is nothing to reclaim on
    // a request that merely increments.
    if (windows.size >= MAX_TRACKED_KEYS) prune(now)
    windows.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0, remaining: limit - 1 }
  }

  existing.count += 1

  if (existing.count > limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    }
  }

  return { ok: true, retryAfter: 0, remaining: limit - existing.count }
}

/**
 * Best-effort client identity for rate limiting.
 *
 * `x-forwarded-for` is a client-supplied header that a proxy appends to, so
 * only the *first* hop is meaningful and even that is spoofable when the app is
 * reachable without a proxy in front. Good enough to throttle a loop; not an
 * identity check, and never used for authorisation.
 */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}
