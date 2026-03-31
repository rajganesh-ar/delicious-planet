'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

const slides = [
  {
    image: '/images/experience/experience-chef.avif',
    alt: 'Expert chef preparing a dish',
    label: 'Curated by Experts',
    title: 'Curated by Experts',
    description:
      'Our team of culinary specialists personally visits producers, tastes every offering, and selects only ingredients that meet our exacting standards.',
    cta: { text: 'MEET THE TEAM', href: '/about' },
  },
  {
    image: '/images/experience/experience-dish.avif',
    alt: 'Beautifully plated gourmet dish',
    label: 'From Source to Table',
    title: 'From Source to Table',
    description:
      'We trace every ingredient back to its origin, ensuring transparent supply chains and the freshest possible products delivered to your door.',
    cta: { text: 'OUR PROCESS', href: '/about' },
  },
  {
    image: '/images/experience/experience-experts.avif',
    alt: 'Our team of culinary experts',
    label: 'For Chefs & Home Cooks',
    title: 'For Chefs & Home Cooks',
    description:
      'Whether you run a Michelin-starred kitchen or cook for your family, our collection is designed to elevate every dish you create.',
    cta: { text: 'EXPLORE PRODUCTS', href: '/categories' },
  },
]

export function ExperienceSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
    },
    [current],
  )

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1))
  }, [])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1))
  }, [])

  const slide = slides[current]

  const textVariants = {
    enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 30 : -30 }),
    center: { opacity: 1, y: 0 },
    exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -30 : 30 }),
  }

  const imageVariants = {
    enter: { opacity: 0, scale: 1.05 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  }

  return (
    <section className="bg-cream py-(--spacing-section-lg) overflow-hidden">
      {/* Section header */}
      <div className="max-w-360 mx-auto px-8 lg:px-16">
        <p className="text-gold text-xs font-light tracking-[0.25em] uppercase m-0 mb-16 flex items-center gap-4">
          <span className="inline-block w-10 h-px bg-gold/40" />
          The Delicious Experience
        </p>
      </div>

      {/* Slide content */}
      <div className="max-w-360 mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: text */}
          <div className="relative min-h-85 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                {/* Slide counter */}
                <p className="text-obsidian/40 text-sm font-light tracking-wide m-0 mb-6 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-obsidian/20" />
                  {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                </p>

                <h2 className="font-serif text-2xl lg:text-[32px] font-medium text-obsidian leading-[1.2] tracking-tight m-0 mb-6">
                  {slide.title}
                </h2>

                <p className="text-obsidian/60 text-base leading-relaxed m-0 mb-8 max-w-md">
                  {slide.description}
                </p>

                <a
                  href={slide.cta.href}
                  className="inline-flex items-center gap-3 text-xs font-medium tracking-[0.15em] text-obsidian no-underline border-b border-obsidian/30 pb-1 hover:border-obsidian transition-colors duration-300"
                >
                  {slide.cta.text}
                  <span className="text-sm">→</span>
                </a>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="flex items-center gap-3 mt-10">
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="w-10 h-10 rounded-full border border-obsidian/20 bg-transparent flex items-center justify-center text-obsidian/50 hover:border-obsidian/50 hover:text-obsidian transition-colors duration-300 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Next slide"
                className="w-10 h-10 rounded-full border border-obsidian/20 bg-transparent flex items-center justify-center text-obsidian/50 hover:border-obsidian/50 hover:text-obsidian transition-colors duration-300 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: image */}
          <div className="relative aspect-4/3 lg:aspect-5/4 overflow-hidden rounded-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="max-w-360 mx-auto px-8 lg:px-16 mt-16">
        {/* Progress line */}
        <div className="relative h-px bg-obsidian/10 mb-5">
          <motion.div
            className="absolute top-0 left-0 h-full bg-obsidian/60"
            initial={false}
            animate={{
              width: `${((current + 1) / slides.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Slide labels */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${slides.length}, 1fr)` }}>
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`text-left text-xs tracking-wide transition-colors duration-300 bg-transparent border-none p-0 cursor-pointer ${
                i === current
                  ? 'text-obsidian font-medium'
                  : 'text-obsidian/40 hover:text-obsidian/60'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
