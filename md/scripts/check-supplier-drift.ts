/**
 * Report where the catalogue has drifted from the suppliers' own stores.
 * Read-only: it changes nothing.
 *
 *   pnpm check:suppliers
 *
 * The importers copy price and stock once, and nothing re-syncs them, so the
 * catalogue goes stale as suppliers reprice, sell out and relist. This compares
 * every imported product with its source listing (matched on `source.handle`)
 * and prints what differs:
 *
 *   - price     variant prices, in order, after the importer's own conversion
 *   - stock     in stock here but sold out there, or the other way round
 *   - gone      still carried here but no longer in the supplier's store
 *   - new       in the supplier's store but not carried here
 *
 * A price difference is a question, not an error: a supplier can reuse one
 * listing for a different pack size (Intermex turned a single banderilla stick
 * into a 30-piece case under the same handle), so check the listing before
 * copying its price across.
 *
 * "new" is noisy for suppliers whose importer reads only some collections;
 * those products were left out on purpose.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import type { Product } from '../../src/payload-types'
import { fetchJson, toAed, type ShopifyProduct } from '../seed/lib/shopify-source'

interface Source {
  provider: string
  store: string
  /** Source price → AED, exactly as the importer converts it. */
  toCatalogue: (price: string) => number
}

const SOURCES: Source[] = [
  { provider: 'intermex', store: 'https://intermexuae.com', toCatalogue: Number },
  { provider: 'velsoro', store: 'https://www.velsoro.com', toCatalogue: Number },
  { provider: 'caputo', store: 'https://caputoflour.com', toCatalogue: toAed },
  { provider: 'garcia-de-la-cruz', store: 'https://garciadelacruzoliveoil.com', toCatalogue: toAed },
]

/** Not comparable: Casinetto's products.json answers 403; Admiral is scraped. */
const UNCHECKED = ['casinetto', 'admiral-caviar']

async function fetchStore(store: string): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = []
  for (let page = 1; ; page++) {
    const { products } = await fetchJson<{ products: ShopifyProduct[] }>(
      `${store}/products.json?limit=250&page=${page}`,
    )
    all.push(...products)
    if (products.length < 250) return all
  }
}

const money = (n: number) => n.toFixed(2)

async function main() {
  const payload = await getPayload({ config })
  let issues = 0

  for (const source of SOURCES) {
    const { docs } = await payload.find({
      collection: 'products',
      where: { 'source.provider': { equals: source.provider } },
      limit: 0,
      pagination: false,
      depth: 0,
    })
    const ours = docs as Product[]
    const theirs = await fetchStore(source.store)
    const byHandle = new Map(theirs.map((p) => [p.handle, p]))
    const carried = new Set(ours.map((p) => p.source?.handle))

    const price: string[] = []
    const stock: string[] = []
    const gone: string[] = []

    for (const product of ours) {
      const listing = byHandle.get(product.source?.handle ?? '')
      if (!listing) {
        gone.push(`${product.slug}  (${product._status})`)
        continue
      }

      const ourPrices = product.variants.map((v) => v.price)
      const theirPrices = listing.variants.map((v) => source.toCatalogue(v.price))
      const differs =
        ourPrices.length !== theirPrices.length ||
        ourPrices.some((p, i) => Math.abs(p - theirPrices[i]!) > 0.005)
      if (differs) {
        price.push(
          `${product.slug}: ours ${ourPrices.map(money).join(' / ')}  →  theirs ${theirPrices.map(money).join(' / ')}  ("${listing.title}")`,
        )
      }

      const oursInStock = product.variants.some((v) => v.inStock !== false)
      const theirsInStock = listing.variants.some((v) => v.available)
      if (oursInStock && !theirsInStock) stock.push(`${product.slug}: in stock here, sold out there`)
      if (!oursInStock && theirsInStock) stock.push(`${product.slug}: out of stock here, available there`)
    }

    const added = theirs
      .filter((p) => !carried.has(p.handle))
      .map((p) => `${p.handle}  (${p.variants[0]?.price ?? '?'}, ${p.images.length} image${p.images.length === 1 ? '' : 's'})`)

    console.log(`\n══ ${source.provider}  —  ${ours.length} carried, ${theirs.length} in their store`)
    for (const [label, rows] of [
      ['price', price],
      ['stock', stock],
      ['gone from their store', gone],
      ['in their store, not carried', added],
    ] as const) {
      console.log(`  ${label}: ${rows.length}`)
      for (const row of rows) console.log(`    ${row}`)
    }
    issues += price.length + stock.length + gone.length
  }

  console.log(`\nnot checked: ${UNCHECKED.join(', ')}`)
  console.log(`${issues} price/stock/gone difference${issues === 1 ? '' : 's'}\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
