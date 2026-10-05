/**
 * Import the Fennec Trading catalogue into products and media.
 *
 *   pnpm import:fennec --dry-run           preview, touch nothing
 *   pnpm import:fennec                     the real run
 *   pnpm import:fennec --only=28,131       just these Fennec product ids
 *   pnpm import:fennec --skip-images       re-run copy and pricing only
 *
 * Reads md/seed/data/fennec.json, written by `pnpm scrape:fennec`. Prices come
 * from that feed (AED at source, a Dubai-area seller, so nothing is converted).
 * Everything else a customer reads (title, photos, description, ingredients,
 * nutrition) comes from fennec-catalogue.ts: Fennec's own listings are a line
 * of copy and a phone photo, so each product was researched against the
 * maker's site, Open Food Facts and retailer listings, and the sources are
 * recorded there.
 *
 * Same contract as the other importers: upsert on `source.externalId`, media
 * de-duplicated on `sourceUrl`, `isFeatured` and `publishedAt` never
 * overwritten on a re-run.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import type { Payload, RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  CATALOGUE,
  DEPARTMENT,
  EXISTING_CATEGORIES,
  LEAVES,
  NOT_IMPORTED,
  type FennecEntry,
} from './fennec-catalogue'
import type { FennecProduct } from './scrape-fennec'
import { assignSku } from './lib/sku'
import { createMediaResolver, type FetchedImage } from './lib/shopify-source'

const PROVIDER = 'fennec'

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_IMAGES = argv.includes('--skip-images')
const ONLY = argv
  .find((a) => a.startsWith('--only='))
  ?.slice('--only='.length)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))
const FEED = path.join(__dirname_, 'data', 'fennec.json')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/**
 * Images come from a dozen unrelated hosts: makers' sites, Open Food Facts,
 * retailers. Several of them refuse Node's fetch on its TLS fingerprint while
 * serving curl, the same way Casinetto does (see fetchTextViaCurl), so every
 * image goes through curl. The type is read from the bytes, not the URL: half
 * these URLs carry no extension and some lie about the one they have.
 */
async function curlImageFetcher(src: string): Promise<FetchedImage> {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const run = promisify(execFile)
  const { stdout } = await run(
    'curl',
    ['-sSLf', '--compressed', '--max-time', '60', '-A', UA, '-H', 'Accept: image/*', src],
    { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 },
  )
  const data = stdout as Buffer
  const sniff: Array<[string, string, (b: Buffer) => boolean]> = [
    ['image/jpeg', 'jpg', (b) => b[0] === 0xff && b[1] === 0xd8],
    ['image/png', 'png', (b) => b.subarray(0, 4).toString('hex') === '89504e47'],
    ['image/webp', 'webp', (b) => b.subarray(8, 12).toString('ascii') === 'WEBP'],
    ['image/avif', 'avif', (b) => b.subarray(4, 12).toString('ascii').startsWith('ftypavi')],
  ]
  const hit = sniff.find(([, , test]) => test(data))
  if (!hit) throw new Error(`GET image ${src}: not a JPEG/PNG/WebP/AVIF (${data.length} bytes)`)
  if (data.length < 10_000) throw new Error(`GET image ${src}: only ${data.length} bytes`)
  return { data, mimetype: hit[0], ext: hit[1] }
}

// ─── Report ──────────────────────────────────────────────────────────────────

interface Row {
  externalId: string
  title: string
  action: string
  category: string
  brand: string | null
  variants: Array<{ sku: string; size: string; aed: number }>
  images: number
  flags: string[]
}

const report: Row[] = []
const problems: string[] = []

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(FEED)) {
    throw new Error(`no harvested feed at ${FEED} — run "pnpm scrape:fennec" first`)
  }
  const feed = JSON.parse(fs.readFileSync(FEED, 'utf8')) as {
    harvestedAt: string
    products: FennecProduct[]
  }
  const byId = new Map(feed.products.map((p) => [p.externalId, p]))

  // Every product in the feed must be either catalogued or deliberately left
  // out. A new Fennec listing fails loudly here instead of importing with no
  // photo or copy of its own.
  const unmapped = feed.products.filter(
    (p) => !CATALOGUE[p.externalId] && !NOT_IMPORTED[p.externalId],
  )
  for (const p of unmapped) {
    problems.push(`${p.externalId} ${p.title}: in the feed but not in fennec-catalogue.ts`)
  }
  for (const id of Object.keys(CATALOGUE)) {
    if (!byId.has(id)) problems.push(`${id}: catalogued but no longer in Fennec's store`)
  }

  let ids = Object.keys(CATALOGUE).filter((id) => byId.has(id))
  if (ONLY) {
    const unknown = ONLY.filter((id) => !CATALOGUE[id])
    if (unknown.length) throw new Error(`--only: not in the catalogue: ${unknown.join(', ')}`)
    ids = ids.filter((id) => ONLY.includes(id))
  }

  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log(`\nFennec import${DRY_RUN ? '  (dry run — nothing is written)' : ''}`)
  console.log(
    `feed: ${feed.products.length} product(s), harvested ${feed.harvestedAt} — ` +
      `${Object.keys(NOT_IMPORTED).length} left out, ${ids.length} to import`,
  )
  console.log('prices are AED at source — no conversion\n')

  // ── categories ──
  const categoryIds = new Map<string, number | string>()
  if (!DRY_RUN) {
    const departmentId = await ensureCategory(payload, DEPARTMENT)
    for (const leaf of LEAVES) {
      categoryIds.set(leaf.slug, await ensureCategory(payload, { ...leaf, parent: departmentId }))
    }
    for (const slug of EXISTING_CATEGORIES) {
      const found = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })
      if (!found.docs[0]) throw new Error(`category "${slug}" not found`)
      const children = await payload.count({
        collection: 'categories',
        where: { parent: { equals: found.docs[0].id } },
        overrideAccess: true,
      })
      if (children.totalDocs > 0) {
        throw new Error(`"${slug}" has sub-categories, so products cannot be filed directly under it`)
      }
      categoryIds.set(slug, found.docs[0].id)
      console.log(`  reusing category: ${found.docs[0].title} (id ${found.docs[0].id})`)
    }
    console.log('')
  }

  // ── brands ──
  const brandIds = new Map<string, number | string>()
  async function brandFor(slug: string, title: string, website?: string) {
    if (brandIds.has(slug)) return brandIds.get(slug)!
    const found = await payload.find({
      collection: 'brands',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const id = found.docs[0]
      ? found.docs[0].id
      : (
          await payload.create({
            collection: 'brands',
            data: { title, slug, ...(website ? { website } : {}) },
          })
        ).id
    if (!found.docs[0]) console.log(`   brand: created ${title} (id ${id})`)
    brandIds.set(slug, id)
    return id
  }

  const media = createMediaResolver(payload, {
    skipImages: SKIP_IMAGES,
    fetcher: curlImageFetcher,
  })

  for (const id of ids) {
    const entry = CATALOGUE[id]!
    try {
      await importProduct(byId.get(id)!, entry)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      problems.push(`${id} ${entry.title}: ${msg}`)
      console.log(`   FAIL   ${id} ${entry.title} — ${msg}`)
    }
  }

  async function importProduct(p: FennecProduct, e: FennecEntry) {
    const flags = [...(e.flags ?? [])]
    if (!e.brand) flags.push('no brand — the maker could not be confirmed')
    const known = [...LEAVES.map((l) => l.slug), ...EXISTING_CATEGORIES] as string[]
    if (!known.includes(e.category)) throw new Error(`unknown category "${e.category}"`)

    const brandId =
      e.brand && !DRY_RUN ? await brandFor(e.brand.slug, e.brand.title, e.brand.website) : undefined

    if (e.images.length === 0) throw new Error('no researched image — refusing an empty gallery')
    const imageIds: Array<number | string> = []
    if (!DRY_RUN) {
      for (const [i, img] of e.images.entries()) {
        const alt = i === 0 ? e.title : `${e.title}, view ${i + 1}`
        const mediaId = await media.resolve(img.url, alt, `fennec-${p.externalId}-${i + 1}`)
        if (mediaId !== undefined) imageIds.push(mediaId)
      }
      if (imageIds.length === 0) {
        throw new Error('no images resolved — refusing to save a product with an empty gallery')
      }
    }

    // Every Fennec listing is a single pack size. Fennec shows no stock level,
    // only an add-to-cart button, so everything it lists is taken as in stock.
    if (!(p.price > 0)) throw new Error(`no usable price (${p.price})`)
    const variants = [
      {
        sku: assignSku({
          prefix: 'FEN',
          handle: e.skuStem,
          index: 0,
          total: 1,
          variantId: p.externalId,
        }),
        size: e.size,
        price: p.price,
        ...(e.weightGrams ? { weightGrams: e.weightGrams } : {}),
        ...(e.barcode ? { barcode: e.barcode } : {}),
        inStock: true,
        isDefault: true,
      },
    ]

    const html = e.description.map((t) => `<p>${t}</p>`).join('\n')
    const specifications = [
      ...(e.brand ? [{ label: 'Brand', value: e.brand.title }] : []),
      ...(e.maker ? [{ label: 'Made by', value: e.maker }] : []),
      ...(e.specifications ?? []),
    ]

    const data = {
      title: e.title,
      sku: variants[0]!.sku,
      category: categoryIds.get(e.category),
      ...(brandId ? { brand: brandId } : {}),
      origin: { country: e.country },
      shortDescription: e.shortDescription,
      description: convertHTMLToLexical({ editorConfig, html, JSDOM }),
      images: imageIds.map((image) => ({ image })),
      variants,
      // Only what a source states. Halal is set where the pack or the maker
      // claims it, never inferred from the country.
      dietary: {
        isOrganic: false,
        isVegan: e.dietary?.isVegan ?? false,
        isVegetarian: e.dietary?.isVegetarian ?? false,
        isHalal: e.dietary?.isHalal ?? false,
        isGlutenFree: e.dietary?.isGlutenFree ?? false,
        isLactoseFree: false,
      },
      ...(e.ingredients ? { ingredients: e.ingredients } : {}),
      ...(e.allergens ? { allergens: e.allergens } : {}),
      ...(e.nutrition ? { nutritionPer100g: e.nutrition } : {}),
      ...(e.storage ? { storageInstructions: e.storage } : {}),
      ...(e.packaging ? { packaging: e.packaging } : {}),
      ...(specifications.length ? { specifications } : {}),
      shipping: { shippingClass: e.shippingClass ?? 'standard' },
      meta: { title: e.title, description: e.shortDescription },
      source: {
        provider: PROVIDER,
        externalId: p.externalId,
        handle: p.handle,
        url: p.url,
        importedAt: new Date().toISOString(),
      },
      _status: 'published',
    } as RequiredDataFromCollectionSlug<'products'>

    const row: Row = {
      externalId: p.externalId,
      title: e.title,
      action: DRY_RUN ? 'preview' : 'created',
      category: e.category,
      brand: e.brand?.title ?? null,
      variants: variants.map((v) => ({ sku: v.sku, size: v.size, aed: v.price })),
      images: e.images.length,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
      const prices = variants.map((v) => `${v.size} ${v.price}`).join(', ')
      console.log(`   preview ${p.externalId.padStart(3)} ${e.title}  → ${e.category}  AED ${prices}`)
      return
    }

    const existing = await payload.find({
      collection: 'products',
      where: {
        and: [
          { 'source.provider': { equals: PROVIDER } },
          { 'source.externalId': { equals: p.externalId } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs[0]) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data })
      row.action = 'updated'
      console.log(`   update ${p.externalId.padStart(3)} ${e.title}  → id ${existing.docs[0].id}`)
    } else {
      const created = await payload.create({
        collection: 'products',
        data: { ...data, isFeatured: false },
      })
      console.log(`   create ${p.externalId.padStart(3)} ${e.title}  → id ${created.id}`)
    }
    report.push(row)
  }

  // ── report ──
  const reportPath = path.join(
    __dirname_,
    `fennec-import-report${ONLY ? '.only' : ''}${DRY_RUN ? '.dry-run' : ''}.json`,
  )
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      { ranAt: new Date().toISOString(), report, notImported: NOT_IMPORTED, problems },
      null,
      2,
    ),
  )

  console.log(`\n${DRY_RUN ? 'previewed' : 'imported'}: ${report.length}`)
  console.log(`left out on purpose: ${Object.keys(NOT_IMPORTED).length}`)
  for (const [id, why] of Object.entries(NOT_IMPORTED)) console.log(`  · ${id}: ${why}`)
  if (!DRY_RUN) {
    console.log(`images: ${media.resolvedCount} resolved, ${media.uploadCount} newly uploaded`)
  }
  console.log(`report: ${path.relative(process.cwd(), reportPath)}`)

  const flagged = report.filter((r) => r.flags.length)
  if (flagged.length) {
    console.log(`\nneeds a human look (${flagged.length}):`)
    for (const r of flagged) for (const f of r.flags) console.log(`  · ${r.externalId} ${r.title}: ${f}`)
  }
  if (problems.length) {
    console.log(`\nfailed (${problems.length}):`)
    for (const pr of problems) console.log(`  · ${pr}`)
    process.exit(1)
  }
}

async function ensureCategory(
  payload: Payload,
  spec: { title: string; slug: string; description: string; sortOrder: number; parent?: number | string },
): Promise<number | string> {
  const found = await payload.find({
    collection: 'categories',
    where: { slug: { equals: spec.slug } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) {
    console.log(`  category: reusing ${spec.title} (id ${found.docs[0].id})`)
    return found.docs[0].id
  }
  const created = await payload.create({
    collection: 'categories',
    data: spec as RequiredDataFromCollectionSlug<'categories'>,
  })
  console.log(`  category: created ${spec.title} (id ${created.id}, path ${created.path})`)
  return created.id
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nimport failed:', err)
    process.exit(1)
  })
