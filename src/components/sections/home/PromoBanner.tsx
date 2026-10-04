import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { formatPrice, getBrandName, getImageUrl, getPrice } from '@/lib/product'
import type { Banner, Media, Product } from '@/payload-types'

function bannerImage(banner: Banner): string | null {
  if (typeof banner.image === 'object' && banner.image !== null) {
    const media = banner.image as Media
    return media.sizes?.hero?.url ?? media.sizes?.card?.url ?? media.url ?? null
  }
  return null
}

/**
 * The product an editor pinned to the banner, when it can still be sold from
 * here. A product unpublished after the banner was set would otherwise be
 * advertised with a link to a 404, and one fetched without its photo (depth too
 * shallow) has nothing to show.
 */
function featuredProduct(banner: Banner): Product | null {
  const product = banner.product
  if (typeof product !== 'object' || product === null) return null
  if (product._status !== 'published' || !getImageUrl(product)) return null
  return product
}

const SURFACE: Record<string, string> = {
  dark: 'bg-obsidian',
  forest: 'bg-forest-green',
  light: 'bg-parchment',
}

/** Text tones per theme — `light` reads dark-on-parchment. */
function tones(theme: string, hasImage: boolean) {
  const onDark = theme !== 'light' || hasImage
  return {
    eyebrow: onDark ? 'text-gold' : 'text-forest-green',
    heading: onDark ? 'text-cream' : 'text-obsidian',
    body: onDark ? 'text-cream/75' : 'text-stone',
    cta: onDark
      ? 'bg-cream/95 text-obsidian group-hover:bg-forest-green group-hover:text-cream'
      : 'bg-forest-green text-cream group-hover:bg-obsidian',
  }
}

/**
 * The featured product as a small white card on the right of the banner.
 *
 * Catalogue photos arrive on white, on cream, on transparent and as full
 * lifestyle shots, so the photo is contained on white rather than cropped into
 * the banner — and `mix-blend-multiply` melts a white backdrop into the card so
 * a packshot doesn't sit in a visible box.
 */
function ProductPanel({ product }: { product: Product }) {
  const imageUrl = getImageUrl(product)!
  const price = getPrice(product)
  const brand = getBrandName(product)

  return (
    <div className="ml-auto shrink-0 w-28 sm:w-36 md:w-40 rounded-sm bg-white p-2 md:p-2.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-out group-hover:-translate-y-1">
      <div className="relative aspect-square">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 112px, 160px"
          className="object-contain mix-blend-multiply"
        />
      </div>
      <div className="mt-2 px-0.5">
        {brand && (
          <p className="m-0 truncate font-heading text-[8px] uppercase tracking-[0.2em] font-semibold leading-none text-stone/60">
            {brand}
          </p>
        )}
        <p className="m-0 mt-1 line-clamp-2 font-luxury italic text-[12px] md:text-[13px] leading-snug text-obsidian">
          {product.title}
        </p>
        {price && (
          <p className="m-0 mt-1 font-heading text-[11px] font-semibold leading-none text-forest-green">
            {formatPrice(price.amount, price.currency)}
          </p>
        )}
      </div>
    </div>
  )
}

interface PromoBannerProps {
  banner: Banner
}

export function PromoBanner({ banner }: PromoBannerProps) {
  const imgUrl = bannerImage(banner)
  const theme = banner.theme ?? 'dark'
  const t = tones(theme, !!imgUrl)
  const product = banner.variant === 'strip' ? null : featuredProduct(banner)
  const href = banner.ctaHref || (product ? `/products/${product.slug}` : '/products')

  // Slim text bar — no image, sits tight between sections
  if (banner.variant === 'strip') {
    return (
      <FadeIn>
        <Link
          href={href}
          className={`group flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3.5 rounded-sm no-underline overflow-hidden relative ${
            imgUrl ? 'bg-obsidian' : SURFACE[theme]
          }`}
        >
          {imgUrl && (
            <>
              <Image src={imgUrl} alt="" fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-obsidian/70" />
            </>
          )}
          <span className="relative z-10 flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
            {banner.eyebrow && (
              <span
                className={`font-heading text-[9px] uppercase tracking-[0.18em] font-semibold ${t.eyebrow}`}
              >
                {banner.eyebrow}
              </span>
            )}
            {banner.heading && (
              <span className={`font-luxury text-sm md:text-base font-semibold ${t.heading}`}>
                {banner.heading}
              </span>
            )}
            {banner.subheading && (
              <span className={`font-sans text-[12px] ${t.body}`}>{banner.subheading}</span>
            )}
          </span>
          {banner.ctaLabel && (
            <span
              className={`relative z-10 shrink-0 inline-flex items-center h-8 px-3.5 rounded-sm font-heading text-[9px] uppercase tracking-[0.14em] font-semibold transition-colors ${t.cta}`}
            >
              {banner.ctaLabel}
            </span>
          )}
        </Link>
      </FadeIn>
    )
  }

  // Wide and split share the image-band treatment; only the ratio differs. The
  // ratio is a floor, not a fixed height: a zero-width spacer's percentage
  // padding (which resolves against the banner's width) holds it open, so copy
  // or a product panel taller than the ratio grows the banner instead of being
  // clipped by overflow-hidden — which an `aspect-*` box would do.
  const floor = banner.variant === 'split' ? 'pb-[50%] md:pb-[40%]' : 'pb-[50%] md:pb-[25%]'

  // h-full on both: paired splits sit in a grid row, which stretches the FadeIn
  // wrapper — the link has to follow it, or the shorter banner ends early.
  return (
    <FadeIn className="h-full">
      <Link
        href={href}
        className={`group relative flex h-full items-center overflow-hidden rounded-sm no-underline ${
          imgUrl ? 'bg-charcoal' : SURFACE[theme]
        }`}
      >
        {imgUrl && (
          <>
            <Image
              src={imgUrl}
              alt=""
              fill
              sizes={banner.variant === 'split' ? '(max-width: 768px) 100vw, 50vw' : '100vw'}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-r from-obsidian/90 via-obsidian/60 to-obsidian/20" />
          </>
        )}

        <span aria-hidden="true" className={`block w-0 shrink-0 ${floor}`} />

        <div className="relative z-10 flex flex-1 min-w-0 items-center gap-4 md:gap-6 px-5 md:px-8 py-5">
          <div className="min-w-0 max-w-lg">
            {banner.eyebrow && (
              <p
                className={`font-heading text-[9px] md:text-[10px] uppercase tracking-[0.18em] font-semibold m-0 ${t.eyebrow}`}
              >
                {banner.eyebrow}
              </p>
            )}
            {banner.heading && (
              <p
                className={`font-luxury font-semibold m-0 mt-1.5 leading-tight tracking-tight text-lg md:text-2xl ${t.heading}`}
              >
                {banner.heading}
              </p>
            )}
            {banner.subheading && (
              // Beside a product panel a phone has room for the heading and the
              // button, not a paragraph as well.
              <p
                className={`font-sans text-[12px] md:text-[13px] m-0 mt-2 leading-relaxed ${t.body} ${
                  product ? 'hidden sm:block' : ''
                }`}
              >
                {banner.subheading}
              </p>
            )}
            {banner.ctaLabel && (
              <span
                className={`inline-flex items-center h-9 px-4 mt-4 rounded-sm font-heading text-[10px] uppercase tracking-[0.14em] font-semibold transition-colors ${t.cta}`}
              >
                {banner.ctaLabel}
              </span>
            )}
          </div>

          {product && <ProductPanel product={product} />}
        </div>
      </Link>
    </FadeIn>
  )
}
