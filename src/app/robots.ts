import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

/**
 * Served at /robots.txt.
 *
 * The disallow list is the set of routes that are either private, per-visitor,
 * or a dead end for a crawler. `/admin` and `/api` are the important ones:
 * without them the Payload admin login and every REST endpoint end up in the
 * index. The basket and checkout routes are excluded because they render
 * nothing without a client-side basket, so a crawler only ever sees an empty
 * state — indexing that competes with the real product pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/account', '/cart', '/checkout', '/login', '/register', '/forgot-password'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
