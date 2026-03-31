'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'

export function SustainabilitySection() {
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

  const imgY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <section
      ref={refCallback}
      className="relative min-h-[80vh] md:min-h-[70vh] overflow-hidden bg-obsidian"
    >
      {/* Parallax background image */}
      <motion.div style={{ y: imgY }} className="absolute -top-[10%] -bottom-[10%] left-0 right-0">
        <Image
          src="/images/misc/philosophy.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
      </motion.div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between w-full px-5 md:px-8 lg:px-16 pt-10 md:pt-12 lg:pt-16 pb-10 md:pb-12 lg:pb-16">
        {/* Zone 1: Label + Quote (top-left) */}
        <div className="max-w-2xl">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-heading font-medium m-0 mb-5 md:mb-8 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              Sourcing &amp; Sustainability
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <blockquote className="border-l-2 md:border-l-4 border-gold pl-5 md:pl-8 m-0">
              <p className="font-luxury text-base md:text-xl lg:text-2xl font-medium text-cream leading-normal md:leading-[1.55] tracking-tight m-0">
                &ldquo;Ingredient quality begins at origin. We build long-term relationships with
                producers selected for expertise, transparency, and consistent excellence — because
                every great dish starts with a trusted source.&rdquo;
              </p>
            </blockquote>
          </FadeIn>
        </div>

        {/* Zone 2: Body + CTA (bottom-right) */}
        <div className="max-w-lg self-start md:self-end text-left md:text-right mt-8 md:mt-0">
          <FadeIn delay={0.25}>
            <p className="font-luxury text-cream/50 text-sm md:text-base leading-relaxed font-light m-0 mb-6 md:mb-8">
              We collaborate with producers across Mediterranean regions, Europe, North Africa, and
              international specialty markets — each evaluated for production standards,
              traceability capability, and environmental awareness. Our sourcing model prioritizes
              controlled production processes, resource-conscious methods, and supply continuity
              that ensures every ingredient meets the standard our partners expect.
            </p>
          </FadeIn>

          <FadeIn delay={0.35}>
            <a
              href="/sourcing"
              className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-cream/70 font-heading no-underline hover:text-cream transition-colors duration-300"
            >
              Our Sourcing Approach <span className="inline-block w-8 h-px bg-cream/30" />
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
