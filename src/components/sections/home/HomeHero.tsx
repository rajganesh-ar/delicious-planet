'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

interface HeroSlide {
  image: string
  /** Headline is split so the middle line can carry the gold accent. */
  lead: string
  accent: string
  tail: string
  body: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
}

const SLIDES: HeroSlide[] = [
  {
    image: '/images/about/about-cover.avif',
    lead: 'Discover',
    accent: 'Authentic Flavors',
    tail: 'From Around the World',
    body: 'Premium food products curated from Europe, Middle East, Africa, and Latin America.',
    primary: { label: 'Shop Now', href: '/products' },
    secondary: { label: 'Explore Regions', href: '/products?region=europe' },
  },
  {
    image: '/images/sourcing/sourcing-farmer.avif',
    lead: 'Sourced Direct',
    accent: 'From the Producers',
    tail: 'Who Know Them Best',
    body: 'No middlemen, no compromise — every product is traceable to the estate it came from.',
    primary: { label: 'Our Sourcing', href: '/sourcing' },
    secondary: { label: 'Shop Best Sellers', href: '/products?featured=true' },
  },
  {
    image: '/images/collections/oils.avif',
    lead: 'Curated',
    accent: 'Gourmet Collections',
    tail: 'For Every Kitchen',
    body: 'Fifteen chef-built collections, from single-origin spices to aged balsamic vinegars.',
    primary: { label: 'Browse Collections', href: '/products' },
    secondary: { label: 'For Business', href: '/b2b' },
  },
]

const AUTOPLAY_MS = 7000

export function HomeHero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((i: number) => setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused])

  const slide = SLIDES[index]

  return (
    <section
      /* svh, not vh: with vh the hero resizes every time mobile browser chrome
         collapses on scroll, which shifts the headline mid-read. */
      className="relative w-full h-[68svh] min-h-105 max-h-170 overflow-hidden bg-obsidian"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      {/* Background */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, scale: { duration: 7, ease: 'linear' } }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Legibility scrim — heavier on the left where the copy sits */}
      <div className="absolute inset-0 bg-linear-to-r from-obsidian/85 via-obsidian/60 to-obsidian/25" />
      <div className="absolute inset-0 bg-linear-to-t from-obsidian/70 to-transparent" />

      {/* Copy */}
      <div className="relative z-10 h-full w-full px-6 lg:px-16 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="max-w-xl lg:max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* styles.css sets unlayered h1–h6 typography that outranks
                Tailwind's layered utilities, so the type scale lives on a span. */}
            <h1 className="m-0!">
              <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                <span className="block">{slide.lead}</span>
                <span className="block text-gold">{slide.accent}</span>
                <span className="block">{slide.tail}</span>
              </span>
            </h1>

            <p className="font-sans text-cream/75 text-sm md:text-base leading-relaxed m-0 mt-4 md:mt-5 max-w-lg">
              {slide.body}
            </p>

            {/* Label colour lives on the span: the global `a { color: currentColor }`
                rule in styles.css is unlayered and would override text utilities
                applied directly to the anchor. */}
            <div className="flex flex-wrap gap-3 mt-6 md:mt-8">
              <Link
                href={slide.primary.href}
                className="group inline-flex items-center justify-center h-11 px-7 bg-forest-green no-underline rounded-sm transition-colors hover:bg-bud-green"
              >
                <span className="text-cream text-[11px] uppercase tracking-[0.16em] font-heading font-semibold">
                  {slide.primary.label}
                </span>
              </Link>
              <Link
                href={slide.secondary.href}
                className="group inline-flex items-center justify-center h-11 px-7 bg-transparent no-underline border border-cream/45 rounded-sm transition-colors hover:bg-cream hover:border-cream"
              >
                <span className="text-cream group-hover:text-obsidian text-[11px] uppercase tracking-[0.16em] font-heading font-semibold transition-colors">
                  {slide.secondary.label}
                </span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      {/* The dot is the mark; the button around it is the target. Bare 6px dots
          are unhittable on a phone, so each one carries a 44px-tall hit area
          and the visual bar lives on an inner span. */}
      <div className="absolute z-10 bottom-2 md:bottom-4 left-0 right-0 flex justify-center">
        {SLIDES.map((s, i) => (
          <button
            key={s.image}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className="h-11 px-2.5 flex items-center justify-center bg-transparent border-0 cursor-pointer"
          >
            <span
              className={`block h-1.5 rounded-pill transition-all duration-300 ${
                i === index ? 'w-6 bg-gold' : 'w-1.5 bg-cream/45'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
