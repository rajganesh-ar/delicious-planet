/**
 * The site's canonical absolute origin.
 *
 * Needed by anything that has to emit a URL rather than a path: `metadataBase`
 * (which resolves relative OG image paths), the sitemap, and robots.txt. A
 * relative path is fine in an <a href>; it is not fine in an og:image, which
 * crawlers and chat clients fetch from outside the site entirely.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL — set this in production. It is the only value that
 *      survives a custom domain sitting in front of the host.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the project's stable production domain
 *      on Vercel, so a deploy works before the variable above is set. Note this
 *      is *not* VERCEL_URL, which is the per-deployment hostname and would pin
 *      canonicals to a preview build.
 *   3. localhost, for development.
 */
function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`

  return 'http://localhost:3000'
}

export const SITE_URL = resolve()

/**
 * Whether `SITE_URL` came from configuration rather than falling through to the
 * localhost default.
 *
 * The distinction matters where a wrong origin is worse than a slightly stale
 * one — the Stripe redirect URLs, for instance. A developer running on a port
 * other than 3000 needs the request's own origin; a deployed environment must
 * never take the origin from a request header it doesn't control.
 */
export const SITE_URL_IS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim(),
)

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return new URL(path.startsWith('/') ? path : `/${path}`, SITE_URL).toString()
}
