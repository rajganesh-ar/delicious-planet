'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/animations/FadeIn'

export interface CarouselSlide {
  image: string
  title: string
  subtitle: string
  cta: string
  href?: string
}

interface ElegantCarouselProps {
  items: CarouselSlide[]
  autoPlayInterval?: number
  /** Set false inside a container that already provides horizontal gutters. */
  padded?: boolean
}

/** Cross-fade length in ms; the slide swaps at the halfway point. */
const TRANSITION_DURATION = 600

export default function ElegantCarousel({
  items,
  autoPlayInterval = 5000,
  padded = true,
}: ElegantCarouselProps) {
  const pad = padded ? 'px-5 md:px-8 lg:px-16' : ''
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const touchStartX = useRef(0)

  // These read `currentIndex`/`isTransitioning` straight from state rather than
  // through mirror refs. The autoplay effect below already re-subscribes on every
  // index change, so the closures are rebuilt each slide and never go stale.
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return
      setIsTransitioning(true)
      setProgress(0)
      setTimeout(() => {
        setCurrentIndex(index)
        setTimeout(() => setIsTransitioning(false), 50)
      }, TRANSITION_DURATION / 2)
    },
    [currentIndex, isTransitioning],
  )

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % items.length)
  }, [currentIndex, items.length, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + items.length) % items.length)
  }, [currentIndex, items.length, goToSlide])

  // Autoplay & progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 100 / (autoPlayInterval / 50)))
    }, 50)

    const autoPlayTimer = setInterval(goNext, autoPlayInterval)

    return () => {
      clearInterval(autoPlayTimer)
      clearInterval(progressInterval)
    }
  }, [currentIndex, autoPlayInterval, goNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  const slide = items[currentIndex]

  return (
    <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Main content */}
      <div className={`w-full ${pad}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-100 sm:min-h-110 lg:min-h-125">
          {/* Left: Text */}
          <FadeIn
            direction="left"
            className="flex flex-col justify-center py-10 lg:py-12 order-2 lg:order-1"
          >
            <div
              className={`transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-mist" />
                <span className="text-[10px] text-stone font-heading tracking-wide">
                  {String(currentIndex + 1).padStart(2, '0')} /{' '}
                  {String(items.length).padStart(2, '0')}
                </span>
              </div>

              <h3 className="font-luxury text-2xl sm:text-3xl lg:text-4xl font-light text-obsidian tracking-tight leading-[1.1] mb-3 sm:mb-4">
                {slide.title}
              </h3>

              <p className="text-sm md:text-base text-stone font-light leading-relaxed max-w-lg">
                {slide.subtitle}
              </p>

              {slide.cta && (
                <div className="mt-6">
                  {slide.href ? (
                    <Link
                      href={slide.href}
                      className="inline-flex items-center gap-2 min-h-11 sm:min-h-0 text-[10px] uppercase tracking-[0.2em] text-obsidian font-heading border-b border-obsidian pb-0.5 hover:text-stone hover:border-stone transition-colors duration-200 no-underline"
                    >
                      {slide.cta}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-obsidian font-heading border-b border-obsidian pb-0.5">
                      {slide.cta}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-3 mt-8 lg:mt-10">
              <button
                onClick={goPrev}
                className="h-11 w-11 sm:h-9 sm:w-9 border border-obsidian/15 flex items-center justify-center text-obsidian/50 hover:border-obsidian/40 hover:text-obsidian transition-colors duration-200 cursor-pointer bg-transparent"
                aria-label="Previous"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={goNext}
                className="h-11 w-11 sm:h-9 sm:w-9 border border-obsidian/15 flex items-center justify-center text-obsidian/50 hover:border-obsidian/40 hover:text-obsidian transition-colors duration-200 cursor-pointer bg-transparent"
                aria-label="Next"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </FadeIn>

          {/* Right: Image */}
          <FadeIn
            direction="right"
            delay={0.1}
            className="relative overflow-hidden order-1 lg:order-2 aspect-16/10 lg:aspect-auto"
          >
            <div
              className={`absolute inset-0 transition-all duration-500 ${
                isTransitioning ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Progress indicators */}
      <div
        className={`w-full grid gap-3 pt-5 pb-4 ${pad}`}
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="text-left group cursor-pointer flex flex-col justify-center min-h-11 sm:min-h-0 bg-transparent border-0 p-0"
            aria-label={`Go to ${item.title}`}
            aria-current={index === currentIndex}
          >
            <div className="h-0.5 bg-mist overflow-hidden mb-2">
              <div
                className="h-full bg-obsidian transition-all duration-100 ease-linear"
                style={{
                  width:
                    index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%',
                }}
              />
            </div>
            {/* Hidden below sm: three equal columns leave ~118px each on a
                phone, so every title truncated. The bars still read as
                progress without them. */}
            <span className="hidden sm:block text-[10px] text-stone truncate font-heading">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
