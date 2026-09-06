import 'dotenv/config'
import { getPayload } from 'payload'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import config from '../../src/payload.config'
import { shopifyImageFetcher, plainImageFetcher } from '../seed/lib/shopify-source'

/**
 * Rebuild the media library in R2 without Vercel Blob.
 *
 *   pnpm media:recover --dry-run   report what each file would be rebuilt from
 *   pnpm media:recover             do it
 *   pnpm media:recover --force     rebuild even files already present in R2
 *   pnpm media:recover --limit=20  stop after N, for a cautious first pass
 *
 * Why this exists: the Blob store went to 403 on every object, so the byte-for
 * byte copy in blob-to-r2.ts has nothing to read. Every file is instead fetched
 * from where it originally came from:
 *
 *   · `media.sourceUrl` — the importers record the supplier URL they fetched
 *     each file from, precisely so a file can be traced back. Those CDNs still
 *     serve, which covers the entire product catalogue.
 *
 *   · `public/` — the bundled category art, matched by filename. Payload's
 *     dedupe suffix is stripped first, so "cutlery-1.avif" finds "cutlery.avif".
 *
 * Nothing is created or deleted: each existing media document is updated in
 * place with a fresh file, so every product, category and banner keeps pointing
 * at the same row. Payload re-runs sharp on the way in, so the four sizes are
 * regenerated rather than copied — the derivatives do not need a source.
 *
 * Re-runnable: a file already in R2 is skipped unless --force.
 */

const DRY_RUN = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')
const LIMIT = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 0)

/** See blob-to-r2.ts — a systemic failure should stop, not repeat 750 times. */
const CONSECUTIVE_FAILURE_LIMIT = 5

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing ${name}. See .env.example.`)
    process.exit(1)
  }
  return value
}

const bucket = required('R2_BUCKET')
const s3 = new S3Client({
  endpoint: required('R2_ENDPOINT'),
  region: 'auto',
  credentials: {
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
  },
  forcePathStyle: true,
})

/** Every file under public/, keyed by lowercased basename. */
function indexPublic(dir = 'public', out = new Map<string, string>()): Map<string, string> {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) indexPublic(p, out)
    else out.set(entry.toLowerCase(), p)
  }
  return out
}

/** "cutlery-1.avif" -> "cutlery.avif": Payload's suffix for a duplicate name. */
function stripDedupeSuffix(name: string): string {
  return name.replace(/-\d+(\.[a-z0-9]+)$/i, '$1')
}

async function existsInR2(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
    const name = (err as { name?: string })?.name
    if (status === 404 || name === 'NotFound' || name === 'NoSuchKey') return false
    throw err
  }
}

interface MediaDoc {
  id: number
  filename?: string | null
  sourceUrl?: string | null
  mimeType?: string | null
  alt?: string | null
}

type Origin = { kind: 'remote'; url: string } | { kind: 'local'; path: string } | null

function resolveOrigin(doc: MediaDoc, publicFiles: Map<string, string>): Origin {
  if (doc.sourceUrl) return { kind: 'remote', url: doc.sourceUrl }
  const name = (doc.filename ?? '').toLowerCase()
  if (!name) return null
  const hit = publicFiles.get(name) ?? publicFiles.get(stripDedupeSuffix(name))
  return hit ? { kind: 'local', path: hit } : null
}

interface Loaded {
  data: Buffer
  mimetype: string
  /** Extension the bytes actually are, which is not always the stored one. */
  ext: string | null
}

/**
 * Fetch through the same helpers the importers used, not the bare sourceUrl.
 *
 * This matters more than it looks. Shopify's CDN serves the untouched master on
 * a plain request — the first run of this script pulled 8.7 MB PNGs for files
 * that were 98 KB webp before. `shopifyImageFetcher` appends
 * `width=2000&format=webp` and sends the Accept header the CDN requires to
 * honour it, which is what the original import did; matching it keeps both the
 * byte sizes and the .webp extensions the database already records.
 */
async function loadBytes(origin: Exclude<Origin, null>): Promise<Loaded> {
  if (origin.kind === 'local') {
    return { data: readFileSync(origin.path), mimetype: '', ext: null }
  }

  const isShopify = /(^|\.)cdn\.shopify\.com$/i.test(new URL(origin.url).hostname)
  const fetcher = isShopify ? shopifyImageFetcher : plainImageFetcher
  const fetched = await fetcher(origin.url)

  // A CDN that answers 200 with an HTML error page would otherwise be stored as
  // a valid-looking image and only fail later, in a browser.
  if (fetched.data.length < 512) {
    throw new Error(`suspiciously small response: ${fetched.data.length} bytes`)
  }
  return { data: fetched.data, mimetype: fetched.mimetype, ext: fetched.ext }
}

/** Keep the stored basename, but let the fetched format decide the extension. */
function reconcileName(filename: string, ext: string | null): string {
  if (!ext) return filename
  const current = extname(filename).replace('.', '').toLowerCase()
  if (current === ext.toLowerCase()) return filename
  return `${filename.slice(0, filename.length - extname(filename).length)}.${ext}`
}

async function main() {
  const payload = await getPayload({ config: await config })
  const publicFiles = indexPublic()

  const res = await payload.find({
    collection: 'media',
    limit: 2000,
    depth: 0,
    select: { filename: true, sourceUrl: true, mimeType: true, alt: true },
  })
  const docs = res.docs as unknown as MediaDoc[]

  console.log(
    `${docs.length} media documents${DRY_RUN ? ' (dry run — nothing will be written)' : ''}\n`,
  )

  let restored = 0
  let skipped = 0
  let noSource = 0
  const failures: Array<{ file: string; error: string }> = []
  let consecutiveFailures = 0

  for (const doc of docs) {
    if (LIMIT && restored >= LIMIT) break

    const filename = doc.filename ?? String(doc.id)
    const origin = resolveOrigin(doc, publicFiles)

    if (!origin) {
      noSource++
      continue
    }

    try {
      if (!FORCE && (await existsInR2(filename))) {
        skipped++
        continue
      }

      if (DRY_RUN) {
        console.log(
          `  would restore  ${filename}  <-  ${origin.kind === 'local' ? origin.path : origin.url.slice(0, 70)}`,
        )
        restored++
        consecutiveFailures = 0
        continue
      }

      const loaded = await loadBytes(origin)
      const name = reconcileName(filename, loaded.ext)
      const mimetype =
        loaded.mimetype ||
        doc.mimeType ||
        MIME_BY_EXT[extname(name).toLowerCase()] ||
        'application/octet-stream'

      // Updating in place keeps the row id, so every relationship survives.
      // `overwriteExistingFiles` stops Payload appending another -1 suffix and
      // stranding the old key in R2.
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {},
        file: { data: loaded.data, mimetype, name, size: loaded.data.length },
        overwriteExistingFiles: true,
      })

      restored++
      consecutiveFailures = 0
      process.stdout.write(`\r  restored ${restored}  skipped ${skipped}  failed ${failures.length}`)
    } catch (err) {
      failures.push({ file: filename, error: (err as Error).message })
      consecutiveFailures++
      if (consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT) {
        console.error(
          `\n\nStopped after ${CONSECUTIVE_FAILURE_LIMIT} failures in a row — this looks systemic.`,
        )
        break
      }
    }
  }

  console.log('\n')
  console.log(`  restored        : ${restored}`)
  console.log(`  already in R2   : ${skipped}`)
  console.log(`  no source found : ${noSource}`)
  console.log(`  failed          : ${failures.length}`)

  if (failures.length > 0) {
    console.log('\nfailures:')
    for (const f of failures.slice(0, 20)) console.log(`  ${f.file}: ${f.error}`)
    if (failures.length > 20) console.log(`  …and ${failures.length - 20} more`)
    console.log('\nRe-run to retry only what is still missing.')
    process.exitCode = 1
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
