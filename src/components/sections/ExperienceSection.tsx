'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'

export function ExperienceSection() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [target, setTarget] = useState<HTMLDivElement | null>(null)

  const refCallback = (node: HTMLDivElement | null) => {
    containerRef.current = node
    setTarget(node)
  }

  const { scrollYProgress } = useScroll({
    ...(target ? { target: { current: target } } : {}),
    offset: ['start end', 'end start'],
  })

  const imgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%'])

  return (
    <section
      ref={refCallback}
      className="relative py-(--spacing-section-lg) overflow-hidden bg-obsidian min-h-[80vh] flex items-center"
    >
      {/* Parallax background */}
      <motion.div style={{ y: imgY }} className="absolute inset-0">
        <div
          className="w-full h-[120%]"
          style={{
            background:
              'linear-gradient(160deg, #3d2b1f 0%, #1a1a1a 40%, #2c4a2e 70%, #3d2b1f 100%)',
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      {/* Content — asymmetric left placement */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-16 w-full"
      >
        <div className="max-w-2xl">
          <FadeIn>
            <p className="text-cream/50 text-sm font-light tracking-wide m-0 mb-4 flex items-center gap-4">
              From source
              <span className="inline-block w-16 h-px bg-cream/30" />
              to table
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-cream leading-[1.1] tracking-tight m-0 mb-8">
              Every Detail{' '}
              <span className="text-gold italic">Matters</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p className="text-cream/50 text-lg leading-relaxed m-0 mb-10 max-w-lg">
              We partner directly with producers who share our unwavering commitment to quality.
              Each ingredient in our collection has been tasted, tested, and chosen for its
              exceptional character.
            </p>
          </FadeIn>

          <FadeIn delay={0.35}>
            <a
              href="/about"
              className="inline-flex items-center gap-4 text-sm text-cream/70 no-underline hover:text-cream transition-colors duration-300"
            >
              Our Story <span className="inline-block w-8 h-px bg-cream/30" />
            </a>
          </FadeIn>
        </div>

        {/* Decorative curved line — like savor.it */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 opacity-20">
          <svg width="200" height="300" viewBox="0 0 200 300" fill="none">
            <path
              d="M10 10 C 80 10, 190 80, 190 150 C 190 220, 80 290, 10 290"
              stroke="#f2ead3"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  )
}
