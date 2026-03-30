import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { importImage } from './utils/import-image'
import { textToLexical } from './utils/to-lexical'

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

// Casinetto CDN – all files follow pattern /<hash>_<SKU>.jpg
const CDN = 'https://cdn.shopify.com/s/files/1/1575/0603/files/'

async function lookupId(
  payload: PayloadInstance,
  collection: 'categories' | 'suppliers' | 'brands',
  slug: string,
): Promise<number> {
  const result = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1 })
  if (!result.docs.length)
    throw new Error(`${collection}/${slug} not found — run seed-base-data first`)
  return result.docs[0]!.id as number
}

async function upsertProduct(
  payload: PayloadInstance,
  slug: string,
  data: Record<string, unknown>,
): Promise<void> {
  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    if ((data.images as Array<unknown>)?.length) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0]!.id as number,
        data: { images: data.images } as never,
        overrideAccess: true,
      })
      console.log(`  [updated images] products/${slug}`)
    } else {
      console.log(`  [skip] products/${slug}`)
    }
    return
  }
  await payload.create({
    collection: 'products',
    data: { ...data, slug } as never,
    overrideAccess: true,
  })
  console.log(`  [created] products/${slug}`)
}

/* ──────────────────────────────────────────────────────────────────────────
   Caputo flour information — sourced from Mulino Caputo official specs
   ────────────────────────────────────────────────────────────────────────*/

interface CaputoProduct {
  slug: string
  title: string
  sku: string
  imageFile: string | null
  shortDesc: string
  longDesc: string
  weightGrams: number
  priceAED: number
  ingredients: string
  allergens: string
  nutritionPer100g: {
    energyKJ: number
    energyKcal: number
    protein: number
    carbohydrates: number
    sugars: number
    fat: number
    saturatedFat: number
    salt: number
    fibre: number
  }
  dietary: { isHalal: boolean; isVegetarian: boolean; isVegan: boolean }
  storageInstructions: string
  packaging: string
  barcode?: string
}

const caputoProducts: CaputoProduct[] = [
  {
    slug: 'caputo-00-flour-pizza-1kg',
    title: 'Caputo Tipo 00 Pizza Flour – 1 kg',
    sku: 'CAPD001',
    imageFile: '7b3d92a741d712b93502c3a3f16cdf3630f538a6_CAPD001.jpg',
    shortDesc:
      'The original Neapolitan pizza flour — finely milled soft-wheat "00" for exceptional gluten development and a light, airy crust.',
    longDesc:
      'Mulino Caputo\'s Tipo 00 is the original Neapolitan pizza flour, milled since 1924 in Naples. Made from 100% soft wheat, this finely sifted "00" flour creates a silky, extensible dough with beautiful elasticity. Suitable for long fermentation (24–72 hours) and high-temperature wood-fired ovens. Certified by the Associazione Verace Pizza Napoletana (AVPN).',
    weightGrams: 1000,
    priceAED: 32,
    ingredients: '100% soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1463,
      energyKcal: 346,
      protein: 12.5,
      carbohydrates: 70.5,
      sugars: 1.2,
      fat: 1.2,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.8,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions:
      'Store in a cool, dry place away from direct sunlight. Use within 12 months of production date.',
    packaging: 'Paper bag',
    barcode: '8008030000036',
  },
  {
    slug: 'caputo-00-flour-pizza-5kg',
    title: 'Caputo Tipo 00 Pizza Flour – 5 kg',
    sku: 'CAPD002',
    imageFile: '7b3d92a741d712b93502c3a3f16cdf3630f538a6_CAPD001.jpg',
    shortDesc:
      '5 kg of the iconic Neapolitan "00" pizza flour — ideal for pizzerias, bakeries, and serious home cooks.',
    longDesc:
      "The professional-sized 5 kg bag of Caputo's original Tipo 00 Pizza Flour. Same premium soft wheat, same fine sifting, same AVPN certification — now in a quantity that suits busy pizzerias, catering operations, and passionate home bakers who ferment large batches.",
    weightGrams: 5000,
    priceAED: 135,
    ingredients: '100% soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1463,
      energyKcal: 346,
      protein: 12.5,
      carbohydrates: 70.5,
      sugars: 1.2,
      fat: 1.2,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.8,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions:
      'Store in a cool, dry place away from direct sunlight. Use within 12 months of production date.',
    packaging: 'Paper bag',
    barcode: '8008030000059',
  },
  {
    slug: 'caputo-cuoco-flour-1kg',
    title: "Caputo Cuoco Chef's Flour – 1 kg",
    sku: 'CAPD003',
    imageFile: '39ff9c85b6aa11392f89153f1ffc583310288492_CAPD012.jpg',
    shortDesc:
      'High-strength "00" flour with W 300–320 for long-fermented pizza, focaccia, and enriched breads.',
    longDesc:
      'Caputo Cuoco (Chef) is a high-protein "00" flour with a strength index (W) of 300–320, designed for extended-fermentation doughs of 24–72 hours. The stronger gluten network supports higher hydration and creates a chewy, open crumb. Excellent for Neapolitan-style pizza, Roman-style focaccia, ciabatta, and enriched brioche-style breads.',
    weightGrams: 1000,
    priceAED: 38,
    ingredients: '100% soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1467,
      energyKcal: 347,
      protein: 13.0,
      carbohydrates: 70.0,
      sugars: 1.1,
      fat: 1.3,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.5,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030000074',
  },
  {
    slug: 'caputo-nuvola-flour-1kg',
    title: 'Caputo Nuvola (Cloud) Flour – 1 kg',
    sku: 'CAPD004',
    imageFile: 'c94e2c211b2cde61fbb5f7fdbe1cafd408241c90_CAPD042.jpg',
    shortDesc:
      '"Nuvola" means cloud — this W 260–280 flour creates incredibly light, airy pizza crusts with a pronounced "cornicione" rim.',
    longDesc:
      'Caputo Nuvola (Italian for "cloud") is specially formulated to produce a pillowy, bubbled cornicione — the prized puffy rim of a Neapolitan pizza. With a W of 260–280, it ferments beautifully at room temperature for 12–24 hours. The result is a base that is crispy on the outside, soft and airy inside, and pleasantly light on the stomach.',
    weightGrams: 1000,
    priceAED: 38,
    ingredients: '100% soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1461,
      energyKcal: 345,
      protein: 12.0,
      carbohydrates: 71.0,
      sugars: 1.0,
      fat: 1.1,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.8,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030011056',
  },
  {
    slug: 'caputo-semola-rimacinata-1kg',
    title: 'Caputo Semola Rimacinata (Durum Semolina) – 1 kg',
    sku: 'CAPD005',
    imageFile: '52dfba041f840dc4f436891ae9968a3177bfada0_CAPD010.jpg',
    shortDesc:
      'Twice-milled durum wheat semolina — the traditional flour for pasta fresca, gnocchi, and artisan bread.',
    longDesc:
      'Caputo Semola Rimacinata is produced by milling durum wheat twice to achieve an extra-fine consistency. This bright-yellow, high-protein semolina delivers superior texture and golden colour in handmade pasta — from tagliatelle to orecchiette — and in rustic Italian breads like Altamura. It can also be used to dust pizza dough during stretching.',
    weightGrams: 1000,
    priceAED: 30,
    ingredients: '100% durum wheat semolina (Triticum durum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1479,
      energyKcal: 349,
      protein: 12.8,
      carbohydrates: 72.0,
      sugars: 0.5,
      fat: 0.8,
      saturatedFat: 0.1,
      salt: 0.003,
      fibre: 3.5,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030000104',
  },
  {
    slug: 'caputo-gluten-free-flour-1kg',
    title: 'Caputo Fioreglut Gluten-Free Flour – 1 kg',
    sku: 'CAPD006',
    imageFile: null,
    shortDesc:
      "Caputo's celebrated gluten-free pizza flour blend, delivering a remarkably authentic crust texture for coeliacs and gluten-intolerant cooks.",
    longDesc:
      "Caputo Fioreglut is the world's first dedicated gluten-free pizza flour certified by AVPN for authentic Neapolitan pizza. Made with a blend of rice starch, buckwheat flour, and psyllium seed husks, it replicates the texture and extensibility of wheat-based dough without gluten. Coeliac-safe and approved by the Italian Coeliac Association (AIC).",
    weightGrams: 1000,
    priceAED: 58,
    ingredients:
      'Rice starch, buckwheat flour, corn starch, psyllium seed husks, rice flour, dextrose, thickeners (E412 guar gum, E415 xanthan gum).',
    allergens: 'Gluten-free. May contain traces of milk, eggs. Suitable for coeliacs.',
    nutritionPer100g: {
      energyKJ: 1455,
      energyKcal: 343,
      protein: 2.8,
      carbohydrates: 79.0,
      sugars: 2.5,
      fat: 0.5,
      saturatedFat: 0.1,
      salt: 0.05,
      fibre: 5.0,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030011025',
  },
  {
    slug: 'caputo-classica-flour-1kg',
    title: 'Caputo Classica All-Purpose Flour – 1 kg',
    sku: 'CAPD007',
    imageFile: '6d43c47586ad6ef3e3059907a30c674fd872f1f0_CAPD017.jpg',
    shortDesc:
      'A versatile Italian "00" all-purpose flour — perfect for pastry, cakes, biscotti, and light pasta doughs.',
    longDesc:
      'Caputo Classica is a finely milled soft-wheat "00" flour with a moderate protein level (W 150–180), ideal for pastry, shortcrust, cakes, biscotti, and delicate pasta doughs where a light, tender result is desired. The lowest-protein flour in the Caputo range, it produces exceptionally soft, crumbly textures in baked goods.',
    weightGrams: 1000,
    priceAED: 28,
    ingredients: '100% soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1453,
      energyKcal: 343,
      protein: 10.0,
      carbohydrates: 72.5,
      sugars: 1.5,
      fat: 1.0,
      saturatedFat: 0.1,
      salt: 0.003,
      fibre: 2.2,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030000043',
  },
  {
    slug: 'caputo-manitoba-oro-flour-1kg',
    title: 'Caputo Manitoba Oro Flour – 1 kg',
    sku: 'CAPD008',
    imageFile: '6676db138f1c3ab0f18fab46d5371754dd4748e1_CAPD018.jpg',
    shortDesc:
      'The strongest flour in the Caputo line (W 380–400) — designed for the most demanding long-fermentation breads, croissants, and panettone.',
    longDesc:
      'Caputo Manitoba Oro is a super-strong flour milled from premium Canadian Manitoba wheat. With a W index of 380–400, it can absorb up to 80% hydration and sustain extremely long fermentations (72–96 hours). The go-to flour for professional bakers making panettone, pandoro, croissants, and other laminated or enriched doughs demanding maximum gluten strength.',
    weightGrams: 1000,
    priceAED: 42,
    ingredients: '100% Manitoba wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1470,
      energyKcal: 348,
      protein: 15.0,
      carbohydrates: 68.0,
      sugars: 1.0,
      fat: 1.5,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.4,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030000104',
  },
  {
    slug: 'caputo-integrale-flour-1kg',
    title: 'Caputo Integrale Wholemeal Flour – 1 kg',
    sku: 'CAPD009',
    imageFile: null,
    shortDesc:
      'Stone-ground Italian wholemeal flour — rich in bran and fibre, ideal for rustic country breads and wholemeal pizza.',
    longDesc:
      'Caputo Integrale is a stone-ground wholemeal flour that retains the wheat germ and bran for a nutritionally complete, flavour-rich flour. It produces a hearty, slightly dense crumb in rustic breads, wholemeal pizza bases, and whole-grain pasta. Its earthy, nutty flavour is a signature of traditional Italian country baking.',
    weightGrams: 1000,
    priceAED: 34,
    ingredients: '100% wholemeal soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1380,
      energyKcal: 326,
      protein: 11.5,
      carbohydrates: 62.0,
      sugars: 1.8,
      fat: 1.8,
      saturatedFat: 0.3,
      salt: 0.004,
      fibre: 9.5,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions:
      'Store in a cool, dry place. Consume within 6 months — wholemeal flour is more perishable.',
    packaging: 'Paper bag',
    barcode: '8008030011018',
  },
  {
    slug: 'caputo-saccorosso-flour-1kg',
    title: 'Caputo Saccorosso Flour – 1 kg',
    sku: 'CAPD010',
    imageFile: 'ba4f7e86e6a808f43eb111d52d086fa09973c6f1_CAPD002.jpg',
    shortDesc:
      'W 300–320 professional bread flour in the iconic red bag — the bakery staple for sourdough, panini, and Italian breads.',
    longDesc:
      'Caputo Saccorosso (red bag) is a professional-grade strong flour (W 300–320) trusted by Italian bakeries and bread artisans for decades. It delivers excellent structure and crumb openness in sourdough, classic Italian panini, focaccia Genovese, and enriched breads. Ideal for medium-to-long fermentation up to 48 hours.',
    weightGrams: 1000,
    priceAED: 36,
    ingredients: '100% soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1467,
      energyKcal: 347,
      protein: 13.0,
      carbohydrates: 70.0,
      sugars: 1.1,
      fat: 1.3,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.5,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030000067',
  },
  {
    slug: 'caputo-pasta-fresca-flour-1kg',
    title: 'Caputo Pasta Fresca e Gnocchi Flour – 1 kg',
    sku: 'CAPD011',
    imageFile: null,
    shortDesc:
      'Dedicated fresh pasta flour from Caputo — a unique blend for silky tagliatelle, pappardelle, and light gnocchi.',
    longDesc:
      'Caputo Pasta Fresca e Gnocchi is a specially formulated blend of soft and durum wheat flours, engineered for making silky fresh pasta and tender gnocchi at home. The balanced protein level creates dough that is easy to roll, holds its shape during cooking, and produces a beautifully smooth, al-dente bite without excessive tearing or toughness.',
    weightGrams: 1000,
    priceAED: 34,
    ingredients: 'Soft wheat flour (Triticum aestivum), durum wheat semolina (Triticum durum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1468,
      energyKcal: 347,
      protein: 12.2,
      carbohydrates: 71.5,
      sugars: 1.0,
      fat: 1.1,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.6,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030015009',
  },
  {
    slug: 'caputo-lievito-secco-yeast-100g',
    title: 'Caputo Lievito Secco Dry Yeast – 100 g',
    sku: 'CAPD012',
    imageFile: '8c9cbbf957db71e0cfe895b29f723e3787261726_CAPD066.jpg',
    shortDesc:
      "Caputo's own instant dry yeast — specifically calibrated to pair with Caputo flours for optimal fermentation activity.",
    longDesc:
      'Caputo Lievito Secco is an instant active dry yeast developed by Mulino Caputo to work in perfect synergy with their flour range. Pre-activated and easy to use — no proofing required — it provides consistent, reliable leavening for pizza, bread, and pastry. One of the most trusted yeasts in professional Neapolitan pizza making.',
    weightGrams: 100,
    priceAED: 22,
    ingredients: 'Saccharomyces cerevisiae (97%), emulsifier: E491.',
    allergens: 'Gluten-free. Contains soy-based emulsifier.',
    nutritionPer100g: {
      energyKJ: 1360,
      energyKcal: 325,
      protein: 45.0,
      carbohydrates: 32.0,
      sugars: 4.0,
      fat: 5.0,
      saturatedFat: 1.5,
      salt: 0.1,
      fibre: 8.0,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place below 25°C. Once opened, use within 2 weeks.',
    packaging: 'Sealed sachet',
    barcode: '8008030010028',
  },
  {
    slug: 'caputo-lievito-madre-dry-sourdough-100g',
    title: 'Caputo Lievito Madre Dry Sourdough Starter – 100 g',
    sku: 'CAPD013',
    imageFile: '666f10a735751363daf61033a5874d737d3e49f3_CAPD007.jpg',
    shortDesc:
      'Authentic Italian dried sourdough starter (lievito madre) — brings complex tang and flavour to pizza and bread without maintaining a live culture.',
    longDesc:
      'Caputo Lievito Madre is a dried, natural sourdough starter sourced from traditional Italian lievito madre cultures. Mixed with flour and water, it reactivates to produce a genuine wild-yeast fermentation — adding characteristic sour depth, improved crust texture, and extended shelf life to breads and pizzas. An easy way to enjoy sourdough results without maintaining a live starter.',
    weightGrams: 100,
    priceAED: 35,
    ingredients: 'Dried sourdough starter (wheat, water, natural wild yeast cultures).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1380,
      energyKcal: 328,
      protein: 11.0,
      carbohydrates: 65.0,
      sugars: 2.0,
      fat: 1.5,
      saturatedFat: 0.3,
      salt: 0.2,
      fibre: 4.0,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place below 20°C. Keep away from moisture.',
    packaging: 'Sealed sachet',
    barcode: '8008030010035',
  },
  {
    slug: 'caputo-pizzeria-flour-1kg',
    title: 'Caputo Pizzeria Flour – 1 kg',
    sku: 'CAPD014',
    imageFile: '7b3d92a741d712b93502c3a3f16cdf3630f538a6_CAPD001.jpg',
    shortDesc:
      'The blue bag — Caputo\'s entry-level "00" pizza flour, the world\'s most-sold professional pizza flour, W 220–240.',
    longDesc:
      'Caputo Pizzeria — the iconic blue bag — is the single most-sold professional pizza flour on earth and the bedrock of countless Neapolitan pizzerias. With a W of 220–240, it is optimised for same-day to 24-hour fermentations in high-temperature ovens. It creates a stretchy, responsive dough that develops gorgeous leopard spots when cooked at 450°C+.',
    weightGrams: 1000,
    priceAED: 30,
    ingredients: '100% soft wheat flour (Triticum aestivum).',
    allergens: 'Contains gluten. May contain traces of soy.',
    nutritionPer100g: {
      energyKJ: 1460,
      energyKcal: 345,
      protein: 11.5,
      carbohydrates: 71.5,
      sugars: 1.2,
      fat: 1.1,
      saturatedFat: 0.2,
      salt: 0.004,
      fibre: 2.7,
    },
    dietary: { isHalal: true, isVegetarian: true, isVegan: true },
    storageInstructions: 'Store in a cool, dry place. Use within 12 months.',
    packaging: 'Paper bag',
    barcode: '8008030000029',
  },
]

export async function importCasinettoCarputo(payload?: PayloadInstance) {
  if (!payload) payload = await getPayload({ config })

  const brandId = await lookupId(payload, 'brands', 'caputo')
  const supplierId = await lookupId(payload, 'suppliers', 'casinetto')
  const categoryId = await lookupId(payload, 'categories', 'caputo-flour-baking')

  console.log('\n=== Casinetto / Caputo Products ===')

  for (const p of caputoProducts) {
    // Image URL from Casinetto CDN
    const imageUrl = p.imageFile ? `${CDN}${p.imageFile}` : null
    const imageId = imageUrl ? await importImage(imageUrl, p.title, payload) : null

    await upsertProduct(payload, p.slug, {
      title: p.title,
      brand: brandId,
      supplier: supplierId,
      category: categoryId,
      countryOfOrigin: 'Italy',
      barcode: p.barcode,
      images: imageId ? [{ image: imageId }] : [],
      shortDescription: p.shortDesc,
      description: textToLexical(p.longDesc),
      inStock: true,
      prices: [{ currency: 'AED', amount: p.priceAED }],
      ingredients: p.ingredients,
      allergens: p.allergens,
      nutritionPer100g: p.nutritionPer100g,
      dietary: p.dietary,
      storageInstructions: p.storageInstructions,
      packaging: p.packaging,
      shipping: { weightGrams: p.weightGrams },
      _status: 'published',
    })
  }

  console.log('\n✅ Casinetto/Caputo import complete.')
}

// Run directly: tsx src/seed/import-casinetto-caputo.ts
if (process.argv[1]?.endsWith('import-casinetto-caputo.ts')) {
  importCasinettoCarputo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
