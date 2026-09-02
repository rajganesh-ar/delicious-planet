/**
 * Assigning SKUs to feeds that ship without them.
 *
 * A variant SKU is what an order line records, so it has to identify exactly
 * one buyable thing and stay identical across re-imports — regenerating them
 * would orphan order history. Deriving from the handle gives both, but only if
 * a multi-variant product also discriminates per variant: handle alone put the
 * same SKU on all three sizes of a chocolate box and was rejected outright by
 * `assertUniqueVariantSkus`.
 */

const MAX_LENGTH = 52

function clean(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface AssignSkuArgs {
  prefix: string
  handle: string
  /** The variant's own option label, when it has one. */
  label?: string | null
  index: number
  /** How many variants the product has — a lone variant needs no suffix. */
  total: number
  /** Stable source id, used only to disambiguate a truncated SKU. */
  variantId: number | string
}

export function assignSku({
  prefix,
  handle,
  label,
  index,
  total,
  variantId,
}: AssignSkuArgs): string {
  let sku = `${clean(prefix)}-${clean(handle)}`

  if (total > 1) {
    const named = label?.trim()
    const suffix =
      named && named.toLowerCase() !== 'default title' ? clean(named) : String(index + 1)
    sku = `${sku}-${suffix}`
  }

  if (sku.length <= MAX_LENGTH) return sku
  // Truncating can collide, so a tail of the source id restores uniqueness.
  return `${sku.slice(0, MAX_LENGTH - 5).replace(/-+$/, '')}-${String(variantId).slice(-4)}`
}
