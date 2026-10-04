import 'dotenv/config'
import { getPayload } from 'payload'
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import config from '../../src/payload.config'
import { SITE_IMAGE_PREFIX } from '../../src/lib/site-image'

/**
 * Post-migration housekeeping for the R2 media store.
 *
 *   pnpm media:cleanup             report only — the default, writes nothing
 *   pnpm media:cleanup --strays    delete R2 objects no media row points at
 *   pnpm media:cleanup --orphans   delete media rows nothing in the CMS points at
 *
 * Two separate messes, deliberately two separate flags:
 *
 *   · Strays. The first recovery run fetched Shopify masters instead of the
 *     webp transform the importers use, so those files landed under the wrong
 *     extension and at the wrong dimensions. Re-running fixed the rows and
 *     wrote new keys; the superseded ones are still sitting in the bucket.
 *
 *   · Orphans. Media rows left behind when the previous catalogue was emptied.
 *     Their files were only ever in the suspended Blob store, so they cannot be
 *     restored and every one shows as a broken thumbnail in the admin.
 *
 * Both sets are recomputed from the database on every run and never read from a
 * saved list — collections get added while work is in flight, and a stale list
 * would eventually delete something live. A row is "referenced" only when a
 * populated upload object is found at depth 2, so a number that merely happens
 * to equal a media id cannot make one look used.
 */

const DELETE_STRAYS = process.argv.includes('--strays')
const DELETE_ORPHANS = process.argv.includes('--orphans')
const REPORT_ONLY = !DELETE_STRAYS && !DELETE_ORPHANS

/** DeleteObjects takes at most 1000 keys per call. */
const DELETE_BATCH = 1000

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

async function listBucket(): Promise<Map<string, number>> {
  const objects = new Map<string, number>()
  let token: string | undefined
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token, MaxKeys: 1000 }),
    )
    for (const o of res.Contents ?? []) objects.set(o.Key!, o.Size ?? 0)
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)
  return objects
}

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function main() {
  const payload = await getPayload({ config: await config })
  const cfg = await config

  const mediaRes = await payload.find({
    collection: 'media',
    limit: 5000,
    depth: 0,
    select: { filename: true, sizes: true },
  })
  const mediaDocs = mediaRes.docs as unknown as Array<{
    id: number
    filename?: string | null
    sizes?: Record<string, { filename?: string | null }>
  }>

  // ── Which R2 keys does the database still expect? ────────────────────────
  const expected = new Set<string>()
  for (const doc of mediaDocs) {
    if (doc.filename) expected.add(doc.filename)
    for (const size of Object.values(doc.sizes ?? {})) {
      if (size?.filename) expected.add(size.filename)
    }
  }

  const bucketObjects = await listBucket()
  // `site/` holds the static page art (src/lib/site-image.ts). No media row
  // will ever name those keys, so without this every one of them would be
  // reported, and with --strays deleted, as a stray.
  const strays = [...bucketObjects.keys()].filter(
    (key) => !expected.has(key) && !key.startsWith(`${SITE_IMAGE_PREFIX}/`),
  )
  const strayBytes = strays.reduce((sum, k) => sum + (bucketObjects.get(k) ?? 0), 0)

  // ── Which media rows does anything actually point at? ────────────────────
  const mediaIds = new Set(mediaDocs.map((d) => d.id))
  const referenced = new Set<number>()
  const collect = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(collect)
    if (!value || typeof value !== 'object') return
    const obj = value as Record<string, unknown>
    // A populated upload, not a bare number that happens to match an id.
    if (
      typeof obj.id === 'number' &&
      typeof obj.filename === 'string' &&
      typeof obj.mimeType === 'string'
    ) {
      if (mediaIds.has(obj.id)) referenced.add(obj.id)
      return
    }
    Object.values(obj).forEach(collect)
  }

  for (const collection of cfg.collections) {
    if (collection.slug === 'media') continue
    try {
      const res = await payload.find({
        collection: collection.slug as 'products',
        limit: 5000,
        depth: 2,
      })
      collect(res.docs)
    } catch {
      // Payload's internal tables reject find(); nothing references media there.
    }
  }
  for (const global of cfg.globals) {
    try {
      collect(await payload.findGlobal({ slug: global.slug as 'site-settings', depth: 2 }))
    } catch {
      /* same */
    }
  }

  const orphans = mediaDocs.filter((d) => !referenced.has(d.id))

  console.log('R2 bucket        :', bucketObjects.size, 'objects,', mb(
    [...bucketObjects.values()].reduce((a, b) => a + b, 0),
  ))
  console.log('media rows       :', mediaDocs.length)
  console.log('  referenced     :', referenced.size)
  console.log('  orphaned       :', orphans.length)
  console.log('stray R2 objects :', strays.length, `(${mb(strayBytes)})`)

  if (REPORT_ONLY) {
    console.log('\nReport only. Pass --strays and/or --orphans to delete.')
    return
  }

  if (DELETE_STRAYS && strays.length > 0) {
    console.log(`\nDeleting ${strays.length} stray objects…`)
    for (let i = 0; i < strays.length; i += DELETE_BATCH) {
      const batch = strays.slice(i, i + DELETE_BATCH)
      const res = await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      )
      for (const err of res.Errors ?? []) console.error(`  ! ${err.Key}: ${err.Message}`)
    }
    console.log(`  freed ${mb(strayBytes)}`)
  }

  if (DELETE_ORPHANS && orphans.length > 0) {
    console.log(`\nDeleting ${orphans.length} orphaned media rows…`)
    let removed = 0
    const failed: string[] = []
    for (const doc of orphans) {
      try {
        // Payload asks the storage adapter to remove the files too. Those keys
        // are already gone, and S3 deletes are idempotent, so this is a no-op
        // for them rather than an error.
        await payload.delete({ collection: 'media', id: doc.id })
        removed++
      } catch (err) {
        failed.push(`${doc.filename ?? doc.id}: ${(err as Error).message}`)
      }
    }
    console.log(`  removed ${removed} rows`)
    if (failed.length) {
      console.log(`  ${failed.length} failed:`)
      for (const f of failed.slice(0, 10)) console.log(`    ${f}`)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
