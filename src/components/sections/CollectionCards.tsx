'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import type { ProductCollection, Media } from '@/payload-types'

/** Static fallback images for known collection slugs */
const STATIC_IMAGES: Record<string, string> = {
  'caviar-selection': '/images/collections/caviar.avif',
  'truffle-treasury': '/images/collections/pantry.avif',
  'grand-cru-cocoa-chocolat': '/images/collections/coco.avif',
  'heritage-extra-virgin-oils': '/images/collections/oils.avif',
  'rare-estate-honey': '/images/collections/honey.avif',
  'aged-balsamic-vinegars': '/images/collections/vinegar.avif',
  'mediterranean-olive-reserve': '/images/collections/olives.avif',
  'single-origin-spices': '/images/collections/spices.avif',
  'signature-gourmet-spreads': '/images/collections/spreads.avif',
  'fromagerie-selection': '/images/collections/Fromagerie.avif',
  'artisan-heritage-breads': '/images/collections/breads.avif',
  'specialty-coffee-reserve': '/images/collections/coffee.avif',
  'botanical-seed-selection': '/images/collections/seeds.avif',
  'curated-fine-beverages': '/images/collections/beverages.avif',
  'bespoke-tableware-cutlery': '/images/collections/cutlery.avif',
}

function getCollectionImage(col: ProductCollection): string | null {
  // Prefer static images bundled in public/ — they survive container restarts
  if (STATIC_IMAGES[col.slug]) return STATIC_IMAGES[col.slug]

  if (typeof col.image === 'object' && col.image !== null) {
    const media = col.image as Media
    return media.sizes?.hero?.url ?? media.sizes?.card?.url ?? media.url ?? null
  }
  return null
}

interface CollectionCardsProps {
  collections: ProductCollection[]
}

export function CollectionCards({ collections }: CollectionCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (collections.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.7
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="bg-cream py-12 md:py-16 lg:py-24 overflow-hidden">
      <div className="px-5 md:px-6 lg:px-16 flex items-center justify-between mb-5 md:mb-6 lg:mb-8">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium m-0 mb-2 md:mb-3">
            Curated Excellence
          </p>
          <h2 className="font-luxury text-xl md:text-2xl lg:text-[36px] font-normal m-0 text-obsidian tracking-tight">
            The Collection
          </h2>
        </FadeIn>

        {/* Carousel arrows */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 border border-obsidian/15 bg-transparent text-obsidian/50 hover:text-obsidian hover:border-obsidian/40 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Previous"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 border border-obsidian/15 bg-transparent text-obsidian/50 hover:text-obsidian hover:border-obsidian/40 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Next"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Scrollable carousel */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-pl-5 md:scroll-pl-6 lg:scroll-pl-16"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex gap-4 w-fit">
            <div className="w-5 md:w-6 lg:w-16 shrink-0" />
            {collections.map((col, i) => {
              const imgUrl = getCollectionImage(col)
              return (
                <FadeIn key={col.id} delay={i * 0.04}>
                  <Link
                    href={`/products?collection=${col.slug}`}
                    className="group shrink-0 snap-start block no-underline w-[40vw] sm:w-[35vw] md:w-[28vw] lg:w-[18vw] min-w-[140px]"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-charcoal">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={col.title}
                          fill
                          sizes="(max-width: 1024px) 43vw, 19vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-charcoal" />
                      )}

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-obsidian/80 via-obsidian/40 to-obsidian/10 transition-opacity duration-500 group-hover:from-obsidian/90" />

                      {/* Text at the bottom */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 lg:p-5">
                        <h3 className="font-sans text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide text-cream m-0 leading-snug">
                          {col.title}
                        </h3>
                        {col.description && (
                          <p className="hidden sm:block text-[11px] text-cream/70 m-0 mt-0.5 leading-relaxed line-clamp-2">
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              )
            })}
            <div className="w-5 md:w-6 lg:w-16 shrink-0" />
          </div>
        </div>
      </div>
    </section>
  )
}
