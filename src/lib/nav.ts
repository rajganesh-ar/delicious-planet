/**
 * Storefront navigation model.
 *
 * The header is built server-side from live CMS data so the menus never drift
 * from the catalogue: product types come from `categories`, and price/dietary
 * entries from the facet tables. Regions are the exception: a region's products
 * are derived from REGION_SLUGS in src/lib/countries.ts, and only its wording
 * and artwork are CMS-editable (the `regions` collection).
 *
 * Everything here is plain serialisable data — the header is a client
 * component, so no Payload documents may cross the boundary.
 */
import { PRICE_BANDS, DIETARY_FACETS } from './facets'
import { getCategoryImage } from './images'
import { REGIONS } from './regions'
import type { Region } from './regions'
import { countriesInRegion } from './countries'
import type { Category, Supplier } from '@/payload-types'

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
  /** The product-type tree — departments first, in sortOrder. */
  categories: Category[]
  /** Producers behind the catalogue, shown as the "Shop by Brand" column. */
  suppliers?: Supplier[]
  /**
   * Resolved regions for the "Shop by Region" cards. Defaults to the bundled
   * table so a caller that hasn't fetched the CMS rows still gets a full menu.
   */
  regions?: Region[]
  /**
   * Countries that actually appear on published products, most stocked first.
   * Drives the "popular origins" chips so none of them lead to an empty listing.
   */
  originCountries?: string[]
  /** CMS-authored nav items, appended when an editor has added their own. */
  cmsItems?: { label: string; href?: string | null }[]
}

const MAX_CATEGORY_LINKS = 14
const CATEGORY_COLUMN_SIZE = 7
const MAX_ORIGIN_CHIPS = 10

/** One country per region — the fallback used before any product is stocked. */
const FALLBACK_ORIGINS = REGIONS.map(
  (region) => countriesInRegion(region.slug)[0]?.name ?? '',
).filter(Boolean)

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

function categoryColumns(categories: Category[]): NavColumn[] {
  // The index is only worth a link once it holds more than the menu shows, and
  // it spends one of the slots so the columns stay evenly filled.
  const overflows = categories.length > MAX_CATEGORY_LINKS
  const links: NavLinkItem[] = categories
    .slice(0, overflows ? MAX_CATEGORY_LINKS - 1 : MAX_CATEGORY_LINKS)
    .map((cat) => ({
      label: cat.title,
      href: `/products?category=${cat.slug}`,
    }))
  if (overflows) {
    links.push({ label: 'All Categories', href: '/categories' })
  }

  return chunk(links, CATEGORY_COLUMN_SIZE).map((group, i) => ({
    heading: i === 0 ? 'Shop by Category' : 'More Categories',
    links: group,
  }))
}

/**
 * Region cards render from the resolved region list — the `regions` collection
 * merged over the bundled table, the same list the homepage row uses. Membership
 * is still derived from each product’s origin.country, never authored.
 */
function regionCards(regions: Region[]): NavCard[] {
  return regions.map((region) => ({
    label: region.label,
    href: `/products?region=${region.slug}`,
    image: region.image,
    eyebrow: region.eyebrow,
    caption: region.description,
  }))
}

export function buildNav({
  categories,
  suppliers = [],
  regions = REGIONS,
  originCountries = [],
  cmsItems = [],
}: BuildNavArgs): NavEntry[] {
  const featured = categories.find((c) => getCategoryImage(c))

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
      ...categoryColumns(categories),
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
        href: featured ? `/products?category=${featured.slug}` : '/products',
        image: featured ? getCategoryImage(featured) : '/images/collections/pantry.avif',
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
    cards: regionCards(regions),
    chips: { heading: 'Popular origins', links: originChips(originCountries) },
    cta: { label: 'Browse every region', href: '/products' },
  }

  const entries: NavEntry[] = [
    { label: 'Shop All', href: '/products', panel: shopPanel },
    { label: 'Shop by Region', href: '/products', panel: regionPanel },
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
