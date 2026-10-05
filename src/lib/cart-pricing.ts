import type { Payload } from 'payload'
import type { Product } from '@/payload-types'
import { BASE_CURRENCY, MAX_QTY_PER_LINE, getVariantBySku } from './product'

export interface CartLineInput {
  productId: number
  variantSku: string
  quantity: number
}

export interface PricedLine {
  productId: number
  variantSku: string
  title: string
  size: string | null
  imageUrl?: string
  quantity: number
  unitAmount: number
  currency: string
}

export type PricingResult =
  | { ok: true; lines: PricedLine[]; currency: string; subtotal: number }
  /**
   * `line` names the basket line at fault when there is one, so checkout can
   * point at it. A product that has been deleted has no title to put in the
   * message, and "one of the items" left the shopper guessing which to remove.
   */
  | { ok: false; error: string; line?: { productId: number; variantSku: string } }

const MAX_LINES = 50

function firstImageUrl(product: Product, variantImage: unknown): string | undefined {
  const image = variantImage ?? product.images?.[0]?.image
  if (typeof image === 'object' && image !== null) {
    const media = image as { sizes?: { card?: { url?: string | null } }; url?: string | null }
    return media.sizes?.card?.url ?? media.url ?? undefined
  }
  return undefined
}

/**
 * Re-prices a cart from the product records.
 *
 * The browser tells us *what* is being bought, never *what it costs* — otherwise
 * anyone can POST an order for a 650 AED gift set at 0.01. Every amount that
 * reaches Stripe or the order record comes from here.
 *
 * Pricing is per variant: a line names a product *and* a variant SKU, and the
 * amount comes off that variant. Pricing off the product would charge the 30g
 * price for a 1kg tin.
 */
export async function priceCart(
  payload: Payload,
  input: CartLineInput[],
): Promise<PricingResult> {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: 'Your cart is empty.' }
  }
  if (input.length > MAX_LINES) {
    return { ok: false, error: 'That is too many different items for a single order.' }
  }

  // Collapse duplicates so a repeated line can't slip past the per-line quantity
  // cap. Keyed on product *and* variant — two sizes are two separate lines.
  const merged = new Map<string, { productId: number; variantSku: string; quantity: number }>()

  for (const line of input) {
    const id = Number(line?.productId)
    const qty = Number(line?.quantity)
    const sku = typeof line?.variantSku === 'string' ? line.variantSku.trim() : ''

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, error: 'Your cart contains an unrecognised product.' }
    }
    if (!sku) {
      return { ok: false, error: 'Please choose a size for each item in your cart.' }
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ok: false, error: 'Please choose a quantity between 1 and 99 for each item.' }
    }

    const key = `${id}::${sku}`
    const existing = merged.get(key)
    merged.set(key, {
      productId: id,
      variantSku: sku,
      quantity: (existing?.quantity ?? 0) + qty,
    })
  }

  const lines: PricedLine[] = []

  for (const { productId, variantSku, quantity } of merged.values()) {
    if (quantity > MAX_QTY_PER_LINE) {
      return { ok: false, error: 'Please choose a quantity between 1 and 99 for each item.' }
    }

    const line = { productId, variantSku }
    let product: Product | null = null
    try {
      product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 1,
        overrideAccess: true,
      })
    } catch {
      product = null
    }

    if (!product || product._status !== 'published') {
      return { ok: false, error: 'One of the items in your cart is no longer available.', line }
    }

    const variant = getVariantBySku(product, variantSku)
    if (!variant) {
      return {
        ok: false,
        error: `The size you chose for "${product.title}" is no longer available.`,
        line,
      }
    }
    if (variant.inStock === false) {
      return { ok: false, error: `"${product.title}" (${variant.size}) is out of stock.`, line }
    }
    // Zero is refused as well as missing: an imported size the supplier priced
    // at 0.00 (as one Intermex listing still is) would otherwise be given away.
    if (typeof variant.price !== 'number' || !(variant.price > 0)) {
      return {
        ok: false,
        error: `"${product.title}" is not currently priced for online purchase.`,
        line,
      }
    }

    lines.push({
      productId,
      variantSku,
      title: product.title,
      size: variant.size ?? null,
      imageUrl: firstImageUrl(product, variant.image),
      quantity,
      unitAmount: variant.price,
      currency: BASE_CURRENCY,
    })
  }

  if (lines.length === 0) {
    return { ok: false, error: 'Your cart is empty.' }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0)
  // Guard against float drift accumulating into a mismatch with the Stripe total.
  return {
    ok: true,
    lines,
    currency: BASE_CURRENCY,
    subtotal: Math.round(subtotal * 100) / 100,
  }
}
