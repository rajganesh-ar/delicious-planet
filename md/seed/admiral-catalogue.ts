/**
 * Mapping decisions for the Admiral Caviar import.
 *
 * The harvested feed carries almost everything — titles, per-size prices, SKUs,
 * UPCs, species, roe size, packaging. What is left here is the handful of
 * judgements a feed cannot make: which existing department a product belongs
 * to, and what to record as country of origin when the supplier never states
 * one.
 */

/**
 * The store's own breadcrumb decides the department, mapped onto categories
 * this catalogue already has.
 *
 * No new category is created. The supplier files its sturgeon caviar under a
 * department it calls "Caviar Selection", which is the exact title of the
 * department already sitting at sort order 1 here — creating a second caviar
 * department beside it would split nine products across two near-identical
 * listings for no gain. Its two mother-of-pearl spoons are serveware, not food,
 * and land in the existing tableware department rather than under caviar.
 */
export const BREADCRUMB_TO_CATEGORY: Record<string, string> = {
  'Caviar Selection': 'caviar-selection',
  'Luxury Caviar Accessories': 'bespoke-tableware-cutlery',
}

/**
 * The three tasting sets sit directly under "Store" with no sub-category, but
 * they are boxes of caviar tins, so they belong with the caviar.
 */
export const DEFAULT_CATEGORY = 'caviar-selection'

/**
 * `Label:` lines lifted out of the description into the specifications table.
 * Everything else on a line of its own stays prose.
 */
export const SPEC_LABELS = new Set([
  'maturity',
  'weight',
  'color',
  'colour',
  'roe',
  'flavor',
  'flavour',
  'packaging',
  'total weight',
])

export interface OriginSpec {
  country: string
  producerRegion?: string
}

/**
 * Country of origin, where the supplier actually claims one.
 *
 * Only Royal Beluga does: its own page title sells it as "Authentic Iranian
 * Royal Beluga". Every other listing describes the *species'* natural range
 * rather than where the roe was farmed, and those two are not the same claim —
 * the Russian Osetra copy name-checks an Italian producer, and the Siberian
 * Baerii copy says the species is mostly farmed in France and Italy. Reading a
 * farm origin out of a sturgeon's Latin name would be inventing a provenance
 * claim on a luxury food product.
 */
export const ORIGIN_BY_HANDLE: Record<string, OriginSpec> = {
  'royal-beluga': { country: 'IR', producerRegion: 'Caspian Sea' },
}

/**
 * Everything else falls back to the seller's own country. `origin.country` is
 * required and drives the region filter, so it cannot simply be left empty; AE
 * is where Admiral Caviar trades and ships from, and both AE and IR sit in the
 * middle-east region, so the storefront filter stays coherent either way.
 *
 * This is a placeholder, not a provenance claim. Every product that uses it is
 * flagged in the run report — confirm the farms with the supplier before the
 * catalogue makes an origin claim of its own.
 */
export const ORIGIN_FALLBACK = {
  country: 'AE',
  note:
    'origin recorded as AE (the seller\'s country) — the source states no farm origin, ' +
    'only the species\' natural range. Confirm with the supplier.',
}
