/**
 * Mapping and researched content for the Fennec Trading import.
 *
 * Fennec's storefront (fennectradingllc.odoo.com) supplies a name, an AED price
 * and a category for each product, and little else: the descriptions are a line
 * long, and the photos are mostly phone shots, AI-generated posters and
 * thumbnails. So everything a customer reads is researched per product here:
 * a packshot of the exact variant, the maker, and the ingredients and
 * nutrition panel where a source publishes one.
 *
 * Sources, in order of preference: the maker's own site, Open Food Facts
 * (CC BY-SA, so its images need attribution, which `images[].source` records),
 * then a retailer listing. Every fact here is one a source states. Halal is set
 * only where the pack or the maker claims it.
 *
 * Prices are NOT here. They come from the harvested feed, so a re-scrape
 * picks up Fennec's current price.
 */

// ─── Taxonomy ────────────────────────────────────────────────────────────────

export interface CategorySpec {
  title: string
  slug: string
  description: string
  sortOrder: number
}

/** The new department, shaped like Mexican Pantry. It holds no products itself. */
export const DEPARTMENT: CategorySpec = {
  title: 'North African Pantry',
  slug: 'north-african-pantry',
  description:
    'Couscous, trida and tlitli, harissa, flan mixes, Algerian coffee and the everyday staples of a North African kitchen.',
  sortOrder: 19,
}

/**
 * Created beneath DEPARTMENT, in menu order. Slugs are given explicitly
 * because they are unique store-wide, and "Sauces & Condiments" would
 * otherwise claim a slug a future department might need.
 */
export const LEAVES: CategorySpec[] = [
  {
    title: 'Pasta, Couscous & Grains',
    slug: 'north-african-pasta-grains',
    description: 'Chakhchoukha, trida, tlitli, semolina, barley couscous, chickpeas and lentils.',
    sortOrder: 1,
  },
  {
    title: 'Canned Fish & Tomato',
    slug: 'north-african-canned',
    description: 'Tuna in oil and in tomato sauce, and double-concentrated tomato paste.',
    sortOrder: 2,
  },
  {
    title: 'Sauces & Condiments',
    slug: 'north-african-sauces',
    description: 'Harissa, sauce algérienne, mustard and table sauces.',
    sortOrder: 3,
  },
  {
    title: 'Seasonings & Stock',
    slug: 'north-african-seasonings',
    description: 'Stock cubes and dried mloukhia for stews and chorba.',
    sortOrder: 4,
  },
  {
    title: 'Baking & Desserts',
    slug: 'north-african-baking',
    description: 'Flan mixes, baking powder, cocoa, icing sugar, chantilly and dyoul pastry sheets.',
    sortOrder: 5,
  },
  {
    title: 'Butter, Margarine & Spreads',
    slug: 'north-african-spreads',
    description: 'Margarine, vegetable ghee, jam and spreads.',
    sortOrder: 6,
  },
  {
    title: 'Coffee & Tea',
    slug: 'north-african-coffee-tea',
    description: 'Algerian ground coffee and the green tea used for mint tea.',
    sortOrder: 7,
  },
  {
    title: 'Biscuits & Snacks',
    slug: 'north-african-snacks',
    description: 'Wafers, biscuits and snack bars.',
    sortOrder: 8,
  },
]

/** Existing categories that take Fennec products directly. */
export const EXISTING_CATEGORIES = ['heritage-extra-virgin-oils', 'chocolate-bars'] as const

export type CategorySlug =
  | (typeof LEAVES)[number]['slug']
  | (typeof EXISTING_CATEGORIES)[number]

// ─── Entries ─────────────────────────────────────────────────────────────────

export interface BrandSpec {
  slug: string
  title: string
  website?: string
}

export interface FennecEntry {
  /** Our title: brand, product, size, spelled as the pack spells them. */
  title: string
  /** Stable stem for the generated SKU. Never change it once imported. */
  skuStem: string
  brand: BrandSpec | null
  /** The company behind the brand, when a source names it. */
  maker?: string
  category: CategorySlug
  /** ISO country of manufacture. Drives the region filter. */
  country: string
  /** The size a customer picks, e.g. "900g". */
  size: string
  weightGrams?: number
  barcode?: string
  shortDescription: string
  /** Paragraphs. */
  description: string[]
  ingredients?: string
  allergens?: string
  nutrition?: {
    energyKJ?: number
    energyKcal?: number
    protein?: number
    carbohydrates?: number
    sugars?: number
    fat?: number
    saturatedFat?: number
    salt?: number
    fibre?: number
  }
  storage?: string
  packaging?: string
  specifications?: Array<{ label: string; value: string }>
  dietary?: { isHalal?: boolean; isVegan?: boolean; isVegetarian?: boolean; isGlutenFree?: boolean }
  shippingClass?: 'standard' | 'frozen'
  /** Main image first. `url` is fetched; `source` is the page it came from. */
  images: Array<{ url: string; source: string }>
  /** Printed in the run report for a human to check. */
  flags?: string[]
}

// ─── Sources and shared values ───────────────────────────────────────────────

/** An Open Food Facts full-size image, by its path under /images/products/. */
const OFF = (path: string) => `https://images.openfoodfacts.org/images/products/${path}`

/**
 * Fennec's own main photo. Used only where it is a clean packshot and nothing
 * better exists: the Nouara range, and a handful of packs no one else has
 * photographed.
 */
const FENNEC_IMG = (id: string) =>
  `https://fennectradingllc.odoo.com/web/image/product.template/${id}/image_1920`

const BIMO: BrandSpec = { slug: 'bimo', title: 'Bimo', website: 'https://groupebimo.com' }
const BONAL: BrandSpec = { slug: 'bonal', title: 'Bonal' }
// The row already exists, unlinked; El Mordjene is Cebon's range.
const CEBON: BrandSpec = { slug: 'cebon', title: 'Cebon', website: 'https://cebon.dz' }
const DREAMY: BrandSpec = { slug: 'dreamy', title: 'Dreamy' }
const GARRIDO: BrandSpec = { slug: 'garrido', title: 'Garrido', website: 'https://garrido.dz' }
const ISABEL: BrandSpec = { slug: 'isabel', title: 'Isabel' }
const JUMBO: BrandSpec = { slug: 'jumbo', title: 'Jumbo' }
const LABELLE: BrandSpec = { slug: 'labelle', title: 'LaBelle', website: 'https://www.groupelabelle.dz' }
const LESIEUR: BrandSpec = { slug: 'lesieur', title: 'Lesieur' }
const MOMENT: BrandSpec = { slug: 'moment', title: 'Moment' }
const NOUARA: BrandSpec = { slug: 'nouara', title: 'Nouara' }
const RICAMAR: BrandSpec = { slug: 'ricamar', title: 'Ricamar', website: 'https://raja-food.com' }
const SANOUBAR: BrandSpec = { slug: 'el-sanoubar', title: 'El Sanoubar' }

/** The five Nouara flan mixes share everything but flavour, barcode and box weight. */
function NOUARA_FLAN(
  id: string,
  flavour: string,
  arome: string,
  barcode: string | undefined,
  grams: number,
  opts: { ingredients?: string; halal?: boolean; flag?: string },
): FennecEntry {
  return {
    title: `Nouara ${flavour} Flan Mix ${grams}g`,
    skuStem: `nouara-flan-${arome}`,
    brand: NOUARA,
    maker: 'SIPADES, Ain Benian, Algiers, Algeria',
    category: 'north-african-baking',
    country: 'DZ',
    size: `${grams}g`,
    weightGrams: grams,
    ...(barcode ? { barcode } : {}),
    shortDescription: `Préparation pour flan arôme ${arome}: one box sets half a litre of milk.`,
    description: [
      `Nouara’s ${flavour.toLowerCase()} flan mix (préparation pour flan arôme ${arome}), a fixture of the Algerian dessert table.`,
      'Whisk the box into half a litre of milk, bring it to the boil, pour into a mould and chill for about two hours until set.',
    ],
    ...(opts.ingredients ? { ingredients: opts.ingredients } : {}),
    storage: 'Keep away from humidity and heat.',
    // Halal only where the box shows the mark.
    ...(opts.halal === false ? {} : { dietary: { isHalal: true } }),
    images: [{ url: FENNEC_IMG(id), source: 'Fennec Trading listing photo' }],
    ...(opts.flag ? { flags: [opts.flag] } : {}),
  }
}

/**
 * Fennec product ids that are deliberately not imported, and why. Each is a
 * problem in Fennec's own data or a missing photo, not something to work
 * around here.
 */
export const NOT_IMPORTED: Record<string, string> = {
  '73': 'duplicate: "Medina Margarine 500g" is Medina Smen, the same product as 115, listed at 13 AED against 13.50',
  '117': 'duplicate of 109 (Moula medium semolina 1kg); same photo, "MEDIEUM" typo',
  '133': 'weight unknown: listed as 900g, the pack photo is illegible (500g?), retailers sell 1kg',
  '122': 'no usable photo: Fennec’s is AI-generated and the only real ones are watermarked',
  '139': 'no usable photo: Fennec’s is an ad with text, and no packshot of this flavour exists',
  '140': 'no usable photo: Fennec’s shows a different Oleabio product; would be the 12-bar box of 139',
  '120': 'Fennec Grove own label: the only photo is an AI mock-up and nothing independent exists',
  '121': 'L’Algerina own label: the only photo is an AI mock-up and nothing independent exists',
}

/** Keyed by Fennec's product.template id. */
export const CATALOGUE: Record<string, FennecEntry> = {
  // ── Pasta, couscous & grains ───────────────────────────────────────────────

  '10': {
    title: 'El Sanoubar Chakhchoukha 900g',
    skuStem: 'el-sanoubar-chakhchoukha-900g',
    brand: SANOUBAR,
    maker: 'El Sanoubar, Chelghoum Laïd, Mila, Algeria',
    category: 'north-african-pasta-grains',
    country: 'DZ',
    size: '900g',
    weightGrams: 900,
    barcode: '6133964000015',
    shortDescription: 'Durum-wheat pasta pieces for chakhchoukha, the steamed dish of eastern Algeria.',
    description: [
      'Chakhchoukha is the celebration dish of the Aurès, Batna, Biskra and Sétif: torn pieces of semolina dough, steamed and soaked in a spiced red sauce with meat or chicken, chickpeas and vegetables.',
      'El Sanoubar makes the pieces ready-dried from durum-wheat semolina. Steam them in a couscoussier, then soak them with the sauce. A family-size 900g bag.',
    ],
    ingredients: 'Durum wheat semolina, water, salt.',
    allergens: 'Gluten (wheat).',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0488/3143/0819/files/el-sanoubar-algerian-pasta-chakhchoukha-900g-foods-zaytunamartca-8907145.jpg?v=1761288172',
        source: 'https://www.zaytunamart.ca/products/el-sanoubar-algerian-oasta-chakchouka-900g',
      },
    ],
  },
  '21': {
    title: 'El Sanoubar Trida 450g',
    skuStem: 'el-sanoubar-trida-450g',
    brand: SANOUBAR,
    maker: 'El Sanoubar, Chelghoum Laïd, Mila, Algeria',
    category: 'north-african-pasta-grains',
    country: 'DZ',
    size: '450g',
    weightGrams: 450,
    barcode: '6133964000268',
    shortDescription: 'Small squares of semolina pasta for trida, the Constantine speciality.',
    description: [
      'Trida (or mkartfa) is a speciality of Constantine and north-eastern Algeria: small flat squares of durum-wheat pasta, steamed and then simmered in a white or red sauce with vegetables and chicken or meat.',
      'A 450g bag from El Sanoubar.',
    ],
    ingredients: 'Durum wheat semolina, water, salt.',
    allergens: 'Gluten (wheat).',
    images: [
      {
        url: 'https://www.mercatoarabo.it/wp-content/uploads/2025/04/trida-el-sanoubar-6133964000268.jpg',
        source: 'https://www.mercatoarabo.it/prodotto/el-sanoubar-pasta-trida-algerina-450gr/',
      },
    ],
  },
  '136': {
    title: 'SIM Tlitli No. 1, 500g',
    skuStem: 'sim-tlitli-500g',
    brand: { slug: 'sim', title: 'SIM' },
    maker: 'Groupe SIM, Aïn Romana, Blida, Algeria',
    category: 'north-african-pasta-grains',
    country: 'DZ',
    size: '500g',
    weightGrams: 500,
    barcode: '6130351001518',
    shortDescription: 'Rice-shaped durum-wheat pasta for tlitli and soups.',
    description: [
      'Tlitli is rice-shaped durum-wheat pasta (also called langues d’oiseau, or orzo), here in size 1. In Constantine it is cooked in a red or white sauce with chicken and chickpeas. It also goes into chorba and other soups.',
      'A 500g bag from SIM’s “Le goût éternel” range.',
    ],
    allergens: 'Gluten (wheat).',
    images: [{ url: 'https://areej.store/wp-content/uploads/2023/02/6130351001518.jpg', source: 'https://areej.store/produit/tlitli-sim-500g/' }],
  },
  '109': {
    title: 'Moula Medium Semolina 1kg',
    skuStem: 'moula-semolina-medium-1kg',
    brand: { slug: 'moula', title: 'Moula' },
    maker: 'MEB (Moula Pâtes), Blida, Algeria',
    category: 'north-african-pasta-grains',
    country: 'DZ',
    size: '1kg',
    weightGrams: 1000,
    shortDescription: 'Medium-grain durum wheat semolina for bread, galette and cakes.',
    description: [
      'Medium-grain durum wheat semolina in a 1kg bag.',
      'For homemade breads such as kesra and matlouh, for doughs, and for semolina cakes.',
    ],
    ingredients: 'Durum wheat semolina.',
    allergens: 'Gluten (wheat).',
    images: [
      // The maker's pack images are thumbnails; Fennec's is the only clean one.
      { url: FENNEC_IMG('109'), source: 'https://fennectradingllc.odoo.com/shop/semolina-moula-1kg-medium-109' },
    ],
  },
  '63': {
    title: 'Garrido Extra Chickpeas 500g',
    skuStem: 'garrido-chickpeas-500g',
    brand: GARRIDO,
    maker: 'Garrido, packed in Algeria',
    category: 'north-african-pasta-grains',
    country: 'DZ',
    size: '500g',
    weightGrams: 500,
    shortDescription: 'Extra-grade dried chickpeas for chorba, couscous and salads.',
    description: [
      'Extra-grade dried chickpeas from Garrido, a Spanish pulse brand that has packed in Algeria since 2003.',
      'Soak them overnight, with a spoon of bicarbonate of soda in the water if you like, before cooking. For chorba, couscous sauces, stews and salads.',
    ],
    ingredients: 'Chickpeas.',
    images: [{ url: FENNEC_IMG('63'), source: 'https://fennectradingllc.odoo.com/shop/garrido-chickpeas-500g-63' }],
  },
  '67': {
    title: 'Garrido Lentils 500g',
    skuStem: 'garrido-lentils-500g',
    brand: GARRIDO,
    maker: 'Garrido, packed in Algeria',
    category: 'north-african-pasta-grains',
    country: 'DZ',
    size: '500g',
    weightGrams: 500,
    shortDescription: 'Dried green-brown lentils for soups, stews and salads.',
    description: [
      'Dried lentils from Garrido, a Spanish pulse brand packed in Algeria. Garrido sources its lentils from Canada.',
      'Start them in cold water and keep them covered while they cook. For lentil soup, stews and salads.',
    ],
    ingredients: 'Lentils.',
    images: [{ url: FENNEC_IMG('67'), source: 'https://fennectradingllc.odoo.com/shop/garrido-lentils-500g-67' }],
  },

  // ── Canned tomato, jam and harissa ─────────────────────────────────────────

  '23': {
    title: 'Izdihar Double Concentrated Tomato Paste 400g',
    skuStem: 'izdihar-tomato-paste-400g',
    brand: { slug: 'izdihar', title: 'Izdihar' },
    maker: 'Izdihar, Aïn Nechma, Skikda, Algeria',
    category: 'north-african-canned',
    country: 'DZ',
    size: '400g',
    weightGrams: 400,
    barcode: '6130382000160',
    shortDescription: 'Double-concentrated tomato paste, made from tomatoes alone.',
    description: [
      'Double-concentrated tomato paste in a 400g tin, made from nothing but tomatoes and concentrated to at least 28% dry matter.',
      'The base of the red sauces of the Algerian kitchen: chorba, stews, chakhchoukha and couscous.',
    ],
    ingredients: 'Tomato.',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0488/3143/0819/files/isdihar-tomato-paste-400g-foods-zaytunamartca-5018952.jpg?v=1767332827',
        source: 'https://www.zaytunamart.ca/products/izdihar-tomato-paste-400g',
      },
    ],
  },
  '28': {
    title: 'CAB Harissa 135g',
    skuStem: 'cab-harissa-135g',
    brand: { slug: 'cab', title: 'CAB' },
    maker: 'Conserverie Amor Benamor, Guelma, Algeria',
    category: 'north-african-sauces',
    country: 'DZ',
    size: '135g',
    weightGrams: 135,
    barcode: '6130384000083',
    shortDescription: 'Algerian hot chilli paste with garlic, coriander and caraway.',
    description: [
      'Harissa from Conserverie Amor Benamor of Guelma: hot red peppers pounded with garlic, coriander and caraway, in a 135g tin.',
      'Stir it into couscous sauces, chorba and stews, or serve it on the side with grilled meat and sandwiches.',
    ],
    ingredients: 'Hot red pepper, garlic, coriander, caraway, salt.',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0488/3143/0819/files/cab-algerian-harissa-135g-hot-chili-paste-foods-zaytunamartca-9306227.jpg?v=1765133888',
        source: 'https://www.zaytunamart.ca/products/cab-algerian-harissa-135g-hot-chili-paste',
      },
    ],
    flags: ['Fennec’s description says "380g jar"; its title, photo and price are the 135g tin'],
  },
  '26': {
    title: 'Telloise Apricot Jam 400g',
    skuStem: 'telloise-apricot-jam-400g',
    brand: { slug: 'telloise', title: 'Telloise' },
    maker: 'La Telloise, Chlef, Algeria',
    category: 'north-african-spreads',
    country: 'DZ',
    size: '400g',
    weightGrams: 400,
    barcode: '6133212000088',
    shortDescription: 'Confiture d’abricot, “pur fruit, pur sucre”, from La Telloise.',
    description: [
      'Apricot jam from La Telloise of Chlef, making preserves since 1967: apricot pulp and sugar, “pur fruit, pur sucre”, in a 400g tin.',
      'Spread it on bread, or use it as Algerian bakers do, to fill and glaze sablés, makrout and the cakes of the Eid table.',
    ],
    ingredients: 'Apricot pulp, sugar, citric acid (E330), pectin (E440).',
    nutrition: { energyKcal: 248, carbohydrates: 61, protein: 0.1 },
    packaging: 'Tin',
    images: [
      {
        url: 'https://www.coursesnet.dz/wp-content/uploads/2022/06/Telloise-Confiture-Abrictos-400g-2.jpg',
        source: 'https://www.coursesnet.dz/product/confiture-telloise-abricot-400g/',
      },
    ],
  },

  // ── Seasonings ─────────────────────────────────────────────────────────────

  '72': {
    title: 'El Fawaha Mloukhia 100g',
    skuStem: 'el-fawaha-mloukhia-100g',
    brand: { slug: 'el-fawaha', title: 'El Fawaha' },
    category: 'north-african-seasonings',
    country: 'TN',
    size: '100g',
    weightGrams: 100,
    shortDescription: 'Ground dried jute mallow leaves for mloukhia stew.',
    description: [
      'Finely ground dried jute mallow leaves (corète), the base of mloukhia: the dark-green stew of Tunisia and eastern Algeria.',
      'Slow-cook it for hours with olive oil, garlic, spices and meat. A 100g sachet, product of Tunisia.',
    ],
    ingredients: 'Ground dried jute mallow leaves.',
    images: [{ url: 'https://dzstore.ae/wp-content/uploads/2025/10/fouahaa.jpg', source: 'https://dzstore.ae/product/moloukhiya/' }],
    flags: ['Fennec’s photo shows a different product (Al Dhawaka coriander & caraway); confirm the brand on the shelf'],
  },

  // ── Tea ────────────────────────────────────────────────────────────────────

  '33': {
    title: 'El Raki Chinese Green Tea 41025, 125g',
    skuStem: 'el-raki-green-tea-125g',
    brand: { slug: 'el-raki', title: 'El Raki' },
    maker: 'Packed in China for the Algerian market',
    category: 'north-african-coffee-tea',
    country: 'CN',
    size: '125g',
    weightGrams: 125,
    shortDescription: 'Chinese green tea, grade 41025, for North African mint tea.',
    description: [
      'Chinese green tea, grade 41025, in a 125g box packed for the Algerian market.',
      'Brew it strong in a teapot with a handful of fresh mint and sugar for proper North African mint tea.',
    ],
    ingredients: 'Green tea.',
    images: [{ url: 'https://dzstore.ae/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-14-at-19.18.34_daa3020e.jpg', source: 'https://dzstore.ae/product/green-tea41025/' }],
    flags: ['Fennec says "imported from Algeria"; the box says the tea is Chinese, so origin is CN'],
  },
  '123': {
    title: 'Safinet E’Sahraa Chunmee Green Tea 9371, 125g',
    skuStem: 'safinet-esahraa-green-tea-125g',
    brand: { slug: 'safinet-esahraa', title: 'Safinet E’Sahraa' },
    maker: 'China Tea (Hunan), Changsha, China',
    category: 'north-african-coffee-tea',
    country: 'CN',
    size: '125g',
    weightGrams: 125,
    barcode: '6930922500347',
    shortDescription: 'Special Chunmee green tea in the camel box, for North African mint tea.',
    description: [
      'Safinet E’Sahraa, “ship of the desert”: Special Chunmee green tea, grade 9371, from China Tea of Hunan, in the camel-and-palm box made for the Algerian market.',
      'A tightly rolled “eyebrow” tea with a strong, mellow taste. Brew it with fresh mint and sugar.',
    ],
    ingredients: 'Green tea.',
    images: [
      {
        url: 'https://img.v15cdn.com/uploads/202027776/green-tea-chun-mee-9371-125b-box15580249457.jpg',
        source: 'https://www.chinateahunan.com/saffinet-e-sahraa-green-tea/green-tea-chun-mee-9371-125b-box.html',
      },
    ],
  },

  // ── Canned fish ────────────────────────────────────────────────────────────

  '34': {
    title: 'Ricamar Tuna in Tomato Sauce 3 × 65g',
    skuStem: 'ricamar-tuna-tomato-3x65g',
    brand: RICAMAR,
    maker: 'Raja Food Industrie, Oran, Algeria',
    category: 'north-african-canned',
    country: 'DZ',
    size: '3 × 65g',
    weightGrams: 195,
    shortDescription: 'Tuna chunks in tomato sauce, three 65g tins with no preservatives.',
    description: [
      'Ricamar Premium tuna chunks in tomato sauce, in a banded pack of three 65g tins. Made in Oran with no preservatives, and a natural source of omega-3.',
      'Eat it straight from the tin, or fold it into salads, sandwiches, pasta and rice.',
    ],
    ingredients: 'Tuna, tomato, vegetable oil, brine.',
    allergens: 'Fish.',
    nutrition: { energyKJ: 591, energyKcal: 141, fat: 7, carbohydrates: 3.6, protein: 16 },
    packaging: 'Tins, pack of 3',
    images: [{ url: 'https://familymarket13.com/wp-content/uploads/2025/01/IMG_7458.png', source: 'https://familymarket13.com/product/ricamar-thon-a-la-tomate-x3/' }],
    flags: ['Fennec spells this one "Reccamar"; the brand is Ricamar'],
  },
  '36': {
    title: 'Ricamar Whole Tuna in Vegetable Oil 3 × 65g',
    skuStem: 'ricamar-tuna-oil-3x65g',
    brand: RICAMAR,
    maker: 'Raja Food Industrie, Oran, Algeria',
    category: 'north-african-canned',
    country: 'DZ',
    size: '3 × 65g',
    weightGrams: 195,
    barcode: '6130816010048',
    shortDescription: 'Whole tuna in vegetable oil, three 65g tins with no preservatives.',
    description: [
      'Ricamar Premium whole tuna (thon entier) in vegetable oil, in a banded pack of three 65g tins. No preservatives.',
      'Drain and use in salads, sandwiches, pizzas and pasta, or in brik and chakchouka.',
    ],
    ingredients: 'Tuna, vegetable oil, brine.',
    allergens: 'Fish.',
    nutrition: { energyKJ: 830, energyKcal: 198, fat: 8.2, saturatedFat: 0, carbohydrates: 0, sugars: 0, fibre: 0, protein: 29.1 },
    packaging: 'Tins, pack of 3',
    images: [{ url: 'https://familymarket13.com/wp-content/uploads/2025/01/IMG_7451.png', source: 'https://familymarket13.com/product/ricamar-thon-a-lhuile-x3/' }],
  },
  '37': {
    title: 'Isabel Tuna in Tomato Sauce 160g',
    skuStem: 'isabel-tuna-tomato-160g',
    brand: ISABEL,
    maker: 'COGEAT, Algiers, Algeria',
    category: 'north-african-canned',
    country: 'DZ',
    size: '160g',
    weightGrams: 160,
    shortDescription: 'Tuna in tomato sauce from Isabel, “calidad desde 1887”.',
    description: [
      'Isabel tuna in tomato sauce in a 160g tin (104g drained). Isabel is the Spanish Garavilla family’s brand, “calidad desde 1887”, made in Algeria by COGEAT since 2017.',
      'A source of omega-3. Serve it on toast, or add it to sandwiches, pasta, rice and salads.',
    ],
    allergens: 'Fish.',
    nutrition: { energyKcal: 155, fat: 8.5, saturatedFat: 1.5, carbohydrates: 2.7, sugars: 2, fibre: 0.4, protein: 17, salt: 1.2 },
    specifications: [{ label: 'Drained weight', value: '104g' }],
    images: [{ url: 'https://familymarket13.com/wp-content/uploads/2025/01/IMG_7459.png', source: 'https://familymarket13.com/product/isabel-thon-tomate-160g/' }],
    flags: ['Fennec spells the brand "Izabel"; the photo is the current carton, and Fennec photographs the older one'],
  },
  '38': {
    title: 'Isabel Tuna in Vegetable Oil 160g',
    skuStem: 'isabel-tuna-oil-160g',
    brand: ISABEL,
    maker: 'COGEAT, Algiers, Algeria',
    category: 'north-african-canned',
    country: 'DZ',
    size: '160g',
    weightGrams: 160,
    shortDescription: 'Tuna in vegetable oil from Isabel, “calidad desde 1887”.',
    description: [
      'Isabel tuna in vegetable oil in a 160g tin (104g drained), made in Algeria by COGEAT under the Spanish Isabel brand.',
      'Drain and use in salads, sandwiches, pizzas and pasta.',
    ],
    allergens: 'Fish.',
    specifications: [{ label: 'Drained weight', value: '104g' }],
    images: [{ url: 'https://familymarket13.com/wp-content/uploads/2025/01/IMG_7461.png', source: 'https://familymarket13.com/product/isabel-thon-a-lhuile-160g/' }],
    flags: ['Fennec spells the brand "Izabel"; the photo is the current carton, and Fennec photographs the older one'],
  },
  '43': {
    title: 'Isabel Tuna in Tomato Sauce 3 × 65g',
    skuStem: 'isabel-tuna-tomato-3x65g',
    brand: ISABEL,
    category: 'north-african-canned',
    // The sleeve Fennec stocks is the Spanish-language one ("Atún en salsa de
    // tomate"), not COGEAT's Algerian sleeve, so it is recorded as Spanish.
    country: 'ES',
    size: '3 × 65g',
    weightGrams: 195,
    shortDescription: 'Tuna in tomato sauce, a banded pack of three 65g tins.',
    description: [
      'Isabel tuna in tomato sauce (atún en salsa de tomate) in three 65g tins, 129g drained in all. Isabel is the Garavilla family’s brand, “calidad desde 1887”.',
      'Serve it on bread, or add it to sandwiches and pasta.',
    ],
    allergens: 'Fish.',
    specifications: [{ label: 'Drained weight', value: '3 × 43g' }],
    packaging: 'Tins, pack of 3',
    images: [
      { url: 'https://www.taibaoline.com/wp-content/uploads/2024/02/Remove-bg.ai_1753259754798.webp', source: 'https://www.taibaoline.com/product/isabel-thon-a-la-tomate-65gx3/' },
    ],
    flags: ['origin recorded as ES because Fennec photographs the Spanish sleeve; confirm against the stock'],
  },

  // ── Seasonings & stock ─────────────────────────────────────────────────────

  '68': {
    title: 'Jumbo Beef Stock Cubes 48 × 10g',
    skuStem: 'jumbo-beef-48',
    brand: JUMBO,
    maker: 'SFCPA, Oran, Algeria',
    category: 'north-african-seasonings',
    country: 'DZ',
    size: '48 cubes',
    weightGrams: 480,
    shortDescription: 'A tray of 48 individually boxed beef stock cubes.',
    description: [
      'Jumbo beef-flavour stock cubes: a tray of 48 cubes of 10g, each in its own little box.',
      'Crumble one cube into half a litre of cooking water for soups, chorba, stews, rice and sauces.',
    ],
    dietary: { isHalal: true },
    images: [{ url: 'https://familymarket13.com/wp-content/uploads/2025/02/IMG_7595.jpg', source: 'https://familymarket13.com/product/jumbo-x48/' }],
  },
  '69': {
    title: 'Jumbo Chicken Stock Cubes 48 × 10g',
    skuStem: 'jumbo-chicken-48',
    brand: JUMBO,
    maker: 'SFCPA, Oran, Algeria',
    category: 'north-african-seasonings',
    country: 'DZ',
    size: '48 cubes',
    weightGrams: 480,
    shortDescription: 'A tray of 48 individually boxed chicken stock cubes.',
    description: [
      'Jumbo chicken stock cubes: a tray of 48 cubes of 10g, each in its own little box.',
      'Crumble one cube into half a litre of cooking water and boil for 3 minutes. The everyday seasoning for chorba, stews, couscous sauces and rice.',
    ],
    ingredients:
      'Salt, maize starch, palm fat, soya flour, vegetable protein extract (contains wheat), chicken 1.3%, vegetables (onion, parsnip, carrot, parsley), flavourings (contain wheat, soya, milk, celery), spice, flavour enhancers (E621, E635), colour (E150d).',
    allergens: 'Soy, wheat (gluten), milk, celery. May contain egg, crustaceans and fish.',
    dietary: { isHalal: true },
    images: [{ url: 'https://familymarket13.com/wp-content/uploads/2025/02/IMG_7596.jpg', source: 'https://familymarket13.com/product/jumbo-x48-2/' }],
    flags: ['Fennec’s description says "pack of 24"; the tray is 48 × 10g as the title says'],
  },
  '119': {
    title: 'Jumbo Mutton Stock Cubes 48 × 10g',
    skuStem: 'jumbo-mutton-48',
    brand: JUMBO,
    maker: 'SFCPA, Oran, Algeria',
    category: 'north-african-seasonings',
    country: 'DZ',
    size: '48 cubes',
    weightGrams: 480,
    barcode: '6133320000031',
    shortDescription: 'A tray of 48 individually boxed mutton stock cubes.',
    description: [
      'Jumbo mutton-flavour stock cubes: a tray of 48 cubes of 10g, each in its own little box.',
      'Crumble one cube into half a litre of cooking water for soups, stews and sauces. The taste of lamb chorba.',
    ],
    ingredients:
      'Salt, maize starch, palm fat, flavourings (contain soya), vegetable protein extract, sugar, vegetables (onion, parsley, garlic, celery, coriander), mutton fat, spices, mutton 0.1%, flavour enhancer (E621).',
    allergens: 'Soy, celery. May contain egg, fish, crustaceans, milk and wheat.',
    nutrition: { energyKJ: 770, energyKcal: 184, fat: 9.4, saturatedFat: 5.4, carbohydrates: 15, sugars: 0.1, fibre: 0.3, protein: 9.4 },
    dietary: { isHalal: true },
    images: [
      // No other photo of this tray exists online; Fennec's is a clean packshot.
      { url: FENNEC_IMG('119'), source: 'https://fennectradingllc.odoo.com/shop/jumbo-stock-cubes-mutton-flavour-pack-x48-119' },
    ],
  },

  // ── Sauces ─────────────────────────────────────────────────────────────────

  '76': {
    title: 'Lesieur Dijon Mustard 260g',
    skuStem: 'lesieur-dijon-mustard-260g',
    brand: LESIEUR,
    maker: 'Générale Condimentaire Algérie, under licence from Lesieur',
    category: 'north-african-sauces',
    country: 'DZ',
    size: '260g',
    weightGrams: 260,
    barcode: '6135345000355',
    shortDescription: 'Strong Dijon mustard in a 260g glass jar.',
    description: [
      'Lesieur Moutarde de Dijon in a 260g glass jar, made in Algeria under licence from Lesieur.',
      'Whisk it into vinaigrettes, sauces and marinades, spread it in sandwiches, or serve it with grilled meat.',
    ],
    ingredients: 'Water, mustard seeds, vinegar, iodised salt, acidity regulator (E330), antioxidant (E224).',
    allergens: 'Mustard, sulphites.',
    storage: 'Keep in a cool, dry place. Once opened, keep refrigerated and use within a month.',
    packaging: 'Glass jar',
    images: [{ url: 'https://www.taibaoline.com/wp-content/uploads/2026/08/SnapBG.ai_1786371271679.png', source: 'https://www.taibaoline.com/product/lesieur-moutarde-de-dijon-260-g/' }],
  },
  '78': {
    title: 'Lesieur Chive & Parsley Salad Dressing 500ml',
    skuStem: 'lesieur-ciboulette-persil-500ml',
    brand: LESIEUR,
    category: 'north-african-sauces',
    country: 'DZ',
    size: '500ml',
    shortDescription: 'Sauce salade ciboulette persil: a ready-made herb vinaigrette.',
    description: [
      'Lesieur’s Sauce Salade Ciboulette Persil: a ready-to-pour vinaigrette with chives and parsley, in a 500ml bottle.',
      'Shake well, then pour over green salads, crudités, potato salad or grilled vegetables.',
    ],
    ingredients:
      'Water, sunflower oil, vinegar, sugar, iodised salt, parsley (1.5%), chives (1%), concentrated lemon juice, thickener (E1422), stabiliser (xanthan gum), flavourings (herbs, mustard), colour (lutein), antioxidant (E385).',
    allergens: 'Mustard. May contain traces of milk, egg and sulphites.',
    nutrition: { energyKcal: 182, fat: 16.5, saturatedFat: 1.8, carbohydrates: 8.1, sugars: 5.2, protein: 0.1, salt: 3.2 },
    images: [{ url: FENNEC_IMG('78'), source: 'https://fennectradingllc.odoo.com/shop/lesieur-ciboulette-persil-500ml-78' }],
  },
  '135': {
    title: 'Lesieur Sauce Algérienne 240g',
    skuStem: 'lesieur-sauce-algerienne-240g',
    brand: LESIEUR,
    maker: 'Générale Condimentaire Algérie, under licence from Lesieur',
    category: 'north-african-sauces',
    country: 'DZ',
    size: '240g',
    weightGrams: 240,
    shortDescription: 'The creamy, gently spiced sauce of the Algerian sandwich shop.',
    description: [
      'Sauce algérienne: a creamy, mildly spiced mayonnaise-style sauce with onion, garlic, cumin and tomato. In a 240g squeeze bottle.',
      'The sauce for sandwiches, kebabs, tacos, burgers and fries.',
    ],
    images: [
      // No photo of the 240g bottle exists online; Fennec's is a real photo.
      { url: FENNEC_IMG('135'), source: 'https://fennectradingllc.odoo.com/shop/lesieur-algerian-sauce-240ml-135' },
    ],
    flags: ['Fennec lists 240ml; the bottle says 240g. No ingredient panel found for this size'],
  },
  '130': {
    title: 'Daily Sauce Professionnel Barbecue Sauce 900g',
    skuStem: 'daily-sauce-bbq-900g',
    brand: { slug: 'daily-sauce', title: 'Daily Sauce' },
    maker: 'Fromagerie Procheese, Chéraga, Algiers, Algeria',
    category: 'north-african-sauces',
    country: 'DZ',
    size: '900g',
    weightGrams: 900,
    barcode: '6132507372077',
    shortDescription: 'A tomato-based barbecue sauce in a large squeeze bottle.',
    description: [
      'Barbecue sauce from Daily Sauce’s Professionnel range: a sweet-tangy, tomato-based sauce in a large squeeze bottle.',
      'For grilled meat, burgers, sandwiches, wraps and fries.',
    ],
    ingredients:
      'Water, tomato concentrate, sugar, vinegar, thickener (E1422), salt, stabiliser (E415), colour (E150d), flavouring, preservatives (E211, E202).',
    allergens: 'May contain traces of soy, milk and mustard.',
    nutrition: { energyKJ: 400, energyKcal: 96, fat: 0.1, carbohydrates: 23, protein: 1 },
    storage: 'Store at room temperature before opening. Once opened, keep at 2–6°C.',
    images: [{ url: 'https://grossiste-mabrouk.com/wp-content/uploads/2024/07/item833192364.png', source: 'https://grossiste-mabrouk.com/product/daily-sauce-bbq-900g-6u/' }],
    flags: ['Fennec lists 900ml; the wholesaler and the range are 900g'],
  },

  // ── Baking & desserts ──────────────────────────────────────────────────────

  '86': {
    title: 'El Aila Dyoul Brick Pastry Sheets, 10 Sheets',
    skuStem: 'el-aila-dyoul-10',
    brand: { slug: 'el-aila', title: 'El Aila' },
    maker: 'El Ayla, Batna, Algeria',
    category: 'north-african-baking',
    country: 'DZ',
    size: '10 sheets',
    weightGrams: 170,
    shortDescription: 'Ten thin round brick sheets for bourek, brik and samsa.',
    description: [
      'Dyoul (dioul) are the thin round pastry sheets of the Algerian kitchen: ten sheets, 170g.',
      'Roll them into bourek for Ramadan, fold them into brik and samsa, or bake them into sweet pastries.',
    ],
    ingredients: 'Flour, water, fresh eggs, salt, vegetable oil, preservative (E200).',
    allergens: 'Gluten (wheat), egg.',
    storage: 'Keep refrigerated at 0–6°C.',
    shippingClass: 'frozen',
    images: [{ url: 'https://www.taibaoline.com/wp-content/uploads/2024/02/Capture-decran-2026-01-27-154231.png', source: 'https://www.taibaoline.com/product/el-aila-dioul-10-feuilles/' }],
  },
  '87': {
    title: 'Oum Walid Dyoul Brick Pastry Sheets, 10 Sheets',
    skuStem: 'oum-walid-dyoul-10',
    brand: { slug: 'oum-walid', title: 'Oum Walid' },
    category: 'north-african-baking',
    country: 'DZ',
    size: '10 sheets',
    weightGrams: 155,
    shortDescription: 'Ten thin brick sheets for bourek, brik and samsa.',
    description: [
      'Oum Walid dyoul: ten thin brick pastry sheets (feuilles de brick), 155g.',
      'Roll them into bourek, fold them into brik and samsa, or use them for spring-roll style starters and sweet pastries.',
    ],
    allergens: 'Made with wheat flour (gluten).',
    storage: 'Keep refrigerated.',
    shippingClass: 'frozen',
    images: [{ url: 'https://familymarket13.com/wp-content/uploads/2025/02/IMG_7732.jpg', source: 'https://familymarket13.com/product/oum-walid-dioul-10x/' }],
  },
  '88': NOUARA_FLAN('88', 'Strawberry', 'fraise', '6130763000031', 50, {
    ingredients: 'Sugar, gelling agent (carrageenan E407), maize starch, strawberry flavouring, colour (E124).',
  }),
  '89': NOUARA_FLAN('89', 'Caramel', 'caramel', '6130763000642', 50, {
    ingredients:
      'Sugar, gelling agent (carrageenan E407), maize starch, caramel flavouring, colours (E150c, E102, E124).',
  }),
  '90': NOUARA_FLAN('90', 'Vanilla', 'vanille', '6130763000024', 50, {
    ingredients: 'Sugar, gelling agent (carrageenan E407), maize starch, vanilla flavouring, colours (E102, E110).',
  }),
  '91': NOUARA_FLAN('91', 'Lemon', 'citron', undefined, 50, { halal: false }),
  '92': NOUARA_FLAN('92', 'Chocolate', 'chocolat', '6130763000017', 56, {
    ingredients: 'Sugar, cocoa, gelling agent (carrageenan E407), maize starch, chocolate flavouring.',
    halal: false,
    flag: 'Fennec lists 50g; the chocolate box says 56g',
  }),
  '93': {
    title: 'Nouara Baking Powder (Levure Chimique) 10g',
    skuStem: 'nouara-baking-powder-10g',
    brand: NOUARA,
    maker: 'SIPADES, Ain Benian, Algiers, Algeria',
    category: 'north-african-baking',
    country: 'DZ',
    size: '10g',
    weightGrams: 10,
    shortDescription: 'Levure chimique ménagère: one sachet raises 500g of flour.',
    description: [
      'Nouara levure chimique ménagère is household baking powder: one 10g sachet raises 500g of flour.',
      'For cakes, biscuits and gâteaux. It is a chemical raising agent, not baker’s yeast, so it will not prove bread dough.',
    ],
    images: [{ url: FENNEC_IMG('93'), source: 'https://fennectradingllc.odoo.com/shop/nouara-levure-baking-yeast-93' }],
    flags: ['Fennec lists "Baking Yeast"; the sachet is baking powder, so it is titled as baking powder'],
  },

  // ── Chocolate ──────────────────────────────────────────────────────────────

  '50': {
    title: 'Dreamy Héritage Milk Chocolate with Pistachio 100g',
    skuStem: 'dreamy-heritage-pistachio-100g',
    brand: DREAMY,
    category: 'chocolate-bars',
    country: 'DZ',
    size: '100g',
    weightGrams: 100,
    barcode: '6132604600233',
    shortDescription: 'Milk chocolate with chopped pistachio, from Dreamy’s Héritage range.',
    description: [
      'A 100g tablet of milk chocolate studded with chopped pistachio, from the Héritage range by the Algerian chocolatier Dreamy.',
      'Creamy and melting, with the crunch of pistachio in every square. An everyday bar for snacking or sharing.',
    ],
    storage: 'Keep in a cool, dry place away from heat and humidity.',
    images: [{ url: OFF('613/260/460/0233/front_ar.5.full.jpg'), source: 'https://world.openfoodfacts.org/product/6132604600233' }],
  },
  '52': {
    title: 'Moment Les Croquants Milk Chocolate, Whole Hazelnuts 145g',
    skuStem: 'moment-croquants-hazelnut-145g',
    brand: MOMENT,
    maker: 'Palmary Food, Algeria',
    category: 'chocolate-bars',
    country: 'DZ',
    size: '145g',
    weightGrams: 145,
    shortDescription: 'Premium milk chocolate with 25% whole hazelnuts and hazelnut pieces.',
    description: [
      'From the Les Croquants range of Moment, Palmary’s premium chocolate: a thick 145g tablet of milk chocolate loaded with 25% whole hazelnuts and hazelnut pieces.',
      'Made in Algeria. A bar for sharing, or for keeping to yourself.',
    ],
    allergens: 'Milk, hazelnuts, soy.',
    images: [
      {
        url: 'https://confiseriedubonheur.net/Stalk3r_hGeDKFxAmyy7H5pn/wp-content/uploads/2023/10/3456754356763563757.jpg',
        source: 'https://confiseriedubonheur.net/product/palmary-moment-les-croquants-lait-noisettes-entieres/',
      },
    ],
  },
  '53': {
    title: 'Moment Les Croquants Milk Chocolate, Almonds 145g',
    skuStem: 'moment-croquants-almond-145g',
    brand: MOMENT,
    maker: 'Palmary Food, Algeria',
    category: 'chocolate-bars',
    country: 'DZ',
    size: '145g',
    weightGrams: 145,
    barcode: '6133414008943',
    shortDescription: 'Premium milk chocolate with 25% almonds.',
    description: [
      'From the Les Croquants range of Moment, Palmary’s premium chocolate: a 145g tablet of milk chocolate with 25% almonds.',
      'Made in Algeria. Crunchy, creamy and generous with the nuts.',
    ],
    ingredients:
      'Sugar, whole milk powder, cocoa butter, almonds, cocoa mass, emulsifiers (soy lecithin E322, polyglycerol polyricinoleate E476), flavouring (vanillin).',
    allergens: 'Milk, almonds, soy.',
    nutrition: { energyKJ: 2267, energyKcal: 544, fat: 33, saturatedFat: 18, carbohydrates: 51, sugars: 46, fibre: 3.7, protein: 8.8, salt: 0.22 },
    images: [
      {
        url: 'https://confiseriedubonheur.net/Stalk3r_hGeDKFxAmyy7H5pn/wp-content/uploads/2023/10/34567890765467890.jpg',
        source: 'https://confiseriedubonheur.net/product/palmary-moment-les-croquants-lait-eclatsamandes/',
      },
    ],
  },
  '54': {
    title: 'Moment Les Croquants Milk Chocolate, Raisins & Hazelnuts 145g',
    skuStem: 'moment-croquants-raisin-hazelnut-145g',
    brand: MOMENT,
    maker: 'Palmary Food, Algeria',
    category: 'chocolate-bars',
    country: 'DZ',
    size: '145g',
    weightGrams: 145,
    barcode: '6133414008981',
    shortDescription: 'Premium milk chocolate with raisins and hazelnut pieces.',
    description: [
      'From the Les Croquants range of Moment, Palmary’s premium chocolate: a 145g tablet of milk chocolate with raisins and hazelnut pieces, 25% fruit and nut in all.',
      'Made in Algeria. The classic fruit-and-nut bar.',
    ],
    ingredients:
      'Sugar, whole milk powder, cocoa butter, hazelnut pieces, cocoa mass, raisins, emulsifiers (soy lecithin E322, polyglycerol polyricinoleate E476), flavouring (vanillin).',
    allergens: 'Milk, hazelnuts, soy. May contain traces of other nuts.',
    // Open Food Facts gives 27g sugars, which is low for milk chocolate and
    // user-entered, so the panel is left off rather than half-published.
    images: [
      // Fennec's own photo: the only clean packshot of this variant found.
      { url: FENNEC_IMG('54'), source: 'https://fennectradingllc.odoo.com/shop/moment-les-croquants-raisins-hazelnuts-54' },
    ],
  },
  '56': {
    title: 'Moment Djazaïr Makrout El Louz Chocolate 150g',
    skuStem: 'moment-djazair-makrout-150g',
    brand: MOMENT,
    maker: 'Palmary Food, Algeria',
    category: 'chocolate-bars',
    country: 'DZ',
    size: '150g',
    weightGrams: 150,
    shortDescription: 'Chocolate filled with lemon cream and almond pieces, inspired by makrout el louz.',
    description: [
      'A filled chocolate tablet from Moment’s Djazaïr edition, inspired by makrout el louz, the Algerian almond pastry scented with lemon.',
      'Melting chocolate around a lemon-flavoured cream and crunchy almond pieces. 150g.',
    ],
    allergens: 'Almonds. Full allergen list on the pack.',
    storage: 'Keep in a cool, dry place away from heat and humidity.',
    images: [
      {
        url: 'https://www.coursesnet.dz/wp-content/uploads/2025/11/djazair-moment-2.png',
        source: 'https://www.coursesnet.dz/product/chocolat-djazair-moment-makrout-ellouz-150g/',
      },
    ],
  },
  '57': {
    title: 'Bimo Ambassadeur Noir Dark Chocolate 100g',
    skuStem: 'bimo-ambassadeur-noir-100g',
    brand: BIMO,
    maker: 'Chocolaterie Bimo, Algeria',
    category: 'chocolate-bars',
    country: 'DZ',
    size: '100g',
    weightGrams: 100,
    barcode: '6130014080119',
    shortDescription: '“Le chocolat noir du connaisseur”: Bimo’s classic dark chocolate tablet.',
    description: [
      'Ambassadeur Noir is Bimo’s classic dark chocolate, sold for decades as “le chocolat noir du connaisseur”. Bimo makes it from a selection of cocoa beans for an intense cocoa taste.',
      'A 100g tablet to eat as it is, or to melt into cakes and desserts.',
    ],
    ingredients: 'Sugar, cocoa butter, cocoa mass, emulsifier (lecithin E322), flavourings.',
    allergens: 'Soy (lecithin).',
    storage: 'Best before 12 months from manufacture. Keep cool and dry.',
    // Open Food Facts' panel for this bar disagrees with itself (2466 kJ against
    // 563 kcal), so it is left off.
    images: [{ url: 'https://groupebimo.com/sites/default/files/images/products/bimo_ambassadeur_noir.png', source: 'https://groupebimo.com/produits/ambassadeur-2' }],
  },
  '58': {
    title: 'Bimo Ambassadeur Extra-Fine Milk Chocolate 100g',
    skuStem: 'bimo-ambassadeur-lait-100g',
    brand: BIMO,
    maker: 'Chocolaterie Bimo, Algeria',
    category: 'chocolate-bars',
    country: 'DZ',
    size: '100g',
    weightGrams: 100,
    barcode: '6130014080010',
    shortDescription: 'Ambassadeur chocolat extra fin au lait: Bimo’s classic milk chocolate in the white wrapper.',
    description: [
      'The white-wrapped Ambassadeur is Bimo’s extra-fine milk chocolate, a long-standing Algerian classic.',
      'A 100g tablet for snacking, and smooth enough to melt for cooking.',
    ],
    ingredients: 'Sugar, cocoa butter, cocoa mass, milk powder, emulsifier (lecithin E322), flavourings.',
    allergens: 'Milk. May contain traces of nuts and gluten.',
    nutrition: { energyKJ: 2265, energyKcal: 542, fat: 33.8, carbohydrates: 51.5, fibre: 2, protein: 7.9 },
    storage: 'Best before 12 months from manufacture. Keep cool and dry.',
    images: [{ url: 'https://groupebimo.com/sites/default/files/images/products/bimo_ambassadeur_au_lait.png', source: 'https://groupebimo.com/produits/ambassadeur' }],
    flags: ['Fennec lists this as "Ambassadeur Dark Chocolate White"; the pack is the milk chocolate, so it is titled as milk'],
  },
  '118': {
    title: 'Bimo Ambassadeur Noir Précieux 70% Dark Chocolate 100g',
    skuStem: 'bimo-ambassadeur-noir-precieux-100g',
    brand: BIMO,
    maker: 'Chocolaterie Bimo, Algeria',
    category: 'chocolate-bars',
    country: 'DZ',
    size: '100g',
    weightGrams: 100,
    barcode: '6130014350120',
    shortDescription: 'A 70% cocoa dark chocolate from Bimo’s Ambassadeur range.',
    description: [
      'Noir Précieux is the darkest of Bimo’s Ambassadeur tablets: 70% cocoa, made with pure cocoa butter.',
      'Stronger and less sweet than the classic Ambassadeur Noir. 100g.',
    ],
    ingredients: 'Cocoa mass, cocoa butter, sugar, emulsifier (lecithin E322), flavouring.',
    allergens: 'May contain traces of milk, nuts and gluten.',
    nutrition: { energyKJ: 2385, energyKcal: 570, fat: 39.1, carbohydrates: 44.4, fibre: 5.7, protein: 7.3 },
    images: [{ url: OFF('613/001/435/0120/front_fr.23.full.jpg'), source: 'https://world.openfoodfacts.org/product/6130014350120' }],
  },

  // ── Biscuits & snacks ──────────────────────────────────────────────────────

  '61': {
    title: 'Bimo Double Mix Wafers, Vanilla & Chocolate 200g',
    skuStem: 'bimo-double-mix-vanilla-chocolate-200g',
    brand: BIMO,
    maker: 'Gaufretterie Bimo, Algeria',
    category: 'north-african-snacks',
    country: 'DZ',
    size: '200g',
    weightGrams: 200,
    barcode: '6130014300422',
    shortDescription: 'Crisp wafers with a double layer of vanilla and chocolate cream.',
    description: [
      'Bimo’s Double Mix: crisp wafers sandwiched with two creams, vanilla and chocolate.',
      'A 200g pack for the lunchbox, the afternoon break or the tea tray.',
    ],
    ingredients:
      'Flour, sugar, vegetable fats, milk powder, cocoa powder, dextrose, starch, raising agent (sodium bicarbonate E500ii), emulsifier (lecithin E322), flavourings.',
    allergens: 'Gluten (flour), milk.',
    storage: 'Best before 12 months from manufacture. Keep cool and dry.',
    images: [{ url: 'https://groupebimo.com/sites/default/files/images/products/bimo_double_mix_vanille_-_chocolat.png', source: 'https://groupebimo.com/produits/double-mix-2' }],
  },
  '83': {
    title: 'Bimo Double Mix Wafers, Vanilla & Hazelnut 200g',
    skuStem: 'bimo-double-mix-vanilla-hazelnut-200g',
    brand: BIMO,
    maker: 'Gaufretterie Bimo, Algeria',
    category: 'north-african-snacks',
    country: 'DZ',
    size: '200g',
    weightGrams: 200,
    shortDescription: 'Crisp wafers with a double layer of vanilla and hazelnut cream.',
    description: [
      'Bimo’s Double Mix: crisp wafers sandwiched with two creams, vanilla and hazelnut.',
      'A 200g pack for snacking.',
    ],
    ingredients:
      'Flour, sugar, vegetable fats, milk powder, dextrose, starch, hazelnut paste, raising agent (sodium bicarbonate E500ii), emulsifier (lecithin E322), flavourings.',
    allergens: 'Gluten (flour), milk, hazelnuts.',
    storage: 'Best before 12 months from manufacture. Keep cool and dry.',
    images: [{ url: 'https://groupebimo.com/sites/default/files/images/products/bimo_double_mix_vanille_-_noisette.png', source: 'https://groupebimo.com/produits/double-mix-1' }],
  },
  '85': {
    title: 'Bimo Double Mix Wafers, Strawberry & Chocolate 200g',
    skuStem: 'bimo-double-mix-strawberry-chocolate-200g',
    brand: BIMO,
    maker: 'Gaufretterie Bimo, Algeria',
    category: 'north-african-snacks',
    country: 'DZ',
    size: '200g',
    weightGrams: 200,
    shortDescription: 'Crisp wafers with a double layer of strawberry and chocolate cream.',
    description: [
      'Bimo’s Double Mix: crisp wafers sandwiched with two creams, strawberry and chocolate.',
      'A 200g pack for snacking.',
    ],
    ingredients:
      'Flour, sugar, vegetable fats, milk powder, dextrose, starch, cocoa powder, raising agent (sodium bicarbonate E500ii), emulsifier (lecithin E322), flavourings.',
    allergens: 'Gluten (flour), milk.',
    storage: 'Best before 12 months from manufacture. Keep cool and dry.',
    images: [{ url: 'https://groupebimo.com/sites/default/files/images/products/bimo_double_mix_fraise_-_chocolat.png', source: 'https://groupebimo.com/produits/double-mix' }],
  },

  // ── El Mordjene (Cebon) ────────────────────────────────────────────────────

  '131': {
    title: 'El Mordjene Roasted Peanut Cream 700g',
    skuStem: 'el-mordjene-peanut-cream-700g',
    brand: CEBON,
    maker: 'Cebon, Algeria',
    category: 'north-african-spreads',
    country: 'DZ',
    size: '700g',
    weightGrams: 700,
    shortDescription: 'A sweet roasted-peanut spread from the makers of El Mordjene.',
    description: [
      'From Cebon, the makers of the El Mordjene hazelnut cream: a smooth, sweet spread of roasted peanuts in a 700g jar.',
      'It is a sweetened peanut cream rather than a plain peanut butter, made for breakfast bread, crêpes and sweet breaks.',
    ],
    ingredients:
      'Sugar, peanut butter, vegetable fat, skimmed milk powder, whey, emulsifier (lecithin), vanilla flavouring, salt.',
    allergens: 'Peanuts, milk.',
    storage: 'Keep dry and out of the sun. Best before 12 months from production.',
    packaging: 'Glass jar',
    images: [{ url: 'https://cebon.dz/wp-content/uploads/2026/04/Creme-cacahuetes-700g.jpg', source: 'https://cebon.dz/creme-cacahuetes/' }],
    flags: ['Fennec lists "Peanut Butter 700ml"; it is a 700g sweetened peanut cream'],
  },
  '141': {
    title: 'El Mordjene Vanilla Flavouring Powder 200g',
    skuStem: 'el-mordjene-vanilla-200g',
    brand: CEBON,
    maker: 'Cebon, Algeria',
    category: 'north-african-baking',
    country: 'DZ',
    size: '200g',
    weightGrams: 200,
    barcode: '6132500710852',
    shortDescription: 'Vanilla-flavoured baking powder for cakes and pastries.',
    description: [
      'A fine, white vanilla-flavoured powder in a 200g tub, for scenting cakes, biscuits, creams and pastries.',
      'It is a flavouring on a dextrose base, used by the spoonful like vanilla sugar. It is not a vanilla extract.',
    ],
    ingredients: 'Dextrose monohydrate, vanilla, ethyl vanillin, flavourings.',
    nutrition: { energyKJ: 1109, energyKcal: 265, fat: 0.1, carbohydrates: 65, protein: 0.1 },
    storage: 'Keep in a dry place out of the sun. Best before 24 months from production.',
    images: [{ url: 'https://cebon.dz/wp-content/uploads/2026/04/Vanille-200g.jpg', source: 'https://cebon.dz/vanille/' }],
  },
  '142': {
    title: 'El Mordjene Chantilly Whipped Cream Powder 200g',
    skuStem: 'el-mordjene-chantilly-200g',
    brand: CEBON,
    maker: 'Cebon, Algeria',
    category: 'north-african-baking',
    country: 'DZ',
    size: '200g',
    weightGrams: 200,
    barcode: '6132500711163',
    shortDescription: 'Powdered chantilly: whip it up for filling and topping cakes and desserts.',
    description: [
      'Chantilly en poudre in a 200g tub. Whipped with cold milk, it makes a light, stable chantilly-style cream.',
      'Use it to fill and decorate cakes, tarts, crêpes and verrines.',
    ],
    ingredients:
      'Sugar, glucose syrup, hydrogenated vegetable oil, sodium caseinate, emulsifiers (E471, E472a), stabiliser (E340), anti-caking agent (E341iii), modified starch (E1422), vanilla flavouring.',
    allergens: 'Milk (sodium caseinate).',
    nutrition: { energyKJ: 2236, energyKcal: 535, fat: 37, carbohydrates: 49.3, protein: 1.2 },
    storage: 'Keep in a dry place out of the sun. Best before 24 months from production.',
    images: [{ url: 'https://cebon.dz/wp-content/uploads/2026/04/Chantilly-200g.jpg', source: 'https://cebon.dz/chantilly/' }],
  },
  '144': {
    title: 'El Mordjene Cocoa Powder 150g',
    skuStem: 'el-mordjene-cacao-150g',
    brand: CEBON,
    maker: 'Cebon, Algeria',
    category: 'north-african-baking',
    country: 'DZ',
    size: '150g',
    weightGrams: 150,
    barcode: '6132500711156',
    shortDescription: 'Extra-fine cocoa powder for baking, ganache and dusting.',
    description: [
      'Extra-fine cocoa powder in a 150g tub.',
      'Cebon recommends it for flavouring ganaches and creams, and for dusting biscuits, pastries, icings and chocolates.',
    ],
    ingredients: 'Cocoa.',
    // The maker's sheet gives 100 kcal and 3g protein per 100g, which cannot be
    // right for cocoa powder, so no panel is published.
    storage: 'Keep in a dry place out of the sun. Best before 24 months from production.',
    images: [{ url: 'https://cebon.dz/wp-content/uploads/2026/04/Cacao-150g.jpg', source: 'https://cebon.dz/cacao/' }],
  },
  '145': {
    title: 'El Mordjene Extra-Fine Icing Sugar 700g',
    skuStem: 'el-mordjene-sucre-glace-700g',
    brand: CEBON,
    maker: 'Cebon, Algeria',
    category: 'north-african-baking',
    country: 'DZ',
    size: '700g',
    weightGrams: 700,
    barcode: '6132500710128',
    shortDescription: 'Sucre glace extra fin, for dusting, icing and meringues.',
    description: [
      'Extra-fine icing sugar in a 700g bag.',
      'For dusting pastries and makrout, and for smooth icings and light meringues.',
    ],
    ingredients: 'Sugar, maize starch.',
    nutrition: { energyKJ: 1672, energyKcal: 400, fat: 0, carbohydrates: 100, protein: 0 },
    storage: 'Keep in a dry place out of the sun. Best before 24 months from production.',
    images: [{ url: 'https://cebon.dz/wp-content/uploads/2026/04/Sucre-glace-paquet-700g.jpg', source: 'https://cebon.dz/sucre-glace/' }],
  },

  // ── Coffee ─────────────────────────────────────────────────────────────────

  '101': {
    title: 'Café Boukhari Ground Coffee 250g',
    skuStem: 'boukhari-coffee-250g',
    brand: { slug: 'boukhari', title: 'Boukhari' },
    maker: 'Café Boukhari, Boufarik, Algeria',
    category: 'north-african-coffee-tea',
    country: 'DZ',
    size: '250g',
    weightGrams: 250,
    barcode: '6130080004538',
    shortDescription: 'Finely ground Algerian coffee from the Boukhari roastery in Boufarik.',
    description: [
      'Ground coffee from the Boukhari family roastery in Boufarik, sold in a 250g vacuum brick.',
      'A robusta-led blend with some arabica, finely ground for a strong, traditional cup. It suits a moka pot or an espresso machine.',
    ],
    storage: 'Store in a cool, dry place away from direct sunlight. Close the pack tightly after opening.',
    packaging: 'Vacuum brick',
    images: [
      { url: 'https://areej.store/wp-content/uploads/2024/08/CAFE-BOUKHARI-250G-405x330-1-1.jpg', source: 'https://areej.store/produit/cafe-boukhari-melange-arabica-et-robusta/' },
    ],
    flags: ['only a 405px photo of this pack exists online; replace with a photo of our stock when possible'],
  },
  '102': {
    title: 'Café Facto Généreux et Intense Ground Coffee 250g',
    skuStem: 'facto-coffee-250g',
    brand: { slug: 'facto', title: 'Facto' },
    maker: 'Café Facto, Algiers, Algeria',
    category: 'north-african-coffee-tea',
    country: 'DZ',
    size: '250g',
    weightGrams: 250,
    barcode: '6130560000067',
    shortDescription: 'Algerian ground coffee, “généreux et intense”, for the moka pot or espresso machine.',
    description: [
      'Café Facto’s “Généreux et Intense”: Algerian ground coffee in a 250g vacuum brick.',
      'Roasted the Algerian way with a little sugar (under 3%), which gives a dark, rounded cup. It suits a moka pot or an espresso machine.',
    ],
    ingredients: 'Ground coffee roasted with sugar (sugar under 3%).',
    packaging: 'Vacuum brick',
    images: [{ url: 'https://areej.store/wp-content/uploads/2024/08/Cafe-Facto-250g-600x600-1.png', source: 'https://areej.store/' }],
  },
  '103': {
    title: 'Aroma Café Ground Coffee 250g',
    skuStem: 'aroma-coffee-250g',
    brand: { slug: 'aroma-cafe', title: 'Aroma Café', website: 'http://cafearoma-dz.com' },
    maker: 'Algo Food, Baraki, Algiers, Algeria',
    category: 'north-african-coffee-tea',
    country: 'DZ',
    size: '250g',
    weightGrams: 250,
    shortDescription: '“La maison de qualité”: Algerian ground coffee in the red brick.',
    description: [
      'Aroma Café is roasted in Baraki, Algiers, from carefully selected beans under the eye of the roaster. The result is a distinctive, full-flavoured morning cup.',
      'Ground coffee in a 250g vacuum brick, roasted with 3% sugar in the Algerian style.',
    ],
    ingredients: 'Ground coffee roasted with sugar (3%).',
    packaging: 'Vacuum brick',
    images: [
      { url: 'http://cafearoma-dz.com/assets/img/AROMA%20fond%20blanc%20.jpg', source: 'http://cafearoma-dz.com/portfolio-details-Aromacaffee.html' },
    ],
  },
  '104': {
    title: 'Café 1001 Goût Espresso Ground Coffee 250g',
    skuStem: 'cafe-1001-250g',
    brand: { slug: 'cafe-1001', title: 'Café 1001' },
    maker: 'TBH Food, Birtouta, Algiers, Algeria',
    category: 'north-african-coffee-tea',
    country: 'DZ',
    size: '250g',
    weightGrams: 250,
    barcode: '6130661000041',
    shortDescription: 'Algerian ground coffee with an espresso-style taste.',
    description: [
      'Café 1001 (Mille Un) “Goût Espresso”: Algerian ground coffee in a 250g vacuum brick.',
      'A blend roasted with a little sugar (3% at most), for the moka pot or the espresso machine.',
    ],
    ingredients: 'Blend of ground coffee roasted with sugar (sugar 3% max).',
    packaging: 'Vacuum brick',
    images: [{ url: 'https://www.coursesnet.dz/wp-content/uploads/2022/05/cafe-1001-250gr.jpg', source: 'https://www.coursesnet.dz/product/cafe-moulu-1001-gout-espresso-250g/' }],
  },
  '105': {
    title: 'Café Bonal Ground Coffee 250g',
    skuStem: 'bonal-coffee-250g',
    brand: BONAL,
    maker: 'Groupe La Belle, Ouled Moussa, Algeria',
    category: 'north-african-coffee-tea',
    country: 'DZ',
    size: '250g',
    weightGrams: 250,
    barcode: '6130711000076',
    shortDescription: 'Café Bonal, roasted by Groupe La Belle: “N°1 en Algérie”.',
    description: [
      'Café Bonal is roasted and ground by Groupe La Belle at Ouled Moussa, and sold as “N°1 en Algérie”.',
      'Ground coffee roasted with a little crystallised sugar (3% at most), in a 250g pack.',
    ],
    ingredients: 'Ground coffee roasted with crystallised white sugar (sugar 3% max).',
    storage: 'Once opened, keep the pack in the refrigerator.',
    // The box pack, which is the one Fennec photographs; La Belle's own site
    // shows only the newer vacuum brick.
    images: [{ url: 'https://www.coursesnet.dz/wp-content/uploads/2022/05/bonalcafe-250gr-2.jpg', source: 'https://www.coursesnet.dz/product/cafe-moulu-bonal-250g/' }],
  },

  // ── Fats ───────────────────────────────────────────────────────────────────

  '71': {
    title: 'Salha Puff-Pastry Margarine 500g',
    skuStem: 'salha-margarine-feuilletage-500g',
    brand: { slug: 'salha', title: 'Salha' },
    maker: 'Maluxe, Bordj El Kiffan, Algiers, Algeria',
    category: 'north-african-spreads',
    country: 'DZ',
    size: '500g',
    weightGrams: 500,
    barcode: '6130651000020',
    shortDescription: 'Margarine de feuilletage: a 100% vegetable block for laminating pastry.',
    description: [
      'Salha is a superior-quality puff-pastry margarine (margarine de feuilletage) in a 500g block, 100% vegetable.',
      'It is made for laminated doughs: puff pastry, croissants and the layered pastries of the North African table. It is a margarine, not butter.',
    ],
    ingredients:
      'Refined vegetable oils and fats (palm, soya), as-is and partially hydrogenated (80–82%), water, salt, sugar, emulsifiers (E471, E475, soy lecithin E322), preservative (potassium sorbate E202), antioxidants (E304, E307c), acidity regulator (citric acid E330), colour (beta-carotene E160a), butter flavouring.',
    allergens: 'Soy.',
    nutrition: { energyKJ: 3077, energyKcal: 736, fat: 81.7, saturatedFat: 41.8, carbohydrates: 0.1, sugars: 0, fibre: 0, protein: 0.1, salt: 0.22 },
    images: [{ url: 'https://www.deluxeglobalmarket.com/media/products/imgs/Salha_1.JPG', source: 'https://www.deluxeglobalmarket.com/product-details/salah-margarine-de-feuilletage-500-gr' }],
    flags: ['Fennec lists "Salha Butter"; the pack is puff-pastry margarine'],
  },
  '115': {
    title: 'Medina Smen Vegetable Ghee 500g',
    skuStem: 'medina-smen-500g',
    brand: { slug: 'medina', title: 'Medina' },
    maker: 'Cevital, Béjaïa, Algeria',
    category: 'north-african-spreads',
    country: 'DZ',
    size: '500g',
    weightGrams: 500,
    barcode: '6130234001666',
    shortDescription: 'Cevital’s 100% vegetable smen, with the aroma of ghee.',
    description: [
      'Medina is Cevital’s 100% vegetable smen: a ghee-style cooking fat with the aroma of ghee, enriched with vitamins A, D and E and free of cholesterol.',
      'Use it for traditional dishes and cakes, to work through steamed couscous, or wherever a recipe calls for butter or oil.',
    ],
    ingredients:
      'Non-hydrogenated vegetable oils and fats, ghee flavouring, vitamins E, A and D, antioxidant (TBHQ), colour (beta-carotene).',
    nutrition: { energyKJ: 3700, energyKcal: 900, fat: 100, saturatedFat: 53, carbohydrates: 0, sugars: 0, protein: 0, salt: 0 },
    storage: 'Store away from light in a clean, dry place at 15–25°C. Best before 12 months from manufacture.',
    dietary: { isHalal: true },
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0538/3726/7130/files/smen-vegital-medina-500g.png?v=1724678505',
        source: 'https://www.panierdorient.com/products/smen-vegetal-medina-500g',
      },
    ],
    flags: [
      'halal from "PRODUIT HALAL" on the older 500g pack; the current pack’s back panel was not seen',
      'photo shows the older pack; Fennec stocks the newer "Recette Authentique" design',
    ],
  },
  '113': {
    title: 'LaBelle Margarine 100% Vegetable 500g',
    skuStem: 'labelle-margarine-500g',
    brand: LABELLE,
    maker: 'Margarinerie La Belle, Dar El Beida, Algiers, Algeria',
    category: 'north-african-spreads',
    country: 'DZ',
    size: '500g',
    weightGrams: 500,
    barcode: '6132004000022',
    shortDescription: 'Superior 100% vegetable margarine: non-hydrogenated, trans-free, no cholesterol.',
    description: [
      'LaBelle Margarine Supérieure, 100% vegetable, in a 500g tub. Non-hydrogenated, trans-free and cholesterol-free, with added vitamins A and D.',
      'For spreading, and for the cakes and pastries of the Algerian kitchen.',
    ],
    ingredients:
      'Vegetable oils (soya, sunflower), solid vegetable fats, water, salt, butter flavouring, vitamins A and D3, emulsifiers (E471, E322), preservatives (E200, E202), acidity regulator (E330), colour (E160a), antioxidant (E307c).',
    allergens: 'Soy.',
    nutrition: { energyKJ: 3053, energyKcal: 743, fat: 82, saturatedFat: 30, carbohydrates: 0.8, sugars: 0.8, protein: 0.3, salt: 0.5 },
    storage: 'Keep cool.',
    images: [{ url: 'https://www.groupelabelle.dz/wp-content/uploads/2025/04/margarine-labelle-500g.png', source: 'https://www.groupelabelle.dz/produit/margarine-labelle-500g/' }],
  },
  '114': {
    title: 'LaBelle Margarine 100% Vegetable 250g',
    skuStem: 'labelle-margarine-250g',
    brand: LABELLE,
    maker: 'Groupe La Belle, Algeria',
    category: 'north-african-spreads',
    country: 'DZ',
    size: '250g',
    weightGrams: 250,
    barcode: '6132004000015',
    shortDescription: 'Superior 100% vegetable margarine: non-hydrogenated, trans-free, no cholesterol.',
    description: [
      'LaBelle Margarine Supérieure, 100% vegetable, in a 250g pot. Non-hydrogenated, trans-free and cholesterol-free, rich in vitamins A, D and E.',
      'For spreading, and for the cakes and pastries of the Algerian kitchen.',
    ],
    ingredients:
      'Vegetable oils (soya, sunflower), solid vegetable fats, water, salt (0.5%), butter flavouring, vitamins A and D3, emulsifiers (E471, E322), preservatives (E200, E202), acidity regulator (E330), colour (E160a), antioxidant (E307c).',
    allergens: 'Soy.',
    nutrition: { energyKJ: 3053, energyKcal: 743, fat: 82, saturatedFat: 30, carbohydrates: 0.8, sugars: 0.8, protein: 0.3, salt: 0.5 },
    storage: 'Keep cool.',
    images: [
      { url: 'https://cdn.shopify.com/s/files/1/0284/7532/6542/files/Photoroom-20240906_1931527E3-2.jpg?v=1757966293', source: 'https://lepro1600.com/en/products/margarine-superieur' },
    ],
  },
  '126': {
    title: 'SOL Margarine 100% Vegetable 250g',
    skuStem: 'sol-margarine-250g',
    brand: { slug: 'sol', title: 'SOL' },
    maker: 'Mateg, Oran, Algeria',
    category: 'north-african-spreads',
    country: 'DZ',
    size: '250g',
    weightGrams: 250,
    shortDescription: 'A 100% vegetable margarine from Mateg of Oran.',
    description: [
      'SOL is a 100% vegetable, non-hydrogenated margarine made by Mateg in Oran: 82% fat, with a natural butter taste.',
      'For spreading and for cooking, in a 250g pot.',
    ],
    ingredients:
      'Non-hydrogenated vegetable oils and fats (palm, soya, sunflower), water, salt, natural butter flavouring, emulsifiers (E471, E322), preservative (E202), acidity regulators (E330, E270), colour (E160a), vitamins E and A.',
    allergens: 'Soy.',
    nutrition: { energyKJ: 2967, energyKcal: 722, fat: 80, saturatedFat: 37, carbohydrates: 0.3, salt: 0.45 },
    storage: 'Store in a cool, dry place at 15–18°C. Best before 12 months from manufacture.',
    images: [{ url: 'https://www.mateg.net/gallery_gen/42391792183e2b0701acf0ec811e48e7_600x600.jpg', source: 'https://www.mateg.net/Margarine-SOL/' }],
    flags: ['photo is the maker’s older pack design; Fennec stocks the newer Arabic-led pot'],
  },
}
