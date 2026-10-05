/**
 * Which products' primary photos look bad in the product card? Read-only.
 *
 *   pnpm images:audit
 *
 * Run it after any import. Each published product's first image is measured
 * the way ProductCard frames it (an exact square, `object-cover`):
 *
 *   CUT     part of the product falls outside the square crop
 *   TOUCH   something runs into the edge of the square on a plain backdrop,
 *           including a product that already touches the edge of its photo
 *   TINY    the product is a small object in a big plain frame
 *   LOWRES  narrower than 600px, so it goes soft on a 2× screen
 *
 * A flagged product is fixed with `pnpm images:fix` (see that script). An
 * unflagged one is left alone: a good photo is not re-processed for the sake
 * of uniformity.
 *
 * Photos already settled are skipped, so the list is only what still needs a
 * look: the image `images:fix` made (per its applied log), or one kept on
 * purpose with a `{ slug, action: "keep", mediaId, note }` entry in the plan.
 * Both match on the media id, so a product whose photo later changes is
 * audited again.
 *
 * Writes md/scripts/product-image-audit.json alongside the printed list.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import type { Media, Product } from '../../src/payload-types'
import { measure, type ImageMeasure } from './lib/product-image'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const CONCURRENCY = 8

/** slug → media id of a primary photo that has been fixed or deliberately kept. */
function settledPhotos(): Map<string, number> {
  const settled = new Map<string, number>()
  const read = (file: string) =>
    fs.existsSync(path.join(dirname, file)) ? JSON.parse(fs.readFileSync(path.join(dirname, file), 'utf8')) : []
  for (const l of read('product-image-fixes.applied.json') as Array<{ slug: string; mediaId: number }>) {
    settled.set(l.slug, l.mediaId)
  }
  for (const e of read('product-image-fixes.json') as Array<{ slug: string; action: string; mediaId?: number }>) {
    if (e.action === 'keep' && e.mediaId) settled.set(e.slug, e.mediaId)
  }
  return settled
}

async function main() {
  const settled = settledPhotos()
  let skipped = 0
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    limit: 2000,
    depth: 1,
    select: { slug: true, title: true, images: true },
  })

  const rows: Array<{ slug: string; mediaId: number; url: string } & ImageMeasure> = []
  const failures: string[] = []
  let next = 0
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < docs.length) {
        const product = docs[next++] as Product
        const media = product.images?.[0]?.image
        if (!media || typeof media !== 'object') {
          failures.push(`${product.slug}: no primary image`)
          continue
        }
        const m = media as Media
        if (settled.get(product.slug) === m.id) {
          skipped++
          continue
        }
        // the card rendition keeps the aspect ratio, so it measures the same
        // as the original at a fraction of the download
        const url = m.sizes?.card?.url ?? m.url
        if (!url || !m.width || !m.height) {
          failures.push(`${product.slug}: media ${m.id} has no url or dimensions`)
          continue
        }
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const buf = Buffer.from(await res.arrayBuffer())
          const result = await measure(buf, { width: m.width, height: m.height })
          rows.push({ slug: product.slug, mediaId: m.id, url, ...result })
        } catch (err) {
          failures.push(`${product.slug}: ${(err as Error).message}`)
        }
      }
    }),
  )

  const flagged = rows.filter((r) => r.flags.length > 0).sort((a, b) => a.slug.localeCompare(b.slug))
  console.log(
    `\n${docs.length} published products: ${skipped} already fixed or kept, ${flagged.length} of the rest with a bad primary photo\n`,
  )
  for (const r of flagged) {
    const detail = [
      `${r.width}×${r.height}`,
      r.flags.includes('CUT') ? `${Math.round(r.cutBy * 100)}% cut off` : null,
      r.flags.includes('TINY') && r.tileFrac !== null ? `product ${Math.round(r.tileFrac * 100)}% of tile` : null,
    ]
      .filter(Boolean)
      .join(', ')
    console.log(`  ${r.flags.join('+').padEnd(11)} ${r.slug}  (media ${r.mediaId}; ${detail})`)
  }
  if (failures.length) {
    console.log(`\nCould not measure ${failures.length}:`)
    for (const f of failures) console.log(`  ${f}`)
  }

  const out = path.join(dirname, 'product-image-audit.json')
  fs.writeFileSync(out, JSON.stringify({ checkedAt: new Date().toISOString(), flagged, failures }, null, 2) + '\n')
  console.log(`\nReport: ${path.relative(process.cwd(), out)}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
