/**
 * Mapping decisions for the Intermex import.
 *
 * Intermex is a UAE importer of Mexican food. Their Shopify store carries no
 * usable `vendor` (every product is "My Store" or "Intermex UAE") and no
 * `product_type` at all, so both the brand and the category have to come from
 * collection membership — which is exactly how the store is organised: some of
 * its 14 collections are brands, some are product types, and some are
 * merchandising ("Special Offers", "Home page", "Mexican Must Haves").
 *
 * The taxonomy is incomplete and overlapping at source: 46 of 200 products are
 * in no product-type collection, 21 are in no collection at all, and a handful
 * sit in two at once. `resolveCategory` handles all three cases and always
 * reports which of them applied, so nothing lands by silent guesswork.
 */

/** Collections that name a product type rather than a brand or a promotion. */
export const CATEGORY_COLLECTIONS = [
  'chilis',
  'drinks',
  'mexican-accessories',
  'mexican-candy',
  'mexican-pantry',
  'mexican-sauces',
] as const

/**
 * Where each product-type collection lands.
 *
 * Drinks and accessories join departments this catalogue already has rather
 * than being duplicated inside a Mexican silo — a Mexican soda is a beverage
 * and a molcajete is tableware. The four genuinely Mexican-pantry types become
 * sub-categories of a new department.
 */
export const COLLECTION_TO_CATEGORY: Record<string, string> = {
  'mexican-sauces': 'mexican-sauces',
  'mexican-pantry': 'pantry-staples',
  'mexican-candy': 'mexican-candy',
  chilis: 'chilis',
  drinks: 'curated-fine-beverages',
  'mexican-accessories': 'bespoke-tableware-cutlery',
}

/**
 * Applied when a product sits in more than one product-type collection, most
 * specific first. "Maggi Seasoning Sauce" is in both pantry and sauces and is a
 * sauce; "La Costeña Jalapeño Nachos" is in both chilis and pantry and is a
 * chilli product. Pantry is last because it is the store's catch-all.
 */
export const CATEGORY_PRECEDENCE = [
  'chilis',
  'mexican-sauces',
  'mexican-candy',
  'drinks',
  'mexican-accessories',
  'mexican-pantry',
] as const

/**
 * Fallback classification for the 46 products the store files under no product
 * type at all.
 *
 * Ordered, and deliberately narrow. The sauce rule runs before the chilli rule
 * so "Cholula Original Chilli Lime Hot Sauce" is a sauce, and the chilli rule
 * matches pepper *varieties* rather than the word "chilli" so that "Pepe Crunch
 * Peanuts Chilli Flavour" stays a snack. Anything unmatched falls through to
 * pantry staples, which is where the store itself puts its miscellany.
 */
export const TITLE_RULES: Array<{ pattern: RegExp; category: string }> = [
  // Stems are anchored at the start of a word only, never at the end: the
  // source pluralises freely and "\bchocorrol\b" misses "Chocorroles".
  { pattern: /\b(sauce|salsa)/i, category: 'mexican-sauces' },
  { pattern: /\b(candy|chocorrol|gansito|dulce|lollipop|paleta)/i, category: 'mexican-candy' },
  { pattern: /\b(jalape|chipotle|serrano|habanero|poblano|guajillo|ancho)/i, category: 'chilis' },
  { pattern: /\b(drink|soda|cola|juice|agua fresca|horchata)\b/i, category: 'curated-fine-beverages' },
]

export const DEFAULT_CATEGORY = 'pantry-staples'

export interface CategoryResolution {
  category: string
  /** How it was decided — reported so an inferred category is never invisible. */
  from: 'collection' | 'title-rule' | 'default'
}

/**
 * Decide a product's category from its collection membership, falling back to
 * its title and finally to the catch-all.
 */
export function resolveCategory(title: string, collections: string[]): CategoryResolution {
  const inType = CATEGORY_PRECEDENCE.filter((c) => collections.includes(c))
  if (inType.length > 0) {
    return { category: COLLECTION_TO_CATEGORY[inType[0]!]!, from: 'collection' }
  }

  for (const rule of TITLE_RULES) {
    if (rule.pattern.test(title)) return { category: rule.category, from: 'title-rule' }
  }

  return { category: DEFAULT_CATEGORY, from: 'default' }
}

// ─── Departments and sub-categories ──────────────────────────────────────────

export const PARENT_DEPARTMENT = {
  title: 'Mexican Pantry',
  slug: 'mexican-pantry',
  description:
    'Salsas, dried chillies, masa, sweets and the staples of a Mexican kitchen, imported into the UAE.',
  sortOrder: 18,
}

export interface SubCategorySpec {
  title: string
  slug: string
  description: string
  sortOrder: number
}

/** Created beneath PARENT_DEPARTMENT. Order is the menu order. */
export const SUB_CATEGORIES: SubCategorySpec[] = [
  {
    title: 'Mexican Sauces',
    slug: 'mexican-sauces',
    description: 'Hot sauces, salsas, adobos and seasoning sauces, from mild table salsa to habanero.',
    sortOrder: 1,
  },
  {
    title: 'Chilis',
    slug: 'chilis',
    description: 'Whole, dried and pickled chillies — jalapeño, chipotle, serrano and guajillo.',
    sortOrder: 2,
  },
  {
    title: 'Pantry Staples',
    slug: 'pantry-staples',
    description: 'Masa and corn flour, beans, rice, tortillas, tostadas and everyday Mexican staples.',
    sortOrder: 3,
  },
  {
    title: 'Mexican Candy',
    slug: 'mexican-candy',
    description: 'Tamarind sweets, chilli lollipops, chocolate rolls and the rest of the dulcería.',
    sortOrder: 4,
  },
]

/** Sub-category slugs, so the importer knows which targets need creating. */
export const SUB_CATEGORY_SLUGS = new Set(SUB_CATEGORIES.map((s) => s.slug))

// ─── Brands ──────────────────────────────────────────────────────────────────

/**
 * Brand collections → the brand row.
 *
 * "Intermex Production" is Intermex's own manufacturing, not a separate label —
 * every one of its 22 products is also in the Intermex collection — so both map
 * to one brand. Carey has a collection but no products, so no row is created
 * for it. The remaining 128 products belong to no brand collection and are
 * imported without a brand rather than having one guessed from the title.
 */
export const BRAND_COLLECTIONS: Record<string, { title: string; slug: string }> = {
  intermex: { title: 'Intermex', slug: 'intermex' },
  'from-our-production': { title: 'Intermex', slug: 'intermex' },
  'la-costena': { title: 'La Costeña', slug: 'la-costena' },
  'la-meridana': { title: 'La Meridana', slug: 'la-meridana' },
}

// ─── Origin ──────────────────────────────────────────────────────────────────

/**
 * Only 9 of 200 products state an origin, and all nine say Mexico. The store is
 * a Mexican-food importer and 119 products mention Mexico in their copy, so MX
 * is the default rather than a guess made per product.
 *
 * The exception is worth flagging: a few titles name brands that are not
 * Mexican companies, even where the product itself is a Mexican-market line.
 */
export const ORIGIN_COUNTRY = 'MX'

export const NON_MEXICAN_BRAND_HINT = /\b(maggi|maruchan|fit\s*panda)\b/i
