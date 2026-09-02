/**
 * Per-product facts for the García de la Cruz import that the Shopify feed does
 * not carry, cannot be trusted on, or states only in prose.
 *
 * This table is deliberately explicit rather than derived by regex. Three of
 * these fields — pack size, dietary flags, appellation — are things a customer
 * makes a buying decision on, and one of them is a claim the source itself gets
 * wrong (see `manchego-cheese-stuffed-olives`). A parser that is 95% right on a
 * dietary flag is worse than a table someone can read in one sitting.
 *
 * `size` resolution, in order of confidence:
 *   stated in the copy      400 g olives, 3 L Mill bottle
 *   stated in the handle    the four 250 mL infusions
 *   stated in a filename    the blend (Blend-AOVE_Semillas500ml.png)
 *   a Shopify option        Early Harvest, Master Miller, Organic Essential
 *   inferred from weight    marked `assumed` below — flagged in the run report
 *
 * The inference: Shopify's `grams` is a shipping weight, not net content, but it
 * is consistent per bottle format. The blend is known-500 mL at 889 g, and the
 * four single varietals ship at 907 g, so they are the same 500 mL bottle. The
 * vinegar at 503 g is roughly half that, so 250 mL. Both are marked `assumed`
 * and neither is certain — confirm with the supplier before a catalogue goes
 * live on them.
 */

export interface DietaryFlags {
  isOrganic?: boolean
  isVegan?: boolean
  isVegetarian?: boolean
  isGlutenFree?: boolean
  isLactoseFree?: boolean
  isHalal?: boolean
}

export interface ProductOverride {
  /** Fixed pack size, when the product has one size and Shopify calls it "Default Title". */
  size?: string
  /** True when `size` is inferred from shipping weight rather than stated. */
  assumedSize?: boolean
  /** Fallback SKU, for the one product the feed ships without one. */
  sku?: string
  packaging?: string
  /** Sub-national origin. Only set where the estate is actually the source. */
  producerRegion?: string
  appellation?: string
  dietary: DietaryFlags
  /**
   * Claims to strike from the supplier's own copy because they are false for
   * this product. Applied to both the lifted specifications list and the
   * description body — correcting the structured `dietary` flags is not enough
   * when the prose beside them still makes the claim.
   */
  contradictedClaims?: string[]
  /** Why this row differs from what the feed says. Printed in the run report. */
  note?: string
}

/**
 * Every oil below is pressed at the family mill in Montes de Toledo, so the
 * estate is the producer region. The three exceptions are deliberate:
 * the olives are Gordal (a Seville variety, "sourced & packed in Spain" and
 * nothing more specific), the Mill bottle claims only "Product of Spain", and
 * the vinegar is made from Pedro Ximénez wine, which is not from Toledo.
 */
const ESTATE = 'Montes de Toledo'

/** Olive oil is ~0.912 g/mL, wine vinegar ~1.01. Used for net weight. */
export const DENSITY_G_PER_ML = { oil: 0.912, vinegar: 1.01 } as const

export const PRODUCT_OVERRIDES: Record<string, ProductOverride> = {
  // ─── Mediterranean Olive Reserve ─────────────────────────────────────────
  'manchego-cheese-stuffed-olives': {
    size: '400g',
    packaging: 'Glass jar',
    dietary: { isVegetarian: true, isGlutenFree: true },
    contradictedClaims: ['Vegan-friendly'],
    note:
      'Source copy says "Vegan-friendly", which is a copy-paste from the sibling ' +
      'olive listings — this one is stuffed with Manchego, a sheep\'s-milk cheese. ' +
      'Imported as vegetarian, not vegan, and not lactose-free, and the claim is ' +
      'struck from the description and specifications.',
  },
  'garlic-stuffed-olives': {
    size: '400g',
    packaging: 'Glass jar',
    dietary: { isVegan: true, isVegetarian: true, isGlutenFree: true, isLactoseFree: true },
  },
  'pimiento-stuffed-olives': {
    size: '400g',
    packaging: 'Glass jar',
    dietary: { isVegan: true, isVegetarian: true, isGlutenFree: true, isLactoseFree: true },
  },

  // ─── Heritage Extra Virgin Oils ──────────────────────────────────────────
  // Multi-size products take their size from the Shopify option, so no `size`.
  'early-harvest-organic-extra-virgin-olive-oil-500ml': {
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'master-miller-coupage-organic-evoo-500ml': {
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'smooth-organic-extra-virgin-olive-oil': {
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'extra-virgin-olive-blend-oil': {
    size: '500mL',
    producerRegion: undefined,
    // 51% EVOO / 34% sunflower / 15% avocado. The copy makes no organic claim
    // for the blend, and Shopify's product_type is inherited from the EVOO line.
    dietary: { isVegan: true, isVegetarian: true, isGlutenFree: true, isLactoseFree: true },
    note: 'Not marked organic: the blend carries no organic claim, only the EVOO line does.',
  },
  'picual-organic-extra-virgin-olive-oil': {
    size: '500mL',
    assumedSize: true,
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'arbequina-single-variety-organic-extra-virgin-olive-oil': {
    size: '500mL',
    assumedSize: true,
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'cornicabra-single-variety-organic-extra-virgin-olive-oil': {
    size: '500mL',
    assumedSize: true,
    producerRegion: ESTATE,
    appellation: 'DOP Montes de Toledo',
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'hojiblanca-single-variety-organic-extra-virgin-olive-oil': {
    size: '500mL',
    assumedSize: true,
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'hot-chili-infused-organic-spanish-aromatic-extra-virgin-olive-oil-250ml': {
    size: '250mL',
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'garlic-infused-organic-spanish-aromatic-extra-virgin-olive-oil-250ml': {
    size: '250mL',
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'lemon-infused-organic-spanish-aromatic-extra-virgin-olive-oil-250ml': {
    size: '250mL',
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'basil-infused-organic-spanish-aromatic-extra-virgin-olive-oil-250ml': {
    size: '250mL',
    producerRegion: ESTATE,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
  'extra-virgin-olive-oil-garcias-mill': {
    size: '3L',
    // The feed ships this one with an empty SKU. Variant SKUs are what an order
    // line records, so it needs a real one before it can be sold.
    sku: 'GDLC-EVOO-MILL-3L',
    packaging: '3 L PET bottle',
    dietary: { isVegan: true, isVegetarian: true, isGlutenFree: true, isLactoseFree: true },
    note:
      'No SKU in the feed — assigned GDLC-EVOO-MILL-3L. Out of stock upstream, so it ' +
      'imports unavailable. Not marked organic: the copy says only "Spanish Extra Virgin".',
  },

  // ─── Aged Balsamic & Vinegars ────────────────────────────────────────────
  'pedro-ximenez-vinegar': {
    size: '250mL',
    assumedSize: true,
    dietary: {
      isOrganic: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isLactoseFree: true,
    },
  },
}

/**
 * Handles the importer must not create.
 *
 * "Master Miller – Spray" is the same physical item as the Spray option on the
 * Master Miller listing, down to the SKU (A04518). Importing both would trip
 * assertUniqueVariantSkus, and forcing it through with a suffixed SKU would make
 * one product sellable two ways — order history could no longer say which.
 */
export const SKIP_HANDLES = new Set<string>(['spray'])

/** Shopify collection handle → the category slug it lands in. */
export const COLLECTION_TO_CATEGORY: Record<string, string> = {
  olives: 'mediterranean-olive-reserve',
  oils: 'heritage-extra-virgin-oils',
  vinegars: 'aged-balsamic-vinegars',
}
