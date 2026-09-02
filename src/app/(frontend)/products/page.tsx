import { getPayload } from 'payload'
import config from '@/payload.config'
import { ProductsListing } from '@/components/sections/ProductsListing'
import { isRegionSlug, resolveRegions } from '@/lib/regions'
import { resolveCountryCode } from '@/lib/countries'
import { getDietaryFacet, dietaryWhere, getPriceBand } from '@/lib/facets'
import {
  buildShopFacets,
  categorySubtreeIds,
  indexCategories,
  type ShopSelection,
} from '@/lib/shop-facets'
import type { Where } from 'payload'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const PER_PAGE = 24

/** Upper bound on the projection the facet counts are tallied from. */
const FACET_SCAN_LIMIT = 3000

/** Slugs are unique, so an impossible one is the safe "match nothing" clause. */
const NO_MATCH: Where = { slug: { equals: '__no_such_product__' } }

const str = (value: string | string[] | undefined): string =>
  typeof value === 'string' ? value.trim() : ''

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const payload = await getPayload({ config: await config })

  const page = Number(params.page) || 1
  const sort = str(params.sort) || '-createdAt'
  // `?collection=` is the old product-collections param. Those rows are
  // categories now and kept their slugs, so links already in the wild resolve.
  const categorySlug = str(params.category) || str(params.collection)
  const supplierSlug = str(params.supplier)
  const brandSlug = str(params.brand)
  const regionSlug = str(params.region)
  const dietarySlug = str(params.dietary)
  const priceSlug = str(params.price)
  const searchTerm = str(params.search)
  const featured = params.featured === 'true'
  const inStock = params.inStock === 'true'
  // Accepts an ISO code or a country name, so existing links keep working.
  const originCode = resolveCountryCode(str(params.originCountry))

  // The taxonomy and the vendor lists are needed for both the `where` clause and
  // the filter panel, so they are fetched before the product query rather than
  // beside it. Depth 0 — the panel renders labels, not artwork.
  const [categoriesRes, suppliersRes, brandsRes, regionsRes] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 500,
      depth: 0,
      sort: 'sortOrder',
      select: { title: true, slug: true, parent: true, isDepartment: true, sortOrder: true },
    }),
    payload.find({ collection: 'suppliers', limit: 100, depth: 0, sort: 'name' }),
    payload.find({ collection: 'brands', limit: 200, depth: 0, sort: 'title' }),
    payload.find({ collection: 'regions', limit: 20, depth: 1 }),
  ])

  const categories = categoriesRes.docs
  const suppliers = suppliersRes.docs
  const brands = brandsRes.docs
  const regions = resolveRegions(regionsRes.docs)
  const categoryIndex = indexCategories(categories)

  // ── Where clause ────────────────────────────────────────────────────
  const conditions: Where[] = [{ _status: { equals: 'published' } }]

  if (searchTerm) {
    conditions.push({
      or: [
        { title: { contains: searchTerm } },
        { shortDescription: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
      ],
    })
  }

  if (featured) conditions.push({ isFeatured: { equals: true } })
  if (inStock) conditions.push({ inStock: { equals: true } })
  if (originCode) conditions.push({ 'origin.country': { equals: originCode } })

  // Regions aren't CMS records: origin.region is derived from origin.country
  // on save, so this is a plain indexed equality. See src/lib/countries.ts.
  if (regionSlug && isRegionSlug(regionSlug)) {
    conditions.push({ 'origin.region': { equals: regionSlug } })
  }

  // Dietary flags live in the `dietary` group; price filters the rolled-up
  // `basePrice` so a band can't be satisfied by some other size of the product.
  const dietary = dietarySlug ? getDietaryFacet(dietarySlug) : undefined
  if (dietary) conditions.push(dietaryWhere(dietary))

  const band = priceSlug ? getPriceBand(priceSlug) : undefined
  if (band) {
    if (band.min !== undefined) conditions.push({ basePrice: { greater_than_equal: band.min } })
    if (band.max !== undefined) conditions.push({ basePrice: { less_than: band.max } })
  }

  // Products attach to leaves, so a department has to select its whole subtree
  // or it would come back empty — same rule as /categories/[slug].
  if (categorySlug) {
    const ids = categorySubtreeIds(categoryIndex, categorySlug)
    // An unknown slug must return nothing rather than silently ignoring the
    // filter and showing the entire catalogue.
    conditions.push(ids.length > 0 ? { category: { in: ids } } : NO_MATCH)
  }

  if (supplierSlug) {
    const supplier = suppliers.find((s) => s.slug === supplierSlug)
    conditions.push(supplier ? { supplier: { equals: supplier.id } } : NO_MATCH)
  }

  if (brandSlug) {
    const brand = brands.find((b) => b.slug === brandSlug)
    conditions.push(brand ? { brand: { equals: brand.id } } : NO_MATCH)
  }

  const where: Where = conditions.length > 1 ? { and: conditions } : conditions[0]

  const [productsRes, facetDocsRes] = await Promise.all([
    payload.find({ collection: 'products', where, sort, page, limit: PER_PAGE, depth: 2 }),
    // One narrow scan of the catalogue feeds every count in the filter panel —
    // see src/lib/shop-facets.ts for why this beats a query per option.
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: FACET_SCAN_LIMIT,
      select: {
        title: true,
        sku: true,
        shortDescription: true,
        category: true,
        brand: true,
        supplier: true,
        origin: true,
        dietary: true,
        basePrice: true,
        inStock: true,
        isFeatured: true,
      },
    }),
  ])

  const selection: ShopSelection = {
    category: categorySlug,
    brand: brandSlug,
    supplier: supplierSlug,
    region: regionSlug,
    country: originCode ?? '',
    dietary: dietarySlug,
    price: priceSlug,
    search: searchTerm,
    featured,
    inStock,
  }

  const facets = buildShopFacets({
    docs: facetDocsRes.docs,
    categories,
    brands,
    suppliers,
    regions,
    selection,
  })

  return (
    <ProductsListing
      products={productsRes.docs}
      facets={facets}
      selection={selection}
      totalPages={productsRes.totalPages}
      totalDocs={productsRes.totalDocs}
      currentPage={productsRes.page ?? 1}
      perPage={PER_PAGE}
    />
  )
}
