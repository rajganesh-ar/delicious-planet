import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { importImage } from './utils/import-image'
import { textToLexical } from './utils/to-lexical'

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

async function lookupId(
  payload: PayloadInstance,
  collection: 'categories' | 'suppliers' | 'brands' | 'warehouses',
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
    const newImages = data.images as { image: number }[]
    if (newImages?.length) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0]!.id as number,
        data: { images: newImages },
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

export async function importAdmiralCaviar(payload?: PayloadInstance) {
  if (!payload) payload = await getPayload({ config })

  const brandId = await lookupId(payload, 'brands', 'admiral-caviar')
  const supplierId = await lookupId(payload, 'suppliers', 'admiral-caviar')
  const caviarSelectionId = await lookupId(payload, 'categories', 'caviar-selection')
  const caviarGiftSetsId = await lookupId(payload, 'categories', 'caviar-gift-sets')
  const caviarAccessoriesId = await lookupId(payload, 'categories', 'caviar-accessories')

  console.log('\n=== Admiral Caviar Products ===')

  // ── 1. Siberian Sturgeon Caviar ───────────────────────────────────────────
  const siberianImgIds: number[] = []
  for (const url of [
    'https://d2j6dbq0eux0bg.cloudfront.net/images/105577556/4539550283.jpg',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/e9911cef-dcad-4709-9219-80758ffdb9e7/SIBERIAN%2BTOP%2BOPEN.png',
  ]) {
    const id = await importImage(url, 'Siberian Sturgeon Caviar', payload)
    if (id) siberianImgIds.push(id)
  }
  await upsertProduct(payload, 'siberian-sturgeon-caviar', {
    title: 'Siberian Sturgeon Caviar',
    brand: brandId,
    supplier: supplierId,
    category: caviarSelectionId,
    countryOfOrigin: 'China',
    images: siberianImgIds.map(id => ({ image: id })),
    shortDescription:
      'Refined Siberian sturgeon caviar with firm, glossy black pearls and a rich, buttery taste.',
    description: textToLexical(
      'Sourced from Acipenser baerii, our Siberian Sturgeon Caviar offers firm, glossy black pearls with a rich, buttery flavour and subtle earthy notes. Cold-pasteurised to preserve freshness, it pairs perfectly with blinis and crème fraîche.',
    ),
    inStock: true,
    sizeVariants: [
      { size: '30g', priceAED: 195, variantSku: 'ADM-SIB-30', inStock: true },
      { size: '50g', priceAED: 295, variantSku: 'ADM-SIB-50', inStock: true },
      { size: '100g', priceAED: 550, variantSku: 'ADM-SIB-100', inStock: true },
      { size: '250g', priceAED: 1200, variantSku: 'ADM-SIB-250', inStock: true },
      { size: '500g', priceAED: 2200, variantSku: 'ADM-SIB-500', inStock: true },
    ],
    dietary: { isHalal: false },
    storageInstructions:
      'Keep refrigerated between -2°C and +2°C. Consume within 2 days of opening.',
    packaging: 'Airtight tin with leaden seal',
    _status: 'published',
  })

  // ── 2. Oscietra Caviar ────────────────────────────────────────────────────
  const oscietraImgIds: number[] = []
  for (const url of [
    'https://d2j6dbq0eux0bg.cloudfront.net/images/105577556/4539549264.jpg',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/022ebe15-effe-4e1b-a153-4d2f5a440ae7/IMPERIAL%2BOPEN%2BTOP.png',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/6c3aaec2-b8e8-46a8-9fac-c08b4c881af4/imperial%2Bcaviar.png',
  ]) {
    const id = await importImage(url, 'Oscietra Caviar', payload)
    if (id) oscietraImgIds.push(id)
  }
  await upsertProduct(payload, 'oscietra-caviar', {
    title: 'Oscietra Caviar',
    brand: brandId,
    supplier: supplierId,
    category: caviarSelectionId,
    countryOfOrigin: 'Italy',
    images: oscietraImgIds.map(id => ({ image: id })),
    shortDescription:
      'Medium-sized amber-to-brown pearls with a distinctive nutty, creamy flavour profile.',
    description: textToLexical(
      'Oscietra Caviar (Acipenser gueldenstaedtii) is prized for its medium-sized amber-to-brown pearls and complex flavour — nutty, creamy, with a gentle ocean finish. One of the most sought-after caviars in the world.',
    ),
    inStock: true,
    sizeVariants: [
      { size: '30g', priceAED: 325, variantSku: 'ADM-OSC-30', inStock: true },
      { size: '50g', priceAED: 495, variantSku: 'ADM-OSC-50', inStock: true },
      { size: '100g', priceAED: 950, variantSku: 'ADM-OSC-100', inStock: true },
      { size: '250g', priceAED: 2200, variantSku: 'ADM-OSC-250', inStock: true },
      { size: '500g', priceAED: 4100, variantSku: 'ADM-OSC-500', inStock: true },
    ],
    dietary: { isHalal: false },
    storageInstructions:
      'Keep refrigerated between -2°C and +2°C. Consume within 2 days of opening.',
    packaging: 'Airtight tin with leaden seal',
    _status: 'published',
  })

  // ── 3. Beluga Hybrid Caviar ───────────────────────────────────────────────
  const belugaImgIds: number[] = []
  for (const url of [
    'https://d2j6dbq0eux0bg.cloudfront.net/images/105577556/4539547369.jpg',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/e6fb0fd6-8a86-4213-809b-e6148d81158f/ROYAL%2BBELUGA%2BTOP%2BOPEN.png',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/fe8e4c0c-4300-497d-8395-73fc1c5f9a8d/royal%2Bcaviar.png',
  ]) {
    const id = await importImage(url, 'Beluga Hybrid Caviar', payload)
    if (id) belugaImgIds.push(id)
  }
  await upsertProduct(payload, 'beluga-hybrid-caviar', {
    title: 'Beluga Hybrid Caviar',
    brand: brandId,
    supplier: supplierId,
    category: caviarSelectionId,
    countryOfOrigin: 'Italy',
    images: belugaImgIds.map(id => ({ image: id })),
    shortDescription:
      'Large, jet-black pearls of Beluga × Siberian hybrid with an extraordinarily creamy, mild flavour.',
    description: textToLexical(
      'Produced from a cross between Huso huso (Beluga) and Acipenser baerii (Siberian), our Beluga Hybrid Caviar features large, jet-black pearls with an extraordinarily creamy, mild flavour. An accessible alternative to wild Beluga at exceptional quality.',
    ),
    inStock: true,
    sizeVariants: [
      { size: '30g', priceAED: 420, variantSku: 'ADM-BH-30', inStock: true },
      { size: '50g', priceAED: 650, variantSku: 'ADM-BH-50', inStock: true },
      { size: '100g', priceAED: 1250, variantSku: 'ADM-BH-100', inStock: true },
      { size: '250g', priceAED: 2900, variantSku: 'ADM-BH-250', inStock: true },
      { size: '500g', priceAED: 5400, variantSku: 'ADM-BH-500', inStock: true },
    ],
    dietary: { isHalal: false },
    storageInstructions:
      'Keep refrigerated between -2°C and +2°C. Consume within 2 days of opening.',
    packaging: 'Airtight tin with natural mother-of-pearl lid',
    _status: 'published',
  })

  // ── 4. Sevruga Caviar ─────────────────────────────────────────────────────
  const sevrugaImgIds: number[] = []
  for (const url of [
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/b6dca4bd-86f8-4573-b50f-9bb350617720/RUSSIAN%2BOSETRA%2BTOP%2Bopen.png',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/b875e1d5-8f12-4ba6-a23a-41b39f4fe7b4/russian%2Bcaviar%2B%281%29.png',
  ]) {
    const id = await importImage(url, 'Sevruga Caviar', payload)
    if (id) sevrugaImgIds.push(id)
  }
  await upsertProduct(payload, 'sevruga-caviar', {
    title: 'Sevruga Caviar',
    brand: brandId,
    supplier: supplierId,
    category: caviarSelectionId,
    countryOfOrigin: 'France',
    images: sevrugaImgIds.map(id => ({ image: id })),
    shortDescription:
      'Small, silvery-grey pearls with the most intense, boldly saline flavour of all sturgeon caviars.',
    description: textToLexical(
      'Sevruga (Acipenser stellatus) produces the smallest pearls of the premium sturgeon caviars — small, silvery-grey beads with the most intensely saline, complex flavour. A favourite of caviar connoisseurs worldwide.',
    ),
    inStock: true,
    sizeVariants: [
      { size: '30g', priceAED: 280, variantSku: 'ADM-SEV-30', inStock: true },
      { size: '50g', priceAED: 430, variantSku: 'ADM-SEV-50', inStock: true },
      { size: '100g', priceAED: 820, variantSku: 'ADM-SEV-100', inStock: true },
      { size: '250g', priceAED: 1900, variantSku: 'ADM-SEV-250', inStock: true },
      { size: '500g', priceAED: 3600, variantSku: 'ADM-SEV-500', inStock: true },
    ],
    dietary: { isHalal: false },
    storageInstructions:
      'Keep refrigerated between -2°C and +2°C. Consume within 2 days of opening.',
    packaging: 'Airtight tin with leaden seal',
    _status: 'published',
  })

  // ── 5. Kaluga Hybrid Caviar ───────────────────────────────────────────────
  const kalugaImgIds: number[] = []
  for (const url of [
    'https://d2j6dbq0eux0bg.cloudfront.net/images/105577556/4539550288.jpg',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/7472f59f-fa86-4a78-9d99-d09262d50c88/CLASSIC%2BTOP%2BOPEN.png',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/89ad4464-e89b-43cc-b269-25029f07d254/classic%2Bcaviar.png',
  ]) {
    const id = await importImage(url, 'Kaluga Hybrid Caviar', payload)
    if (id) kalugaImgIds.push(id)
  }
  await upsertProduct(payload, 'kaluga-hybrid-caviar', {
    title: 'Kaluga Hybrid Caviar',
    brand: brandId,
    supplier: supplierId,
    category: caviarSelectionId,
    countryOfOrigin: 'China',
    images: kalugaImgIds.map(id => ({ image: id })),
    shortDescription:
      'River Beluga hybrid caviar: large, dark pearls with a smooth, buttery finish often compared to Beluga.',
    description: textToLexical(
      'Known as "River Beluga", Kaluga Hybrid (Huso dauricus × Acipenser schrencki) caviar produces large, golden-brown to dark pearls with a smooth, buttery finish that closely rivals wild Beluga. Sustainably farmed in China\'s Qiandao Lake.',
    ),
    inStock: true,
    sizeVariants: [
      { size: '30g', priceAED: 390, variantSku: 'ADM-KAL-30', inStock: true },
      { size: '50g', priceAED: 610, variantSku: 'ADM-KAL-50', inStock: true },
      { size: '100g', priceAED: 1150, variantSku: 'ADM-KAL-100', inStock: true },
      { size: '250g', priceAED: 2650, variantSku: 'ADM-KAL-250', inStock: true },
      { size: '500g', priceAED: 4900, variantSku: 'ADM-KAL-500', inStock: true },
    ],
    dietary: { isHalal: false },
    storageInstructions:
      'Keep refrigerated between -2°C and +2°C. Consume within 2 days of opening.',
    packaging: 'Airtight tin with leaden seal',
    _status: 'published',
  })

  // ── 6. Hybrid American White Sturgeon ─────────────────────────────────────
  const whiteImgIds: number[] = []
  for (const url of [
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/e3bf740f-d977-46ef-a45b-13d08ebe635d/PREMIUM%2BTOP%2BOPEN.png',
    'https://images.squarespace-cdn.com/content/v1/66c8aaf2ebe476772113ae80/5c871f23-17a5-4d45-b393-edfe615d63ab/premium%2Bcaviar.png',
  ]) {
    const id = await importImage(url, 'American White Sturgeon Caviar', payload)
    if (id) whiteImgIds.push(id)
  }
  await upsertProduct(payload, 'american-white-sturgeon-caviar', {
    title: 'American White Sturgeon Caviar',
    brand: brandId,
    supplier: supplierId,
    category: caviarSelectionId,
    countryOfOrigin: 'USA',
    images: whiteImgIds.map(id => ({ image: id })),
    shortDescription:
      'Californian farm-raised white sturgeon caviar with large, glossy dark-grey pearls and a clean, mild taste.',
    description: textToLexical(
      'Farmed in the pristine waters of California, American White Sturgeon (Acipenser transmontanus) caviar features large, dark-grey glossy pearls with a clean, mildly briny flavour. An excellent introduction to premium American caviar.',
    ),
    inStock: true,
    sizeVariants: [
      { size: '30g', priceAED: 220, variantSku: 'ADM-AWS-30', inStock: true },
      { size: '50g', priceAED: 340, variantSku: 'ADM-AWS-50', inStock: true },
      { size: '100g', priceAED: 650, variantSku: 'ADM-AWS-100', inStock: true },
      { size: '250g', priceAED: 1500, variantSku: 'ADM-AWS-250', inStock: true },
      { size: '500g', priceAED: 2800, variantSku: 'ADM-AWS-500', inStock: true },
    ],
    dietary: { isHalal: false },
    storageInstructions:
      'Keep refrigerated between -2°C and +2°C. Consume within 2 days of opening.',
    packaging: 'Airtight tin with leaden seal',
    _status: 'published',
  })

  // ── 7. Admiral Classic Gift Set ───────────────────────────────────────────
  await upsertProduct(payload, 'admiral-classic-gift-set', {
    title: 'Admiral Classic Gift Set',
    brand: brandId,
    supplier: supplierId,
    category: caviarGiftSetsId,
    countryOfOrigin: 'UAE',
    images: [],
    shortDescription:
      'A curated gift set with 30g Siberian Sturgeon and 30g Oscietra caviar, plus blinis and crème fraîche.',
    description: textToLexical(
      'The Admiral Classic Gift Set is a thoughtfully curated introduction to fine caviar — a 30g tin of Siberian Sturgeon Caviar, a 30g tin of Oscietra Caviar, artisan blinis, and a jar of crème fraîche, presented in an elegant gift box. Perfect for entertaining or gifting.',
    ),
    inStock: true,
    prices: [{ currency: 'AED', amount: 650 }],
    dietary: { isHalal: false },
    _status: 'published',
  })

  // ── 8. Imperial Duo Gift Set ──────────────────────────────────────────────
  await upsertProduct(payload, 'imperial-duo-gift-set', {
    title: 'Imperial Duo Gift Set',
    brand: brandId,
    supplier: supplierId,
    category: caviarGiftSetsId,
    countryOfOrigin: 'UAE',
    images: [],
    shortDescription:
      '50g Beluga Hybrid and 50g Kaluga Hybrid in a lacquered chest with mother-of-pearl spoons.',
    description: textToLexical(
      'Presenting our finest hybrid caviars side by side — 50g of Beluga Hybrid and 50g of Kaluga Hybrid — in a hand-lacquered presentation chest with two mother-of-pearl tasting spoons. An extraordinary gift for those who demand the very best.',
    ),
    inStock: true,
    prices: [{ currency: 'AED', amount: 1600 }],
    dietary: { isHalal: false },
    _status: 'published',
  })

  // ── 9. Prestige Gift Set ──────────────────────────────────────────────────
  await upsertProduct(payload, 'admiral-prestige-gift-set', {
    title: 'Admiral Prestige Gift Set',
    brand: brandId,
    supplier: supplierId,
    category: caviarGiftSetsId,
    countryOfOrigin: 'UAE',
    images: [],
    shortDescription:
      'Three 30g tins — Siberian, Oscietra, Sevruga — in a navy velvet box with full service accessories.',
    description: textToLexical(
      'The ultimate tasting experience: three 30g tins — Siberian Sturgeon, Oscietra, and Sevruga — presented in a padded navy velvet box together with a complete service set: blinis, crème fraîche, mother-of-pearl spoons, and tasting notes.',
    ),
    inStock: true,
    prices: [{ currency: 'AED', amount: 1200 }],
    dietary: { isHalal: false },
    _status: 'published',
  })

  // ── 10. Luxury Corporate Gift Set ────────────────────────────────────────
  await upsertProduct(payload, 'admiral-luxury-corporate-gift-set', {
    title: 'Admiral Luxury Corporate Gift Set',
    brand: brandId,
    supplier: supplierId,
    category: caviarGiftSetsId,
    countryOfOrigin: 'UAE',
    images: [],
    shortDescription:
      'Bespoke corporate gift — 100g Oscietra, Champagne, and a personalised keepsake box.',
    description: textToLexical(
      'Impress your most valued clients with our Luxury Corporate Gift Set: a 100g tin of premium Oscietra Caviar, a chilled bottle of Champagne, hand-engraved mother-of-pearl spoons, and a personalised keepsake box bearing your company logo.',
    ),
    inStock: true,
    prices: [{ currency: 'AED', amount: 2200 }],
    dietary: { isHalal: false },
    _status: 'published',
  })

  // ── 11. Discovery Trio – Mini Gift Set ────────────────────────────────────
  await upsertProduct(payload, 'admiral-discovery-trio-gift-set', {
    title: 'Admiral Discovery Trio Gift Set',
    brand: brandId,
    supplier: supplierId,
    category: caviarGiftSetsId,
    countryOfOrigin: 'UAE',
    images: [],
    shortDescription:
      '3 × 10g tins (Siberian, Oscietra, Beluga Hybrid) — the perfect introduction for first-time caviar lovers.',
    description: textToLexical(
      'New to the world of caviar? The Discovery Trio offers three 10g tins — Siberian Sturgeon, Oscietra, and Beluga Hybrid — allowing you to compare and discover your preferred style. Presented in a minimalist white gift box with tasting guide.',
    ),
    inStock: true,
    prices: [{ currency: 'AED', amount: 450 }],
    dietary: { isHalal: false },
    _status: 'published',
  })

  // ── 12. Mother-of-Pearl Caviar Spoon Set (2 spoons) ───────────────────────
  const spoon2ImgId = await importImage(
    'https://d2j6dbq0eux0bg.cloudfront.net/images/105577556/4539604770.jpg',
    'Mother-of-Pearl Caviar Spoon Set (2 pcs)',
    payload,
  )
  await upsertProduct(payload, 'mother-of-pearl-caviar-spoon-set-2', {
    title: 'Mother-of-Pearl Caviar Spoon Set (2 pcs)',
    brand: brandId,
    supplier: supplierId,
    category: caviarAccessoriesId,
    countryOfOrigin: 'France',
    images: spoon2ImgId ? [{ image: spoon2ImgId }] : [],
    shortDescription:
      'Classic mother-of-pearl spoons — the only material that never imparts metallic notes to caviar.',
    description: textToLexical(
      "Genuine mother-of-pearl caviar spoons are the connoisseur's choice — the natural shell surface is completely neutral and will never impart metallic flavours. Set of 2 spoons, each 12 cm, presented in a gift drawstring pouch.",
    ),
    inStock: true,
    prices: [{ currency: 'AED', amount: 120 }],
    _status: 'published',
  })

  // ── 13. Mother-of-Pearl Caviar Spoon Set (4 spoons) ───────────────────────
  const spoon4ImgId = await importImage(
    'https://d2j6dbq0eux0bg.cloudfront.net/images/105577556/4539602809.jpg',
    'Mother-of-Pearl Caviar Spoon Set (4 pcs)',
    payload,
  )
  await upsertProduct(payload, 'mother-of-pearl-caviar-spoon-set-4', {
    title: 'Mother-of-Pearl Caviar Spoon Set (4 pcs)',
    brand: brandId,
    supplier: supplierId,
    category: caviarAccessoriesId,
    countryOfOrigin: 'France',
    images: spoon4ImgId ? [{ image: spoon4ImgId }] : [],
    shortDescription:
      'Set of 4 mother-of-pearl spoons — ideal for entertaining and caviar service at the table.',
    description: textToLexical(
      'Entertain in style with our set of 4 mother-of-pearl caviar spoons. Each 12 cm long, lightly curved for effortless serving, and presented in a padded gift box. Perfect companion to our full selection of Admiral Caviar.',
    ),
    inStock: true,
    prices: [{ currency: 'AED', amount: 220 }],
    _status: 'published',
  })

  console.log('\n✅ Admiral Caviar import complete.')
}

// Run directly: tsx src/seed/import-admiral-caviar.ts
if (process.argv[1]?.endsWith('import-admiral-caviar.ts')) {
  importAdmiralCaviar()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

