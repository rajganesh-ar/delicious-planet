/**
 * Public URL for a static site image — page art, logos, category tiles.
 *
 * These live in R2 under `site/`, beside the CMS media, so every image on the
 * site comes from one store and none of them ships inside the deployment.
 * Paths are written the way they were under `public/`, e.g.
 * `/images/about/about-cover.avif`, and map to
 * `<R2_PUBLIC_URL>/site/images/about/about-cover.avif`.
 *
 * The base is NEXT_PUBLIC_MEDIA_URL, which next.config.ts copies from
 * R2_PUBLIC_URL at build time: most of these paths are read in client
 * components, and a plain R2_PUBLIC_URL never reaches the browser bundle.
 * Unset (a local checkout without R2) the path comes back unchanged.
 *
 * Add or replace files with `pnpm images:site`. `pnpm media:cleanup` skips
 * the `site/` prefix, so it never mistakes these for strays.
 */
export const SITE_IMAGE_PREFIX = 'site'

export function siteImage(path: `/images/${string}`): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_URL
  if (!base) return path
  return `${base}/${SITE_IMAGE_PREFIX}${path}`
}
