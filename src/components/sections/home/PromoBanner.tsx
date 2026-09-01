import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import type { Banner, Media } from '@/payload-types'

function bannerImage(banner: Banner): string | null {
  if (typeof banner.image === 'object' && banner.image !== null) {
    const media = banner.image as Media
    return media.sizes?.hero?.url ?? media.sizes?.card?.url ?? media.url ?? null
  }
  return null
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

interface PromoBannerProps {
  banner: Banner
}

export function PromoBanner({ banner }: PromoBannerProps) {
  const imgUrl = bannerImage(banner)
  const theme = banner.theme ?? 'dark'
  const t = tones(theme, !!imgUrl)
  const href = banner.ctaHref || '/products'

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

  // Wide and split share the image-band treatment; only the ratio differs
  const ratio = banner.variant === 'split' ? 'aspect-2/1 md:aspect-5/2' : 'aspect-2/1 md:aspect-[4/1]'

  return (
    <FadeIn>
      <Link
        href={href}
        className={`group relative flex items-center overflow-hidden rounded-sm no-underline ${ratio} ${
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

        <div className="relative z-10 max-w-lg px-5 md:px-8 py-5">
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
            <p className={`font-sans text-[12px] md:text-[13px] m-0 mt-2 leading-relaxed ${t.body}`}>
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
      </Link>
    </FadeIn>
  )
}
