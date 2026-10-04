import type { Brand, Product } from '@/payload-types'
import { countryName } from './countries'
import { mediaUrl } from './images'
import { siteImage } from '@/lib/site-image'

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
  'admiral-caviar': siteImage('/images/partner-logo/admiral.webp'),
  caputo: siteImage('/images/partner-logo/caputo.avif'),
  velsoro: siteImage('/images/partner-logo/velsoro.avif'),
  'garcia-de-la-cruz': siteImage('/images/partner-logo/garcia.webp'),
  cebon: siteImage('/images/partner-logo/cebon.png'),
}

/** The uploaded logo, else the bundled file, else null. */
export function brandLogo(brand: Brand): string | null {
  return mediaUrl(brand.logo) ?? BUNDLED_LOGOS[brand.slug] ?? null
}

export interface StockedBrand {
  brand: Brand
  /** Published products carrying the brand. */
  count: number
  /** The origin most of its products state, as a display name. */
  country: string | null
}

type BrandedProduct = { brand?: Product['brand']; origin?: Product['origin'] }

/**
 * The brands a shopper can actually buy, most stocked first.
 *
 * A brand record outlives its products — Cebon has none — and every place a
 * brand is listed links to its products, so a brand with none would be a link
 * to an empty page. Pass published products only.
 */
export function stockedBrands(brands: Brand[], products: BrandedProduct[]): StockedBrand[] {
  const tally = new Map<number, { count: number; countries: Map<string, number> }>()
  for (const p of products) {
    const id = typeof p.brand === 'object' && p.brand !== null ? p.brand.id : p.brand
    if (typeof id !== 'number') continue
    const entry = tally.get(id) ?? { count: 0, countries: new Map() }
    entry.count++
    const country = countryName(p.origin?.country)
    if (country) entry.countries.set(country, (entry.countries.get(country) ?? 0) + 1)
    tally.set(id, entry)
  }

  return brands
    .flatMap((brand) => {
      const entry = tally.get(brand.id)
      if (!entry) return []
      const [country] = [...entry.countries].sort((a, b) => b[1] - a[1])[0] ?? []
      return [{ brand, count: entry.count, country: country ?? null }]
    })
    .sort((a, b) => b.count - a.count || a.brand.title.localeCompare(b.brand.title))
}

export interface BrandMark {
  slug: string
  name: string
  /** Logo artwork, or null to set the name as a wordmark. */
  src: string | null
}

/**
 * Marks for the fixed-size logo grids: the homepage strip is five across and
 * the /brands marque board reserves its sixth cell for the masthead.
 *
 * Brands with artwork go first so the grid reads as logos. Any cells left go
 * to the next brands in the order given, set as wordmarks, so a logo nobody has
 * uploaded never leaves a hole in the grid.
 */
export function resolveBrandMarks(brands: Brand[], limit?: number): BrandMark[] {
  const marks = brands.map((brand) => ({
    slug: brand.slug,
    name: brand.title,
    src: brandLogo(brand),
  }))
  return [...marks.filter((m) => m.src), ...marks.filter((m) => !m.src)].slice(0, limit)
}
