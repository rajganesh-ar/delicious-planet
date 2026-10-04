/**
 * Import the harvested Admiral Caviar catalogue into products and media.
 *
 *   pnpm import:admiral --dry-run       preview, touch nothing
 *   pnpm import:admiral                 the real run
 *   pnpm import:admiral --skip-images   re-run copy and pricing only
 *
 * Reads md/seed/data/admiral-caviar.json, written by `pnpm scrape:admiral`.
 * That file is the feed: this half never touches the network except to fetch
 * images, so copy and pricing can be re-mapped without re-running the browser.
 *
 * Same contract as the other importers — upsert on `source.externalId`, media
 * de-duplicated on `sourceUrl`, `isFeatured` and `publishedAt` never
 * overwritten on a re-run.
 *
 * Prices are already AED at source (a Dubai storefront), so unlike the other
 * two suppliers nothing is converted. See `compareAtFor` for the one place
 * where a supplier-published number is deliberately dropped.
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
  BREADCRUMB_TO_CATEGORY,
  DEFAULT_CATEGORY,
  NOT_CARRIED_BREADCRUMBS,
  ORIGIN_BY_HANDLE,
  ORIGIN_FALLBACK,
  SPEC_LABELS,
} from './admiral-catalogue'
import { createMediaResolver, plainImageFetcher } from './lib/shopify-source'

const PROVIDER = 'admiral-caviar'

const BRAND = {
  title: 'Admiral Caviar',
  slug: 'admiral-caviar',
  website: 'https://www.admiralcaviar.com',
}

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_IMAGES = argv.includes('--skip-images')

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))
const FEED = path.join(__dirname_, 'data', 'admiral-caviar.json')

interface HarvestedSize {
  size: string
  price: number
  compareAt?: number
  inStock: boolean
}

interface HarvestedProduct {
  url: string
  handle: string
  externalId: string
  title: string
  seoTitle?: string
  metaDescription?: string
  sku?: string
  gtin?: string
  breadcrumb: string[]
  detailsText: string
  images: string[]
  sizes: HarvestedSize[]
  singlePrice?: number
  singleCompareAt?: number
  inStock: boolean
  priceWarning?: string
}

// ─── Detail-text parsing ─────────────────────────────────────────────────────

/**
 * The harvested `detailsText` is the whole product tile as rendered: breadcrumb
 * and price at the top, share buttons in the middle, a "You May Also Like"
 * strip of other products at the bottom. Only the slice between the "Product
 * Details" heading and the store-wide boilerplate is this product's own copy —
 * without the lower bound the description would end up quoting the prices of
 * five unrelated products.
 */
const BODY_END = ['Save this product for later', 'Have questions?', 'You May Also Like']

/**
 * Store-wide boilerplate that appears mid-body. It is dropped line by line
 * rather than used as a cut-off, because "Packaging: Stainless Cylinder Can"
 * is printed *after* the VAT notice — truncating there lost the packaging on
 * every caviar in the range.
 */
const BOILERPLATE = [/^All products are subject to a \d+% VAT/i, /^\*?Orders outside UAE/i]

function detailLines(detailsText: string): string[] {
  const start = detailsText.indexOf('Product Details')
  const from = start >= 0 ? start + 'Product Details'.length : 0
  let to = detailsText.length
  for (const marker of BODY_END) {
    const i = detailsText.indexOf(marker, from)
    if (i >= 0 && i < to) to = i
  }
  return detailsText
    .slice(from, to)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !BOILERPLATE.some((re) => re.test(l)))
}

interface ParsedDetail {
  paragraphs: string[]
  specifications: Array<{ label: string; value: string }>
  packaging?: string
}

/**
 * Splits the body into prose and the labelled facts a caviar buyer reads first
 * — species, maturity, roe size, flavour. Those are `Label: value` lines, and
 * they belong in the specifications table rather than buried in a paragraph.
 */
function parseDetail(product: HarvestedProduct): ParsedDetail {
  const out: ParsedDetail = { paragraphs: [], specifications: [] }

  for (const line of detailLines(product.detailsText)) {
    // "Brand: Admiral Caviar" is already the brand relationship, and the UPC is
    // carried on the variant as a barcode.
    if (/^Brand:/i.test(line)) continue
    if (/^UPC:/i.test(line)) continue

    const m = line.match(/^([A-Za-z][A-Za-z ]{2,20}):\s*(.+)$/)
    if (m && SPEC_LABELS.has(m[1]!.trim().toLowerCase())) {
      const label = m[1]!.trim()
      const value = m[2]!.trim()
      if (/^packaging$/i.test(label)) out.packaging = value
      else out.specifications.push({ label, value })
      continue
    }
    out.paragraphs.push(line)
  }

  // A bare Latin binomial on its own line is the species. It reads as a stray
  // fragment in prose and as a fact in the spec table, so it is moved.
  //
  // Two shapes, matched narrowly on purpose: "Acipenser baerii" (genus then
  // lowercase species) and "Beluga Huso huso" (a common name before the
  // binomial). Anything looser also catches title lines like "Sterlet Caviar",
  // which is a heading, not a species.
  const isBinomial = (l: string) =>
    /^[A-Z][a-z]+ [a-z]+$/.test(l) || /^[A-Z][a-z]+ [A-Z][a-z]+ [a-z]+$/.test(l)
  const species = out.paragraphs.filter((l) => isBinomial(l) && l.length < 40)
  if (species.length) {
    out.specifications.unshift({ label: 'Species', value: species.join(', ') })
    out.paragraphs = out.paragraphs.filter((l) => !species.includes(l))
  }

  if (product.gtin) out.specifications.push({ label: 'UPC', value: product.gtin })
  return out
}

/** Grams from a size label: "125g" → 125, "One size" → undefined. */
function gramsOf(size: string): number | undefined {
  const m = size.match(/^([\d.]+)\s*g$/i)
  return m ? Math.round(parseFloat(m[1]!)) : undefined
}

/**
 * The supplier's compare-at is only trustworthy where it is internally
 * consistent.
 *
 * Royal Beluga advertises "was 1500" against every size, so its 30 g tin shows
 * a 70% saving and its 50 g a 50% while the rest of the range is a flat 20% —
 * their storefront applies the size modifier to the price but not to the
 * compare-at. Republishing those would put an RRP on our own product page that
 * the tin never sold at. Any size whose implied discount differs from the
 * product's most common one therefore ships with no compare-at at all rather
 * than a fabricated one.
 */
function compareAtFor(sizes: HarvestedSize[]): Map<string, number | undefined> {
  const pct = (s: HarvestedSize) =>
    s.compareAt && s.compareAt > s.price ? Math.round((1 - s.price / s.compareAt) * 100) : null

  const counts = new Map<number, number>()
  for (const s of sizes) {
    const p = pct(s)
    if (p !== null) counts.set(p, (counts.get(p) ?? 0) + 1)
  }
  let modal: number | null = null
  let best = 0
  for (const [p, n] of counts) {
    if (n > best) {
      best = n
      modal = p
    }
  }

  const out = new Map<string, number | undefined>()
  for (const s of sizes) out.set(s.size, pct(s) === modal ? s.compareAt : undefined)
  return out
}

// ─── Report ──────────────────────────────────────────────────────────────────

interface Row {
  handle: string
  title: string
  action: string
  category: string
  sku: string
  variants: Array<{ sku: string; size: string; aed: number; compareAt?: number; inStock: boolean }>
  images: number
  specs: number
  flags: string[]
}

const report: Row[] = []
const problems: string[] = []

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(FEED)) {
    throw new Error(`no harvested feed at ${FEED} — run "pnpm scrape:admiral" first`)
  }
  const feed = JSON.parse(fs.readFileSync(FEED, 'utf8')) as {
    harvestedAt: string
    products: HarvestedProduct[]
  }

  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log(`\nAdmiral Caviar import${DRY_RUN ? '  (dry run — nothing is written)' : ''}`)
  const products = feed.products.filter(
    (p) => !NOT_CARRIED_BREADCRUMBS.has(p.breadcrumb[p.breadcrumb.length - 1] ?? ''),
  )
  console.log(
    `feed: ${feed.products.length} product(s), harvested ${feed.harvestedAt} — ` +
      `${feed.products.length - products.length} not food, skipped`,
  )
  console.log('prices are AED at source — no conversion\n')

  let brandId: number | string | undefined
  const categoryIds = new Map<string, number | string>()

  if (!DRY_RUN) {
    const existing = await payload.find({
      collection: 'brands',
      where: { slug: { equals: BRAND.slug } },
      limit: 1,
      depth: 0,
    })
    brandId = existing.docs[0]
      ? existing.docs[0].id
      : (await payload.create({ collection: 'brands', data: BRAND })).id
    console.log(`brand: ${existing.docs[0] ? 'reusing' : 'created'} ${BRAND.title} (id ${brandId})`)

    for (const slug of new Set([...Object.values(BREADCRUMB_TO_CATEGORY), DEFAULT_CATEGORY])) {
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

  const media = createMediaResolver(payload, {
    skipImages: SKIP_IMAGES,
    // Not a Shopify CDN, so no webp transform is available — the JPEGs are
    // taken as served.
    fetcher: plainImageFetcher,
  })

  for (const p of products) {
    try {
      await importProduct(p)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      problems.push(`${p.handle}: ${msg}`)
      console.log(`   FAIL   ${p.handle} — ${msg}`)
    }
  }

  async function importProduct(p: HarvestedProduct) {
    const flags: string[] = []
    if (p.priceWarning) flags.push(p.priceWarning)

    const sku = p.sku?.trim()
    if (!sku) throw new Error('no SKU in the harvested feed')

    const leaf = p.breadcrumb[p.breadcrumb.length - 1] ?? ''
    const categorySlug = BREADCRUMB_TO_CATEGORY[leaf] ?? DEFAULT_CATEGORY

    const origin = ORIGIN_BY_HANDLE[p.handle]
    const originCountry = origin?.country ?? ORIGIN_FALLBACK.country
    if (!origin) flags.push(ORIGIN_FALLBACK.note)

    const detail = parseDetail(p)

    const ordered = p.images
    const imageIdBySrc = new Map<string, number | string>()
    if (!DRY_RUN) {
      for (const [i, src] of ordered.entries()) {
        const alt = i === 0 ? p.title : `${p.title}, view ${i + 1}`
        const id = await media.resolve(src, alt, `${p.handle}-${i + 1}`)
        if (id !== undefined) imageIdBySrc.set(src, id)
      }
      if (imageIdBySrc.size === 0) {
        throw new Error('no images resolved — refusing to save a product with an empty gallery')
      }
    }

    // Single-price products (the gift sets) carry their weight in the title —
    // "Osetra Trio – 90g".
    const compareAt = compareAtFor(p.sizes)
    const rawVariants = p.sizes.length
      ? p.sizes.map((s) => ({
          size: s.size,
          price: s.price,
          compareAt: compareAt.get(s.size),
          inStock: s.inStock,
        }))
      : [
          {
            size: p.title.match(/(\d+\s*g)\s*$/i)?.[1]?.replace(/\s+/g, '') ?? 'One size',
            price: p.singlePrice ?? 0,
            compareAt: p.singleCompareAt,
            inStock: p.inStock,
          },
        ]

    if (rawVariants.some((v) => !v.price)) throw new Error('a variant has no price')

    const dropped = p.sizes.filter((s) => s.compareAt && compareAt.get(s.size) === undefined)
    if (dropped.length) {
      flags.push(
        `compare-at dropped on ${dropped.map((d) => d.size).join(', ')} — the supplier's ` +
          '"was" price there implies a different discount from the rest of the range',
      )
    }

    const variants = rawVariants
      .slice()
      .sort((a, b) => (gramsOf(a.size) ?? 0) - (gramsOf(b.size) ?? 0))
      .map((v, i) => ({
        // Sizes share one supplier SKU, so each gets a suffix — a variant SKU is
        // what an order line records and must identify exactly one tin.
        sku: p.sizes.length ? `${sku}-${v.size.toUpperCase()}` : sku,
        size: v.size,
        price: v.price,
        ...(v.compareAt && v.compareAt > v.price ? { compareAt: v.compareAt } : {}),
        ...(gramsOf(v.size) !== undefined ? { weightGrams: gramsOf(v.size) } : {}),
        // The UPC identifies the product, not a tin size, so it rides on the
        // default variant only rather than being repeated across every size.
        ...(i === 0 && p.gtin ? { barcode: p.gtin } : {}),
        inStock: v.inStock,
        isDefault: i === 0,
      }))

    const blurb =
      p.metaDescription?.trim() ||
      detail.paragraphs[0]?.slice(0, 200) ||
      `${p.title} from Admiral Caviar.`

    const html = detail.paragraphs.map((t) => `<p>${t}</p>`).join('\n') || `<p>${blurb}</p>`

    const data = {
      title: p.title,
      sku,
      category: categoryIds.get(categorySlug),
      brand: brandId,
      origin: {
        country: originCountry,
        ...(origin?.producerRegion ? { producerRegion: origin.producerRegion } : {}),
      },
      shortDescription: blurb.slice(0, 300),
      description: convertHTMLToLexical({ editorConfig, html, JSDOM }),
      images: ordered
        .filter((src) => imageIdBySrc.has(src))
        .map((src) => ({ image: imageIdBySrc.get(src) })),
      variants,
      // Nothing on this storefront makes a dietary or halal claim, and sturgeon
      // roe is not a claim to invent on a supplier's behalf.
      dietary: {
        isOrganic: false,
        isVegan: false,
        isVegetarian: false,
        isHalal: false,
        isGlutenFree: false,
        isLactoseFree: false,
      },
      ...(detail.packaging ? { packaging: detail.packaging } : {}),
      ...(detail.specifications.length ? { specifications: detail.specifications } : {}),
      // Caviar ships chilled; the store's own copy sells it as a fresh product.
      shipping: { shippingClass: 'frozen' },
      meta: { title: p.seoTitle ?? p.title, description: blurb.slice(0, 300) },
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
      handle: p.handle,
      title: p.title,
      action: DRY_RUN ? 'preview' : 'created',
      category: categorySlug,
      sku,
      variants: variants.map((v) => ({
        sku: v.sku,
        size: v.size,
        aed: v.price,
        compareAt: v.compareAt,
        inStock: v.inStock,
      })),
      images: ordered.length,
      specs: detail.specifications.length,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
      const range = variants.length > 1 ? `${variants[0]!.price}–${variants.at(-1)!.price}` : `${variants[0]!.price}`
      console.log(
        `   preview ${p.handle}  → ${categorySlug}  AED ${range}  ` +
          `${variants.length} variant(s), ${ordered.length} image(s), ${row.specs} spec(s)`,
      )
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

  const reportPath = path.join(__dirname_, `admiral-import-report${DRY_RUN ? '.dry-run' : ''}.json`)
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ ranAt: new Date().toISOString(), report, problems }, null, 2),
  )

  const imported = report.filter((r) => r.action === 'created' || r.action === 'updated').length
  console.log(`\n${DRY_RUN ? 'previewed' : 'imported'}: ${DRY_RUN ? report.length : imported}`)
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
