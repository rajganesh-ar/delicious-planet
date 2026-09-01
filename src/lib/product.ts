import type { Product, Media, Category, Brand, ProductCollection } from '@/payload-types'

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

/** Products store multiple currencies; the storefront always renders the first. */
export function getPrice(product: Product): ProductPrice | null {
  const p = product.prices?.[0]
  if (!p) return null
  return { amount: p.amount, currency: p.currency, compareAt: p.compareAtAmount ?? undefined }
}

export function getCategoryTitle(product: Product): string | null {
  if (typeof product.category === 'object' && product.category !== null) {
    return (product.category as Category).title ?? null
  }
  return null
}

export function getCollectionTitle(product: Product): string | null {
  if (typeof product.collection === 'object' && product.collection !== null) {
    return (product.collection as ProductCollection).title ?? null
  }
  return null
}

export function getBrandName(product: Product): string | null {
  if (typeof product.brand === 'object' && product.brand !== null) {
    return (product.brand as Brand).title ?? null
  }
  return null
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

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}
