import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import type { Category, Product } from '../../src/payload-types'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const BACKUP_FILE = path.resolve(dirname, 'removed-non-food-products.json')

/**
 * The store sells food only. These two departments held nothing else — Intermex
 * accessories (sombreros, piñatas, a molcajete), Admiral's caviar spoons, and
 * Caputo apparel and its gift card — so they go along with their products. The
 * importers now skip all of it, so a re-run will not bring it back.
 */
const NON_FOOD_DEPARTMENTS = ['bespoke-tableware-cutlery', 'merchandise']

/**
 *   pnpm tsx md/scripts/remove-non-food-products.ts           dry run
 *   pnpm tsx md/scripts/remove-non-food-products.ts --apply   delete
 *
 * Deletes the products, then the departments left empty. The full documents
 * are written to BACKUP_FILE first. Media is left alone: the backup references
 * it by id, so the products can be re-created from the backup.
 */
async function main() {
  const apply = process.argv.includes('--apply')
  const payload = await getPayload({ config })

  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: { slug: { in: NON_FOOD_DEPARTMENTS } },
    depth: 0,
    limit: 0,
    pagination: false,
  })
  // Already removed. Stop here: an empty `in` below must never reach a query.
  if (categories.length === 0) {
    console.log('No non-food departments left — nothing to remove.')
    return
  }

  const children = await payload.count({
    collection: 'categories',
    where: { parent: { in: categories.map((c) => c.id) } },
  })
  if (children.totalDocs > 0) {
    throw new Error('a non-food department has sub-categories — check them before deleting')
  }

  const { docs: products } = await payload.find({
    collection: 'products',
    where: { category: { in: categories.map((c) => c.id) } },
    depth: 0,
    limit: 0,
    pagination: false,
    sort: 'title',
  })

  for (const c of categories as Category[]) {
    const own = (products as Product[]).filter((p) => p.category === c.id)
    console.log(`\n${c.title} (${c.slug}) — ${own.length} product(s)`)
    for (const p of own) console.log(`  ${p.id}  ${p.title}  (${p._status}, ${p.source?.provider ?? 'manual'})`)
  }

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to delete these products and departments.')
    return
  }

  fs.writeFileSync(
    BACKUP_FILE,
    JSON.stringify({ removedAt: new Date().toISOString(), categories, products }, null, 2),
  )
  console.log(`\nBacked up to ${path.relative(process.cwd(), BACKUP_FILE)}`)

  for (const p of products) {
    await payload.delete({ collection: 'products', id: p.id })
  }
  console.log(`Deleted ${products.length} product(s).`)

  for (const c of categories) {
    await payload.delete({ collection: 'categories', id: c.id })
  }
  console.log(`Deleted ${categories.length} department(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
