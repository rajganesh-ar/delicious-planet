'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useCallback, useState, useEffect } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import type { Category, Media } from '@/payload-types'

interface CategoryStripProps {
  categories: Category[]
}

function getCatImage(cat: Category): string | null {
  if (typeof cat.image === 'object' && cat.image !== null) {
    return (cat.image as Media).sizes?.card?.url ?? (cat.image as Media).url ?? null
  }
  return null
}

export function CategoryStrip({ categories }: CategoryStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const isMobile = window.innerWidth < 768
    const cardWidth = isMobile ? 220 + 16 : 288 + 20
    const count = isMobile ? 1 : 2
    el.scrollBy({
      left: direction === 'left' ? -cardWidth * count : cardWidth * count,
      behavior: 'smooth',
    })
  }

  if (categories.length === 0) return null

  return (
    <section className="bg-obsidian py-10 md:py-14 lg:py-16 overflow-hidden">
      {/* Header with arrow controls */}
      <div className="px-5 md:px-8 lg:px-16 mb-6 md:mb-8 flex items-end justify-between gap-4">
        <div>
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-heading font-medium m-0 mb-2 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              Browse Our Selection
            </p>
            <h2 className="font-luxury text-2xl md:text-3xl lg:text-4xl font-medium text-cream m-0 tracking-tight">
              Explore by Category
            </h2>
          </FadeIn>
        </div>

        {/* Arrow controls */}
        <div className="flex gap-1.5 md:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border border-cream/20 bg-transparent text-cream cursor-pointer transition-all duration-200 hover:bg-cream hover:text-obsidian disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-cream"
            aria-label="Scroll left"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M15 4l-8 8 8 8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border border-cream/20 bg-transparent text-cream cursor-pointer transition-all duration-200 hover:bg-cream hover:text-obsidian disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-cream"
            aria-label="Scroll right"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M9 4l8 8-8 8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable card strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-5 pl-5 md:pl-8 lg:pl-16 pr-5 md:pr-0 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const imgUrl = getCatImage(cat)
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="shrink-0 group relative w-55 h-75 md:w-72 md:h-96 overflow-hidden no-underline"
            >
              <div className="absolute inset-0 bg-charcoal">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={cat.title}
                    fill
                    sizes="288px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-charcoal to-obsidian" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/80 via-obsidian/25 to-transparent" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <h3 className="font-luxury text-xl md:text-2xl text-cream m-0 group-hover:text-gold transition-colors duration-300">
                  {cat.title}
                </h3>
                {cat.description && (
                  <p className="text-cream/60 text-sm m-0 mt-2 line-clamp-2">{cat.description}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
