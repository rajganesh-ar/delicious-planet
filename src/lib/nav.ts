/**
 * Storefront navigation model.
 *
 * The header is built server-side from live CMS data so the menus never drift
 * from the catalogue: product types come from `product-collections`, regions
 * from the top-level `categories` (see src/lib/regions.ts for why those are the
 * same thing here), and price/dietary entries from the facet tables.
 *
 * Everything here is plain serialisable data — the header is a client
 * component, so no Payload documents may cross the boundary.
 */
import { PRICE_BANDS, DIETARY_FACETS } from './facets'
import { getCategoryImage, getCollectionImage } from './images'
import { REGIONS, getRegionForCategoryTitle } from './regions'
import type { Category, ProductCollection, Supplier } from '@/payload-types'

export interface NavLinkItem {
  label: string
  href: string
}

export interface NavColumn {
  heading: string
  links: NavLinkItem[]
}

export interface NavCard {
  label: string
  href: string
  image: string | null
  eyebrow?: string
  caption?: string
}

export interface NavPanel {
  /**
   * `mega` — link columns with an image-card rail on the right.
   * `cards` — image-card grid (used by Shop by Region).
   * `list`  — narrow single-column dropdown.
   */
  kind: 'mega' | 'cards' | 'list'
  columns?: NavColumn[]
  cards?: NavCard[]
  cardsHeading?: string
  /** Chips rendered under the panel body, e.g. popular countries of origin. */
  chips?: { heading: string; links: NavLinkItem[] }
  cta?: NavLinkItem
}

export interface NavEntry {
  label: string
  href: string
  /** Renders in the accent colour — used for the trade entry. */
  accent?: boolean
  panel?: NavPanel
}

interface BuildNavArgs {
  /** Top-level CMS categories; this store models regions as categories. */
  categories: Category[]
  /** Product-type taxonomy. Empty until the collections seed has run. */
  collections: ProductCollection[]
  /** Producers behind the catalogue, shown as the "Shop by Brand" column. */
  suppliers?: Supplier[]
  /**
   * Countries that actually appear on published products, most stocked first.
   * Drives the "popular origins" chips so none of them lead to an empty listing.
   */
  originCountries?: string[]
  /** CMS-authored nav items, appended when an editor has added their own. */
  cmsItems?: { label: string; href?: string | null }[]
}

const MAX_COLLECTION_LINKS = 14
const COLLECTION_COLUMN_SIZE = 7
const MAX_ORIGIN_CHIPS = 10

/** One country per region — the fallback used before any product is stocked. */
const FALLBACK_ORIGINS = REGIONS.map((region) => region.countries[0])

function originChips(countries: string[]): NavLinkItem[] {
  const source = countries.length > 0 ? countries : FALLBACK_ORIGINS
  return source.slice(0, MAX_ORIGIN_CHIPS).map((country) => ({
    label: country,
    href: `/products?originCountry=${encodeURIComponent(country)}`,
  }))
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

function collectionColumns(collections: ProductCollection[]): NavColumn[] {
  const links = collections.slice(0, MAX_COLLECTION_LINKS).map((col) => ({
    label: col.title,
    href: `/products?collection=${col.slug}`,
  }))

  return chunk(links, COLLECTION_COLUMN_SIZE).map((group, i) => ({
    heading: i === 0 ? 'Shop by Collection' : 'More Collections',
    links: group,
  }))
}

/** Region cards prefer CMS artwork, falling back to the bundled region image. */
function regionCards(categories: Category[]): NavCard[] {
  return REGIONS.map((region) => {
    const cmsCategory = categories.find((c) => getRegionForCategoryTitle(c.title)?.slug === region.slug)

    return {
      label: region.label,
      href: `/products?region=${region.slug}`,
      image: (cmsCategory ? getCategoryImage(cmsCategory) : null) ?? region.image,
      eyebrow: region.eyebrow,
      caption: region.description,
    }
  })
}

export function buildNav({
  categories,
  collections,
  suppliers = [],
  originCountries = [],
  cmsItems = [],
}: BuildNavArgs): NavEntry[] {
  const featured = collections.find((c) => getCollectionImage(c))

  const brandColumn: NavColumn[] = suppliers.length
    ? [
        {
          heading: 'Shop by Brand',
          links: [
            ...suppliers.slice(0, 6).map((s) => ({
              label: s.name,
              href: `/products?supplier=${s.slug}`,
            })),
            { label: 'All Brands', href: '/brands' },
          ],
        },
      ]
    : []

  const shopPanel: NavPanel = {
    kind: 'mega',
    columns: [
      {
        heading: 'Featured',
        links: [
          { label: 'All Products', href: '/products' },
          { label: 'Best Sellers', href: '/products?featured=true' },
          { label: 'New Arrivals', href: '/products?sort=-createdAt' },
          { label: 'In Stock Now', href: '/products?inStock=true' },
          { label: 'Recipes & Pairings', href: '/recipes' },
        ],
      },
      // Empty until the product-collections seed has run — the brand and facet
      // columns keep the panel populated in the meantime.
      ...collectionColumns(collections),
      ...brandColumn,
      {
        heading: 'Shop by Price',
        links: PRICE_BANDS.map((band) => ({
          label: band.label,
          href: `/products?price=${band.slug}`,
        })),
      },
      {
        heading: 'Dietary',
        links: DIETARY_FACETS.map((facet) => ({
          label: facet.label,
          href: `/products?dietary=${facet.slug}`,
        })),
      },
    ],
    cardsHeading: 'Highlights',
    cards: [
      {
        label: featured?.title ?? 'Curated Collections',
        href: featured ? `/products?collection=${featured.slug}` : '/products',
        image: featured ? getCollectionImage(featured) : '/images/collections/pantry.avif',
        eyebrow: 'Editor’s pick',
      },
      {
        label: 'Partner with us',
        href: '/b2b',
        image: '/images/b2b/commercial-resturant.avif',
        eyebrow: 'Trade & wholesale',
      },
    ],
    cta: { label: 'Shop all products', href: '/products' },
  }

  const regionPanel: NavPanel = {
    kind: 'cards',
    cards: regionCards(categories),
    chips: { heading: 'Popular origins', links: originChips(originCountries) },
    cta: { label: 'Browse every region', href: '/categories' },
  }

  const entries: NavEntry[] = [
    { label: 'Shop All', href: '/products', panel: shopPanel },
    { label: 'Shop by Region', href: '/categories', panel: regionPanel },
    { label: 'Best Sellers', href: '/products?featured=true' },
    { label: 'New Arrivals', href: '/products?sort=-createdAt' },
    { label: 'Brands', href: '/brands' },
    { label: 'Recipes', href: '/recipes' },
    {
      label: 'Discover',
      href: '/about',
      panel: {
        kind: 'list',
        columns: [
          {
            heading: 'Discover',
            links: [
              { label: 'Our Story', href: '/about' },
              { label: 'Sourcing', href: '/sourcing' },
              { label: 'Sustainability', href: '/sustainability' },
              { label: 'Experiences', href: '/experiences' },
              { label: 'Journal', href: '/journal' },
              { label: 'Contact', href: '/contact' },
            ],
          },
        ],
      },
    },
    {
      label: 'For Business',
      href: '/b2b',
      accent: true,
      panel: {
        kind: 'list',
        columns: [
          {
            heading: 'Trade',
            links: [
              { label: 'B2B Solutions', href: '/b2b' },
              { label: 'Retail Partners', href: '/retail' },
              { label: 'Vendors & Suppliers', href: '/vendors' },
              { label: 'Shipping & Logistics', href: '/shipping' },
              { label: 'Commercial Terms', href: '/policies#b2b-terms' },
            ],
          },
        ],
      },
    },
  ]

  // Anything an editor added in the CMS that the generated nav doesn't cover.
  const known = new Set(entries.map((e) => e.label.toLowerCase()))
  for (const item of cmsItems) {
    if (!item.href || known.has(item.label.toLowerCase())) continue
    entries.push({ label: item.label, href: item.href })
  }

  return entries
}
