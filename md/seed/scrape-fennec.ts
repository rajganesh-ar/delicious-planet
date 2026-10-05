/**
 * Harvest the Fennec Trading catalogue into a JSON feed.
 *
 *   pnpm scrape:fennec
 *
 * Writes md/seed/data/fennec.json, which `pnpm import:fennec` then loads. The
 * split is the same as Admiral's: the harvested feed is the exact data a run was
 * built from, kept on disk so a re-import never means a re-scrape.
 *
 * The store is Odoo eCommerce. It has no public product API, but every product
 * page ships a schema.org Product and BreadcrumbList as JSON-LD, which carry the
 * name, the AED price and the category. The longer description only exists in
 * the rendered page, so it is read from the HTML between the product name and
 * the price.
 *
 * What this feed does NOT supply is a usable photo or real product detail. The
 * listing photos are mostly phone shots, AI posters and thumbnails, and the
 * descriptions are a line or two. Both are replaced in fennec-catalogue.ts from
 * researched sources; the feed is kept for names, prices and traceability.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { fetchTextViaCurl } from './lib/shopify-source'

const STORE = 'https://fennectradingllc.odoo.com'

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname_, 'data', 'fennec.json')

export interface FennecProduct {
  /** Odoo product.template id — the number on the end of the URL. */
  externalId: string
  /** URL slug without the trailing id. */
  handle: string
  url: string
  title: string
  price: number
  /** Fennec's own category, empty when the product is filed under none. */
  breadcrumb: string[]
  /** JSON-LD description: one line plus "Unit Price: AED n". */
  summary?: string
  /** The rendered description from the page body. */
  body?: string
  /** Fennec's listing photos, main first. Kept for reference, not imported. */
  images: string[]
}

interface JsonLdNode {
  '@type'?: string
  name?: string
  description?: string
  offers?: { price?: number; priceCurrency?: string }
  itemListElement?: Array<{ name: string }>
}

function decode(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/** Every product link across the paginated /shop listing. */
async function productLinks(): Promise<string[]> {
  const links = new Set<string>()
  for (let page = 1; page < 50; page++) {
    const html = await fetchTextViaCurl(`${STORE}/shop/page/${page}`)
    const before = links.size
    for (const m of html.matchAll(/href="(\/shop\/[a-z0-9-]+-\d+)"/g)) {
      if (!m[1]!.startsWith('/shop/category/')) links.add(m[1]!)
    }
    // Odoo serves the last page again for any page past the end.
    if (links.size === before) break
  }
  return [...links]
}

function parseProduct(link: string, html: string): FennecProduct {
  const nodes: JsonLdNode[] = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].flatMap((m) => {
    const parsed = JSON.parse(m[1]!) as JsonLdNode | JsonLdNode[]
    return Array.isArray(parsed) ? parsed : [parsed]
  })
  const product = nodes.find((n) => n['@type'] === 'Product')
  const crumbs = nodes.find((n) => n['@type'] === 'BreadcrumbList')
  if (!product?.name) throw new Error(`${link}: no Product JSON-LD`)
  const price = product.offers?.price
  if (typeof price !== 'number') throw new Error(`${link}: no price in JSON-LD`)
  if (product.offers?.priceCurrency !== 'AED') {
    throw new Error(`${link}: price in ${product.offers?.priceCurrency}, not AED`)
  }

  const start = html.indexOf('id="product_detail"')
  const text = decode(
    html
      .slice(start, start + 40000)
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ')
  // The name is printed twice (breadcrumb, heading); the body follows the last.
  const name = decode(product.name)
  const at = text.lastIndexOf(`${name} `)
  const body = at >= 0 ? text.slice(at + name.length).split(/ [\d.]+ AED/)[0]!.trim() : ''

  const externalId = link.match(/-(\d+)$/)![1]!
  const gallery = [
    ...new Set([...html.matchAll(/\/web\/image\/product\.image\/(\d+)\/image_1920/g)].map((m) => m[1]!)),
  ]

  return {
    externalId,
    handle: link.replace('/shop/', '').replace(/-\d+$/, ''),
    url: `${STORE}${link}`,
    title: name,
    price,
    breadcrumb: (crumbs?.itemListElement ?? []).slice(1, -1).map((c) => decode(c.name)),
    ...(product.description ? { summary: decode(product.description) } : {}),
    ...(body ? { body } : {}),
    images: [
      `${STORE}/web/image/product.template/${externalId}/image_1920`,
      ...gallery.map((id) => `${STORE}/web/image/product.image/${id}/image_1920`),
    ],
  }
}

async function main() {
  const links = await productLinks()
  console.log(`listing: ${links.length} products`)

  const products: FennecProduct[] = []
  for (const link of links) {
    const html = await fetchTextViaCurl(`${STORE}${link}`)
    products.push(parseProduct(link, html))
  }
  products.sort((a, b) => Number(a.externalId) - Number(b.externalId))

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(
    OUT,
    JSON.stringify({ harvestedAt: new Date().toISOString(), store: STORE, products }, null, 2),
  )
  console.log(`wrote ${path.relative(process.cwd(), OUT)}`)
}

main().catch((err) => {
  console.error('\nscrape failed:', err)
  process.exit(1)
})
