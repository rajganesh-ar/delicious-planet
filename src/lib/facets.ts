import type { Where } from 'payload'

/**
 * Dietary facets map a URL slug onto the boolean fields in the Products
 * `dietary` group, so `/products?dietary=halal` needs no schema change.
 */
export interface DietaryFacet {
  slug: string
  label: string
  field: string
}

export const DIETARY_FACETS: DietaryFacet[] = [
  { slug: 'halal', label: 'Halal', field: 'dietary.isHalal' },
  { slug: 'vegetarian', label: 'Vegetarian', field: 'dietary.isVegetarian' },
  { slug: 'vegan', label: 'Vegan', field: 'dietary.isVegan' },
  { slug: 'gluten-free', label: 'Gluten Free', field: 'dietary.isGlutenFree' },
  { slug: 'lactose-free', label: 'Lactose Free', field: 'dietary.isLactoseFree' },
  { slug: 'organic', label: 'Organic', field: 'dietary.isOrganic' },
]

export function getDietaryFacet(slug: string): DietaryFacet | undefined {
  return DIETARY_FACETS.find((f) => f.slug === slug)
}

export function dietaryWhere(facet: DietaryFacet): Where {
  return { [facet.field]: { equals: true } }
}

/**
 * Price bands in AED, the catalogue base currency.
 *
 * These filter on the rolled-up `basePrice` column rather than scanning the
 * variants array, so a band can no longer be satisfied by some other size of
 * the same product.
 */
export interface PriceBand {
  slug: string
  label: string
  min?: number
  max?: number
}

export const PRICE_BANDS: PriceBand[] = [
  { slug: 'under-50', label: 'Under AED 50', max: 50 },
  { slug: '50-100', label: 'AED 50 – 100', min: 50, max: 100 },
  { slug: '100-250', label: 'AED 100 – 250', min: 100, max: 250 },
  { slug: 'over-250', label: 'AED 250 & above', min: 250 },
]

export function getPriceBand(slug: string): PriceBand | undefined {
  return PRICE_BANDS.find((b) => b.slug === slug)
}
