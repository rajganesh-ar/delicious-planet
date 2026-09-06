import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clientKey, rateLimit } from '@/lib/rate-limit'

const protectedPaths = ['/account']

/**
 * Payload 3 dropped the built-in rate limiter that Payload 2 configured through
 * express, and these three collections are public to `create` — signup so the
 * storefront can register customers, the other two so their forms submit
 * without an account. That makes them the only unauthenticated write paths on
 * the REST API, and the ones worth a ceiling.
 *
 * `/api/checkout/session` throttles itself, at a tighter limit, in its own
 * route handler; it is deliberately not listed here.
 */
const THROTTLED_WRITE_PATHS = ['/api/users', '/api/b2b-inquiries', '/api/newsletter-subscribers']

/** Generous enough for a fumbled signup, tight enough to stop a script. */
const WRITE_RATE_LIMIT = { limit: 20, windowMs: 60_000 }

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (request.method === 'POST' && THROTTLED_WRITE_PATHS.some((p) => pathname.startsWith(p))) {
    const limit = rateLimit(`write:${clientKey(request)}`, WRITE_RATE_LIMIT)
    if (!limit.ok) {
      return NextResponse.json(
        { errors: [{ message: 'Too many requests. Please wait a moment and try again.' }] },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      )
    }
  }

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected) {
    // Check for Payload auth token cookie
    const token = request.cookies.get('payload-token')

    if (!token?.value) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/account/:path*',
    '/api/users/:path*',
    '/api/b2b-inquiries/:path*',
    '/api/newsletter-subscribers/:path*',
  ],
}
