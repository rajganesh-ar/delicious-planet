import { getPayload } from 'payload'
import config from '@/payload.config'
import { HomePageClient } from '@/components/sections/HomePageClient'
import type { BannerSlots } from '@/components/sections/HomePageClient'
import { RAIL_COLUMNS } from '@/components/sections/home/ProductRail'
import { DIETARY_FACETS, dietaryWhere } from '@/lib/facets'

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
    collectionsRes,
    originsRes,
    testimonialsRes,
    bannersRes,
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
      // Regions are modelled as top-level categories ("Bite Into Europe").
      payload.find({ collection: 'categories', limit: 8, depth: 1, sort: 'sortOrder' }),
      payload.find({ collection: 'product-collections', limit: 16, depth: 1, sort: 'sortOrder' }),
      payload.find({
        collection: 'products',
        where: PUBLISHED,
        depth: 0,
        limit: 1000,
        select: { countryOfOrigin: true },
      }),
      payload.find({ collection: 'testimonials', limit: 6, depth: 1 }),
      payload.find({
        collection: 'banners',
        where: { active: { equals: true } },
        limit: 24,
        depth: 1,
        sort: 'sortOrder',
      }),
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
    const country = doc.countryOfOrigin?.trim()
    if (country) byCountry.set(country, (byCountry.get(country) ?? 0) + 1)
  }
  const countries = [...byCountry.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country))
    .slice(0, MAX_COUNTRIES)

  // Only surface dietary facets that actually match something.
  const dietaryCounts = await Promise.all(
    DIETARY_FACETS.map(async (facet) => {
      const res = await payload.find({
        collection: 'products',
        where: { and: [PUBLISHED, dietaryWhere(facet)] },
        limit: 0,
        depth: 0,
      })
      return { slug: facet.slug, label: facet.label, count: res.totalDocs }
    }),
  )
  const dietaryFacets = dietaryCounts
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count)

  const collections = collectionsRes.docs

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
      regionCategories={categoriesRes.docs}
      featuredCollections={collections.slice(0, 4)}
      categoryCollections={collections.slice(4)}
      countries={countries}
      dietaryFacets={dietaryFacets}
      testimonials={testimonialsRes.docs}
      banners={banners}
    />
  )
}
