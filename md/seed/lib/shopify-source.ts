/**
 * Shared machinery for importing a supplier's Shopify storefront into the
 * catalogue. One module so that two importers cannot drift apart on the things
 * that must stay identical across suppliers — the currency peg, the image
 * pipeline, and the media de-duplication key.
 *
 * Per-supplier concerns deliberately stay in the importer that owns them: which
 * category a collection lands in, how a size is spelled, which dietary claims
 * are true. Those differ per feed and are meant to be read and argued with.
 */
import type { Payload } from 'payload'

// ─── Shopify shapes (only the fields these importers read) ───────────────────

export interface ShopifyImage {
  id: number
  src: string
  position: number
  variant_ids: number[]
  alt?: string | null
}

export interface ShopifyVariant {
  id: number
  title: string
  // Shopify allows three option axes. Food lines use one (size); apparel uses
  // two (colour and size), and the orderable unit is the combination.
  option1: string | null
  option2: string | null
  option3: string | null
  sku: string | null
  price: string
  compare_at_price: string | null
  grams: number
  available: boolean
  featured_image: { src: string } | null
}

export interface ShopifyProduct {
  id: number
  title: string
  handle: string
  body_html: string
  vendor: string
  product_type: string
  tags: string[]
  images: ShopifyImage[]
  variants: ShopifyVariant[]
}

// ─── Currency ────────────────────────────────────────────────────────────────

/**
 * AED has been pegged to USD at 3.6725 since 1997. This is a currency peg, not
 * a market rate: it does not need refreshing, and replacing it with a live rate
 * would make identical imports produce different prices.
 */
export const USD_TO_AED = 3.6725

export function toAed(usd: string | number): number {
  const n = typeof usd === 'string' ? parseFloat(usd) : usd
  return Math.round(n * USD_TO_AED * 100) / 100
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (compatible; delicious-planet-importer/1.0)'

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return (await res.json()) as T
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return await res.text()
}

/**
 * Fetch a page through the system `curl` instead of Node's fetch.
 *
 * Some storefronts sit behind a bot filter that fingerprints the TLS and HTTP/2
 * handshake rather than the headers — Casinetto answers curl with 200 and Node
 * with 403 for the identical request, no matter what headers are set. Reaching
 * for curl is the smallest honest workaround: the same public page a browser
 * would load, fetched by a client the filter accepts.
 *
 * Arguments are passed as an array, never a shell string, so a URL cannot break
 * out into the shell.
 */
export async function fetchTextViaCurl(url: string): Promise<string> {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const run = promisify(execFile)
  const { stdout } = await run(
    'curl',
    [
      '-sSL',
      '--compressed',
      '--max-time',
      '60',
      '-A',
      UA_BROWSER,
      '-H',
      'Accept-Language: en-US,en;q=0.9',
      '-H',
      'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      url,
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  )
  return stdout
}

const UA_BROWSER =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/**
 * Shopify's CDN transcodes on request, but only when the client says it accepts
 * webp — `&format=webp` alone is ignored without the Accept header. Asking for
 * webp at native width turns a 2 MB PNG into a couple of hundred KB with no
 * resolution loss, which across a hundred-odd images is the difference between
 * a minute and ten.
 */
function cdnWebp(src: string): string {
  const join = src.includes('?') ? '&' : '?'
  return `${src}${join}width=2000&format=webp`
}

export async function fetchImage(src: string): Promise<Buffer> {
  const res = await fetch(cdnWebp(src), {
    headers: { 'User-Agent': UA, Accept: 'image/webp,image/*' },
  })
  if (!res.ok) throw new Error(`GET image ${src} → ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/** What a fetcher hands back: the bytes plus what they actually are. */
export interface FetchedImage {
  data: Buffer
  mimetype: string
  ext: string
}

/** Shopify CDN: ask for webp at native width. The default for Shopify feeds. */
export const shopifyImageFetcher = async (src: string): Promise<FetchedImage> => ({
  data: await fetchImage(src),
  mimetype: 'image/webp',
  ext: 'webp',
})

/**
 * Any other host: take the bytes as served and believe the Content-Type.
 * Used for storefronts that are not Shopify and offer no transcoding, where
 * asking for webp would just get the original back under a wrong extension.
 */
export const plainImageFetcher = async (src: string): Promise<FetchedImage> => {
  const res = await fetch(src, { headers: { 'User-Agent': UA, Accept: 'image/*' } })
  if (!res.ok) throw new Error(`GET image ${src} → ${res.status}`)
  const mimetype = (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0]!.trim()
  const ext = mimetype.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
  return { data: Buffer.from(await res.arrayBuffer()), mimetype, ext }
}

/** Barcodes are absent from products.json but present on the per-product .js. */
export async function fetchBarcodes(store: string, handle: string): Promise<Map<number, string>> {
  const out = new Map<number, string>()
  try {
    const p = await fetchJson<{ variants: Array<{ id: number; barcode?: string }> }>(
      `${store}/products/${handle}.js`,
    )
    for (const v of p.variants) if (v.barcode) out.set(v.id, v.barcode)
  } catch {
    // A missing barcode is not worth failing an import over.
  }
  return out
}

// ─── Copy parsing ────────────────────────────────────────────────────────────

export function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Strip embedded media, scripts and form controls out of a supplier's
 * description HTML before it is converted to Lexical.
 *
 * `convertHTMLToLexical` turns an `<img>` into an upload node pointing at a
 * media document that does not exist here, and Payload rejects the whole field
 * as invalid — so a single stray image in a description fails the product. Some
 * Shopify descriptions also paste an entire rendered page section into the body,
 * bringing scripts and an add-to-cart form with them.
 *
 * Elements are removed with their content; `<img>` and friends are void so only
 * the tag needs dropping.
 */
export function sanitizeDescriptionHtml(html: string): string {
  const withContent = ['script', 'style', 'noscript', 'svg', 'iframe', 'form', 'select', 'button']
  const voidTags = ['img', 'source', 'input', 'track', 'embed']

  let out = html
  for (const tag of withContent) {
    out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'gi'), ' ')
  }
  for (const tag of voidTags) {
    out = out.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'gi'), ' ')
  }
  // <picture>/<video>/<audio> wrappers are left behind once their sources are
  // gone; drop the now-empty shells rather than leaving stray tags.
  out = out.replace(/<\/?(picture|video|audio)\b[^>]*>/gi, ' ')
  return out
}

/** The lead paragraph, cut at a word boundary — this is the listing-card blurb. */
export function shortDescription(html: string, max = 200): string {
  // The *first* paragraph is often not the lead: suppliers open with an image
  // wrapper or a bare brand stamp, which once stripped leaves "" or
  // "INTERMEXUAE" as the card blurb. Take the first paragraph that actually
  // says something, and fall back to the whole body when none does.
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => plainText(m[1]!))
  const lead = paragraphs.find((t) => t.length >= 40) ?? plainText(html)

  if (lead.length <= max) return lead
  const cut = lead.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…'
}

/**
 * Strike a false claim out of a supplier's prose before it is stored.
 *
 * Fixing a structured `dietary` flag alone is not enough: the description
 * renders the supplier's own bullet list verbatim next to it, so a shopper
 * avoiding dairy would still read "Vegan-friendly" on a cheese-stuffed olive.
 * Removes the claim and the bullet separator that led it, then tidies up.
 */
export function strikeClaims(html: string, claims: string[] | undefined): string {
  if (!claims?.length) return html
  let out = html
  for (const claim of claims) {
    const escaped = claim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out
      .replace(new RegExp(`\\s*•\\s*${escaped}(?=\\s*[•.])`, 'gi'), '')
      .replace(new RegExp(`${escaped}\\s*•\\s*`, 'gi'), '')
  }
  return out.replace(/\s{2,}/g, ' ')
}

// ─── Media ───────────────────────────────────────────────────────────────────

/**
 * Resolves a Shopify image URL to a media id, uploading it once.
 *
 * `media.sourceUrl` is the de-duplication key rather than the filename, because
 * filenames collide across products — two suppliers, or two products from one
 * supplier, can each ship a "Garlic-1.jpg", and matching on filename would wire
 * the wrong picture onto the second one.
 *
 * `skipImages` skips the *upload*, not the lookup. An update still has to
 * resolve every image it already has: `images` is required with minRows 1, so a
 * re-run that returned nothing would strip the gallery off every product it
 * touched.
 */
export function createMediaResolver(
  payload: Payload,
  opts: {
    skipImages: boolean
    /** Defaults to the Shopify webp transform; pass plainImageFetcher for other hosts. */
    fetcher?: (src: string) => Promise<FetchedImage>
  },
) {
  const cache = new Map<string, number | string>()
  const fetcher = opts.fetcher ?? shopifyImageFetcher
  let uploaded = 0

  return {
    /** Images resolved this run, whether uploaded now or already in the library. */
    get resolvedCount() {
      return cache.size
    },
    /** Images actually fetched and uploaded — the rest were already stored. */
    get uploadCount() {
      return uploaded
    },
    /**
     * `filenameBase` carries no extension — the fetcher decides it, since only
     * the fetcher knows what the bytes turned out to be.
     */
    async resolve(src: string, alt: string, filenameBase: string) {
      if (cache.has(src)) return cache.get(src)!

      const existing = await payload.find({
        collection: 'media',
        where: { sourceUrl: { equals: src } },
        limit: 1,
        depth: 0,
      })
      if (existing.docs[0]) {
        cache.set(src, existing.docs[0].id)
        return existing.docs[0].id
      }

      if (opts.skipImages) return undefined

      const { data, mimetype, ext } = await fetcher(src)
      const doc = await payload.create({
        collection: 'media',
        data: { alt, sourceUrl: src },
        file: { data, name: `${filenameBase}.${ext}`, mimetype, size: data.length },
      })
      cache.set(src, doc.id)
      uploaded += 1
      return doc.id
    },
  }
}
