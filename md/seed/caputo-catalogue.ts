/**
 * Per-product facts for the Caputo import that the Shopify feed does not carry.
 *
 * Unlike the García de la Cruz table, most of this supplier's detail IS
 * published — protein content, flour strength, storage, shelf life, allergens
 * and the vegan/kosher/halal claims all live on the product page and are
 * scraped per product rather than retyped here (see the importer's
 * `scrapeProductPage`). What is left in this file is the two things the source
 * genuinely does not provide:
 *
 *   · SKUs.  Every flour ships with an empty SKU. Variant SKUs are what an
 *            order line records, so the catalogue cannot store a product
 *            without one and they have to be assigned here — stably, because
 *            regenerating them on each run would orphan order history.
 *
 *   · Gluten.  Scraped claims cover vegan/kosher/halal but say nothing about
 *              gluten, and "contains wheat" versus "certified gluten free" is
 *              not something to infer from a product title.
 */

export interface CaputoOverride {
  /** Assigned SKU — the feed ships none. Stable across runs by contract. */
  sku: string
  /** Normalised pack size. The feed spells it "1kg (2.2lbs)". */
  size: string
  netWeightGrams: number
  isGlutenFree: boolean
  /**
   * Lactose-free is asserted only where nothing on the label argues against it.
   * The gluten-free flour carries a "produced in a facility that manufactures …
   * milk" warning, so it is left false: a cross-contamination warning is not a
   * dairy ingredient, but it is also not a claim this shop should make on the
   * supplier's behalf.
   */
  isLactoseFree: boolean
  note?: string
}

export const PRODUCT_OVERRIDES: Record<string, CaputoOverride> = {
  'caputo-00-baking-flour': {
    sku: 'CAPUTO-00-BAKING-1KG',
    size: '1kg',
    netWeightGrams: 1000,
    isGlutenFree: false,
    isLactoseFree: true,
  },
  'caputo-00-bread-flour': {
    sku: 'CAPUTO-00-BREAD-1KG',
    size: '1kg',
    netWeightGrams: 1000,
    isGlutenFree: false,
    isLactoseFree: true,
  },
  'caputo-00-chefs-flour': {
    sku: 'CAPUTO-00-CHEFS-1KG',
    size: '1kg',
    netWeightGrams: 1000,
    isGlutenFree: false,
    isLactoseFree: true,
  },
  'caputo-00-pasta-fresca-flour': {
    sku: 'CAPUTO-00-PASTA-FRESCA-1KG',
    size: '1kg',
    netWeightGrams: 1000,
    isGlutenFree: false,
    isLactoseFree: true,
  },
  'caputo-00-pizzeria-flour': {
    sku: 'CAPUTO-00-PIZZERIA-1KG',
    size: '1kg',
    netWeightGrams: 1000,
    isGlutenFree: false,
    isLactoseFree: true,
  },
  'caputo-gluten-free-flour': {
    sku: 'CAPUTO-FIOREGLUT-GF-1KG',
    size: '1kg',
    netWeightGrams: 1000,
    isGlutenFree: true,
    isLactoseFree: false,
    note:
      'Fioreglut. Marked gluten-free — the label states gluten-free wheat starch meeting ' +
      'the FDA threshold. NOT marked lactose-free despite being dairy-free by recipe: the ' +
      'label warns it is produced in a facility handling milk.',
  },
  'caputo-semolina-flour': {
    sku: 'CAPUTO-SEMOLINA-1KG',
    size: '1kg',
    netWeightGrams: 1000,
    isGlutenFree: false,
    isLactoseFree: true,
  },
}

/**
 * The feed is `/collections/all`, which is the whole storefront: seven flours
 * plus branded apparel and a gift card. The flours land in Flours; everything
 * else is not food, and the store sells food only, so it is not imported.
 */
export const PRODUCT_TYPE = 'Flour'

/** The category this import creates if it is not already there. */
export const CATEGORY = {
  title: 'Flours',
  slug: 'flours',
  description:
    'Stone-ground and finely milled flours from Europe’s heritage mills — "00" for ' +
    'pizza, bread and pasta, semolina for extrusion, and certified gluten-free blends.',
  sortOrder: 16,
}
