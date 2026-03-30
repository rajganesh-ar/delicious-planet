'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useCallback, useState, useEffect } from 'react'
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
    <section className="py-(--spacing-section) overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 md:px-6 lg:px-12 mb-6 md:mb-10 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl md:text-3xl lg:text-[44px] font-medium m-0 text-obsidian tracking-tight">
          Explore by Category
        </h2>

        {/* Arrow controls */}
        <div className="flex gap-1.5 md:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border border-obsidian/20 bg-transparent text-obsidian cursor-pointer transition-all duration-200 hover:bg-obsidian hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-obsidian"
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
            className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border border-obsidian/20 bg-transparent text-obsidian cursor-pointer transition-all duration-200 hover:bg-obsidian hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-obsidian"
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

      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-5 pl-5 md:pl-6 lg:pl-12 pr-5 md:pr-0 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const imgUrl = getCatImage(cat)
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex-shrink-0 group relative w-[220px] h-[300px] md:w-72 md:h-96 rounded-sm overflow-hidden no-underline"
            >
              <div className="absolute inset-0 bg-obsidian">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={cat.title}
                    fill
                    sizes="288px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-forest to-forest-light" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/20 to-transparent" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <h3 className="font-serif text-2xl text-cream m-0 group-hover:text-gold transition-colors duration-300">
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
