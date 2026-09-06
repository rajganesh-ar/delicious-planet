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

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return new URL(path.startsWith('/') ? path : `/${path}`, SITE_URL).toString()
}
