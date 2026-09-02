'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from '@/components/sections/home/SectionHeader'
import { getCategoryImage } from '@/lib/images'
import type { Category } from '@/payload-types'

interface CategoryCardsProps {
  categories: Category[]
  /** Set false inside a container that already provides horizontal gutters. */
  padded?: boolean
}

export function CategoryCards({ categories, padded = true }: CategoryCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (categories.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    // A full viewport per click, so each press advances exactly one screenful
    // of tiles (six at lg) and lands on a snap point.
    const amount = scrollRef.current.clientWidth
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const pad = padded ? 'px-5 md:px-8 lg:px-16' : ''
  const edge = padded ? 'w-5 md:w-8 lg:w-16' : 'w-0'

  // "Full directory" sits beside the arrows because SectionHeader drops its own
  // `href` link whenever an `action` is supplied.
  const arrows = (
    <div className="flex items-center gap-3 shrink-0">
      <Link href="/categories/directory" className="group no-underline hidden sm:block">
        <span className="text-[11px] sm:text-xs font-sans text-stone group-hover:text-forest-green transition-colors">
          Full directory
        </span>
      </Link>
      <div className="flex gap-2">
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
  )

  return (
    <section className="py-8 md:py-11 overflow-hidden">
      <div className={pad}>
        <SectionHeader title="Shop by Category" action={arrows} className="mb-5 md:mb-7" />
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Scrollable carousel */}
        <div
          ref={scrollRef}
          className="overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Not `w-fit`: the row has to measure the scroll port so the tiles'
              percentage widths resolve against it. Children never shrink, so
              they overflow and scroll. */}
          <div className="flex gap-4">
            <div className={`${edge} shrink-0`} />
            {categories.map((cat, i) => {
              const imgUrl = getCategoryImage(cat)
              // FadeIn's motion.div is the flex item, so the width sits on it
              // rather than on the Link: exactly n tiles per view, with the
              // gap-4 (1rem) gutters subtracted n-1 times. Six at lg.
              return (
                <FadeIn
                  key={cat.id}
                  delay={i * 0.06}
                  className="shrink-0 snap-start w-[calc((100%_-_1rem)/2)] sm:w-[calc((100%_-_2rem)/3)] md:w-[calc((100%_-_3rem)/4)] lg:w-[calc((100%_-_5rem)/6)]"
                >
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="group block no-underline w-full"
                  >
                    <div className="relative aspect-2/3 overflow-hidden bg-charcoal">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={cat.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 14vw"
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
                            {cat.title}
                          </span>
                        </h3>
                        {cat.description && (
                          <p className="hidden sm:block text-[11px] text-cream/70 m-0 mt-0.5 leading-relaxed line-clamp-2">
                            {cat.description}
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
