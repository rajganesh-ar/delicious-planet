import { APIError } from 'payload'
import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    // NFKD splits "é" into "e" + a combining accent. Dropping the accent here is
    // the point of decomposing: leave it in and the [^a-z0-9] pass below turns it
    // into a hyphen, so "Pedro Ximénez" slugs as "pedro-xime-nez".
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

/**
 * Slugs are derived, never hand-typed. An importer typo in a slug is a 404 that
 * nobody notices until a customer hits it.
 */
export const ensureProductSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data
  const source = typeof data.slug === 'string' && data.slug.trim() ? data.slug : data.title
  if (typeof source === 'string' && source.trim()) {
    data.slug = slugify(source)
  }
  return data
}

/**
 * Variant SKUs must be unique across the whole catalogue, because they are what
 * an order line records — a collision would make order history ambiguous.
 *
 * This is enforced here rather than with `unique: true` on the field: Payload's
 * unique constraint is not dependable on a field nested inside an array.
 */
export const assertUniqueVariantSkus: CollectionBeforeValidateHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (!data) return data
  const variants = Array.isArray(data.variants) ? data.variants : []
  if (variants.length === 0) return data

  const skus: string[] = []
  const seen = new Set<string>()

  for (const variant of variants) {
    const sku = typeof variant?.sku === 'string' ? variant.sku.trim() : ''
    if (!sku) continue
    const key = sku.toLowerCase()
    if (seen.has(key)) {
      throw new APIError(`Duplicate variant SKU "${sku}" within this product.`, 400)
    }
    seen.add(key)
    skus.push(sku)
  }

  if (skus.length === 0) return data

  const currentId = originalDoc?.id ?? data.id
  const clash = await req.payload.find({
    collection: 'products',
    where: {
      and: [
        { 'variants.sku': { in: skus } },
        ...(currentId ? [{ id: { not_equals: currentId } }] : []),
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (clash.docs.length > 0) {
    throw new APIError(
      `Variant SKU already used by "${clash.docs[0]?.title ?? 'another product'}".`,
      400,
    )
  }

  return data
}

/**
 * Roll variant data up onto the product so listings and filters read one
 * indexed column instead of scanning an array.
 *
 * `basePrice` is the cheapest variant — the "from" price on a card. Filtering
 * on it is what stops a price band matching against some other size.
 */
export const deriveVariantRollups: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data
  const variants = Array.isArray(data.variants) ? data.variants : []

  const priced = variants
    .map((v) => ({ price: Number(v?.price), compareAt: Number(v?.compareAt) }))
    .filter((v) => Number.isFinite(v.price) && v.price >= 0)

  if (priced.length === 0) {
    data.basePrice = null
    data.baseCompareAt = null
  } else {
    const cheapest = priced.reduce((min, v) => (v.price < min.price ? v : min), priced[0]!)
    data.basePrice = cheapest.price
    data.baseCompareAt =
      Number.isFinite(cheapest.compareAt) && cheapest.compareAt > cheapest.price
        ? cheapest.compareAt
        : null
  }

  // A product is buyable when any of its sizes is.
  data.inStock = variants.some((v) => v?.inStock !== false)

  // Exactly one default variant — the one the PDP preselects.
  const defaults = variants.filter((v) => v?.isDefault)
  if (variants.length > 0 && defaults.length !== 1) {
    variants.forEach((v, i) => {
      v.isDefault = i === 0
    })
  }

  return data
}

/** Stamp a publish date once, so a re-import does not reset "New Arrivals". */
export const stampPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) return data
  if (!data.publishedAt && !originalDoc?.publishedAt && data._status === 'published') {
    data.publishedAt = new Date().toISOString()
  }
  return data
}
