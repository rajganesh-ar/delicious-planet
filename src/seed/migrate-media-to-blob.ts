/**
 * Migrates all local media files to Vercel Blob.
 * Reads files from the local /media directory, re-uploads each one through
 * the Payload local API (which triggers the Vercel Blob storage adapter),
 * and updates the URLs in the database. Product references stay intact.
 *
 * Requirements: BLOB_READ_WRITE_TOKEN must be set in .env
 * Run with: pnpm tsx src/seed/migrate-media-to-blob.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEDIA_DIR = path.resolve(__dirname, '../../media')

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }
  return map[ext] ?? 'application/octet-stream'
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('ERROR: BLOB_READ_WRITE_TOKEN is not set in .env')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  const { docs: records, totalDocs } = await payload.find({
    collection: 'media',
    limit: 1000,
    depth: 0,
  })

  console.log(`Found ${totalDocs} media records\n`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const record of records) {
    const filename = record.filename
    if (!filename) {
      console.log(`[SKIP] Record ${record.id} has no filename`)
      skipped++
      continue
    }

    const filePath = path.join(MEDIA_DIR, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] File not found locally: ${filename}`)
      skipped++
      continue
    }

    try {
      const data = fs.readFileSync(filePath)
      const size = fs.statSync(filePath).size
      const mimetype = getMimeType(filename)

      await payload.update({
        collection: 'media',
        id: record.id,
        data: {},
        file: { data, name: filename, mimetype, size },
      })

      console.log(`[OK]   ${filename}`)
      success++
    } catch (err) {
      console.error(`[FAIL] ${filename}:`, err instanceof Error ? err.message : err)
      failed++
    }
  }

  console.log(`\nDone — ${success} migrated, ${skipped} skipped, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
