import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'
import type { Region } from '@/lib/regions'

interface RegionCardsProps {
  /** Resolved regions — CMS rows merged over the bundled table. */
  regions: Region[]
}

/**
 * One scrolling row of region cards.
 *
 * Every region sits on a single line at every breakpoint: below xl the row
 * scrolls sideways with scroll-snap, and at xl the tiles flex to fill the row
 * exactly however many regions are active — so hiding one in the CMS closes the
 * gap instead of leaving a hole.
 *
 * Which products a region holds is derived from origin.country; these cards only
 * present it. See src/lib/regions.ts.
 */
export function RegionCards({ regions }: RegionCardsProps) {
  if (regions.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Shop by Region" href="/categories" className="mb-5 md:mb-7" />

      {/* The scrollbar is hidden rather than styled — the row is short and the
          snap points make the overflow obvious enough on touch. */}
      <div
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {regions.map((region, i) => {
          const { eyebrow, label, image: imgUrl } = region

          return (
            <FadeIn
              key={region.slug}
              delay={i * 0.06}
              className="snap-start shrink-0 grow-0 basis-[46%] sm:basis-[32%] md:basis-[25%] lg:basis-[20%] xl:shrink xl:grow xl:basis-0 xl:min-w-0"
            >
              <Link
                href={`/products?region=${region.slug}`}
                className="group relative block no-underline overflow-hidden rounded-sm aspect-3/4 bg-charcoal"
              >
                {imgUrl && (
                  <Image
                    src={imgUrl}
                    alt={label}
                    fill
                    sizes="(max-width: 768px) 46vw, (max-width: 1280px) 25vw, 14vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                {/* Strong bottom scrim — the region artwork is busy and bright */}
                <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/55 to-obsidian/10 transition-opacity duration-500 opacity-90 group-hover:opacity-100" />

                <div className="absolute inset-0 z-10 flex flex-col justify-end p-3 md:p-4">
                  <p className="font-sans text-[10px] text-cream/70 m-0 leading-none">{eyebrow}</p>
                  <h3 className="m-0! mt-1!">
                    <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-sm md:text-base lg:text-lg">
                      {label}
                    </span>
                  </h3>

                  <span className="mt-2.5 w-7 h-7 shrink-0 rounded-pill border border-cream/50 text-cream flex items-center justify-center transition-colors group-hover:bg-cream group-hover:text-obsidian">
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}
