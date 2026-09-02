import type { Product, Media, Category, Brand } from '@/payload-types'
import { countryName } from './countries'

/** The catalogue stores AED only; other currencies are a display-time concern. */
export const BASE_CURRENCY = 'AED'

export type ProductVariant = NonNullable<Product['variants']>[number]

export interface ProductPrice {
  amount: number
  currency: string
  compareAt?: number
}

/** Card-sized image for listing tiles. */
export function getImageUrl(product: Product): string | null {
  const first = product.images?.[0]
  if (!first) return null
  const img = first.image
  if (typeof img === 'object' && img !== null) {
    return (img as Media).sizes?.card?.url ?? (img as Media).url ?? null
  }
  return null
}

/** Small image used for cart line items. */
export function getThumbUrl(product: Product): string | undefined {
  const first = product.images?.[0]?.image
  if (typeof first === 'object' && first !== null) {
    return (first as Media).sizes?.thumbnail?.url ?? (first as Media).url ?? undefined
  }
  return undefined
}

export function getVariants(product: Product): ProductVariant[] {
  return Array.isArray(product.variants) ? product.variants : []
}

/**
 * The variant a product page opens on: the one flagged default, else the first
 * in stock, else the first that exists.
 */
export function getDefaultVariant(product: Product): ProductVariant | null {
  const variants = getVariants(product)
  if (variants.length === 0) return null
  return (
    variants.find((v) => v.isDefault) ?? variants.find((v) => v.inStock !== false) ?? variants[0]!
  )
}

/**
 * The variant a listing card's price refers to — the cheapest one.
 *
 * Quick-add uses this rather than the default variant so the amount charged is
 * always the amount the card displayed.
 */
export function getCheapestVariant(product: Product): ProductVariant | null {
  const priced = getVariants(product).filter((v) => typeof v.price === 'number')
  if (priced.length === 0) return null
  return priced.reduce((min, v) => (v.price! < min.price! ? v : min), priced[0]!)
}

export function getVariantBySku(product: Product, sku: string | null | undefined): ProductVariant | null {
  if (!sku) return null
  return getVariants(product).find((v) => v.sku === sku) ?? null
}

export function variantPrice(variant: ProductVariant | null): ProductPrice | null {
  if (!variant || typeof variant.price !== 'number') return null
  return {
    amount: variant.price,
    currency: BASE_CURRENCY,
    compareAt:
      typeof variant.compareAt === 'number' && variant.compareAt > variant.price
        ? variant.compareAt
        : undefined,
  }
}

/**
 * The "from" price shown on listing cards — the cheapest variant, rolled up
 * onto `basePrice` at save time so filters and sorts read one indexed column.
 */
export function getPrice(product: Product): ProductPrice | null {
  if (typeof product.basePrice === 'number') {
    return {
      amount: product.basePrice,
      currency: BASE_CURRENCY,
      compareAt:
        typeof product.baseCompareAt === 'number' && product.baseCompareAt > product.basePrice
          ? product.baseCompareAt
          : undefined,
    }
  }
  // Falls back to the variants themselves if the roll-up has not run yet.
  return variantPrice(getDefaultVariant(product))
}

/** True when the product is sold in more than one size. */
export function hasMultipleSizes(product: Product): boolean {
  return getVariants(product).length > 1
}

export function getCategoryTitle(product: Product): string | null {
  if (typeof product.category === 'object' && product.category !== null) {
    return (product.category as Category).title ?? null
  }
  return null
}

export function getBrandName(product: Product): string | null {
  if (typeof product.brand === 'object' && product.brand !== null) {
    return (product.brand as Brand).title ?? null
  }
  return null
}

/** Display name for the product's country of origin, from its ISO code. */
export function getOriginCountryName(product: Product): string | null {
  return countryName(product.origin?.country)
}

export function isOnSale(price: ProductPrice | null): boolean {
  return !!(price?.compareAt && price.compareAt > price.amount)
}

/** Short dietary marks for listing tiles — capped so tiles stay even. */
export function getDietaryTags(product: Product, limit = 2): string[] {
  const d = product.dietary
  if (!d) return []
  const tags: string[] = []
  if (d.isHalal) tags.push('Halal')
  if (d.isVegan) tags.push('Vegan')
  else if (d.isVegetarian) tags.push('Vegetarian')
  if (d.isGlutenFree) tags.push('Gluten Free')
  if (d.isOrganic) tags.push('Organic')
  return tags.slice(0, limit)
}

export function formatPrice(amount: number, currency = BASE_CURRENCY): string {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency }).format(amount)
}
