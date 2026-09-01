'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from '@/components/sections/home/SectionHeader'
import { getCollectionImage } from '@/lib/images'
import type { ProductCollection } from '@/payload-types'

interface CollectionCardsProps {
  collections: ProductCollection[]
  /** Set false inside a container that already provides horizontal gutters. */
  padded?: boolean
}

export function CollectionCards({ collections, padded = true }: CollectionCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (collections.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.7
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const pad = padded ? 'px-5 md:px-8 lg:px-16' : ''
  const edge = padded ? 'w-5 md:w-8 lg:w-16' : 'w-0'

  const arrows = (
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
  )

  return (
    <section className="py-8 md:py-11 overflow-hidden">
      <div className={pad}>
        <SectionHeader title="The Collection" action={arrows} className="mb-5 md:mb-7" />
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Scrollable carousel */}
        <div
          ref={scrollRef}
          className="overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex gap-4 w-fit">
            <div className={`${edge} shrink-0`} />
            {collections.map((col, i) => {
              const imgUrl = getCollectionImage(col)
              return (
                <FadeIn key={col.id} delay={i * 0.06}>
                  <Link
                    href={`/products?collection=${col.slug}`}
                    className="group shrink-0 snap-start block no-underline w-[40vw] sm:w-[35vw] md:w-[28vw] lg:w-[18vw] min-w-35"
                  >
                    <div className="relative aspect-2/3 overflow-hidden bg-charcoal">
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
                        {/* Colour/size on the span — styles.css sets unlayered
                            h1–h6 rules that outrank Tailwind utilities. */}
                        <h3 className="m-0!">
                          <span className="block font-sans text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide text-cream leading-snug">
                            {col.title}
                          </span>
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
            <div className={`${edge} shrink-0`} />
          </div>
        </div>
      </div>
    </section>
  )
}
