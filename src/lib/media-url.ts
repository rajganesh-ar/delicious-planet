/**
 * Public URL for a stored media object.
 *
 * One place builds these, used by both the storage plugin's `generateFileURL`
 * (which covers `url` and every `sizes.*.url`) and the Media collection's
 * `adminThumbnail` (which covers `thumbnailURL`). Payload generates those from
 * different code paths and the storage plugin only rewrites the first set, so
 * without this the admin panel would still point at the retired
 * /api/media/file/* route while the storefront pointed at R2.
 *
 * @param key Object key: the filename, optionally under a prefix.
 */
export function publicMediaUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL
  // Development-only fallback: payload.config.ts throws on a production build
  // with R2_PUBLIC_URL unset. The leading slash is what matters — next/image
  // rejects a bare "foo.webp" and takes the whole page down, so an
  // unconfigured local checkout shows broken images rather than crashing.
  if (!base) return `/api/media/file/${key}`
  return `${base}/${key}`
}
