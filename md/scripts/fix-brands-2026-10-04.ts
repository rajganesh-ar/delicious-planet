import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { BRAND_COLLECTIONS, BRANDS, resolveBrand } from '../seed/intermex-catalogue'
import { fetchJson, type ShopifyProduct } from '../seed/lib/shopify-source'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const RECORD_FILE = path.resolve(dirname, 'fixed-brands-2026-10-04.json')

const INTERMEX = 'https://intermexuae.com'

/**
 * Caputo is a brand we carry, not a supplier. The "Caputo" supplier row was a
 * placeholder (its website is casinetto.com) and nothing links to it.
 */
const WRONG_SUPPLIERS = ['caputo']

/**
 *   pnpm tsx md/scripts/fix-brands-2026-10-04.ts           dry run
 *   pnpm tsx md/scripts/fix-brands-2026-10-04.ts --apply   write
 *
 * 1. Re-files every Intermex product under the maker on its pack, using the
 *    same `resolveBrand` the importer now uses, so a re-run agrees with this.
 *    Before, 30 products sat under "Intermex" whatever their maker (Jarritos,
 *    Fit Panda, Inzi…) and 112 had no brand although their title names one.
 * 2. Deletes the wrong supplier rows above.
 *
 * Every product's previous brand is written to RECORD_FILE first, so the
 * change can be reversed.
 */
async function main() {
  const apply = process.argv.includes('--apply')
  const payload = await getPayload({ config })

  // The fallback collections, read live, exactly as the importer reads them.
  const membership = new Map<string, string[]>()
  for (const collection of Object.keys(BRAND_COLLECTIONS)) {
    const res = await fetchJson<{ products: ShopifyProduct[] }>(
      `${INTERMEX}/collections/${collection}/products.json?limit=250`,
    )
    for (const p of res.products) {
      membership.set(p.handle, [...(membership.get(p.handle) ?? []), collection])
    }
  }

  const { docs: brands } = await payload.find({
    collection: 'brands',
    depth: 0,
    limit: 0,
    pagination: false,
  })
  const brandBySlug = new Map(brands.map((b) => [b.slug, b]))
  const slugById = new Map(brands.map((b) => [b.id, b.slug]))

  const { docs: products } = await payload.find({
    collection: 'products',
    where: { 'source.provider': { equals: 'intermex' } },
    depth: 0,
    limit: 0,
    pagination: false,
    sort: 'title',
  })

  const changes: Array<{
    id: number
    title: string
    handle: string
    from: string | null
    to: string | null
  }> = []
  for (const p of products) {
    const handle = p.source?.handle
    if (!handle) throw new Error(`product ${p.id} has no source handle`)
    const target = resolveBrand(handle, membership.get(handle) ?? [])
    const current = typeof p.brand === 'number' ? (slugById.get(p.brand) ?? null) : null
    if ((target?.slug ?? null) === current) continue
    changes.push({ id: p.id, title: p.title, handle, from: current, to: target?.slug ?? null })
  }

  const toCreate = [...new Set(changes.map((c) => c.to))].filter(
    (slug): slug is string => slug !== null && !brandBySlug.has(slug),
  )

  console.log(`\nIntermex products: ${products.length}, re-branded: ${changes.length}`)
  for (const c of changes) console.log(`  ${c.id}  ${c.from ?? '—'} → ${c.to ?? '—'}  ${c.title}`)
  console.log(`\nbrands to create (${toCreate.length}): ${toCreate.join(', ')}`)

  const { docs: suppliers } = await payload.find({
    collection: 'suppliers',
    where: { slug: { in: WRONG_SUPPLIERS } },
    depth: 0,
    limit: 0,
    pagination: false,
  })
  for (const s of suppliers) {
    const [linkedProducts, linkedApplications] = await Promise.all([
      payload.count({ collection: 'products', where: { supplier: { equals: s.id } } }),
      payload.count({
        collection: 'vendor-applications',
        where: { linkedSupplier: { equals: s.id } },
      }),
    ])
    if (linkedProducts.totalDocs + linkedApplications.totalDocs > 0) {
      throw new Error(`supplier "${s.slug}" is still referenced — check it before deleting`)
    }
    console.log(`\nsupplier to delete: ${s.id}  ${s.name} (${s.website ?? 'no website'})`)
  }

  // Already applied. Stop before RECORD_FILE is overwritten with nothing.
  if (changes.length === 0 && suppliers.length === 0) {
    console.log('\nNothing to change.')
    return
  }

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to write these changes.')
    return
  }

  fs.writeFileSync(
    RECORD_FILE,
    JSON.stringify(
      { fixedAt: new Date().toISOString(), changes, deletedSuppliers: suppliers },
      null,
      2,
    ),
  )
  console.log(`\nRecorded to ${path.relative(process.cwd(), RECORD_FILE)}`)

  for (const slug of toCreate) {
    const { title } = BRANDS[slug]!
    const created = await payload.create({ collection: 'brands', data: { title, slug } })
    brandBySlug.set(slug, created)
    console.log(`  brand: created ${title} (id ${created.id})`)
  }

  for (const c of changes) {
    await payload.update({
      collection: 'products',
      id: c.id,
      data: { brand: c.to ? brandBySlug.get(c.to)!.id : null },
    })
  }
  console.log(`  ${changes.length} products re-branded`)

  for (const s of suppliers) {
    await payload.delete({ collection: 'suppliers', id: s.id })
    console.log(`  supplier: deleted ${s.name} (id ${s.id})`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
