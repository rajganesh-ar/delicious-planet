import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import type { Product, Media } from '../../src/payload-types'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_FILE = path.resolve(dirname, 'disabled-imageless-products.json')

/**
 * Mirrors getImageUrl/getThumbUrl in src/lib/product.ts: an entry only counts
 * if the relation actually resolved to a media doc carrying a URL. A dangling
 * relation comes back as a bare id (or null) at depth 1, so it counts as
 * missing — the storefront would render an empty tile either way.
 */
function usableImageUrl(image: unknown): string | null {
  if (typeof image !== 'object' || image === null) return null
  const media = image as Media
  return media.sizes?.thumbnail?.url ?? media.sizes?.card?.url ?? media.url ?? null
}

function hasUsableImage(product: Product): boolean {
  return (product.images ?? []).some((row) => usableImageUrl(row?.image) !== null)
}

function reasonFor(product: Product): string {
  const rows = product.images ?? []
  if (rows.length === 0) return 'no images'
  return `${rows.length} image row(s), none resolve to a media file`
}

type Entry = { id: number | string; slug: string; title: string; reason: string }

/**
 * Unpublishing is a straight `_status` flip on the main row. It cannot go
 * through payload.update(), because several of these products predate the
 * required `category` field and hold a null there — a validating write on them
 * fails outright. A draft-mode write skips validation but only touches the
 * versions table, leaving the published row live. So: draft-write to move the
 * latest version, then flip `_status` at the DB layer to actually unpublish.
 */
async function setStatus(
  payload: Awaited<ReturnType<typeof getPayload>>,
  ids: Array<number | string>,
  status: 'draft' | 'published',
) {
  const db = payload.db as unknown as { pool: { query: (q: string, v?: unknown[]) => Promise<unknown> } }
  await db.pool.query(`UPDATE products SET _status = $1 WHERE id = ANY($2::int[])`, [status, ids])
  await db.pool.query(
    `UPDATE _products_v SET version__status = $1 WHERE parent_id = ANY($2::int[]) AND latest = true`,
    [status, ids],
  )
}

async function disable(apply: boolean) {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    depth: 1,
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })

  const targets: Entry[] = (docs as Product[])
    .filter((p) => !hasUsableImage(p))
    .map((p) => ({ id: p.id, slug: p.slug, title: p.title, reason: reasonFor(p) }))

  console.log(`Published products scanned: ${docs.length}`)
  console.log(`Without a usable image:     ${targets.length}\n`)

  for (const t of targets) console.log(`  ${t.slug}  —  ${t.title}  (${t.reason})`)

  if (targets.length === 0) return

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to unpublish these.')
    return
  }

  // Move each doc's latest version to draft so admin history stays coherent.
  for (const t of targets) {
    await payload.update({
      collection: 'products',
      id: t.id,
      data: { _status: 'draft' },
      draft: true,
      overrideAccess: true,
    })
  }
  await setStatus(payload, targets.map((t) => t.id), 'draft')

  fs.writeFileSync(
    LOG_FILE,
    JSON.stringify({ disabledAt: new Date().toISOString(), products: targets }, null, 2),
  )

  console.log(`\nUnpublished ${targets.length} product(s). Nothing was deleted.`)
  console.log(`Wrote ${path.relative(process.cwd(), LOG_FILE)} — re-run with --restore to undo.`)
}

async function restore() {
  if (!fs.existsSync(LOG_FILE)) {
    console.error(`No ${path.relative(process.cwd(), LOG_FILE)} to restore from.`)
    process.exitCode = 1
    return
  }

  const payload = await getPayload({ config })
  const { products } = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) as { products: Entry[] }

  await setStatus(payload, products.map((p) => p.id), 'published')
  for (const p of products) console.log(`  republished ${p.slug}`)
  console.log(`\nRepublished ${products.length} product(s) — note they are still image-less.`)
}

async function verify() {
  const payload = await getPayload({ config })
  const all = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })
  const docs = all.docs as Product[]
  const published = docs.filter((d) => d._status === 'published')
  const leaks = published.filter((d) => !hasUsableImage(d))
  console.log(`total ${docs.length} · published ${published.length} · draft ${docs.length - published.length}`)
  console.log(`published without an image: ${leaks.length}`)
  for (const l of leaks) console.log(`  ${l.slug}`)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--restore')) await restore()
  else if (args.includes('--verify')) await verify()
  else await disable(args.includes('--apply'))
  process.exit(process.exitCode ?? 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
