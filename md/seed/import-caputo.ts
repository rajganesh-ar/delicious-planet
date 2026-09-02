/**
 * Import the Caputo flour catalogue from caputoflour.com into products, media,
 * brands and a new "Flours" category.
 *
 *   pnpm import:caputo --dry-run       write a JSON preview, touch nothing
 *   pnpm import:caputo                 the real run
 *   pnpm import:caputo --skip-images   re-run copy and pricing only
 *
 * Same contract as the García de la Cruz importer: idempotent, matching
 * products on `source.externalId` and images on `media.sourceUrl`, and never
 * overwriting `isFeatured` or `publishedAt` on a re-run. The shared machinery
 * lives in ./lib/shopify-source.
 *
 * The difference is where the detail comes from. Caputo's products.json carries
 * only title, copy and price — no SKU, no barcode, nothing about the flour
 * itself. Everything a baker actually chooses on (protein content, W strength,
 * allergens, shelf life) is published on the product page instead, so this
 * importer fetches each page and reads it. That is one extra request per
 * product, which for seven products is a rounding error against getting the
 * catalogue right.
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
  CATEGORY,
  MERCH_CATEGORY,
  MERCH_ORIGIN_COUNTRY,
  MERCH_OVERRIDES,
  PRODUCT_OVERRIDES,
  PRODUCT_TYPE,
} from './caputo-catalogue'
import {
  createMediaResolver,
  fetchJson,
  fetchText,
  shortDescription,
  toAed,
  USD_TO_AED,
  type ShopifyProduct,
} from './lib/shopify-source'

// ─── Source ──────────────────────────────────────────────────────────────────

const STORE = 'https://caputoflour.com'
const PROVIDER = 'caputo'

const BRAND = {
  title: 'Caputo',
  slug: 'caputo',
  website: 'https://www.mulinocaputo.it',
  description: 'Mulino Caputo — premium Italian flour from Naples since 1924.',
}

/** Naples. Stated as "Product of Italy" on every pack; the mill is in Campania. */
const ORIGIN_COUNTRY = 'IT'
const PRODUCER_REGION = 'Campania'

// ─── CLI ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_IMAGES = argv.includes('--skip-images')

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))

// ─── Product page scrape ─────────────────────────────────────────────────────

interface PageDetail {
  /** JSON-LD additionalProperty pairs: protein content, W value, NON GMO, … */
  properties: Array<{ label: string; value: string }>
  /** The claim list from the Ingredients/Allergens tab. */
  claims: string[]
  storageInstructions?: string
  ingredients?: string
  allergens?: string
  /** Shopify media alt text, keyed by image src — better than anything we'd write. */
  altBySrc: Map<string, string>
}

const decode = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Reads the parts of a Caputo product page the JSON feed leaves out.
 *
 * Three sources on one page, each brittle in a different way, so every one of
 * them is optional and a miss degrades the row rather than failing the import:
 *
 *   · JSON-LD `additionalProperty` — the structured spec pairs.
 *   · `.product-detail-tabs__product-ingredients` — the claim list.
 *   · `.product-detail-tabs__product-details` — storage first, allergens second.
 */
async function scrapeProductPage(handle: string): Promise<PageDetail> {
  const detail: PageDetail = { properties: [], claims: [], altBySrc: new Map() }

  let html: string
  try {
    html = await fetchText(`${STORE}/products/${handle}`)
  } catch {
    return detail
  }

  for (const m of html.matchAll(/"name":\s*"([^"]+)",\s*\n\s*"value":\s*"([^"]+)"/g)) {
    detail.properties.push({ label: m[1]!, value: m[2]! })
  }

  const tabs = [
    ...html.matchAll(/class='product-detail-tabs__([a-z-]+) b2'>([\s\S]*?)<\/p>/g),
  ].map((m) => ({ kind: m[1]!, html: m[2]! }))

  const claimText = tabs.find((t) => t.kind === 'product-ingredients')?.html
  if (claimText) {
    detail.claims = decode(claimText)
      .split(',')
      .map((s) => s.trim().replace(/\.$/, ''))
      .filter(Boolean)
  }

  // Two `product-details` paragraphs carry real content: storage, then the
  // "Contains:" statement. The first is an empty placeholder on every page.
  const details = tabs
    .filter((t) => t.kind === 'product-details')
    .map((t) => t.html)
    .filter((h) => decode(h).length > 0)

  if (details[0]) detail.storageInstructions = decode(details[0])

  if (details[1]) {
    // The "Contains:" line is an allergen statement on the wheat flours
    // ("Contains: Wheat.") but a full ingredient list on the gluten-free one.
    // Commas tell them apart: an ingredient list has many, a statement has one
    // or none. Getting this wrong would file an ingredient list under allergens,
    // which is untidy but not unsafe — both render on the PDP either way.
    const segments = details[1]!.split(/<br\s*\/?>/i).map(decode).filter(Boolean)
    const head = segments[0] ?? ''
    const isIngredientList = (head.match(/,/g)?.length ?? 0) >= 3
    if (isIngredientList) {
      detail.ingredients = head.replace(/^Contains:\s*/i, '')
      if (segments.length > 1) detail.allergens = segments.slice(1).join(' ')
    } else {
      detail.allergens = segments.join(' ')
    }
  }

  // Shopify's media JSON is embedded in the page and carries hand-written alt
  // text ("The back of a red and white carton showing the Nutrition Facts
  // label…"). Far better for screen readers than "Product title, view 8".
  for (const m of html.matchAll(
    /\{"alt":"((?:[^"\\]|\\.)*)"[\s\S]{0,600}?"src":"((?:[^"\\]|\\.)*?)"/g,
  )) {
    const alt = m[1]!.replace(/\\\//g, '/').replace(/\\"/g, '"')
    const src = m[2]!.replace(/\\\//g, '/')
    if (!alt || alt === 'null') continue
    const normalised = src.startsWith('//') ? `https:${src}` : src
    detail.altBySrc.set(normalised.split('?')[0]!, alt)
  }

  return detail
}

// ─── Report ──────────────────────────────────────────────────────────────────

interface Row {
  handle: string
  title: string
  action: string
  sku: string
  aed: number
  size: string
  images: number
  specs: number
  flags: string[]
}

const report: Row[] = []
const problems: string[] = []

// ─── Category ────────────────────────────────────────────────────────────────

/**
 * Departments are top-level categories, and Products.category accepts any
 * category with no children — so a freshly created department is immediately a
 * valid target. `path`, `isDepartment` and `ancestors` are all derived by
 * deriveCategoryLineage, so only the authored fields are set here.
 */
async function ensureCategory(
  payload: Payload,
  spec: { title: string; slug: string; description: string; sortOrder: number },
): Promise<number | string> {
  const found = await payload.find({
    collection: 'categories',
    where: { slug: { equals: spec.slug } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) {
    console.log(`category: reusing "${spec.title}" (id ${found.docs[0].id})`)
    return found.docs[0].id
  }
  const created = await payload.create({
    collection: 'categories',
    // `slug` is required on the collection but derived by ensureCategorySlug,
    // so it is deliberately absent here and the cast says so.
    data: {
      title: spec.title,
      description: spec.description,
      sortOrder: spec.sortOrder,
    } as RequiredDataFromCollectionSlug<'categories'>,
  })
  console.log(`category: created "${spec.title}" (id ${created.id}, slug ${created.slug})`)
  return created.id
}

/**
 * The apparel copy is a lead paragraph followed by a `<br>`-separated bullet
 * list of real specifications — fabric composition, crown height, head
 * circumference, and the blank's sourcing statement. That list is the whole
 * substance of a merch listing, so it becomes the specifications table rather
 * than being flattened into prose.
 */
function bulletSpecs(html: string): Array<{ label: string; value: string }> {
  return html
    .split(/<br\s*\/?>/i)
    .map((chunk) => decode(chunk))
    .filter((line) => line.startsWith('•'))
    .map((line) => line.replace(/^•\s*/, ''))
    .filter(Boolean)
    .map((line) => {
      // "Head circumference: 21⅝″–23⅝″" splits into a label/value pair; a bare
      // claim like "Mesh back" has no colon and becomes a Detail row.
      const idx = line.indexOf(':')
      if (idx > 0 && idx < 40) {
        return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() }
      }
      return { label: 'Detail', value: line }
    })
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log(`\nCaputo import${DRY_RUN ? '  (dry run — nothing is written)' : ''}`)
  console.log(`rate: 1 USD = ${USD_TO_AED} AED (peg)\n`)

  const { products: all } = await fetchJson<{ products: ShopifyProduct[] }>(
    `${STORE}/collections/all/products.json?limit=250`,
  )

  const flours = all.filter((p) => p.product_type === PRODUCT_TYPE)
  const merch = all.filter((p) => p.product_type !== PRODUCT_TYPE)
  console.log(`feed: ${all.length} products, ${flours.length} flour, ${merch.length} merchandise\n`)

  let brandId: number | string | undefined
  let categoryId: number | string | undefined
  let merchCategoryId: number | string | undefined

  if (!DRY_RUN) {
    const existingBrand = await payload.find({
      collection: 'brands',
      where: { slug: { equals: BRAND.slug } },
      limit: 1,
      depth: 0,
    })
    if (existingBrand.docs[0]) {
      brandId = existingBrand.docs[0].id
      console.log(`brand: reusing ${BRAND.title} (id ${brandId})`)
    } else {
      brandId = (await payload.create({ collection: 'brands', data: BRAND })).id
      console.log(`brand: created ${BRAND.title} (id ${brandId})`)
    }
    categoryId = await ensureCategory(payload, CATEGORY)
    merchCategoryId = await ensureCategory(payload, MERCH_CATEGORY)
    console.log('')
  }

  const media = createMediaResolver(payload, { skipImages: SKIP_IMAGES })

  console.log(`── flour → ${CATEGORY.slug}`)
  for (const p of flours) {
    try {
      await importFlour(p)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      problems.push(`${p.handle}: ${msg}`)
      console.log(`   FAIL   ${p.handle} — ${msg}`)
    }
  }

  console.log(`\n── merchandise → ${MERCH_CATEGORY.slug}`)
  for (const p of merch) {
    try {
      await importMerch(p)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      problems.push(`${p.handle}: ${msg}`)
      console.log(`   FAIL   ${p.handle} — ${msg}`)
    }
  }

  async function importFlour(p: ShopifyProduct) {
    const override = PRODUCT_OVERRIDES[p.handle]
    const flags: string[] = []
    if (!override) {
      throw new Error('no override row — a SKU must be assigned before this can be sold')
    }
    if (override.note) flags.push(override.note)

    const page = await scrapeProductPage(p.handle)
    if (page.properties.length === 0 && page.claims.length === 0) {
      flags.push('product page yielded no specifications — imported from the feed alone')
    }

    // Claims are the supplier's own words on the pack. Only flags they actually
    // assert are set; gluten comes from the override because the claim list is
    // silent on it and the answer differs per product.
    const claim = (needle: string) =>
      page.claims.some((c) => c.toLowerCase().includes(needle.toLowerCase()))
    const isVegan = claim('vegan')

    const ordered = [...p.images].sort((a, b) => a.position - b.position)
    const imageIdBySrc = new Map<string, number | string>()
    if (!DRY_RUN) {
      for (const [i, img] of ordered.entries()) {
        const alt =
          page.altBySrc.get(img.src.split('?')[0]!) ??
          img.alt ??
          (i === 0 ? p.title : `${p.title}, view ${i + 1}`)
        const id = await media.resolve(img.src, alt, `${p.handle}-${i + 1}`)
        if (id !== undefined) imageIdBySrc.set(img.src, id)
      }
      if (imageIdBySrc.size === 0) {
        throw new Error('no images resolved — refusing to save a product with an empty gallery')
      }
    }

    const variants = p.variants.map((v, i) => ({
      // Every Caputo variant ships with an empty SKU; the assigned one is
      // suffixed per variant so a future multi-pack cannot collide.
      sku: v.sku?.trim() || (i === 0 ? override.sku : `${override.sku}-${i + 1}`),
      size: override.size,
      price: toAed(v.price),
      ...(v.compare_at_price ? { compareAt: toAed(v.compare_at_price) } : {}),
      weightGrams: override.netWeightGrams,
      inStock: v.available,
      isDefault: i === 0,
      ...(v.featured_image?.src && imageIdBySrc.has(v.featured_image.src)
        ? { image: imageIdBySrc.get(v.featured_image.src) }
        : {}),
    }))

    const blurb = shortDescription(p.body_html)

    // Spec rows: the JSON-LD pairs first (protein, W value, NON GMO), then the
    // remaining pack claims that are not already covered by a dietary flag.
    const covered = /^(vegan|halal|kosher|gluten)/i
    const specifications = [
      ...page.properties.map((x) => ({ label: x.label, value: x.value })),
      ...(page.claims.filter((c) => !covered.test(c) && !/^protein|^w:/i.test(c)).length
        ? [
            {
              label: 'Pack claims',
              value: page.claims.filter((c) => !covered.test(c) && !/^protein|^w:/i.test(c)).join(' · '),
            },
          ]
        : []),
    ]

    const data = {
      title: p.title,
      sku: variants[0]!.sku,
      category: categoryId,
      brand: brandId,
      origin: { country: ORIGIN_COUNTRY, producerRegion: PRODUCER_REGION },
      shortDescription: blurb,
      description: convertHTMLToLexical({ editorConfig, html: p.body_html, JSDOM }),
      images: ordered
        .filter((img) => imageIdBySrc.has(img.src))
        .map((img) => ({ image: imageIdBySrc.get(img.src) })),
      variants,
      dietary: {
        isOrganic: false,
        isVegan,
        isVegetarian: isVegan,
        isHalal: claim('halal'),
        isGlutenFree: override.isGlutenFree,
        isLactoseFree: override.isLactoseFree,
      },
      ...(page.ingredients ? { ingredients: page.ingredients } : {}),
      ...(page.allergens ? { allergens: page.allergens } : {}),
      ...(page.storageInstructions ? { storageInstructions: page.storageInstructions } : {}),
      packaging: 'Paper sack',
      ...(specifications.length ? { specifications } : {}),
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
      sku: variants[0]!.sku,
      aed: variants[0]!.price,
      size: override.size,
      images: ordered.length,
      specs: specifications.length,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
      console.log(
        `   preview ${p.handle}  AED ${row.aed}  ${row.images} image(s), ${row.specs} spec(s)` +
          `${page.allergens ? ', allergens' : ''}${page.ingredients ? ', ingredients' : ''}` +
          `${page.storageInstructions ? ', storage' : ''}`,
      )
      return
    }

    await saveProduct(p, data, row)
  }

  /**
   * Upsert on the Shopify product id. `isFeatured` is set only on create — it is
   * a merchandising decision made here, and the feed has no say in it on a
   * re-run.
   */
  async function saveProduct(
    p: ShopifyProduct,
    data: RequiredDataFromCollectionSlug<'products'>,
    row: Row,
  ) {
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

  /**
   * Merchandise: apparel and the gift card. Shares the upsert and the image
   * pipeline with the flours, but almost nothing else — there is no dietary
   * profile, no allergen panel and no product page worth scraping, and the
   * substance of the listing is the bullet-list of fabric and fit specs.
   */
  async function importMerch(p: ShopifyProduct) {
    const override = MERCH_OVERRIDES[p.handle] ?? {}
    const flags: string[] = [
      'origin recorded as US — the source states a multi-country sourcing pool, not an origin',
    ]
    if (override.note) flags.push(override.note)
    if (override.title) flags.push(`retitled from "${p.title}" — two listings shared that title`)

    const title = override.title ?? p.title

    const ordered = [...p.images].sort((a, b) => a.position - b.position)
    const imageIdBySrc = new Map<string, number | string>()
    if (!DRY_RUN) {
      for (const [i, img] of ordered.entries()) {
        const alt = img.alt ?? (i === 0 ? title : `${title}, view ${i + 1}`)
        const id = await media.resolve(img.src, alt, `${p.handle}-${i + 1}`)
        if (id !== undefined) imageIdBySrc.set(img.src, id)
      }
      if (imageIdBySrc.size === 0) {
        throw new Error('no images resolved — refusing to save a product with an empty gallery')
      }
    }

    const variants = p.variants.map((v, i) => {
      // Colour and size are separate Shopify options; the orderable unit is the
      // combination, so both go into `size` — "Heather Dust / L" is what a
      // customer picks, not "Heather Dust".
      const parts = [v.option1, v.option2, v.option3]
        .filter((o): o is string => Boolean(o) && o!.toLowerCase() !== 'default title')
        .map((o) => o.trim())
      const price = toAed(v.price)
      // A gift card's "size" is its denomination, which Shopify labels in USD.
      // Left alone it would read "$10.00 — AED 36.73" on the same row, so the
      // label is restated in the currency the catalogue actually charges.
      const size =
        parts.length === 1 && /^\$[\d.,]+$/.test(parts[0]!)
          ? `AED ${price.toFixed(2)}`
          : parts.length
            ? parts.join(' / ')
            : (override.size ?? 'One size')

      const sku = v.sku?.trim() || `${override.skuPrefix ?? p.handle.toUpperCase()}-${i + 1}`

      return {
        sku,
        size,
        price,
        ...(v.compare_at_price ? { compareAt: toAed(v.compare_at_price) } : {}),
        // Unlike the food lines, Shopify's `grams` here is the garment weight
        // rather than a shipping estimate, so it is the honest net weight.
        ...(v.grams > 0 ? { weightGrams: v.grams } : {}),
        inStock: v.available,
        isDefault: i === 0,
        ...(v.featured_image?.src && imageIdBySrc.has(v.featured_image.src)
          ? { image: imageIdBySrc.get(v.featured_image.src) }
          : {}),
      }
    })

    const blurb = shortDescription(p.body_html)
    const specifications = bulletSpecs(p.body_html)

    const data = {
      title,
      sku: variants[0]!.sku,
      category: merchCategoryId,
      brand: brandId,
      origin: { country: MERCH_ORIGIN_COUNTRY },
      shortDescription: blurb,
      description: convertHTMLToLexical({ editorConfig, html: p.body_html, JSDOM }),
      images: ordered
        .filter((img) => imageIdBySrc.has(img.src))
        .map((img) => ({ image: imageIdBySrc.get(img.src) })),
      variants,
      ...(specifications.length ? { specifications } : {}),
      shipping: { shippingClass: 'standard' },
      meta: { title, description: blurb },
      source: {
        provider: PROVIDER,
        externalId: String(p.id),
        handle: p.handle,
        url: `${STORE}/products/${p.handle}`,
        importedAt: new Date().toISOString(),
      },
      _status: override.draft ? 'draft' : 'published',
    } as RequiredDataFromCollectionSlug<'products'>

    const row: Row = {
      handle: p.handle,
      title,
      action: DRY_RUN ? 'preview' : 'created',
      sku: variants[0]!.sku,
      aed: variants[0]!.price,
      size: variants[0]!.size,
      images: ordered.length,
      specs: specifications.length,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
      console.log(
        `   preview ${p.handle}  AED ${row.aed}  ${variants.length} variant(s), ` +
          `${row.images} image(s), ${row.specs} spec(s)${override.draft ? '  [DRAFT]' : ''}`,
      )
      return
    }

    await saveProduct(p, data, row)
  }

  const reportPath = path.join(__dirname_, `caputo-import-report${DRY_RUN ? '.dry-run' : ''}.json`)
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      { ranAt: new Date().toISOString(), rate: USD_TO_AED, report, problems },
      null,
      2,
    ),
  )

  const imported = report.filter((r) => r.action === 'created' || r.action === 'updated').length
  console.log(`\n${DRY_RUN ? 'previewed' : 'imported'}: ${DRY_RUN ? report.length : imported}`)
  console.log(`images: ${media.resolvedCount} resolved, ${media.uploadCount} newly uploaded`)
  console.log(`report: ${path.relative(process.cwd(), reportPath)}`)

  const drafts = report.filter((r) => r.flags.some((f) => f.startsWith('Imported as a DRAFT')))
  if (drafts.length) {
    console.log(`\nimported unpublished (${drafts.length}):`)
    for (const d of drafts) console.log(`  · ${d.title}`)
  }
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
