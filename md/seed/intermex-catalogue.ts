/**
 * Mapping decisions for the Intermex import.
 *
 * Intermex is a UAE importer of Mexican food. Their Shopify store carries no
 * usable `vendor` (every product is "My Store" or "Intermex UAE") and no
 * `product_type` at all. The category comes from collection membership: some of
 * its 14 collections are product types, some are brands, and some are
 * merchandising ("Special Offers", "Home page", "Mexican Must Haves"). The brand
 * collections are too loose to use, so brands are listed per product (BRANDS).
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
 * Where each product-type collection lands. `null` means not carried.
 *
 * Drinks join a department this catalogue already has rather than being
 * duplicated inside a Mexican silo — a Mexican soda is a beverage. The four
 * genuinely Mexican-pantry types become sub-categories of a new department.
 * Accessories (sombreros, piñatas, tortilla presses) are not food, and the
 * store sells food only, so they are skipped.
 */
export const COLLECTION_TO_CATEGORY: Record<string, string | null> = {
  'mexican-sauces': 'mexican-sauces',
  'mexican-pantry': 'pantry-staples',
  'mexican-candy': 'mexican-candy',
  chilis: 'chilis',
  drinks: 'curated-fine-beverages',
  'mexican-accessories': null,
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
  /** `null` when the product is not carried — see COLLECTION_TO_CATEGORY. */
  category: string | null
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
    return { category: COLLECTION_TO_CATEGORY[inType[0]!] ?? null, from: 'collection' }
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
 * The maker of each product, by handle — the brand printed on the pack, as the
 * title or Intermex's own description names it.
 *
 * Collections cannot be trusted for this. "Intermex" is a shelf of products
 * they push, and "Intermex Production" files Jarritos Cola, Fit Panda and Inzi
 * as their own production. Only La Costeña and La Meridana hold nothing but
 * their own brand, so those two collections are the fallback for a handle not
 * listed here (BRAND_COLLECTIONS).
 *
 * Two are filed on what the brand is known to make rather than on the text:
 * Chocorroles is Marinela's (the feed's own "Choco Roles Mini Marinela" is the
 * same line) and Pulparindo is De la Rosa's.
 *
 * A product whose source names no maker gets no brand rather than a guess:
 * the esquite, the candy bags, the popsicles, the Japanese-style peanuts, the
 * snack wheels, Botanera sauce, cactus in brine, corn husks, guajillo chili,
 * Paleta Payaso and Rancheritos. "De la Rosa Coronado Butter Rum Hard Candies"
 * names two makers, so it is left out until someone checks the pack.
 */
export const BRANDS: Record<string, { title: string; handles: string[] }> = {
  intermex: {
    title: 'Intermex',
    handles: [
      'chicharron-cheese',
      'chicharron-fuego',
      'chicharron-green-sauce',
      'churritos-chili-flavor',
      'corn-tortilla-4-5',
      'corn-tortilla-intermex-copy',
      'flour-tortillas-intermex-copy',
      'golden-tostadas',
      'intermex-classic-tortilla-chips',
      'intermex-corn-tortilla',
      'intermex-flour-tortillas',
      'intermex-mexican-beef-chorizo',
      'intermex-mexican-chicken-chorizo',
      'intermex-tostadas',
      'tortilla-chips',
      'xatze-chile-ancho-whole-dried-chilies',
    ],
  },
  'la-costena': {
    title: 'La Costeña',
    handles: ['homestyle-la-costen-475gm'],
  },
  'la-meridana': {
    title: 'La Meridana',
    handles: ['la-meridana-achiote-paste'],
  },
  'la-sierra': {
    title: 'La Sierra',
    handles: ['black-beans-dry-900g-la-sierra', 'la-sierra-whole-black-beans'],
  },
  'el-chilerito': {
    title: 'El Chilerito',
    handles: ['chamoy-sauce-330ml-intermex', 'el-chilerito-salsa-chamoy'],
  },
  'fit-panda': {
    title: 'Fit Panda',
    handles: ['fit-panda-flamin-hot-instant-noodles', 'fit-panda-vegan-chicken-instant-noodles'],
  },
  'hungry-guru': {
    title: 'Hungry Guru',
    handles: [
      'hungary-guru-35g',
      'hungary-guru-pack-of-3-35gm',
      'hungary-guru-pack-of-6-35g',
      'hungry-guru-pack-of-12',
    ],
  },
  jarritos: {
    title: 'Jarritos',
    handles: [
      'jarritos-fruit-punch-drink-370ml',
      'jarritos-grape-friut-drink-370ml',
      'jarritos-guava-drink-370ml',
      'jarritos-lime-drink-370ml',
      'jarritos-mandarin-drink-370ml',
      'jarritos-mexican-cola-370ml',
      'jarritos-pineapple-drink-370ml',
      'jarritos-strawberry-drink-370ml',
    ],
  },
  inzi: {
    title: 'Inzi',
    handles: [
      'inzi-no-guilt-churritos',
      'inzi-no-guilt-nachos',
      'no-guilt-nachos-cheddar-cheese-inzi',
      'no-guilt-nachos-chilli-lime-inzi',
    ],
  },
  'pepe-crunch': {
    title: 'Pepe Crunch',
    handles: [
      'pepe-crucnh-peanuts-cheese-flavour-500g',
      'pepe-crucnh-peanuts-chilli-flavour-500g',
      'pepe-crucnh-peanuts-chipotle-flavour-500g',
      'pepe-crucnh-peanuts-mango-flavour-500g',
      'pepe-crunch-peanuts-habanero-flavour-500g',
    ],
  },
  excelsior: {
    title: 'Excelsior',
    handles: ['queso-cotija-excelsior-mexican-aged-cheese'],
  },
  'b-sweet': {
    title: 'B Sweet',
    handles: ['b-sweet-organic-agave-syrup'],
  },
  'la-conspiracion': {
    title: 'La Conspiración',
    handles: [
      'la-conspiracion-alebrije-mango-habanero-jam',
      'la-conspiracion-chicharron-de-mezcla-de-chiles-secos',
      'la-conspiracion-salsa-bichi',
      'la-conspiracion-salsa-bichola',
      'la-conspiracion-salsa-mojito-verde',
      'la-conspiracion-salsa-pinera',
      'la-conspiracion-salsa-tres-chiles',
    ],
  },
  xatze: {
    title: 'Xatze',
    handles: [
      'xatze-ancho-chili-powder',
      'xatze-chile-de-arbol-powder',
      'xatze-guajillo-chili-powder',
    ],
  },
  'tama-roca': {
    title: 'Tama-Roca',
    handles: [
      'banderilla-tamaroca-tamarind-mexican-stick-30pcs',
      'palebola-tama-roca-tamarind-candy',
    ],
  },
  marinela: {
    title: 'Marinela',
    handles: [
      'choco-roles-mini-marinela',
      'chocorroles-8-pieces',
      'marinela-barritas-fresa',
      'marinela-barritas-pineapple',
      'mini-gansito-marinela',
    ],
  },
  'el-yucateco': {
    title: 'El Yucateco',
    handles: [
      'el-yucateco-habanero-ghost-chili-hot-sauce',
      'el-yucateco-habanero-y-cafe-hot-sauce',
      'el-yucateco-habanero-y-chiltepin-hot-sauce',
      'el-yucateco-habanero-y-pina-asada-hot-sauce',
      'el-yucateco-horchata-de-arroz',
      'el-yucateco-jamaica-drink-concentrate',
      'el-yucateco-marisquera-negra-hot-sauce',
      'el-yucateco-marisquera-roja-hot-sauce',
      'el-yucateco-tamarindo-1',
      'salsa-picante-chile-habanero-120ml-yucateco',
      'salsa-picante-negra-120ml-yucateco',
      'salsa-picante-roja-120ml-yucateco',
    ],
  },
  naturelo: {
    title: 'Naturelo',
    handles: ['naturelo-blue-corn-masa-flour', 'naturelo-eco-friendly-corn-flour'],
  },
  maseca: {
    title: 'Maseca',
    handles: [
      'blue-corn-masa-flour-maseca',
      'maseca-nixtamalized-corn-flour',
      'maseca-tamal-corn-flour',
    ],
  },
  'nopal-foods': {
    title: 'Nopal Foods',
    handles: [
      'nopal-foods-nopales-en-escabeche',
      'nopal-foods-nopalitos-en-salsa-de-chile-guajillo',
    ],
  },
  'nopal-tenochtitlan': {
    title: 'Nopal Tenochtitlan',
    handles: ['nopal-tenochtitlan-fibra-de-nopal-deshidratado'],
  },
  abuelita: {
    title: 'Abuelita',
    handles: ['nestle-abuelita-chocolate-drink-tablets'],
  },
  cholula: {
    title: 'Cholula',
    handles: [
      'cholula-original-chilli-lime-hot-sauce',
      'cholula-original-chipotle-hot-sauce',
      'cholula-original-hot-sauce',
      'cholula-original-hot-sauce-60ml',
    ],
  },
  clamato: {
    title: 'Clamato',
    handles: ['clamato®-original'],
  },
  'clemente-jacques': {
    title: 'Clemente Jacques',
    handles: [
      'clemente-jacques-chipotle-peppers-in-adobo',
      'whole-green-tomatillo-2-8kg-san-marco',
    ],
  },
  fritos: {
    title: 'Fritos',
    handles: ['fritos-lemon-salt'],
  },
  ruffles: {
    title: 'Ruffles',
    handles: ['ruffles-cheese', 'ruffles-mega-crunch-red-salsa'],
  },
  coronado: {
    title: 'Coronado',
    handles: ['coronado-cajeta-quemada'],
  },
  'de-la-rosa': {
    title: 'De la Rosa',
    handles: ['de-la-rosa-mazapan-original', 'pulparindo-mango-tamarind-candy-with-mango-flavor'],
  },
  herdez: {
    title: 'Herdez',
    handles: ['herdez-white-mexican-corn'],
  },
  lucas: {
    title: 'Lucas',
    handles: ['lucas-muecas-chamoy-1', 'lucas-muecas-mango-spicy-mango-lollipop-with-chili-powder'],
  },
  maggi: {
    title: 'Maggi',
    handles: ['maggi-liquid-seasoning-sauce-800ml', 'maggi-seasoning-sauce-100ml'],
  },
  maizena: {
    title: 'Maizena',
    handles: ['maizena-corn-starch'],
  },
  maruchan: {
    title: 'Maruchan',
    handles: ['maruchan'],
  },
  mccormick: {
    title: 'McCormick',
    handles: ['mayonesa-macromick-lime-390gm'],
  },
  azteca: {
    title: 'Azteca',
    handles: ['mole-azteca-paste'],
  },
  'dona-maria': {
    title: 'Doña María',
    handles: ['dona-maria-mole-paste', 'dona-maria-mole-ready-to-serve'],
  },
  montes: {
    title: 'Montes',
    handles: ['montes-tomy-original-candy-100-pieces'],
  },
  omalli: {
    title: 'Omalli',
    handles: ['omalli-nixtamalized-corn-flour'],
  },
  mayamel: {
    title: 'Mayamel',
    handles: ['mayamel-organic-blue-agave-syrup'],
  },
  'pelon-pelo-rico': {
    title: 'Pelon Pelo Rico',
    handles: ['pelon-pelo-rico-tamarindo'],
  },
  tajin: {
    title: 'Tajín',
    handles: ['tajin-chamoy-hot-sauce', 'tajin-classico-seasoning-400gm'],
  },
  'valle-verde': {
    title: 'Valle Verde',
    handles: ['rice-morelo-1kg-valle-verde'],
  },
  valentina: {
    title: 'Valentina',
    handles: [
      'valentina-salsa-picante-muy-picante-black-label',
      'valentina-salsa-picante-original-yellow-label',
      'valentina-salsa-picante-original-yellow-label-1',
    ],
  },
  vero: {
    title: 'Vero',
    handles: ['vero-rellerindos-mix-filled-candies-80-pieces'],
  },
  'el-mexicano': {
    title: 'El Mexicano',
    handles: ['el-mexicano-maiz-blanco-white-hominy-in-brine', 'el-mexicano-white-hominy-in-brine'],
  },
  'el-fresno': {
    title: 'El Fresno',
    handles: [
      'el-fresno-whole-ancho-chili',
      'el-fresno-whole-cascabel-chili',
      'el-fresno-whole-chile-de-arbol',
      'el-fresno-whole-chipotle-chili',
      'el-fresno-whole-pasilla-chili',
    ],
  },
}

/** Store collections that hold only their own brand. */
export const BRAND_COLLECTIONS: Record<string, string> = {
  'la-costena': 'la-costena',
  'la-meridana': 'la-meridana',
}

const BRAND_BY_HANDLE = new Map(
  Object.entries(BRANDS).flatMap(([slug, { handles }]) => handles.map((h) => [h, slug] as const)),
)

/** The brand for one product, or null when the source names no maker. */
export function resolveBrand(
  handle: string,
  collections: string[],
): { slug: string; title: string } | null {
  const slug =
    BRAND_BY_HANDLE.get(handle) ??
    Object.entries(BRAND_COLLECTIONS).find(([c]) => collections.includes(c))?.[1]
  return slug ? { slug, title: BRANDS[slug]!.title } : null
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
