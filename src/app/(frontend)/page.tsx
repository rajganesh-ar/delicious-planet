import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { HomePageClient } from '@/components/sections/HomePageClient'
import type { BannerSlots } from '@/components/sections/HomePageClient'
import { RAIL_COLUMNS } from '@/components/sections/home/ProductRail'
import { DIETARY_FACETS, dietaryWhere } from '@/lib/facets'
import { countryName } from '@/lib/countries'
import { resolveRegions } from '@/lib/regions'
import { resolveBrandMarks, stockedBrands } from '@/lib/brand-marks'
import { BRAND_STRIP_MARKS } from '@/components/sections/home/BrandStrip'

/**
 * `absolute` opts the title out of the layout's "%s — Delicious Planet"
 * template, which would otherwise render the brand name twice here.
 */
export const metadata: Metadata = {
  title: { absolute: 'Delicious Planet — Premium Food Ingredients' },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Delicious Planet — Premium Food Ingredients',
    url: '/',
  },
}

const PUBLISHED = { _status: { equals: 'published' } } as const

/** Countries shown in the "Shop by Country of Origin" strip. */
const MAX_COUNTRIES = 12

/** Rails render RAIL_COLUMNS tiles per row on xl, so these stay whole-row counts. */
const BEST_SELLER_ROWS = 3
const NEW_ARRIVAL_ROWS = 2
const BEST_SELLERS = BEST_SELLER_ROWS * RAIL_COLUMNS
const NEW_ARRIVALS = NEW_ARRIVAL_ROWS * RAIL_COLUMNS
/** Compact picks listed in the sticky sidebar. */
const SIDEBAR_PICKS = 4

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [
    featuredRes,
    newArrivalsRes,
    categoriesRes,
    originsRes,
    regionsRes,
    testimonialsRes,
    bannersRes,
    brandsRes,
  ] = await Promise.all([
      // No sales data exists — `isFeatured` is the editorial stand-in for best sellers.
      payload.find({
        collection: 'products',
        where: { isFeatured: { equals: true }, ...PUBLISHED },
        limit: BEST_SELLERS,
        depth: 2,
      }),
      payload.find({
        collection: 'products',
        where: PUBLISHED,
        sort: '-createdAt',
        limit: NEW_ARRIVALS,
        depth: 2,
      }),
      // Departments only — the homepage row is the top of the tree.
      payload.find({
        collection: 'categories',
        where: { parent: { exists: false } },
        limit: 16,
        depth: 1,
        sort: 'sortOrder',
      }),
      payload.find({
        collection: 'products',
        where: PUBLISHED,
        depth: 0,
        limit: 1000,
        select: { origin: true, brand: true },
      }),
      // Presentation only — a region's products come from origin.country. Left
      // unsorted here so resolveRegions can apply sortOrder with the bundled
      // table as the tiebreak.
      payload.find({ collection: 'regions', limit: 20, depth: 1 }),
      payload.find({ collection: 'testimonials', limit: 6, depth: 1 }),
      // depth 2 reaches a featured product's photo (banner → product → media).
      // `populate` trims that product to what the panel renders, because the
      // banners are serialised into the client component whole.
      payload.find({
        collection: 'banners',
        where: { active: { equals: true } },
        limit: 24,
        depth: 2,
        sort: 'sortOrder',
        populate: {
          products: {
            title: true,
            slug: true,
            images: true,
            basePrice: true,
            baseCompareAt: true,
            brand: true,
            _status: true,
          },
          brands: { title: true },
        },
      }),
      // depth 1 so `logo` comes back populated — resolveBrandMarks needs the
      // upload resolved to prefer it over the bundled file.
      payload.find({ collection: 'brands', limit: 0, pagination: false, depth: 1 }),
    ])

  // Too few products carry `isFeatured` to fill three rows, so top the rail up
  // with an alphabetical slice that skips whatever is already in it.
  let bestSellers = featuredRes.docs
  if (bestSellers.length < BEST_SELLERS) {
    const taken = bestSellers.map((p) => p.id)
    const fallback = await payload.find({
      collection: 'products',
      where: taken.length ? { and: [PUBLISHED, { id: { not_in: taken } }] } : PUBLISHED,
      sort: 'title',
      limit: BEST_SELLERS - bestSellers.length,
      depth: 2,
    })
    bestSellers = [...bestSellers, ...fallback.docs]
  }

  // The sidebar sits alongside both rails, so its picks skip everything the
  // rails already show.
  const railIds = [...bestSellers, ...newArrivalsRes.docs].map((p) => p.id)
  const picksRes = await payload.find({
    collection: 'products',
    where: railIds.length ? { and: [PUBLISHED, { id: { not_in: railIds } }] } : PUBLISHED,
    sort: 'title',
    limit: SIDEBAR_PICKS,
    depth: 2,
  })
  // Falls back to the best sellers only when the catalogue is too small to
  // supply anything the rails haven't already used.
  const sidebarPicks = picksRes.docs.length ? picksRes.docs : bestSellers.slice(0, SIDEBAR_PICKS)

  const byCountry = new Map<string, number>()
  for (const doc of originsRes.docs) {
    const country = countryName(doc.origin?.country)
    if (country) byCountry.set(country, (byCountry.get(country) ?? 0) + 1)
  }
  const countries = [...byCountry.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country))
    .slice(0, MAX_COUNTRIES)

  // Only surface dietary facets that actually match something. A count query,
  // not a find: `limit: 0` means "no limit" to Payload, so each of these used to
  // load every matching product in full just to read `totalDocs`.
  const dietaryCounts = await Promise.all(
    DIETARY_FACETS.map(async (facet) => {
      const { totalDocs } = await payload.count({
        collection: 'products',
        where: { and: [PUBLISHED, dietaryWhere(facet)] },
      })
      return { slug: facet.slug, label: facet.label, count: totalDocs }
    }),
  )
  const dietaryFacets = dietaryCounts
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count)

  const categories = categoriesRes.docs
  const regions = resolveRegions(regionsRes.docs)
  const brandMarks = resolveBrandMarks(
    stockedBrands(brandsRes.docs, originsRes.docs).map(({ brand }) => brand),
    BRAND_STRIP_MARKS,
  )

  // Group banners by their placement slot so the layout can drop each set in.
  const banners: BannerSlots = {}
  for (const banner of bannersRes.docs) {
    const slot = banner.placement
    ;(banners[slot] ??= []).push(banner)
  }

  return (
    <HomePageClient
      bestSellers={bestSellers}
      bestSellerRows={BEST_SELLER_ROWS}
      newArrivalRows={NEW_ARRIVAL_ROWS}
      sidebarPicks={sidebarPicks}
      newArrivals={newArrivalsRes.docs}
      categories={categories}
      regions={regions}
      countries={countries}
      dietaryFacets={dietaryFacets}
      testimonials={testimonialsRes.docs}
      banners={banners}
      brandMarks={brandMarks}
    />
  )
}
