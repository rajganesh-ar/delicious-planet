/**
 * Harvest the Admiral Caviar catalogue into a JSON feed.
 *
 *   pnpm scrape:admiral            all products from the sitemap
 *   pnpm scrape:admiral --limit=2  first two, for a quick check
 *
 * Writes md/seed/data/admiral-caviar.json, which `pnpm import:admiral` then
 * loads. Harvest and import are separate on purpose: this half drives a real
 * browser and is slow and network-flaky, while the import half is fast, offline
 * and idempotent. Keeping the harvested feed on disk means a re-import does not
 * mean a re-scrape, and the exact data a run was built from stays reviewable.
 *
 * Why a browser at all. The store is Ecwid, whose public JSON APIs are shut:
 * v1 is retired and v3 needs a private token. The page ships JSON-LD, but its
 * `offers.price` is only the default size — Royal Beluga advertises 1200 AED
 * there while its sizes actually run 450 (30g) to 6000 (500g). Prices per size
 * exist nowhere in the static HTML; Ecwid computes them client-side. So each
 * size option is really clicked and the rendered price really read.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium, type Page } from '@playwright/test'

const STORE = 'https://store.admiralcaviar.ae'
const SITEMAP = `${STORE}/sitemap.xml`

const __dirname_ = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname_, 'data', 'admiral-caviar.json')

const argv = process.argv.slice(2)
const LIMIT = Number(argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 0)

export interface HarvestedSize {
  size: string
  price: number
  /** Only present when the supplier's own compare-at is internally consistent. */
  compareAt?: number
  inStock: boolean
}

export interface HarvestedProduct {
  url: string
  handle: string
  /** Ecwid product id, from the canonical /products/Name-p<id> link. */
  externalId: string
  title: string
  /** SEO title from JSON-LD — kept for the meta description, not the title. */
  seoTitle?: string
  metaDescription?: string
  sku?: string
  gtin?: string
  breadcrumb: string[]
  /** Full details text, after expanding "Show More". */
  detailsText: string
  images: string[]
  sizes: HarvestedSize[]
  /** Price when the product has no size options at all. */
  singlePrice?: number
  singleCompareAt?: number
  inStock: boolean
  /** Set when the harvest could not trust its own price reads. */
  priceWarning?: string
}

/**
 * "د.إ1 200.00" → 1200, "was د.إ1 500.00 Save 20%" → 1500.
 *
 * The dirham glyph "د.إ" contains a full stop of its own, so the obvious
 * "strip everything that is not a digit or a separator" leaves a leading "."
 * and parses 396.00 as 0.396 — a hundredfold price error that still looks like
 * a plausible number. The currency is therefore blanked first and the numeric
 * run matched explicitly. Thousands are separated by a space, decimals by a dot.
 */
function parsePrice(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined
  const cleaned = raw.replace(/[^\d.,\s ]/g, ' ')
  const m = cleaned.match(/\d{1,3}(?:[\s ,]\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?/)
  if (!m) return undefined
  const n = parseFloat(m[0].replace(/[\s ,]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

async function productUrls(): Promise<string[]> {
  const xml = await (await fetch(SITEMAP, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!)
  return locs.filter((u) => /\/products\/[^/]+$/.test(u))
}

async function harvest(page: Page, url: string): Promise<HarvestedProduct | null> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 })
  await page.waitForTimeout(2000)

  // A category page renders an h1 and a product grid but no price block. Those
  // share the /products/ prefix in the sitemap, so they are filtered here
  // rather than by guessing from the slug.
  const isProduct = await page.evaluate(
    () => document.querySelector('.details-product-price__value') !== null,
  )
  if (!isProduct) return null

  // The details body is clamped behind a "Show More" toggle; without expanding
  // it the description loses the species, maturity and roe-size lines that are
  // the substance of a caviar listing.
  for (const label of ['Show More', 'Show more']) {
    const btn = page.getByText(label, { exact: true }).first()
    if (await btn.count().then((c) => c > 0).catch(() => false)) {
      await btn.click({ timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(500)
      break
    }
  }

  const base = await page.evaluate(() => {
    const text = (sel: string) => document.querySelector(sel)?.textContent?.trim() ?? undefined
    const ldRaw = document.querySelector('script[type="application/ld+json"]')?.textContent
    let ld: Record<string, unknown> = {}
    try {
      ld = ldRaw ? JSON.parse(ldRaw) : {}
    } catch {
      ld = {}
    }

    const images = Array.isArray(ld.image)
      ? (ld.image as Array<{ contentUrl?: string }>)
          .map((i) => i.contentUrl)
          .filter((u): u is string => typeof u === 'string')
      : []

    // The canonical in-store link carries the Ecwid product id as a -p<id>
    // suffix; it is the only stable key the page exposes.
    const idLink = [...document.querySelectorAll('a[href*="-p"], link[href*="-p"]')]
      .map((a) => a.getAttribute('href') ?? '')
      .concat(JSON.stringify(ld))
      .join(' ')
    const externalId = idLink.match(/-p(\d{6,})/)?.[1] ?? images[0]?.match(/products\/(\d+)\//)?.[1]

    const details =
      (document.querySelector('#tile-product-details') as HTMLElement | null)?.innerText ??
      (document.body as HTMLElement).innerText

    return {
      title: text('h1'),
      seoTitle: typeof ld.name === 'string' ? ld.name : undefined,
      metaDescription: typeof ld.description === 'string' ? ld.description : undefined,
      sku: typeof ld.sku === 'string' ? ld.sku : undefined,
      gtin: typeof ld.gtin12 === 'string' ? ld.gtin12 : undefined,
      externalId,
      images,
      breadcrumb: (document.querySelector('.ec-breadcrumbs')?.textContent ?? '')
        .split('/')
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean),
      detailsText: (details ?? '').replace(/\n{2,}/g, '\n').trim(),
      sizeValues: [...document.querySelectorAll('input[name="Size"]')].map((i) => ({
        value: (i as HTMLInputElement).value,
        id: i.id,
      })),
    }
  })

  const readPrice = () =>
    page.evaluate(() => {
      // Scoped to the first stock label in the details tile. Testing the tile's
      // whole innerText marks everything out of stock, because the related-
      // products strip below it carries its own "Out of stock" badges — and the
      // main product's label always precedes them in document order.
      const root = document.querySelector('#tile-product-details') ?? document.body
      let stockLabel: string | null = null
      for (const e of root.querySelectorAll('*')) {
        if (e.children.length !== 0) continue
        const t = (e.textContent ?? '').trim()
        if (/^(in stock|out of stock|sold out)$/i.test(t)) {
          stockLabel = t
          break
        }
      }
      return {
        price: document.querySelector('.details-product-price__value')?.textContent ?? null,
        was:
          document.querySelector('.details-product-price-compare__container')?.textContent ?? null,
        outOfStock: stockLabel !== null && !/^in stock$/i.test(stockLabel),
      }
    })

  /**
   * Read every size once, waiting for Ecwid's price request to land after each
   * click. A fixed sleep is not enough: at 900 ms the Imperial Osetra silently
   * reported its 250 g price for 500 g, 30 g and 50 g alike, which is the worst
   * kind of scrape bug because every value still looks like a real price.
   */
  async function readSizes(settleMs: number): Promise<HarvestedSize[]> {
    const out: HarvestedSize[] = []
    for (const s of base.sizeValues) {
      await page.click(`label[for="${s.id}"]`, { timeout: 15_000 })
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
      await page.waitForTimeout(settleMs)
      const r = await readPrice()
      const price = parsePrice(r.price)
      if (price === undefined) continue
      out.push({ size: s.value, price, compareAt: parsePrice(r.was), inStock: !r.outOfStock })
    }
    return out
  }

  /**
   * Caviar is sold by weight, so within one product a heavier tin must cost
   * more than a lighter one. Any violation means a stale read rather than a
   * real price, and is the only automatic way to catch one.
   */
  function pricesLookSane(list: HarvestedSize[]): boolean {
    const weighed = list
      .map((s) => ({ ...s, grams: parseFloat(s.size) }))
      .filter((s) => Number.isFinite(s.grams))
      .sort((a, b) => a.grams - b.grams)
    if (weighed.length < 2) return true
    return weighed.every((s, i) => i === 0 || s.price > weighed[i - 1]!.price)
  }

  const sizes: HarvestedSize[] = []
  let singlePrice: number | undefined
  let singleCompareAt: number | undefined
  let priceWarning: string | undefined

  if (base.sizeValues.length === 0) {
    const r = await readPrice()
    singlePrice = parsePrice(r.price)
    singleCompareAt = parsePrice(r.was)
  } else {
    let read = await readSizes(700)
    if (!pricesLookSane(read)) {
      // One retry with a much longer settle before giving up on the product.
      read = await readSizes(2500)
      if (!pricesLookSane(read)) {
        priceWarning = 'prices are not monotonic by weight — a stale read survived the retry'
      }
    }
    sizes.push(...read)
  }

  const stock = await readPrice()

  return {
    url,
    handle: url.split('/').pop()!,
    externalId: base.externalId ?? url.split('/').pop()!,
    title: base.title ?? '',
    seoTitle: base.seoTitle,
    metaDescription: base.metaDescription,
    sku: base.sku,
    gtin: base.gtin,
    breadcrumb: base.breadcrumb,
    detailsText: base.detailsText,
    images: base.images,
    sizes,
    singlePrice,
    singleCompareAt,
    inStock: !stock.outOfStock,
    priceWarning,
  }
}

async function main() {
  let urls = await productUrls()
  if (LIMIT > 0) urls = urls.slice(0, LIMIT)
  console.log(`\nAdmiral Caviar harvest — ${urls.length} candidate URL(s) from the sitemap\n`)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })

  // tsx compiles with esbuild's `keepNames`, which rewrites the functions passed
  // to page.evaluate to call a `__name` helper. That helper is defined in the
  // Node bundle, not in the page, so every evaluate throws
  // "ReferenceError: __name is not defined". Injected as a raw string so the
  // compiler cannot rewrite the shim itself.
  await page.addInitScript({ content: 'globalThis.__name = globalThis.__name || ((fn) => fn)' })

  const products: HarvestedProduct[] = []
  const skipped: string[] = []

  for (const url of urls) {
    try {
      const p = await harvest(page, url)
      if (!p) {
        skipped.push(`${url} — category page, no price block`)
        console.log(`   skip    ${url.split('/').pop()}`)
        continue
      }
      products.push(p)
      const range = p.sizes.length
        ? `${Math.min(...p.sizes.map((s) => s.price))}–${Math.max(...p.sizes.map((s) => s.price))} AED over ${p.sizes.length} size(s)`
        : `${p.singlePrice} AED`
      console.log(`   ok      ${p.title}  ${range}, ${p.images.length} image(s)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      skipped.push(`${url} — ${msg}`)
      console.log(`   FAIL    ${url.split('/').pop()} — ${msg.split('\n')[0]}`)
    }
  }

  await browser.close()

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(
    OUT,
    JSON.stringify({ harvestedAt: new Date().toISOString(), store: STORE, products, skipped }, null, 2),
  )
  console.log(`\nharvested ${products.length} product(s) → ${path.relative(process.cwd(), OUT)}`)
  if (skipped.length) {
    console.log(`skipped ${skipped.length}:`)
    for (const s of skipped) console.log(`  · ${s}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nharvest failed:', err)
    process.exit(1)
  })
