/**
 * One-off catalogue corrections from the 2026-09-25 audit (OPEN-ISSUES.md §2–§4).
 *
 *   pnpm fix:catalogue-2026-09-25 --dry-run   print what would change, write nothing
 *   pnpm fix:catalogue-2026-09-25             apply it
 *
 * Idempotent: anything already in the target state is reported and skipped, so
 * a second run is a no-op.
 *
 * Writes go through the Local API rather than SQL so that `deriveVariantRollups`
 * recomputes the product-level `inStock`, and a version row is recorded.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

const DRY_RUN = process.argv.includes('--dry-run')

/** Supplier handles shown in stock here but sold out at the supplier. */
const SOLD_OUT_AT_SOURCE = [
  'la-costena-green-salsa',
  'la-conspiracion-salsa-mojito-verde',
  'rancheritos-original',
  'marinela-barritas-pineapple',
  'rice-morelo-1kg-valle-verde',
  'dona-maria-mole-paste',
  'ruffles-cheese',
  'caputo-00-baking-flour',
  'caputo-00-pasta-fresca-flour',
]

/** Supplier handles shown out of stock here but available at the supplier. */
const BACK_IN_STOCK = ['queso-cotija-excelsior-mexican-aged-cheese']

/** Category → an existing product photo, chosen by eye from in-stock products. */
const CATEGORY_IMAGE: Record<string, number> = {
  'pantry-staples': 741, // Nopal Foods, pickled cactus
  'mexican-sauces': 624, // La Meridana artisanal hot sauce basket
  'mexican-candy': 629, // Montes Tomy candies
  'chocolate-bars': 483, // Velsoro ruby chocolate with pistachio
}

/** Orphaned by the zero-priced `la-costena-guacamole-salsa`, which is not imported. */
const DELETE_MEDIA = [844, 845]

async function main() {
  const payload = await getPayload({ config })
  console.log(DRY_RUN ? '\nDRY RUN — nothing is written\n' : '\nLIVE RUN\n')

  async function bySourceHandle(handle: string) {
    const { docs } = await payload.find({
      collection: 'products',
      where: { 'source.handle': { equals: handle } },
      limit: 2,
      depth: 0,
    })
    if (docs.length !== 1) throw new Error(`${handle}: expected 1 product, found ${docs.length}`)
    return docs[0]!
  }

  async function setStock(handles: string[], inStock: boolean) {
    for (const handle of handles) {
      const p = await bySourceHandle(handle)
      if (p.variants.every((v) => (v.inStock !== false) === inStock)) {
        console.log(`  ${p.slug}: already ${inStock ? 'in' : 'out'}`)
        continue
      }
      console.log(`  ${p.slug}: inStock → ${inStock}`)
      if (DRY_RUN) continue
      await payload.update({
        collection: 'products',
        id: p.id,
        data: { variants: p.variants.map((v) => ({ ...v, inStock })) },
        depth: 0,
      })
    }
  }

  console.log('Stock → out of stock')
  await setStock(SOLD_OUT_AT_SOURCE, false)

  console.log('Stock → in stock')
  await setStock(BACK_IN_STOCK, true)

  console.log('Category images')
  for (const [slug, mediaId] of Object.entries(CATEGORY_IMAGE)) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const category = docs[0]
    if (!category) throw new Error(`category "${slug}" not found`)
    if (category.image) {
      console.log(`  ${slug}: already has an image`)
      continue
    }
    const media = await payload.findByID({ collection: 'media', id: mediaId, depth: 0 })
    console.log(`  ${slug}: media ${media.id} (${media.filename})`)
    if (DRY_RUN) continue
    await payload.update({ collection: 'categories', id: category.id, data: { image: mediaId }, depth: 0 })
  }

  console.log('Orphaned media')
  for (const id of DELETE_MEDIA) {
    const media = await payload.findByID({ collection: 'media', id, depth: 0, disableErrors: true })
    if (!media) {
      console.log(`  ${id}: already gone`)
      continue
    }
    console.log(`  ${id}: delete ${media.filename}`)
    if (DRY_RUN) continue
    await payload.delete({ collection: 'media', id })
  }

  console.log('\ndone')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
