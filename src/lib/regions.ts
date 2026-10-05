/**
 * Region presentation for the storefront.
 *
 * Regions used to be inferred by matching a product's free-text
 * `countryOfOrigin` against a hard-coded bucket of country names, because the
 * schema had no region field. It has one now: `origin.region`, derived from
 * `origin.country` on save (see src/lib/countries.ts).
 *
 * So this file no longer decides *which* products are in a region — it only
 * says how a region is presented. The country buckets are gone; adding a
 * country to a region is a one-line change in countries.ts.
 *
 * The table below is the *default* presentation. Editors override it in the
 * `regions` collection; resolveRegions() merges the two, so the storefront looks
 * finished before anything is authored.
 */
import type { RegionSlug } from './countries'
import { REGION_SLUGS } from './countries'
import { mediaUrl } from './images'
import { siteImage } from '@/lib/site-image'
// The CMS row. Aliased because `Region` below is the resolved shape the
// storefront renders — the row is only one of its two sources.
import type { Region as RegionDoc } from '@/payload-types'

export interface Region {
  slug: RegionSlug
  /** Big display name on the card, e.g. "Europe" */
  label: string
  /** Small line above the label, e.g. "Bite into" */
  eyebrow: string
  /** Short blurb used on listing pages */
  description: string
  image: string
  /** Drawn as the spotlight card: wider, framed and badged. */
  highlighted: boolean
}

// Card art is one landmark per region (Maqam Echahid, Eiffel Tower, Burj
// Khalifa, Giza, Machu Picchu, Statue of Liberty, Taj Mahal, Sydney Opera
// House), so the row reads as a map at a glance. All are free for commercial
// use with no credit required, and cropped to the card's 3:4.
export const REGIONS: Region[] = [
  {
    slug: 'algeria',
    label: 'Algeria',
    eyebrow: 'Our roots',
    description:
      'Deglet Nour dates, olive oil, couscous and spice from the country our sourcing grew from.',
    image: siteImage('/images/regions/algeria-maqam-echahid.avif'),
    highlighted: true,
  },
  {
    slug: 'europe',
    label: 'Europe',
    eyebrow: 'Bite into',
    description:
      'Explore authentic European gourmet foods from Italy, France, Spain, Greece and more.',
    image: siteImage('/images/regions/europe-eiffel-tower.avif'),
    highlighted: false,
  },
  {
    slug: 'middle-east',
    label: 'Middle East',
    eyebrow: 'Bite into',
    description: 'Spices, mezze and confections from the Levant, the Gulf and Anatolia.',
    image: siteImage('/images/regions/middle-east-burj-khalifa.avif'),
    highlighted: false,
  },
  {
    slug: 'africa',
    label: 'Africa',
    eyebrow: 'Bite into',
    description:
      'Single-origin coffee, honey, argan and heritage grains from across the continent.',
    image: siteImage('/images/regions/africa-giza.avif'),
    highlighted: false,
  },
  {
    slug: 'latin-america',
    label: 'Latin America',
    eyebrow: 'Bite into',
    description: 'Cacao, coffee, ancient grains and chillies from Mexico down to Patagonia.',
    image: siteImage('/images/regions/latin-america-machu-picchu.avif'),
    highlighted: false,
  },
  {
    slug: 'north-america',
    label: 'North America',
    eyebrow: 'Bite into',
    description: 'Maple, wild rice, craft preserves and small-batch pantry staples.',
    image: siteImage('/images/regions/north-america-statue-of-liberty.avif'),
    highlighted: false,
  },
  {
    slug: 'asia',
    label: 'Asia',
    eyebrow: 'Bite into',
    description: 'Rice, tea, soy and spice traditions from East, South and Southeast Asia.',
    image: siteImage('/images/regions/asia-taj-mahal.avif'),
    highlighted: false,
  },
  {
    slug: 'oceania',
    label: 'Oceania',
    eyebrow: 'Bite into',
    description: 'Manuka honey, macadamia and cool-climate produce from Australia and New Zealand.',
    image: siteImage('/images/regions/oceania-sydney-opera-house.avif'),
    highlighted: false,
  },
]

export function getRegionBySlug(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug)
}

export function isRegionSlug(slug: string): slug is RegionSlug {
  return (REGION_SLUGS as readonly string[]).includes(slug)
}

/**
 * Merge the CMS rows (collection `regions`) over the bundled table above.
 *
 * The table stays the fallback, so the storefront renders the full row before
 * anything is authored — and a row that leaves a field blank keeps the bundled
 * wording or artwork rather than rendering an empty card.
 *
 * Once rows exist they decide *which* regions show: deactivating or deleting one
 * hides it. A row whose slug is no longer in REGION_SLUGS is skipped, because a
 * region only exists if countries map to it.
 */
export function resolveRegions(docs: RegionDoc[] = []): Region[] {
  if (docs.length === 0) return REGIONS

  const bundled = new Map(REGIONS.map((region) => [region.slug, region]))
  const order = REGIONS.map((region) => region.slug)

  return docs
    .filter((doc) => doc.active !== false && isRegionSlug(doc.slug))
    .map((doc) => {
      const base = bundled.get(doc.slug as RegionSlug)
      return {
        slug: doc.slug as RegionSlug,
        label: doc.label || base?.label || doc.slug,
        eyebrow: doc.eyebrow || base?.eyebrow || '',
        description: doc.description || base?.description || '',
        image: mediaUrl(doc.image) ?? base?.image ?? '',
        // A checkbox, so the row always has an answer: once rows exist the
        // spotlight is the editor's call, not the bundled table's.
        highlighted: doc.highlighted ?? base?.highlighted ?? false,
        sortOrder: doc.sortOrder ?? null,
      }
    })
    .sort(
      (a, b) =>
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
        order.indexOf(a.slug) - order.indexOf(b.slug),
    )
    .map(({ sortOrder: _sortOrder, ...region }) => region)
}
