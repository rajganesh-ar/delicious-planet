/**
 * Import the García de la Cruz catalogue — olives, oils and vinegars — from the
 * supplier's Shopify storefront into products, media and brands.
 *
 *   pnpm import:gdlc --dry-run              write a JSON preview, touch nothing
 *   pnpm import:gdlc                        the real run
 *   pnpm import:gdlc --collection=oils      one collection
 *   pnpm import:gdlc --skip-images          re-run copy and pricing only
 *
 * Idempotent. Products are matched on `source.externalId` (the Shopify product
 * id) and images on `media.sourceUrl`, so a second run updates in place instead
 * of doubling the catalogue — which is the whole reason those two columns exist
 * (migration 20260901_200000_import_provenance).
 *
 * What it deliberately does NOT overwrite on a re-run:
 *   · isFeatured / featuredRank — merchandising decisions made here, not there
 *   · publishedAt               — stampPublishedAt keeps New Arrivals stable
 *
 * Prices are USD upstream and AED here. The dirham is pegged to the dollar at
 * 3.6725, so the conversion is exact arithmetic rather than a rate that goes
 * stale; see USD_TO_AED below before changing it.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  COLLECTION_TO_CATEGORY,
  DENSITY_G_PER_ML,
  PRODUCT_OVERRIDES,
  SKIP_HANDLES,
  type ProductOverride,
} from './gdlc-catalogue'
import {
  createMediaResolver,
  fetchBarcodes,
  fetchJson,
  plainText,
  shortDescription,
  strikeClaims,
  toAed,
  USD_TO_AED,
  type ShopifyProduct,
  type ShopifyVariant,
} from './lib/shopify-source'

// ─── Source ──────────────────────────────────────────────────────────────────

const STORE = 'https://garciadelacruzoliveoil.com'
const PROVIDER = 'garcia-de-la-cruz'

const BRAND = {
  title: 'García de la Cruz',
  slug: 'garcia-de-la-cruz',
  website: STORE,
  description:
    'Sixth-generation olive growers in Madridejos, Montes de Toledo, milling organic ' +
    'Cornicabra, Picual, Arbequina and Hojiblanca on the estate where they are grown.',
}

const ORIGIN_COUNTRY = 'ES'

// ─── CLI ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_IMAGES = argv.includes('--skip-images')
const ONLY_COLLECTION = argv.find((a) => a.startsWith('--collection='))?.split('=')[1]

const COLLECTIONS = Object.keys(COLLECTION_TO_CATEGORY).filter(
  (c) => !ONLY_COLLECTION || c === ONLY_COLLECTION,
)

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))

// ─── Copy parsing (supplier-specific) ─────────────────────────────────────

/**
 * Their copy ends with a "✅ Certifications:" or "✅ Product Details:" run of
 * bullet-separated claims. That list is exactly what the PDP specifications
 * table wants, so it is lifted rather than retyped.
 */
function certifications(html: string): string[] {
  const text = plainText(html)
  const m = text.match(/(?:Certifications?|Product Details)\s*:\s*(.+?)(?:Free [Ss]hipping|$)/)
  if (!m) return []
  return m[1]
    .split('•')
    .map((s) => s.trim().replace(/[.,]$/, ''))
    .filter((s) => s.length > 1 && s.length < 80)
}

// ─── Value derivation ────────────────────────────────────────────────────────

/**
 * Net content, derived from the pack size.
 *
 * Shopify's `grams` is a shipping weight and is wrong for this purpose — both
 * the 250 mL and 500 mL Early Harvest are listed at 1134 g, and several products
 * carry 0. The PDP shows this number to a customer as a product spec, so a
 * shipping weight would read as a lie about the bottle. Volume × density is the
 * physical net weight and is right by construction.
 */
function netWeightGrams(size: string, isVinegar: boolean): number | undefined {
  const grams = size.match(/^([\d.]+)\s*g$/i)
  if (grams) return Math.round(parseFloat(grams[1]!))

  const volume = size.match(/^([\d.]+)\s*(ml|l)$/i)
  if (!volume) return undefined // "Spray", and anything else without a stated size
  const ml = parseFloat(volume[1]!) * (volume[2]!.toLowerCase() === 'l' ? 1000 : 1)
  return Math.round(ml * (isVinegar ? DENSITY_G_PER_ML.vinegar : DENSITY_G_PER_ML.oil))
}

/**
 * Shopify calls a single-variant product's only option "Default Title", which is
 * not a size, and `size` is required. Multi-size products carry a real option1.
 */
function variantSize(variant: ShopifyVariant, override: ProductOverride | undefined): string {
  const opt = variant.option1?.trim()
  if (opt && opt.toLowerCase() !== 'default title') return opt
  if (override?.size) return override.size
  throw new Error(`no size for variant ${variant.id} (option1=${JSON.stringify(opt)})`)
}

// ─── Report ──────────────────────────────────────────────────────────────────

interface Row {
  handle: string
  title: string
  action: string
  category: string
  sku: string
  variants: Array<{ sku: string; size: string; aed: number; inStock: boolean }>
  images: number
  flags: string[]
}

const report: Row[] = []
const problems: string[] = []

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log(`\nGarcía de la Cruz import${DRY_RUN ? '  (dry run — nothing is written)' : ''}`)
  console.log(`collections: ${COLLECTIONS.join(', ')}`)
  console.log(`rate: 1 USD = ${USD_TO_AED} AED (peg)\n`)

  // ── brand ──
  let brandId: number | string | undefined
  if (!DRY_RUN) {
    const existing = await payload.find({
      collection: 'brands',
      where: { slug: { equals: BRAND.slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      brandId = existing.docs[0].id
      console.log(`brand: reusing ${BRAND.title} (id ${brandId})`)
    } else {
      const created = await payload.create({ collection: 'brands', data: BRAND })
      brandId = created.id
      console.log(`brand: created ${BRAND.title} (id ${brandId})`)
    }
  }

  // ── categories ──
  const categoryIds = new Map<string, number | string>()
  if (!DRY_RUN) {
    for (const [, slug] of Object.entries(COLLECTION_TO_CATEGORY)) {
      const found = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })
      if (!found.docs[0]) throw new Error(`category "${slug}" not found — import cannot continue`)
      categoryIds.set(slug, found.docs[0].id)
    }
    console.log(`categories: resolved ${categoryIds.size}\n`)
  }

  const media = createMediaResolver(payload, { skipImages: SKIP_IMAGES })

  // ── products ──
  for (const collection of COLLECTIONS) {
    const categorySlug = COLLECTION_TO_CATEGORY[collection]!
    const { products } = await fetchJson<{ products: ShopifyProduct[] }>(
      `${STORE}/collections/${collection}/products.json?limit=250`,
    )
    console.log(`── ${collection} → ${categorySlug}  (${products.length} products)`)

    for (const p of products) {
      if (SKIP_HANDLES.has(p.handle)) {
        console.log(`   skip   ${p.handle} — excluded by SKIP_HANDLES`)
        report.push({
          handle: p.handle,
          title: p.title,
          action: 'skipped',
          category: categorySlug,
          sku: '',
          variants: [],
          images: 0,
          flags: ['duplicate of a Master Miller variant (SKU A04518)'],
        })
        continue
      }

      try {
        await importProduct(p, collection, categorySlug)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        problems.push(`${p.handle}: ${msg}`)
        console.log(`   FAIL   ${p.handle} — ${msg}`)
      }
    }
    console.log('')
  }

  async function importProduct(p: ShopifyProduct, collection: string, categorySlug: string) {
    const override = PRODUCT_OVERRIDES[p.handle]
    const isVinegar = collection === 'vinegars'
    const flags: string[] = []
    if (!override) flags.push('no override row — sizes and dietary flags are unverified')
    if (override?.assumedSize) flags.push(`size ${override.size} inferred from shipping weight`)
    if (override?.note) flags.push(override.note)

    const barcodes = await fetchBarcodes(STORE, p.handle)

    // ── images ──
    const ordered = [...p.images].sort((a, b) => a.position - b.position)
    const imageIdBySrc = new Map<string, number | string>()
    if (!DRY_RUN) {
      for (const [i, img] of ordered.entries()) {
        const alt = i === 0 ? p.title : `${p.title}, view ${i + 1}`
        const id = await media.resolve(img.src, alt, `${p.handle}-${i + 1}`)
        if (id !== undefined) imageIdBySrc.set(img.src, id)
      }
      if (imageIdBySrc.size === 0) {
        throw new Error('no images resolved — refusing to save a product with an empty gallery')
      }
    }

    // ── variants ──
    const variants = p.variants.map((v, i) => {
      const size = variantSize(v, override)
      const sku = v.sku?.trim() || override?.sku
      if (!sku) throw new Error(`variant ${v.id} has no SKU and no override`)
      const compareAt = v.compare_at_price ? toAed(v.compare_at_price) : undefined
      const variantImage = v.featured_image?.src
        ? imageIdBySrc.get(v.featured_image.src)
        : undefined

      return {
        sku,
        size,
        price: toAed(v.price),
        ...(compareAt ? { compareAt } : {}),
        ...(barcodes.get(v.id) ? { barcode: barcodes.get(v.id)! } : {}),
        ...(netWeightGrams(size, isVinegar) !== undefined
          ? { weightGrams: netWeightGrams(size, isVinegar) }
          : {}),
        inStock: v.available,
        isDefault: i === 0,
        ...(variantImage ? { image: variantImage } : {}),
      }
    })

    const body = strikeClaims(p.body_html, override?.contradictedClaims)
    const certs = certifications(body)
    const blurb = shortDescription(body)

    // Cast rather than annotate: the object is assembled with conditional
    // spreads for the fields the feed may not carry, which TypeScript cannot
    // narrow back to the collection's required-field shape on its own.
    const data = {
      title: p.title,
      sku: variants[0]!.sku,
      category: categoryIds.get(categorySlug),
      brand: brandId,
      origin: {
        country: ORIGIN_COUNTRY,
        ...(override?.producerRegion ? { producerRegion: override.producerRegion } : {}),
        ...(override?.appellation ? { appellation: override.appellation } : {}),
      },
      shortDescription: blurb,
      description: convertHTMLToLexical({ editorConfig, html: body, JSDOM }),
      images: ordered
        .filter((img) => imageIdBySrc.has(img.src))
        .map((img) => ({ image: imageIdBySrc.get(img.src) })),
      variants,
      dietary: {
        isHalal: false,
        isLactoseFree: false,
        isOrganic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        ...(override?.dietary ?? {}),
      },
      ...(override?.packaging ? { packaging: override.packaging } : {}),
      ...(certs.length ? { specifications: [{ label: 'Certifications', value: certs.join(' · ') }] } : {}),
      shipping: { shippingClass: 'standard' },
      meta: { title: p.title, description: blurb },
      source: {
        provider: PROVIDER,
        externalId: String(p.id),
        handle: p.handle,
        url: `${STORE}/products/${p.handle}`,
        importedAt: new Date().toISOString(),
      },
      _status: 'published',
    } as RequiredDataFromCollectionSlug<'products'>

    const row: Row = {
      handle: p.handle,
      title: p.title,
      action: DRY_RUN ? 'preview' : 'created',
      category: categorySlug,
      sku: variants[0]!.sku,
      variants: variants.map((v) => ({
        sku: v.sku,
        size: v.size,
        aed: v.price,
        inStock: v.inStock,
      })),
      images: ordered.length,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
      console.log(
        `   preview ${p.handle}  ${variants.length} variant(s), ${ordered.length} image(s)`,
      )
      return
    }

    const existing = await payload.find({
      collection: 'products',
      where: {
        and: [
          { 'source.provider': { equals: PROVIDER } },
          { 'source.externalId': { equals: String(p.id) } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs[0]) {
      // isFeatured/featuredRank stay as merchandised here; the feed has no say.
      await payload.update({ collection: 'products', id: existing.docs[0].id, data })
      row.action = 'updated'
      console.log(`   update ${p.handle}  → id ${existing.docs[0].id}`)
    } else {
      const created = await payload.create({
        collection: 'products',
        data: { ...data, isFeatured: false },
      })
      console.log(`   create ${p.handle}  → id ${created.id}`)
    }
    report.push(row)
  }

  // ── report ──
  const reportPath = path.join(__dirname_, `gdlc-import-report${DRY_RUN ? '.dry-run' : ''}.json`)
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ ranAt: new Date().toISOString(), rate: USD_TO_AED, report, problems }, null, 2),
  )

  const imported = report.filter((r) => r.action === 'created' || r.action === 'updated').length
  console.log(`${DRY_RUN ? 'previewed' : 'imported'}: ${DRY_RUN ? report.length : imported}`)
  console.log(`images: ${media.resolvedCount} resolved, ${media.uploadCount} newly uploaded`)
  console.log(`report: ${path.relative(process.cwd(), reportPath)}`)

  const flagged = report.filter((r) => r.flags.length)
  if (flagged.length) {
    console.log(`\nneeds a human look (${flagged.length}):`)
    for (const r of flagged) for (const f of r.flags) console.log(`  · ${r.handle}: ${f}`)
  }
  if (problems.length) {
    console.log(`\nfailed (${problems.length}):`)
    for (const pr of problems) console.log(`  · ${pr}`)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nimport failed:', err)
    process.exit(1)
  })
