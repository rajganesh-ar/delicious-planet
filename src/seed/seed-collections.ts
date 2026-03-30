import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PUBLIC_DIR = path.resolve(__dirname, '../../public')

async function uploadLocalImage(
  payload: Payload,
  filePath: string,
  alt: string,
): Promise<number | null> {
  try {
    const data = fs.readFileSync(filePath)
    const filename = path.basename(filePath)
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
    const mimetype =
      ext === 'avif'
        ? 'image/avif'
        : ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg'

    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`  [skip] media/${filename} already exists`)
      return existing.docs[0]!.id as number
    }

    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype, name: filename, size: data.length },
    })
    console.log(`  [uploaded] media/${filename}`)
    return doc.id as number
  } catch (err) {
    console.error(`  [error] uploading ${filePath}:`, err)
    return null
  }
}

async function upsertCollection(
  payload: Payload,
  data: { title: string; slug: string; description: string; imageFile: string; sortOrder: number },
) {
  const existing = await payload.find({
    collection: 'product-collections',
    where: { slug: { equals: data.slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    // Update with image if it's missing
    const doc = existing.docs[0]!
    if (!doc.image) {
      const imagePath = path.join(PUBLIC_DIR, 'images', 'collections', data.imageFile)
      const imageId = await uploadLocalImage(payload, imagePath, data.title)
      if (imageId) {
        await payload.update({
          collection: 'product-collections',
          id: doc.id as number,
          data: { image: imageId },
        })
        console.log(`  [updated image] collection/${data.slug}`)
        return
      }
    }
    console.log(`  [skip] collection/${data.slug} already exists`)
    return
  }

  const imagePath = path.join(PUBLIC_DIR, 'images', 'collections', data.imageFile)
  const imageId = await uploadLocalImage(payload, imagePath, data.title)

  await payload.create({
    collection: 'product-collections',
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      sortOrder: data.sortOrder,
      ...(imageId ? { image: imageId } : {}),
    },
  })
  console.log(`  [created] collection/${data.slug}`)
}

const COLLECTIONS = [
  {
    title: 'Caviar Selection',
    slug: 'caviar-selection',
    imageFile: 'caviar.avif',
    sortOrder: 1,
    description:
      "The world's finest caviars, from Beluga to Oscietra, sourced from the most prestigious sturgeon farms.",
  },
  {
    title: 'Truffle Treasury',
    slug: 'truffle-treasury',
    imageFile: 'pantry.avif',
    sortOrder: 2,
    description:
      'Black Périgord and white Alba truffles alongside truffle oils, butters, and infused pantry essentials.',
  },
  {
    title: 'Grand Cru Cocoa & Chocolat',
    slug: 'grand-cru-cocoa-chocolat',
    imageFile: 'coco.avif',
    sortOrder: 3,
    description:
      "Single-origin grand cru chocolates and fine cocoa crafted by the world's foremost maîtres chocolatiers.",
  },
  {
    title: 'Heritage Extra Virgin Oils',
    slug: 'heritage-extra-virgin-oils',
    imageFile: 'oils.avif',
    sortOrder: 4,
    description:
      'Cold-pressed extra virgin olive oils from century-old groves across Andalucía, Tuscany, and the Levant.',
  },
  {
    title: 'Rare Estate Honey',
    slug: 'rare-estate-honey',
    imageFile: 'honey.avif',
    sortOrder: 5,
    description:
      'Monofloral and wildflower honeys harvested by artisan beekeepers from protected estates worldwide.',
  },
  {
    title: 'Aged Balsamic & Vinegars',
    slug: 'aged-balsamic-vinegars',
    imageFile: 'vinegar.avif',
    sortOrder: 6,
    description:
      'Traditional Modena balsamic aged decades in oak barrels and rare fruit vinegars from small-batch producers.',
  },
  {
    title: 'Mediterranean Olive Reserve',
    slug: 'mediterranean-olive-reserve',
    imageFile: 'olives.avif',
    sortOrder: 7,
    description:
      'Hand-picked table olives, tapenades, and olive-based condiments from the finest Mediterranean groves.',
  },
  {
    title: 'Single-Origin Spices',
    slug: 'single-origin-spices',
    imageFile: 'spices.avif',
    sortOrder: 8,
    description:
      'Rare spices traced to their exact origin — saffron from Kashmir, vanilla from Madagascar, pepper from Kerala.',
  },
  {
    title: 'Signature Gourmet Spreads',
    slug: 'signature-gourmet-spreads',
    imageFile: 'spreads.avif',
    sortOrder: 9,
    description:
      'Artisan nut butters, fruit conserves, and savoury spreads made from single-estate and heritage ingredients.',
  },
  {
    title: 'Fromagerie Selection',
    slug: 'fromagerie-selection',
    imageFile: 'Fromagerie.avif',
    sortOrder: 10,
    description:
      'A curated cellar of aged and artisan cheeses — from cave-ripened blues to estate-made raw-milk tommes.',
  },
  {
    title: 'Artisan Heritage Breads',
    slug: 'artisan-heritage-breads',
    imageFile: 'breads.avif',
    sortOrder: 11,
    description:
      'Long-fermented sourdoughs and heritage-grain loaves baked by master boulangeries using ancient techniques.',
  },
  {
    title: 'Specialty Coffee Reserve',
    slug: 'specialty-coffee-reserve',
    imageFile: 'coffee.avif',
    sortOrder: 12,
    description:
      'Lot-specific specialty coffees scoring 87+ points, roasted to order from micro-lot farms across three continents.',
  },
  {
    title: 'Botanical Seed Selection',
    slug: 'botanical-seed-selection',
    imageFile: 'seeds.avif',
    sortOrder: 13,
    description:
      'Heirloom and heritage seeds — sesame, poppy, chia, and more — sourced from traditional agricultural regions.',
  },
  {
    title: 'Curated Fine Beverages',
    slug: 'curated-fine-beverages',
    imageFile: 'beverages.avif',
    sortOrder: 14,
    description:
      'Rare teas, botanical waters, and premium non-alcoholic drinks selected for provenance and exceptional taste.',
  },
  {
    title: 'Bespoke Tableware & Cutlery',
    slug: 'bespoke-tableware-cutlery',
    imageFile: 'cutlery.avif',
    sortOrder: 15,
    description:
      'Handcrafted tableware and silversmith cutlery for those who believe the table is as important as the dish.',
  },
]

async function main() {
  const payload = await getPayload({ config })

  console.log('\n╔═══════════════════════════════════════╗')
  console.log('║  Seeding Product Collections          ║')
  console.log('╚═══════════════════════════════════════╝\n')

  for (const col of COLLECTIONS) {
    await upsertCollection(payload, col)
  }

  console.log('\n✅ Product collections seeded successfully.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
