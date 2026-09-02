/**
 * Facet counting for the shop listing.
 *
 * The listing itself filters in Postgres (see the `where` built in
 * app/(frontend)/products/page.tsx), but the sidebar also has to say how many
 * products each *unchosen* option would return. One count query per option
 * would be dozens of round-trips, so the page pulls a single narrow projection
 * of the published catalogue instead and this module tallies it in memory.
 *
 * Every dimension is counted against the other active filters but not its own —
 * the standard faceted-search rule, so choosing "Halal" narrows the brand counts
 * while the dietary list still shows what switching to "Vegan" would return.
 */
import { DIETARY_FACETS, PRICE_BANDS } from './facets'
import { countryName } from './countries'
import type { Region } from './regions'
import type { Brand, Category, Product, Supplier } from '@/payload-types'

/**
 * The projections this module works from.
 *
 * Payload types a `select`ed query to exactly the columns asked for, so taking
 * full `Product`/`Category` docs here would force the page to over-fetch. These
 * shapes are the contract instead — a full doc satisfies them too.
 */
export type FacetProduct = {
  id: number | string
  title?: string | null
  sku?: string | null
  shortDescription?: string | null
  category?: Product['category'] | null
  brand?: Product['brand']
  supplier?: Product['supplier']
  origin?: Product['origin']
  dietary?: Product['dietary']
  basePrice?: Product['basePrice']
  inStock?: Product['inStock']
  isFeatured?: Product['isFeatured']
}

export type FacetCategory = Pick<Category, 'id' | 'title' | 'slug' | 'parent' | 'sortOrder'>
export type FacetBrand = Pick<Brand, 'id' | 'slug' | 'title'>
export type FacetSupplier = Pick<Supplier, 'id' | 'slug' | 'name'>

export interface FacetOption {
  slug: string
  label: string
  count: number
}

/** A department plus its immediate children, both carrying subtree counts. */
export interface CategoryFacet extends FacetOption {
  children: FacetOption[]
}

export interface ShopFacets {
  categories: CategoryFacet[]
  brands: FacetOption[]
  suppliers: FacetOption[]
  countries: FacetOption[]
  regions: FacetOption[]
  dietary: FacetOption[]
  price: FacetOption[]
  /** Counts for the two toggles, under every other active filter. */
  inStock: number
  featured: number
}

/** The active filters, already normalised — `country` is an ISO code. */
export interface ShopSelection {
  category: string
  brand: string
  supplier: string
  region: string
  country: string
  dietary: string
  price: string
  search: string
  featured: boolean
  inStock: boolean
}

/** Relationship fields arrive as an id at depth 0 and an object deeper. */
function relId(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') {
    const id = (value as { id?: string | number }).id
    return id === undefined ? null : String(id)
  }
  return String(value)
}

/* ── Category tree ──────────────────────────────────────────────────── */

export interface CategoryIndex {
  bySlug: Map<string, FacetCategory>
  /** Category id → the ids of that category and everything beneath it. */
  subtree: Map<string, string[]>
  /** Top-level categories, in `sortOrder` then title order. */
  departments: FacetCategory[]
  childrenOf: (id: string) => FacetCategory[]
}

/**
 * Indexes the flat category list into the shapes the listing needs.
 *
 * Products attach to leaves, so a department selection has to widen to its
 * whole subtree — the rule the /categories/[slug] page applies with an
 * `ancestors` lookup, resolved here from the list already in memory.
 */
export function indexCategories(categories: FacetCategory[]): CategoryIndex {
  const bySlug = new Map<string, FacetCategory>()
  const childrenById = new Map<string, FacetCategory[]>()
  const roots: FacetCategory[] = []

  for (const cat of categories) bySlug.set(cat.slug, cat)

  for (const cat of categories) {
    const parent = relId(cat.parent)
    if (parent) {
      childrenById.set(parent, [...(childrenById.get(parent) ?? []), cat])
    } else {
      roots.push(cat)
    }
  }

  const order = (a: FacetCategory, b: FacetCategory) =>
    (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.title.localeCompare(b.title)

  roots.sort(order)
  for (const list of childrenById.values()) list.sort(order)

  // Breadth-first from each node. `seen` guards against a lineage cycle so a
  // bad CMS edit degrades to a short list rather than hanging the request.
  const subtree = new Map<string, string[]>()
  for (const cat of categories) {
    const seen = new Set<string>()
    const queue = [String(cat.id)]
    while (queue.length) {
      const id = queue.shift()!
      if (seen.has(id)) continue
      seen.add(id)
      for (const child of childrenById.get(id) ?? []) queue.push(String(child.id))
    }
    subtree.set(String(cat.id), [...seen])
  }

  return {
    bySlug,
    subtree,
    departments: roots,
    childrenOf: (id) => childrenById.get(id) ?? [],
  }
}

/** Ids matching `?category=<slug>` — the category itself plus its descendants. */
export function categorySubtreeIds(index: CategoryIndex, slug: string): string[] {
  const cat = index.bySlug.get(slug)
  if (!cat) return []
  return index.subtree.get(String(cat.id)) ?? [String(cat.id)]
}

/* ── Counting ───────────────────────────────────────────────────────── */

type Dimension =
  | 'category'
  | 'brand'
  | 'supplier'
  | 'region'
  | 'country'
  | 'dietary'
  | 'price'
  | 'search'
  | 'featured'
  | 'inStock'

interface BuildArgs {
  /** Narrow projection of every published product. */
  docs: FacetProduct[]
  categories: FacetCategory[]
  brands: FacetBrand[]
  suppliers: FacetSupplier[]
  regions: Region[]
  selection: ShopSelection
}

export function buildShopFacets({
  docs,
  categories,
  brands,
  suppliers,
  regions,
  selection,
}: BuildArgs): ShopFacets {
  const index = indexCategories(categories)

  const selectedCategoryIds = selection.category
    ? new Set(categorySubtreeIds(index, selection.category))
    : null

  const dietary = DIETARY_FACETS.find((f) => f.slug === selection.dietary)
  const band = PRICE_BANDS.find((b) => b.slug === selection.price)
  const term = selection.search.trim().toLowerCase()

  const inBand = (price: number | null | undefined, min?: number, max?: number) => {
    if (price === null || price === undefined) return false
    if (min !== undefined && price < min) return false
    if (max !== undefined && price >= max) return false
    return true
  }

  const tests: Record<Dimension, (doc: FacetProduct) => boolean> = {
    category: (d) => !selectedCategoryIds || selectedCategoryIds.has(relId(d.category) ?? ''),
    brand: (d) => !selection.brand || brandSlug(d, brands) === selection.brand,
    supplier: (d) => !selection.supplier || supplierSlug(d, suppliers) === selection.supplier,
    region: (d) => !selection.region || d.origin?.region === selection.region,
    country: (d) => !selection.country || d.origin?.country === selection.country,
    dietary: (d) => !dietary || dietaryValue(d, dietary.field),
    price: (d) => !band || inBand(d.basePrice, band.min, band.max),
    search: (d) =>
      !term ||
      [d.title, d.shortDescription, d.sku]
        .filter((v): v is string => typeof v === 'string')
        .some((v) => v.toLowerCase().includes(term)),
    featured: (d) => !selection.featured || d.isFeatured === true,
    inStock: (d) => !selection.inStock || d.inStock === true,
  }

  const DIMENSIONS = Object.keys(tests) as Dimension[]

  /** Products that survive every filter except `skip`. */
  const pool = (skip: Dimension): FacetProduct[] =>
    docs.filter((doc) => DIMENSIONS.every((dim) => dim === skip || tests[dim](doc)))

  // ── Categories: tally leaves once, then roll each subtree up
  const categoryHits = new Map<string, number>()
  for (const doc of pool('category')) {
    const id = relId(doc.category)
    if (id) categoryHits.set(id, (categoryHits.get(id) ?? 0) + 1)
  }
  const subtreeCount = (cat: FacetCategory): number =>
    (index.subtree.get(String(cat.id)) ?? []).reduce(
      (sum, id) => sum + (categoryHits.get(id) ?? 0),
      0,
    )

  // An option is kept when it would return something, or when it is the one
  // currently chosen — otherwise the active filter would vanish from the panel.
  const categoryFacets: CategoryFacet[] = index.departments
    .map((dept) => ({
      slug: dept.slug,
      label: dept.title,
      count: subtreeCount(dept),
      children: index
        .childrenOf(String(dept.id))
        .map((child) => ({ slug: child.slug, label: child.title, count: subtreeCount(child) }))
        .filter((child) => child.count > 0 || child.slug === selection.category),
    }))
    .filter((dept) => dept.count > 0 || dept.slug === selection.category)

  const brandFacets = tally(
    pool('brand'),
    (doc) => brandSlug(doc, brands),
    (slug) => brands.find((b) => b.slug === slug)?.title ?? slug,
  )
  const supplierFacets = tally(
    pool('supplier'),
    (doc) => supplierSlug(doc, suppliers),
    (slug) => suppliers.find((s) => s.slug === slug)?.name ?? slug,
  )
  const countryFacets = tally(
    pool('country'),
    (doc) => doc.origin?.country ?? null,
    (code) => countryName(code) ?? code,
  )

  // Regions, dietary and price keep their declared order so the lists never
  // reshuffle under the cursor as counts change.
  const regionPool = pool('region')
  const regionFacets: FacetOption[] = regions
    .map((region) => ({
      slug: region.slug,
      label: region.label,
      count: regionPool.filter((doc) => doc.origin?.region === region.slug).length,
    }))
    .filter((r) => r.count > 0 || r.slug === selection.region)

  const dietaryPool = pool('dietary')
  const dietaryFacets: FacetOption[] = DIETARY_FACETS.map((facet) => ({
    slug: facet.slug,
    label: facet.label,
    count: dietaryPool.filter((doc) => dietaryValue(doc, facet.field)).length,
  })).filter((f) => f.count > 0 || f.slug === selection.dietary)

  const pricePool = pool('price')
  const priceFacets: FacetOption[] = PRICE_BANDS.map((b) => ({
    slug: b.slug,
    label: b.label,
    count: pricePool.filter((doc) => inBand(doc.basePrice, b.min, b.max)).length,
  })).filter((b) => b.count > 0 || b.slug === selection.price)

  return {
    categories: categoryFacets,
    brands: brandFacets,
    suppliers: supplierFacets,
    countries: countryFacets,
    regions: regionFacets,
    dietary: dietaryFacets,
    price: priceFacets,
    inStock: pool('inStock').filter((doc) => doc.inStock === true).length,
    featured: pool('featured').filter((doc) => doc.isFeatured === true).length,
  }
}

/** Count by key, drop empties, sort by count then label. */
function tally(
  docs: FacetProduct[],
  key: (doc: FacetProduct) => string | null,
  label: (key: string) => string,
): FacetOption[] {
  const counts = new Map<string, number>()
  for (const doc of docs) {
    const value = key(doc)
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, label: label(slug), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function brandSlug(doc: FacetProduct, brands: FacetBrand[]): string | null {
  if (typeof doc.brand === 'object' && doc.brand !== null) return (doc.brand as Brand).slug
  const id = relId(doc.brand)
  return id ? (brands.find((b) => String(b.id) === id)?.slug ?? null) : null
}

function supplierSlug(doc: FacetProduct, suppliers: FacetSupplier[]): string | null {
  if (typeof doc.supplier === 'object' && doc.supplier !== null)
    return (doc.supplier as Supplier).slug
  const id = relId(doc.supplier)
  return id ? (suppliers.find((s) => String(s.id) === id)?.slug ?? null) : null
}

/** `dietary.isHalal` → the boolean on the doc's dietary group. */
function dietaryValue(doc: FacetProduct, field: string): boolean {
  const key = field.split('.').pop() as keyof NonNullable<Product['dietary']>
  return doc.dietary?.[key] === true
}
