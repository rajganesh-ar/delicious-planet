/**
 * Replace bad primary product photos with exact 1200×1200 squares.
 *
 *   pnpm images:fix --dry-run --preview=<dir>   build every image into <dir>, write nothing
 *   pnpm images:fix --dir=<sources>             upload and relink
 *   pnpm images:fix --only=slug-a,slug-b ...    limit to some plan entries
 *
 * The plan is md/scripts/product-image-fixes.json; `pnpm images:audit` says
 * which products belong in it. Only flagged products go in — a good photo is
 * left exactly as it is. Each entry is one of:
 *
 *   { slug, action: "reframe", fill? }
 *       Re-crop the current primary photo around the product, keeping its own
 *       backdrop. For a product shot small in a big plain frame (TINY).
 *   { slug, action: "cutout", file, sourceUrl, fill? }
 *       Lift the product off a light plain backdrop in `file` (relative to
 *       --dir) and centre it on the card's cream. For a replacement packshot
 *       when the supplier's own photo is unusable (LOWRES, or CUT on a backdrop
 *       that can't be extended). `sourceUrl` records where it came from.
 *   { slug, action: "file", file }
 *       Upload `file` as is; it must already be exactly 1200×1200.
 *
 * Add `"keepOriginal": true` to move the old primary to second place instead
 * of dropping it from the gallery. Dropped photos keep their media rows, so a
 * fix is reverted by restoring the `before` list in the applied log. Note that
 * `pnpm media:cleanup --orphans` will list those rows; deleting them removes
 * the way back.
 *
 * Re-running is safe: a product whose primary is already the image this
 * script made for it is skipped.
 *
 * An importer re-run for one of these products (`import:<supplier> --only=`)
 * resets its gallery to the supplier's photos, undoing the fix.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import type { Media, Product } from '../../src/payload-types'
import { assertExactSquare, cutout, onCream, reframe } from './lib/product-image'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const PLAN_FILE = path.join(dirname, 'product-image-fixes.json')
const LOG_FILE = path.join(dirname, 'product-image-fixes.applied.json')

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
const DRY_RUN = process.argv.includes('--dry-run')
const PREVIEW = arg('preview')
const SOURCE_DIR = arg('dir')
const ONLY = arg('only')?.split(',')

type Entry =
  | { slug: string; action: 'reframe'; fill?: number; keepOriginal?: boolean; note?: string }
  | { slug: string; action: 'cutout'; file: string; sourceUrl: string; fill?: number; keepOriginal?: boolean; note?: string }
  | { slug: string; action: 'file'; file: string; keepOriginal?: boolean; note?: string }

type LogEntry = { slug: string; productId: number; before: number[]; after: number[]; mediaId: number; at: string }

function source(file: string): Buffer {
  if (!SOURCE_DIR) throw new Error(`--dir is required for "${file}"`)
  return fs.readFileSync(path.resolve(SOURCE_DIR, file))
}

async function build(entry: Entry, primary: Media): Promise<Buffer> {
  if (entry.action === 'reframe') {
    if (!primary.url) throw new Error('primary image has no url')
    const res = await fetch(primary.url)
    if (!res.ok) throw new Error(`fetching ${primary.url}: HTTP ${res.status}`)
    return reframe(Buffer.from(await res.arrayBuffer()), entry.fill)
  }
  if (entry.action === 'cutout') return onCream(await cutout(source(entry.file)), entry.fill)
  const buf = source(entry.file)
  await assertExactSquare(buf)
  return buf
}

async function main() {
  const plan = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8')) as Entry[]
  const log: LogEntry[] = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : []
  const entries = ONLY ? plan.filter((e) => ONLY.includes(e.slug)) : plan
  if (PREVIEW) fs.mkdirSync(PREVIEW, { recursive: true })

  const payload = await getPayload({ config })
  console.log(DRY_RUN ? '\nDRY RUN — nothing is written\n' : '\nLIVE RUN\n')

  let changed = 0
  let skipped = 0
  const failed: string[] = []
  for (const entry of entries) {
    try {
      const { docs } = await payload.find({
        collection: 'products',
        where: { slug: { equals: entry.slug } },
        limit: 2,
        depth: 1,
      })
      if (docs.length !== 1) throw new Error(`expected 1 product, found ${docs.length}`)
      const product = docs[0] as Product
      // ids straight from the rows, populated or not, so an unpopulated
      // relation is carried over rather than silently dropped from the gallery
      const before = (product.images ?? [])
        .map((row) => (typeof row.image === 'object' && row.image ? row.image.id : row.image))
        .filter((id): id is number => typeof id === 'number')
      const primary = product.images?.[0]?.image
      if (!primary || typeof primary !== 'object') throw new Error('product has no populated primary image')

      const done = log.find((l) => l.slug === entry.slug)
      if (done && primary.id === done.mediaId) {
        console.log(`  skip   ${entry.slug} (already media ${done.mediaId})`)
        skipped++
        continue
      }

      const image = await build(entry, primary)
      await assertExactSquare(image)
      if (PREVIEW) fs.writeFileSync(path.join(PREVIEW, `${entry.slug}.webp`), image)

      const rest = entry.keepOriginal ? before : before.slice(1)
      console.log(
        `  ${DRY_RUN ? 'would' : 'fix  '}  ${entry.slug}: ${entry.action}; gallery [${before.join(', ')}] → [${['new', ...rest].join(', ')}]`,
      )
      if (DRY_RUN) {
        changed++
        continue
      }

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: product.title,
          ...(entry.action === 'cutout' ? { sourceUrl: entry.sourceUrl } : {}),
        },
        file: {
          data: image,
          mimetype: 'image/webp',
          name: `${entry.slug}-square.webp`,
          size: image.length,
        },
      })
      const after = [media.id, ...rest]
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { images: after.map((id) => ({ image: id })) },
        depth: 0,
      })
      log.push({ slug: entry.slug, productId: product.id, before, after, mediaId: media.id, at: new Date().toISOString() })
      fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2) + '\n')
      changed++
    } catch (err) {
      failed.push(`${entry.slug}: ${(err as Error).message}`)
      console.log(`  FAIL   ${entry.slug}: ${(err as Error).message}`)
    }
  }

  console.log(`\n${changed} ${DRY_RUN ? 'to fix' : 'fixed'}, ${skipped} already done, ${failed.length} failed`)
  if (PREVIEW) console.log(`Preview images: ${PREVIEW}`)
  if (!DRY_RUN && changed) console.log(`Revert log: ${path.relative(process.cwd(), LOG_FILE)}`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
