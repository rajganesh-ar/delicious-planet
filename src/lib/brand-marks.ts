import type { Brand } from '@/payload-types'
import { mediaUrl } from './images'

/**
 * Bundled artwork for brands whose logo has not been uploaded yet.
 *
 * These are the five files the homepage and /brands strips used to hard-code.
 * Keeping them as a fallback means the marque board never empties out because
 * nobody has been into the admin panel yet, and it survives a slow blob store.
 *
 * Note this resolves the *opposite* way round to `getCategoryImage`, where the
 * bundled file wins. A category tile is decoration and the bundled crop is
 * deliberately the better one; a brand mark is the brand's own property, so an
 * uploaded logo is by definition more correct than whatever we shipped.
 */
const BUNDLED_LOGOS: Record<string, string> = {
  'admiral-caviar': '/images/partner-logo/admiral.webp',
  caputo: '/images/partner-logo/caputo.avif',
  velsoro: '/images/partner-logo/velsoro.avif',
  'garcia-de-la-cruz': '/images/partner-logo/garcia.webp',
  cebon: '/images/partner-logo/cebon.png',
}

export interface BrandMark {
  slug: string
  name: string
  src: string
}

/**
 * The brands that can actually show a mark, in the order given.
 *
 * A brand with neither an upload nor bundled artwork is dropped rather than
 * rendered as a gap — the strips are a grid of logos, and an empty cell in one
 * reads as a broken image, not as "logo pending". That is why the eight brand
 * records currently yield five marks.
 *
 * Pass `limit` to keep a fixed-size grid fixed: the homepage strip is five
 * across and the /brands marque board reserves its sixth cell for the masthead.
 */
export function resolveBrandMarks(brands: Brand[] = [], limit?: number): BrandMark[] {
  const marks: BrandMark[] = []

  for (const brand of brands) {
    const src = mediaUrl(brand.logo) ?? BUNDLED_LOGOS[brand.slug] ?? null
    if (!src) continue
    marks.push({ slug: brand.slug, name: brand.title, src })
    if (limit && marks.length >= limit) break
  }

  return marks
}
