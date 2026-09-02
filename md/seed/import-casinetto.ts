/**
 * Import products from Casinetto into the catalogue.
 *
 *   pnpm import:casinetto --dry-run                        preview, write nothing
 *   pnpm import:casinetto                                  every mapped collection
 *   pnpm import:casinetto --collection=soft-semi-soft-cheeses   just one
 *   pnpm import:casinetto --skip-images                    copy and pricing only
 *
 * Casinetto is a competitor whose storefront carries the product detail that
 * producers themselves rarely publish — ingredients, allergens, a full nutrition
 * panel, storage, packaging and country of origin. Those are what this import is
 * for. The brand written onto each product is the producer Casinetto lists as
 * `vendor`; "casinetto" is recorded only as `source.provider`.
 *
 * Their storefront is Gatsby over the Shopify Storefront API, and every JSON
 * endpoint (products.json, sitemap.xml) is disabled. The data is instead served
 * as a `window.pageData` blob inside the page, which is what this reads — the
 * collection page for the product list, then one page per product for the
 * detail. Their Cloudflare filter fingerprints the TLS handshake and refuses
 * Node's fetch outright, so pages come through the system curl; see
 * `fetchTextViaCurl`. Images live on Shopify's CDN and are fetched normally.
 *
 * Same contract as the other importers: upsert on `source.externalId`, media
 * de-duplicated on `sourceUrl`, `isFeatured` and `publishedAt` never overwritten.
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

import { resolveCountryCode } from '../../src/lib/countries'
import {
  COLLECTION_TO_CATEGORY,
  PRICING_NOTE,
  TAG_TO_DIETARY,
  TITLE_CLAIMS,
  type DietaryFlags,
} from './casinetto-catalogue'
import { gramsOf, parseNutrition, sizeLabel } from './lib/nutrition'
import {
  createMediaResolver,
  fetchTextViaCurl,
  plainText,
  shortDescription,
} from './lib/shopify-source'

const STORE = 'https://casinetto.com'
const PROVIDER = 'casinetto'

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_IMAGES = argv.includes('--skip-images')
const ONLY = argv.find((a) => a.startsWith('--collection='))?.split('=')[1]

const COLLECTIONS = Object.keys(COLLECTION_TO_CATEGORY).filter((c) => !ONLY || c === ONLY)

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))

// ─── Source shapes ───────────────────────────────────────────────────────────

interface Metafield {
  value: string
}

interface CasinettoVariant {
  id: string
  title: string
  sku: string | null
  price: { amount: string; currencyCode: string }
  compareAtPrice: { amount: string } | null
  availableForSale: boolean
  calculatedUom?: Metafield | null
}

interface CasinettoProduct {
  id: string
  handle: string
  title: string
  description?: string
  descriptionHtml?: string
  tags: string[]
  totalInventory?: number
  vendor: string
  seo?: { title?: string; description?: string }
  availableForSale: boolean
  ingredients?: Metafield | null
  allergens?: Metafield | null
  instructions?: Metafield | null
  nutrition?: Metafield | null
  storage?: Metafield | null
  packaging?: Metafield | null
  pieceUnitUom?: Metafield | null
  countryOfOrigin?: Metafield | null
  images: { edges?: Array<{ node: { src: string } }>; nodes?: Array<{ url: string }> }
  variants: { nodes: CasinettoVariant[] }
}

/**
 * Their pages are Gatsby: the whole SSR GraphQL response is inlined as
 * `window.pageData = {...};` inside a CDATA-wrapped script. Parsing that is
 * more robust than scraping the rendered markup, because it is the same object
 * the page itself renders from.
 */
function pageData(html: string): Record<string, unknown> | null {
  const m = html.match(/window\.pageData=(\{[\s\S]*?\});\/\*\]\]>\*\//)
  if (!m) return null
  try {
    return JSON.parse(m[1]!) as Record<string, unknown>
  } catch {
    return null
  }
}

function serverData<T>(html: string, pick: (r: Record<string, never>) => T): T | null {
  const d = pageData(html)
  const sd = (d?.result as { serverData?: Record<string, never> } | undefined)?.serverData
  if (!sd) return null
  try {
    return pick(sd)
  } catch {
    return null
  }
}

/** "gid://shopify/Product/7521218330773" → "7521218330773". */
function gidId(gid: string): string {
  return gid.split('/').pop() ?? gid
}

// ─── Report ──────────────────────────────────────────────────────────────────

interface Row {
  handle: string
  title: string
  brand: string
  action: string
  category: string
  sku: string
  aed: number
  size: string
  images: number
  facts: string[]
  flags: string[]
}

const report: Row[] = []
const problems: string[] = []

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log(`\nCasinetto import${DRY_RUN ? '  (dry run — nothing is written)' : ''}`)
  console.log(`collections: ${COLLECTIONS.join(', ')}`)
  console.log('prices are AED at source — no conversion\n')

  const categoryIds = new Map<string, number | string>()
  if (!DRY_RUN) {
    for (const slug of new Set(Object.values(COLLECTION_TO_CATEGORY))) {
      const found = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })
      if (!found.docs[0]) throw new Error(`category "${slug}" not found — import cannot continue`)
      categoryIds.set(slug, found.docs[0].id)
    }
    console.log(`categories: resolved ${categoryIds.size}`)
  }

  /** Producer name → brand id, created on first sight. */
  const brandIds = new Map<string, number | string>()

  async function brandFor(vendor: string): Promise<number | string> {
    const name = vendor.trim()
    if (brandIds.has(name)) return brandIds.get(name)!
    const slug = name
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const found = await payload.find({
      collection: 'brands',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const id = found.docs[0]
      ? found.docs[0].id
      : (await payload.create({ collection: 'brands', data: { title: name, slug } })).id
    if (!found.docs[0]) console.log(`   brand: created ${name} (id ${id})`)
    brandIds.set(name, id)
    return id
  }

  const media = createMediaResolver(payload, { skipImages: SKIP_IMAGES })

  for (const collection of COLLECTIONS) {
    const categorySlug = COLLECTION_TO_CATEGORY[collection]!
    const html = await fetchTextViaCurl(`${STORE}/collections/${collection}`)
    const nodes = serverData<Array<{ handle: string }>>(
      html,
      (sd) =>
        (sd as unknown as { response: { collection: { products: { nodes: Array<{ handle: string }> } } } })
          .response.collection.products.nodes,
    )
    if (!nodes?.length) throw new Error(`no products found in collection "${collection}"`)

    console.log(`\n── ${collection} → ${categorySlug}  (${nodes.length} products)`)

    for (const n of nodes) {
      try {
        await importProduct(n.handle, categorySlug)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        problems.push(`${n.handle}: ${msg}`)
        console.log(`   FAIL   ${n.handle} — ${msg}`)
      }
    }
  }

  async function importProduct(handle: string, categorySlug: string) {
    const html = await fetchTextViaCurl(`${STORE}/products/${handle}`)
    const p = serverData<CasinettoProduct>(
      html,
      (sd) => (sd as unknown as { product: CasinettoProduct }).product,
    )
    if (!p) throw new Error('no product payload on the page')

    const flags: string[] = [PRICING_NOTE]
    const facts: string[] = []

    // ── origin ──
    const countryName = p.countryOfOrigin?.value?.trim()
    const country = resolveCountryCode(countryName)
    if (!country) throw new Error(`unmapped country of origin ${JSON.stringify(countryName)}`)

    // ── dietary, from the source's own tags only ──
    const dietary: DietaryFlags = {
      isOrganic: false,
      isVegan: false,
      isVegetarian: false,
      isHalal: false,
      isGlutenFree: false,
      isLactoseFree: false,
    }
    for (const tag of p.tags ?? []) {
      const field = TAG_TO_DIETARY[tag.trim().toLowerCase()]
      if (field) dietary[field] = true
    }
    // Vegan implies vegetarian; the source tags them separately and can tag
    // only the stronger claim.
    if (dietary.isVegan) dietary.isVegetarian = true

    // A title that claims something the tags do not is reported, not resolved.
    for (const claim of TITLE_CLAIMS) {
      if (claim.pattern.test(p.title) && !dietary[claim.field]) {
        flags.push(
          `title claims "${claim.label}" but the source does not tag it — flag left false, ` +
            'confirm with the producer before setting it',
        )
      }
    }

    // ── nutrition ──
    const nutrition = p.nutrition?.value ? parseNutrition(p.nutrition.value) : null
    if (nutrition && Object.keys(nutrition.values).length) facts.push('nutrition')

    // ── images ──
    const srcs = (p.images.edges?.map((e) => e.node.src) ?? p.images.nodes?.map((n) => n.url) ?? [])
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)

    const imageIdBySrc = new Map<string, number | string>()
    if (!DRY_RUN) {
      for (const [i, src] of srcs.entries()) {
        const alt = i === 0 ? p.title : `${p.title}, view ${i + 1}`
        const id = await media.resolve(src, alt, `${handle}-${i + 1}`)
        if (id !== undefined) imageIdBySrc.set(src, id)
      }
      if (imageIdBySrc.size === 0) {
        throw new Error('no images resolved — refusing to save a product with an empty gallery')
      }
    }

    // ── variants ──
    const variants = p.variants.nodes.map((v, i) => {
      const size = sizeLabel(v.calculatedUom?.value, p.pieceUnitUom?.value) ?? 'One size'
      const sku = v.sku?.trim() || `${handle.toUpperCase()}-${i + 1}`
      const price = parseFloat(v.price.amount)
      const compareAt = v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : undefined
      if (v.price.currencyCode !== 'AED') {
        throw new Error(`variant ${sku} priced in ${v.price.currencyCode}, expected AED`)
      }
      return {
        sku,
        size,
        price,
        ...(compareAt && compareAt > price ? { compareAt } : {}),
        ...(gramsOf(size) !== undefined ? { weightGrams: gramsOf(size) } : {}),
        inStock: v.availableForSale,
        isDefault: i === 0,
      }
    })
    if (!variants.length) throw new Error('no variants')

    const brandId = DRY_RUN ? undefined : await brandFor(p.vendor)

    const descriptionHtml = p.descriptionHtml?.trim() || `<p>${p.description ?? p.title}</p>`
    const blurb = p.seo?.description?.trim() || shortDescription(descriptionHtml)

    const specifications = [
      ...(nutrition?.extras ?? []),
      ...(p.instructions?.value ? [{ label: 'Instructions', value: plainText(p.instructions.value) }] : []),
    ]

    for (const [k, v] of [
      ['ingredients', p.ingredients?.value],
      ['allergens', p.allergens?.value],
      ['storage', p.storage?.value],
      ['packaging', p.packaging?.value],
    ] as const) {
      if (v) facts.push(k)
    }

    const data = {
      title: p.title,
      sku: variants[0]!.sku,
      category: categoryIds.get(categorySlug),
      brand: brandId,
      origin: { country },
      shortDescription: blurb.slice(0, 300),
      description: convertHTMLToLexical({ editorConfig, html: descriptionHtml, JSDOM }),
      images: srcs
        .filter((s) => imageIdBySrc.has(s))
        .map((s) => ({ image: imageIdBySrc.get(s) })),
      variants,
      dietary,
      ...(p.ingredients?.value ? { ingredients: plainText(p.ingredients.value) } : {}),
      ...(p.allergens?.value ? { allergens: plainText(p.allergens.value) } : {}),
      ...(p.storage?.value ? { storageInstructions: plainText(p.storage.value) } : {}),
      ...(p.packaging?.value ? { packaging: plainText(p.packaging.value) } : {}),
      ...(nutrition && Object.keys(nutrition.values).length
        ? { nutritionPer100g: nutrition.values }
        : {}),
      ...(specifications.length ? { specifications } : {}),
      // Cheese travels chilled.
      shipping: { shippingClass: 'frozen' },
      meta: { title: p.seo?.title ?? p.title, description: blurb.slice(0, 300) },
      source: {
        provider: PROVIDER,
        externalId: gidId(p.id),
        handle: p.handle,
        url: `${STORE}/products/${p.handle}`,
        importedAt: new Date().toISOString(),
      },
      _status: 'published',
    } as RequiredDataFromCollectionSlug<'products'>

    const row: Row = {
      handle,
      title: p.title,
      brand: p.vendor,
      action: DRY_RUN ? 'preview' : 'created',
      category: categorySlug,
      sku: variants[0]!.sku,
      aed: variants[0]!.price,
      size: variants[0]!.size,
      images: srcs.length,
      facts,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
      console.log(
        `   preview ${handle}  ${p.vendor} / ${countryName}  AED ${row.aed}  ${row.size}, ` +
          `${srcs.length} image(s)  [${facts.join(', ') || 'no label data'}]`,
      )
      return
    }

    const existing = await payload.find({
      collection: 'products',
      where: {
        and: [
          { 'source.provider': { equals: PROVIDER } },
          { 'source.externalId': { equals: gidId(p.id) } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs[0]) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data })
      row.action = 'updated'
      console.log(`   update ${handle}  → id ${existing.docs[0].id}  (${p.vendor})`)
    } else {
      const created = await payload.create({
        collection: 'products',
        data: { ...data, isFeatured: false },
      })
      console.log(`   create ${handle}  → id ${created.id}  (${p.vendor})`)
    }
    report.push(row)
  }

  const reportPath = path.join(__dirname_, `casinetto-import-report${DRY_RUN ? '.dry-run' : ''}.json`)
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ ranAt: new Date().toISOString(), report, problems }, null, 2),
  )

  const imported = report.filter((r) => r.action === 'created' || r.action === 'updated').length
  console.log(`\n${DRY_RUN ? 'previewed' : 'imported'}: ${DRY_RUN ? report.length : imported}`)
  console.log(`images: ${media.resolvedCount} resolved, ${media.uploadCount} newly uploaded`)
  console.log(`brands touched: ${[...brandIds.keys()].join(', ') || '(none — dry run)'}`)
  console.log(`report: ${path.relative(process.cwd(), reportPath)}`)

  console.log(`\nall ${report.length} product(s): ${PRICING_NOTE}`)

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
