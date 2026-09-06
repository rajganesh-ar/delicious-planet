// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
import { clientKey, rateLimit } from '../../src/lib/rate-limit'

/**
 * The limiter holds module-level state, so every test uses its own key rather
 * than trying to reset it — that also mirrors how it is used in production,
 * where the key is a client address.
 */
let counter = 0
const freshKey = () => `test-key-${counter++}`

afterEach(() => {
  vi.useRealTimers()
})

describe('rateLimit', () => {
  it('allows requests up to the limit and refuses the one after', () => {
    const key = freshKey()
    const opts = { limit: 3, windowMs: 60_000 }

    expect(rateLimit(key, opts).ok).toBe(true)
    expect(rateLimit(key, opts).ok).toBe(true)
    expect(rateLimit(key, opts).ok).toBe(true)
    expect(rateLimit(key, opts).ok).toBe(false)
  })

  it('counts each key separately', () => {
    const a = freshKey()
    const b = freshKey()
    const opts = { limit: 1, windowMs: 60_000 }

    expect(rateLimit(a, opts).ok).toBe(true)
    expect(rateLimit(a, opts).ok).toBe(false)
    // b must be unaffected by a's exhausted window.
    expect(rateLimit(b, opts).ok).toBe(true)
  })

  it('reports whole seconds of Retry-After while blocked', () => {
    const key = freshKey()
    const opts = { limit: 1, windowMs: 30_000 }

    rateLimit(key, opts)
    const blocked = rateLimit(key, opts)

    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
    expect(blocked.retryAfter).toBeLessThanOrEqual(30)
    expect(Number.isInteger(blocked.retryAfter)).toBe(true)
  })

  it('lets the caller through again once the window has passed', () => {
    vi.useFakeTimers()
    const key = freshKey()
    const opts = { limit: 1, windowMs: 1_000 }

    expect(rateLimit(key, opts).ok).toBe(true)
    expect(rateLimit(key, opts).ok).toBe(false)

    vi.advanceTimersByTime(1_001)

    expect(rateLimit(key, opts).ok).toBe(true)
  })

  it('counts down the remaining allowance', () => {
    const key = freshKey()
    const opts = { limit: 3, windowMs: 60_000 }

    expect(rateLimit(key, opts).remaining).toBe(2)
    expect(rateLimit(key, opts).remaining).toBe(1)
    expect(rateLimit(key, opts).remaining).toBe(0)
  })
})

describe('clientKey', () => {
  const req = (headers: Record<string, string>) => new Request('https://example.com', { headers })

  it('takes the first hop of x-forwarded-for', () => {
    // Only the leftmost entry is the client; the rest are proxies that appended
    // themselves, and trusting the last would key every visitor identically.
    expect(clientKey(req({ 'x-forwarded-for': '203.0.113.9, 70.41.3.18, 150.172.238.178' }))).toBe(
      '203.0.113.9',
    )
  })

  it('falls back to x-real-ip', () => {
    expect(clientKey(req({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('returns a constant when neither header is present', () => {
    // Everyone shares one bucket rather than each getting an unlimited one.
    expect(clientKey(req({}))).toBe('unknown')
  })

  it('ignores an empty x-forwarded-for and uses x-real-ip', () => {
    expect(clientKey(req({ 'x-forwarded-for': '', 'x-real-ip': '198.51.100.7' }))).toBe(
      '198.51.100.7',
    )
  })
})
