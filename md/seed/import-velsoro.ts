/**
 * Import the Velsoro chocolate catalogue, creating its three product types as
 * sub-categories of the existing chocolate department.
 *
 *   pnpm import:velsoro --dry-run                  preview, write nothing
 *   pnpm import:velsoro                            the real run
 *   pnpm import:velsoro --collection=tidy-bear     one collection
 *   pnpm import:velsoro --skip-images              copy and pricing only
 *
 * This is the first import to build a second level in `categories`. Chocolate
 * Bars, Chocolate Boxes and Teddy Bear are created beneath "Grand Cru Cocoa &
 * Chocolat" rather than beside it — see velsoro-catalogue.ts for what that
 * changes about the storefront listings.
 *
 * Prices are AED at source (a Dubai chocolatier), so nothing is converted.
 * Two things the feed does not provide and this importer derives:
 *
 *   · SKUs. Every variant ships with an empty SKU, so one is assigned from the
 *     handle — stable across runs, because regenerating them would orphan
 *     order history.
 *   · Sizes. Every product is a single "Default Title" variant, so the pack
 *     size is read out of the title or the copy; see lib/pack-size.ts.
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
  COLLECTION_TO_SUBCATEGORY,
  EXTRA_PRODUCTS,
  ORIGIN_COUNTRY,
  PARENT_DEPARTMENT_SLUG,
  SIZE_OVERRIDES,
  type SubCategorySpec,
} from './velsoro-catalogue'
import { derivePackSize } from './lib/pack-size'
import { assignSku } from './lib/sku'
import {
  createMediaResolver,
  fetchJson,
  plainText,
  shortDescription,
  type ShopifyProduct,
} from './lib/shopify-source'

const STORE = 'https://www.velsoro.com'
const PROVIDER = 'velsoro'

const BRAND = {
  title: 'Velsoro',
  slug: 'velsoro',
  website: STORE,
  description:
    'Dubai chocolatier working in ruby, dark, caramel and gold chocolate — bars, filled bonbons and moulded bears.',
}

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const SKIP_IMAGES = argv.includes('--skip-images')
const ONLY = argv.find((a) => a.startsWith('--collection='))?.split('=')[1]

const COLLECTIONS = Object.keys(COLLECTION_TO_SUBCATEGORY).filter((c) => !ONLY || c === ONLY)

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))

interface Row {
  handle: string
  title: string
  action: string
  category: string
  sku: string
  aed: number
  size: string
  sizeFrom: string
  images: number
  flags: string[]
}

const report: Row[] = []
const problems: string[] = []

async function main() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log(`\nVelsoro import${DRY_RUN ? '  (dry run — nothing is written)' : ''}`)
  console.log(`collections: ${COLLECTIONS.join(', ')}`)
  console.log('prices are AED at source — no conversion\n')

  let brandId: number | string | undefined
  const categoryIds = new Map<string, number | string>()

  if (!DRY_RUN) {
    const existingBrand = await payload.find({
      collection: 'brands',
      where: { slug: { equals: BRAND.slug } },
      limit: 1,
      depth: 0,
    })
    brandId = existingBrand.docs[0]
      ? existingBrand.docs[0].id
      : (await payload.create({ collection: 'brands', data: BRAND })).id
    console.log(`brand: ${existingBrand.docs[0] ? 'reusing' : 'created'} Velsoro (id ${brandId})`)

    const parentId = await requireParent(payload)
    for (const spec of Object.values(COLLECTION_TO_SUBCATEGORY)) {
      categoryIds.set(spec.slug, await ensureSubCategory(payload, spec, parentId))
    }
    console.log('')
  }

  const media = createMediaResolver(payload, { skipImages: SKIP_IMAGES })

  for (const collection of COLLECTIONS) {
    const spec = COLLECTION_TO_SUBCATEGORY[collection]!
    const { products } = await fetchJson<{ products: ShopifyProduct[] }>(
      `${STORE}/collections/${collection}/products.json?limit=250`,
    )
    console.log(`── ${collection} → ${PARENT_DEPARTMENT_SLUG}/${spec.slug}  (${products.length})`)

    for (const p of products) {
      try {
        await importProduct(p, spec.slug)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        problems.push(`${p.handle}: ${msg}`)
        console.log(`   FAIL   ${p.handle} — ${msg}`)
      }
    }
  }

  // Products the store lists in no collection at all.
  if (!ONLY) {
    const { products: all } = await fetchJson<{ products: ShopifyProduct[] }>(
      `${STORE}/products.json?limit=250`,
    )
    const extras = all.filter((p) => EXTRA_PRODUCTS[p.handle])
    if (extras.length) {
      console.log(`\n── uncollected products`)
      for (const p of extras) {
        try {
          await importProduct(p, EXTRA_PRODUCTS[p.handle]!, [
            'belongs to no collection upstream — filed by name',
          ])
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          problems.push(`${p.handle}: ${msg}`)
          console.log(`   FAIL   ${p.handle} — ${msg}`)
        }
      }
    }
  }

  async function importProduct(p: ShopifyProduct, categorySlug: string, extraFlags: string[] = []) {
    const flags = [...extraFlags]
    const bodyText = plainText(p.body_html)

    const pack = derivePackSize(p.title, bodyText, SIZE_OVERRIDES[p.handle])
    // A product whose variants carry real Shopify options names its own sizes
    // ("12-piece", "24-piece"), so a missing product-level pack size is not a
    // gap worth reporting there.
    const hasVariantOptions = p.variants.some(
      (v) => v.option1 && v.option1.trim().toLowerCase() !== 'default title',
    )
    if (!pack && !hasVariantOptions) {
      flags.push('no pack size stated in the title or the copy — imported as "One size"')
    }
    const size = pack?.label ?? 'One size'

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

    const variants = p.variants.map((v, i) => {
      // Shopify's `grams` is unusable here — a 56 g bar is filed as 56000 —
      // so net weight comes from the pack size or is left unset.
      const opt = v.option1?.trim()
      const variantSize =
        opt && opt.toLowerCase() !== 'default title' ? opt : i === 0 ? size : `${size} (${i + 1})`
      return {
        sku:
          v.sku?.trim() ||
          assignSku({
            prefix: 'VLS',
            handle: p.handle,
            label: v.option1,
            index: i,
            total: p.variants.length,
            variantId: v.id,
          }),
        size: variantSize,
        price: parseFloat(v.price),
        ...(v.compare_at_price && parseFloat(v.compare_at_price) > parseFloat(v.price)
          ? { compareAt: parseFloat(v.compare_at_price) }
          : {}),
        ...(pack?.grams !== undefined && variantSize === size ? { weightGrams: pack.grams } : {}),
        inStock: v.available,
        isDefault: i === 0,
      }
    })

    const blurb = shortDescription(p.body_html)

    const data = {
      title: p.title,
      sku: variants[0]!.sku,
      category: categoryIds.get(categorySlug),
      brand: brandId,
      origin: { country: ORIGIN_COUNTRY },
      shortDescription: blurb,
      description: convertHTMLToLexical({ editorConfig, html: p.body_html, JSDOM }),
      images: ordered
        .filter((img) => imageIdBySrc.has(img.src))
        .map((img) => ({ image: imageIdBySrc.get(img.src) })),
      variants,
      // Nothing on the storefront makes a dietary claim, and "sugar-free" in a
      // title is a recipe, not one of these flags.
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
      category: categorySlug,
      sku: variants[0]!.sku,
      aed: variants[0]!.price,
      size,
      sizeFrom: pack?.from ?? 'none',
      images: ordered.length,
      flags,
    }

    if (DRY_RUN) {
      report.push(row)
      console.log(
        `   preview ${p.handle.slice(0, 44).padEnd(45)} AED ${String(row.aed).padStart(6)}  ` +
          `${size.padEnd(10)} (${row.sizeFrom})  ${ordered.length} image(s)`,
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

  const reportPath = path.join(__dirname_, `velsoro-import-report${DRY_RUN ? '.dry-run' : ''}.json`)
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

/** The department these sub-categories hang from. It must already exist. */
async function requireParent(payload: Payload): Promise<number | string> {
  const found = await payload.find({
    collection: 'categories',
    where: { slug: { equals: PARENT_DEPARTMENT_SLUG } },
    limit: 1,
    depth: 0,
  })
  const parent = found.docs[0]
  if (!parent) throw new Error(`parent department "${PARENT_DEPARTMENT_SLUG}" not found`)

  // Giving a department children makes it an invalid product target, so a
  // department that already holds products must not silently acquire them.
  const held = await payload.count({
    collection: 'products',
    where: { category: { equals: parent.id } },
    overrideAccess: true,
  })
  if (held.totalDocs > 0) {
    throw new Error(
      `"${PARENT_DEPARTMENT_SLUG}" holds ${held.totalDocs} product(s). Adding sub-categories ` +
        'would make it an invalid category for them — move those products first.',
    )
  }

  console.log(`parent: ${parent.title} (id ${parent.id})`)
  return parent.id
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
  // `path`, `ancestors` and `isDepartment` are all derived by
  // deriveCategoryLineage from `parent`, so only `parent` is set here.
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
