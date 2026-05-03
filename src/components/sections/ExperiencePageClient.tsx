'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

// Data for sections, inspired by experience.md
const sourceSection = {
  kicker: '01. Origin',
  title: 'At the Source: Farms & Primary Production',
  body: 'Our engagement begins where quality is fundamentally determined. We build relationships with agricultural producers, fisheries, and cooperatives to understand cultivation practices, assess quality, and evaluate environmental conditions. This proximity to origin supports better sourcing decisions and improved traceability.',
  points: [
    'Understanding cultivation & production',
    'Assessing quality consistency & yield',
    'Evaluating environmental & operational conditions',
  ],
}

const specialtySection = {
  kicker: '02. Specialty',
  title: 'Vineyards & Value-Added Production',
  body: 'For premium products, origin characteristics are critical. We are developing exposure to vineyards, estate-based systems, and region-specific agricultural products to understand differentiation at its source. This allows us to align sourcing with the quality and positioning requirements of our partners.',
}

const processingSection = {
  kicker: '03. Handling',
  title: 'Processing & Handling Environments',
  body: 'Between origin and consumption, handling and processing play a critical role in maintaining product integrity. We are building familiarity with processing units, cold chain infrastructure, and quality control processes to ensure alignment with safety standards and improve coordination across the supply chain.',
}

const endUseSection = {
  kicker: '04. Consumption',
  title: 'End Use: Restaurants, Foodservice & Retail',
  body: 'Understanding how products are used is essential for effective distribution. We engage with restaurants, hospitality groups, and retail environments to align product specifications with real-world usage, understand demand patterns, and improve supply consistency.',
}

const whyItMattersPoints = [
  {
    title: 'Context & Precision',
    body: 'Source products aligned with actual usage requirements.',
  },
  {
    title: 'Improved Communication',
    body: 'Bridge the gap between suppliers and end-buyers.',
  },
  {
    title: 'Anticipate & Adapt',
    body: 'Foresee demand shifts and operational constraints.',
  },
  {
    title: 'Strengthened Assurance',
    body: 'Enhance traceability and quality control from end to end.',
  },
]

export function ExperiencePageClient() {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const [heroTarget, setHeroTarget] = useState<HTMLDivElement | null>(null)

  const refCallback = (node: HTMLDivElement | null) => {
    heroRef.current = node
    setHeroTarget(node)
  }

  const { scrollYProgress } = useScroll({
    ...(heroTarget ? { target: { current: heroTarget } } : {}),
    offset: ['start start', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section
        ref={refCallback}
        className="relative min-h-[80vh] flex items-end overflow-hidden bg-obsidian"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/experience/hero-experience.avif"
            alt="A vast terraced farm landscape"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/30" />
        </motion.div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pb-20 lg:pb-28 pt-32 w-full">
          <div className="max-w-3xl">
            <motion.p
              className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our Ecosystem
            </motion.p>
            <motion.h1
              className="font-luxury text-4xl sm:text-5xl lg:text-[64px] xl:text-[76px] font-light text-cream leading-[1.05] tracking-[-0.03em] m-0 mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Connecting Source to Table.
            </motion.h1>
            <motion.p
              className="text-cream/70 text-base lg:text-lg leading-relaxed max-w-xl m-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              We operate across the food value chain, from production environments to
              end-consumption spaces. This integrated perspective informs how we source, evaluate,
              and distribute products.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ═══ At the Source ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-28">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  {sourceSection.kicker}
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0 mb-6">
                  {sourceSection.title}
                </h2>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-8">
                  {sourceSection.body}
                </p>
                <ul className="list-none m-0 p-0 space-y-3">
                  {sourceSection.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-green mt-2 shrink-0" />
                      <span className="text-stone text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 relative aspect-[16/10] rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-source-1.avif"
                      alt="Aerial view of farmland"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-source-2.avif"
                      alt="Farmer at work"
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-source-3.avif"
                      alt="Hands sorting produce"
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Specialty Origins ═══ */}
      <section className="bg-forest-green text-cream">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          <FadeIn>
            <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[600px]">
              <Image
                src="/images/experience/experience-specialty.avif"
                alt="Sunlight over a vineyard"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-green/50 to-transparent" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="p-10 md:p-14 lg:p-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                {specialtySection.kicker}
              </p>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight m-0 mb-6">
                {specialtySection.title}
              </h2>
              <p className="text-cream/70 text-base lg:text-lg leading-relaxed m-0 max-w-lg">
                {specialtySection.body}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Processing & Handling ═══ */}
      <section className="bg-parchment py-16 sm:py-20 lg:py-28">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  {processingSection.kicker}
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0 mb-6">
                  {processingSection.title}
                </h2>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  {processingSection.body}
                </p>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-2 grid-rows-2 gap-4">
                  <div className="col-span-2 row-span-1 relative aspect-[16/10] rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-processing-1.avif"
                      alt="Modern food processing facility"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-processing-2.avif"
                      alt="Quality control inspection"
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-square rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-processing-3.avif"
                      alt="Refrigerated warehouse"
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ End Use ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-28">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  {endUseSection.kicker}
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0 mb-6">
                  {endUseSection.title}
                </h2>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  {endUseSection.body}
                </p>
              </FadeIn>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 space-y-12">
              <FadeIn>
                <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
                  <Image
                    src="/images/experience/experience-foodservice.avif"
                    alt="Professional chef plating a dish"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="font-luxury text-2xl font-light text-cream m-0">
                      Foodservice & Hospitality
                    </h3>
                  </div>
                </div>
              </FadeIn>
              <FadeIn>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-retail-1.avif"
                      alt="Specialty food items on a retail shelf"
                      fill
                      sizes="(max-width: 1024px) 50vw, 30vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                    <Image
                      src="/images/experience/experience-retail-2.avif"
                      alt="Close-up of product packaging"
                      fill
                      sizes="(max-width: 1024px) 50vw, 30vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-luxury text-2xl font-light text-obsidian m-0">
                    Retail & Consumer Interface
                  </h3>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Why It Matters ═══ */}
      <section className="bg-obsidian text-cream relative overflow-hidden py-16 sm:py-20 lg:py-28">
        <div className="absolute inset-0 opacity-[0.03]">
          <Image
            src="/images/experience/experience-map-bg.avif"
            alt="Abstract network map"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-[1100px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-5">
              Why This Matters
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[52px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-16">
              A connected understanding of the entire system.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {whyItMattersPoints.map((p, i) => (
              <FadeIn key={p.title} delay={0.15 + i * 0.08}>
                <div className="border-t border-cream/15 pt-5">
                  <h3 className="font-luxury text-lg text-cream m-0 mb-2">{p.title}</h3>
                  <p className="text-cream/60 text-sm leading-relaxed m-0">{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-20 md:py-28 lg:py-36 bg-obsidian overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/experience/experience-cta-bg.avif"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-obsidian/85" />
        </div>
        <div className="relative max-w-2xl mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-8">
              Explore our portfolio.
            </h2>
            <p className="text-cream/70 text-base lg:text-lg leading-relaxed m-0 mb-10">
              Discover products sourced with an understanding of the entire value chain — from
              origin to your environment.
            </p>
            <MagneticButton>
              <Link
                href="/products"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-5 rounded-sm no-underline hover:bg-gold-light transition-colors"
              >
                Browse All Products
              </Link>
            </MagneticButton>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
