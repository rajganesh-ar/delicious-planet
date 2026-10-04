/**
 * Import the Intermex catalogue — a UAE importer of Mexican food.
 *
 *   pnpm import:intermex --dry-run       preview, write nothing
 *   pnpm import:intermex                 the real run
 *   pnpm import:intermex --skip-images   copy and pricing only
 *   pnpm import:intermex --only=a,b,c    just these handles; nothing else is read or written
 *
 * Their Shopify store gives no usable `vendor` and no `product_type`, so the
 * category comes from collection membership and the brand from a per-product
 * list. intermex-catalogue.ts holds every one of those decisions.
 *
 * Structure this creates:
 *
 *   Mexican Pantry            (new department)
 *   ├── Mexican Sauces
 *   ├── Chilis
 *   ├── Pantry Staples
 *   └── Mexican Candy
 *
 * with drinks joining the existing Curated Fine Beverages rather than being
 * duplicated inside a Mexican silo. Accessories are not food and are skipped.
 *
 * Prices are AED at source. Same contract as the other importers: upsert on
 * `source.externalId`, media de-duplicated on `sourceUrl`, `isFeatured` and
 * `publishedAt` never overwritten on a re-run.
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
  BRAND_COLLECTIONS,
  CATEGORY_COLLECTIONS,
  NON_MEXICAN_BRAND_HINT,
  ORIGIN_COUNTRY,
  PARENT_DEPARTMENT,
  resolveBrand,
  resolveCategory,
  SUB_CATEGORIES,
  type SubCategorySpec,
} from './intermex-catalogue'
import { assignSku } from './lib/sku'
import {
  createMediaResolver,
  fetchJson,
  sanitizeDescriptionHtml,
  shortDescription,
  type ShopifyProduct,
} from './lib/shopify-source'

const STORE = 'https://intermexuae.com'
const PROVIDER = 'intermex'

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_IMAGES = argv.includes('--skip-images')
/**
 * Restrict the run to named handles — for filling gaps without rewriting the
 * rest of the catalogue, which a full run upserts wholesale.
 */
const ONLY = argv
  .find((a) => a.startsWith('--only='))
  ?.slice('--only='.length)
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

/**
 * From September 2026 the store prefixes titles with its internal stock code
 * ("SA 0020 Habanero y Chiltepín…", "CH006 Whole Cascabel Chili"). The
 * catalogue was imported before that and carries none, so strip it.
 */
function stripStockCode(title: string): string {
  return title.replace(/^[A-Z]{2}\s?\d{3,4}\s+/, '').trim()
}

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))

/** Every collection whose membership matters: types, and the two brand fallbacks. */
const COLLECTIONS_TO_READ = [...CATEGORY_COLLECTIONS, ...Object.keys(BRAND_COLLECTIONS)]

interface Row {
  handle: string
  title: string
  action: string
  category: string
  categoryFrom: string
  brand: string | null
  sku: string
  aed: number
  images: number
  flags: string[]
}

const report: Row[] = []
const problems: string[] = []
/** Handles skipped because they are not food. */
const notCarried: string[] = []

async function main() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log(`\nIntermex import${DRY_RUN ? '  (dry run — nothing is written)' : ''}`)
  console.log('prices are AED at source — no conversion')
  console.log(`origin defaults to ${ORIGIN_COUNTRY} — a Mexican-food importer\n`)

  // ── the feed ──
  const feed = await fetchJson<{ products: ShopifyProduct[] }>(`${STORE}/products.json?limit=250`)
  let products = feed.products.map((p) => ({ ...p, title: stripStockCode(p.title) }))
  if (ONLY) {
    const unknown = ONLY.filter((h) => !products.some((p) => p.handle === h))
    if (unknown.length) throw new Error(`--only: not in the feed: ${unknown.join(', ')}`)
    products = products.filter((p) => ONLY.includes(p.handle))
    console.log(`--only: ${products.length} of ${feed.products.length} products\n`)
  }

  // ── collection membership ──
  const membership = new Map<string, string[]>()
  for (const collection of COLLECTIONS_TO_READ) {
    const res = await fetchJson<{ products: ShopifyProduct[] }>(
      `${STORE}/collections/${collection}/products.json?limit=250`,
    )
    for (const p of res.products) {
      membership.set(p.handle, [...(membership.get(p.handle) ?? []), collection])
    }
  }
  console.log(`feed: ${products.length} products, ${COLLECTIONS_TO_READ.length} collections read`)

  // ── categories ──
  const categoryIds = new Map<string, number | string>()
  if (!DRY_RUN) {
    const parentId = await ensureDepartment(payload)
    for (const spec of SUB_CATEGORIES) {
      categoryIds.set(spec.slug, await ensureSubCategory(payload, spec, parentId))
    }
    // The existing department that takes products directly.
    for (const slug of ['curated-fine-beverages']) {
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
      console.log(`  reusing department: ${found.docs[0].title} (id ${found.docs[0].id})`)
    }
    console.log('')
  }

  // ── brands ──
  const brandIds = new Map<string, number | string>()
  async function brandFor(slug: string, title: string): Promise<number | string> {
    if (brandIds.has(slug)) return brandIds.get(slug)!
    const found = await payload.find({
      collection: 'brands',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const id = found.docs[0]
      ? found.docs[0].id
      : (await payload.create({ collection: 'brands', data: { title, slug } })).id
    if (!found.docs[0]) console.log(`   brand: created ${title} (id ${id})`)
    brandIds.set(slug, id)
    return id
  }

  const media = createMediaResolver(payload, { skipImages: SKIP_IMAGES })

  for (const p of products) {
    try {
      await importProduct(p)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      problems.push(`${p.handle}: ${msg}`)
      console.log(`   FAIL   ${p.handle} — ${msg}`)
    }
  }

  async function importProduct(p: ShopifyProduct) {
    const flags: string[] = []
    const collections = membership.get(p.handle) ?? []

    const { category, from } = resolveCategory(p.title, collections)
    if (category === null) {
      notCarried.push(p.handle)
      return
    }
    if (from === 'title-rule') {
      flags.push(`category "${category}" inferred from the title — the store files it under none`)
    } else if (from === 'default') {
      flags.push('no category at source and no title match — filed under Pantry Staples')
    }

    // The maker named on the pack. A product the list doesn't cover imports
    // without one rather than having it guessed.
    const brandSpec = resolveBrand(p.handle, collections)
    const brandId =
      brandSpec && !DRY_RUN ? await brandFor(brandSpec.slug, brandSpec.title) : undefined
    if (!brandSpec) flags.push('no brand — add the maker to BRANDS in intermex-catalogue.ts')

    if (NON_MEXICAN_BRAND_HINT.test(p.title)) {
      flags.push(`origin recorded as ${ORIGIN_COUNTRY} but the title names a non-Mexican brand — verify`)
    }

    const ordered = [...p.images].sort((a, b) => a.position - b.position)
    if (ordered.length === 0) throw new Error('no images in the feed')

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

    const variants = p.variants.map((v, i) => {
      const price = parseFloat(v.price)
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`variant ${i + 1} has no usable price (${JSON.stringify(v.price)})`)
      }
      const opt = v.option1?.trim()
      // The size a customer picks. Most products are a single "Default Title"
      // variant whose size lives in the title, which the title already shows.
      const size =
        opt && opt.toLowerCase() !== 'default title'
          ? opt
          : (p.title.match(/(\d+(?:\.\d+)?\s*(?:g|gm|kg|ml|l)\b)/i)?.[1]?.replace(/\s+/g, '') ??
            'One size')

      return {
        // The store fills unset SKUs with "0" as well as leaving them blank;
        // taken literally, every such product collides on the same SKU.
        sku:
          (/^0*$/.test(v.sku?.trim() ?? '') ? '' : v.sku!.trim()) ||
          assignSku({
            prefix: 'IMX',
            handle: p.handle,
            label: v.option1,
            index: i,
            total: p.variants.length,
            variantId: v.id,
          }),
        size,
        price,
        ...(v.compare_at_price && parseFloat(v.compare_at_price) > price
          ? { compareAt: parseFloat(v.compare_at_price) }
          : {}),
        inStock: v.available,
        isDefault: i === 0,
      }
    })

    // Several descriptions paste a whole rendered Shopify section, images and
    // all, into the body; an <img> alone makes the richText field invalid.
    const bodyHtml = sanitizeDescriptionHtml(p.body_html)
    const blurb = shortDescription(bodyHtml)

    const data = {
      title: p.title,
      sku: variants[0]!.sku,
      category: categoryIds.get(category),
      ...(brandId ? { brand: brandId } : {}),
      origin: { country: ORIGIN_COUNTRY },
      shortDescription: blurb,
      description: convertHTMLToLexical({ editorConfig, html: bodyHtml, JSDOM }),
      images: ordered
        .filter((img) => imageIdBySrc.has(img.src))
        .map((img) => ({ image: imageIdBySrc.get(img.src) })),
      variants,
      // Nothing on the storefront makes a dietary claim.
      dietary: {
        isOrganic: false,
        isVegan: false,
        isVegetarian: false,
        isHalal: false,
        isGlutenFree: false,
        isLactoseFree: false,
      },
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
      category,
      categoryFrom: from,
      brand: brandSpec?.title ?? null,
      sku: variants[0]!.sku,
      aed: variants[0]!.price,
      images: ordered.length,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
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
      await payload.update({ collection: 'products', id: existing.docs[0].id, data })
      row.action = 'updated'
    } else {
      await payload.create({ collection: 'products', data: { ...data, isFeatured: false } })
    }
    if (report.length % 25 === 0) {
      console.log(`   … ${report.length + 1} products`)
    }
    report.push(row)
  }

  // ── report ──
  // A partial run must not overwrite the full run's report.
  const reportPath = path.join(
    __dirname_,
    `intermex-import-report${ONLY ? '.only' : ''}${DRY_RUN ? '.dry-run' : ''}.json`,
  )
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ ranAt: new Date().toISOString(), report, problems }, null, 2),
  )

  const byCategory = new Map<string, number>()
  const bySource = new Map<string, number>()
  for (const r of report) {
    byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1)
    bySource.set(r.categoryFrom, (bySource.get(r.categoryFrom) ?? 0) + 1)
  }

  console.log(`\n${DRY_RUN ? 'previewed' : 'imported'}: ${report.length}`)
  console.log(`not food, skipped: ${notCarried.length}`)
  console.log(`images: ${media.resolvedCount} resolved, ${media.uploadCount} newly uploaded`)
  console.log('\nby category:')
  for (const [c, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${c}`)
  }
  console.log('\nhow the category was decided:')
  for (const [s, n] of [...bySource].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${s}`)
  }
  console.log(`\nwith a brand: ${report.filter((r) => r.brand).length} of ${report.length}`)
  console.log(`report: ${path.relative(process.cwd(), reportPath)}`)

  const flagged = report.filter((r) => r.flags.length)
  console.log(`\nflagged for review: ${flagged.length}`)
  if (problems.length) {
    console.log(`\nfailed (${problems.length}):`)
    for (const pr of problems) console.log(`  · ${pr}`)
    process.exit(1)
  }
}

/** The new department. It must hold no products of its own — it gets children. */
async function ensureDepartment(payload: Payload): Promise<number | string> {
  const found = await payload.find({
    collection: 'categories',
    where: { slug: { equals: PARENT_DEPARTMENT.slug } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) {
    console.log(`department: reusing ${PARENT_DEPARTMENT.title} (id ${found.docs[0].id})`)
    return found.docs[0].id
  }
  const created = await payload.create({
    collection: 'categories',
    data: {
      title: PARENT_DEPARTMENT.title,
      description: PARENT_DEPARTMENT.description,
      sortOrder: PARENT_DEPARTMENT.sortOrder,
    } as RequiredDataFromCollectionSlug<'categories'>,
  })
  console.log(`department: created ${PARENT_DEPARTMENT.title} (id ${created.id})`)
  return created.id
}

async function ensureSubCategory(
  payload: Payload,
  spec: SubCategorySpec,
  parentId: number | string,
): Promise<number | string> {
  const found = await payload.find({
    collection: 'categories',
    where: { slug: { equals: spec.slug } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) {
    console.log(`  sub-category: reusing ${spec.title} (id ${found.docs[0].id})`)
    return found.docs[0].id
  }
  const created = await payload.create({
    collection: 'categories',
    data: {
      title: spec.title,
      description: spec.description,
      sortOrder: spec.sortOrder,
      parent: parentId,
    } as RequiredDataFromCollectionSlug<'categories'>,
  })
  console.log(`  sub-category: created ${spec.title} (id ${created.id}, path ${created.path})`)
  return created.id
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nimport failed:', err)
    process.exit(1)
  })
