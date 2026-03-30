/**
 * Uploads remaining collection images via the Payload REST API.
 * Set credentials via env vars or edit the defaults below.
 * Run with: pnpm tsx src/seed/upload-collection-images.ts
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PUBLIC_DIR = path.resolve(__dirname, '../../public')

const BASE_URL = process.env.PAYLOAD_URL ?? 'http://localhost:3000'
const EMAIL = process.env.PAYLOAD_SEED_EMAIL ?? 'dev@payloadcms.com'
const PASSWORD = process.env.PAYLOAD_SEED_PASSWORD ?? 'test'

const REMAINING = [
  {
    slug: 'mediterranean-olive-reserve',
    imageFile: 'olives.avif',
    title: 'Mediterranean Olive Reserve',
  },
  { slug: 'single-origin-spices', imageFile: 'spices.avif', title: 'Single-Origin Spices' },
  {
    slug: 'signature-gourmet-spreads',
    imageFile: 'spreads.avif',
    title: 'Signature Gourmet Spreads',
  },
  { slug: 'fromagerie-selection', imageFile: 'Fromagerie.avif', title: 'Fromagerie Selection' },
  { slug: 'artisan-heritage-breads', imageFile: 'breads.avif', title: 'Artisan Heritage Breads' },
  { slug: 'specialty-coffee-reserve', imageFile: 'coffee.avif', title: 'Specialty Coffee Reserve' },
  { slug: 'botanical-seed-selection', imageFile: 'seeds.avif', title: 'Botanical Seed Selection' },
  { slug: 'curated-fine-beverages', imageFile: 'beverages.avif', title: 'Curated Fine Beverages' },
  {
    slug: 'bespoke-tableware-cutlery',
    imageFile: 'cutlery.avif',
    title: 'Bespoke Tableware & Cutlery',
  },
]

async function login(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { token: string }
  return json.token
}

async function uploadMedia(token: string, filePath: string, alt: string): Promise<number | null> {
  const filename = path.basename(filePath)
  const data = fs.readFileSync(filePath)

  const form = new FormData()
  form.append('_payload', JSON.stringify({ alt }))
  form.append('file', new Blob([data], { type: 'image/avif' }), filename)

  const res = await fetch(`${BASE_URL}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })

  if (!res.ok) {
    console.error(`  [error] upload ${filename}: ${res.status} ${await res.text()}`)
    return null
  }
  const json = (await res.json()) as { doc: { id: number } }
  console.log(`  [uploaded] media/${filename}`)
  return json.doc.id
}

async function getCollectionId(token: string, slug: string): Promise<number | null> {
  const res = await fetch(
    `${BASE_URL}/api/product-collections?where[slug][equals]=${slug}&limit=1`,
    {
      headers: { Authorization: `JWT ${token}` },
    },
  )
  if (!res.ok) return null
  const json = (await res.json()) as { docs: Array<{ id: number; image?: unknown }> }
  return json.docs[0]?.id ?? null
}

async function updateCollectionImage(token: string, id: number, imageId: number) {
  const res = await fetch(`${BASE_URL}/api/product-collections/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageId }),
  })
  if (!res.ok) console.error(`  [error] update collection ${id}: ${res.status}`)
  else console.log(`  [updated] collection id=${id}`)
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║  Uploading remaining collection images   ║')
  console.log('╚══════════════════════════════════════════╝\n')

  const token = await login()
  console.log('  [auth] logged in\n')

  for (const col of REMAINING) {
    const colId = await getCollectionId(token, col.slug)
    if (!colId) {
      console.log(`  [skip] ${col.slug} not found`)
      continue
    }

    const filePath = path.join(PUBLIC_DIR, 'images', 'collections', col.imageFile)
    const imageId = await uploadMedia(token, filePath, col.title)
    if (imageId) await updateCollectionImage(token, colId, imageId)
  }

  console.log('\n✅ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
