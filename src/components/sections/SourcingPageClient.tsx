'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

const sourcingCriteria = [
  {
    title: 'Production Standards',
    description: 'Facility capabilities, process controls, and output consistency.',
  },
  {
    title: 'Quality Consistency',
    description: 'Batch-level verification maintained across all delivery cycles.',
  },
  {
    title: 'Traceability Capability',
    description: 'Documented origin and handling records from source to shipment.',
  },
  {
    title: 'Export Compliance',
    description: 'Certifications and regulatory readiness for target markets.',
  },
  {
    title: 'Technical Product Characteristics',
    description: 'Sensory, compositional, and culinary performance criteria.',
  },
]

const traceabilityPoints = [
  'Structured supplier documentation',
  'Batch-level product traceability',
  'Controlled logistics partners',
  'Quality verification processes',
]

const regions = [
  { label: 'Mediterranean', detail: 'Olive oils, vinegars, grains, preserved ingredients' },
  { label: 'Europe', detail: 'Specialty cheeses, charcuterie, confections, condiments' },
  { label: 'North Africa', detail: 'Spices, preserved lemons, harissa, artisan grains' },
  {
    label: 'International',
    detail: 'Caviar, specialty teas, premium salts, heritage flours',
  },
]

export function SourcingPageClient() {
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
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  return (
    <>
      {/* Hero — parallax with philosophy.avif */}
      <section
        ref={refCallback}
        className="relative h-[80vh] min-h-[560px] flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/misc/philosophy.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />
        </motion.div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Sourcing &amp; Sustainability
          </motion.p>
          <motion.h1
            className="font-luxury text-4xl sm:text-5xl lg:text-[56px] font-light text-cream leading-[1.1] tracking-[-0.03em] m-0"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Ingredient quality
            <br />
            begins at origin.
          </motion.h1>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                Our Philosophy
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-tight m-0 mb-8">
                We collaborate with producers selected for production expertise, supply reliability,
                and transparent sourcing practices.
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-5">
                Our sourcing model prioritises long-term relationships and consistent product
                integrity. We work directly with manufacturers and agricultural producers who share
                our commitment to quality at every stage of the supply chain.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                Each supplier is evaluated against a structured framework covering production
                standards, traceability capability, and export compliance — before any product
                enters our portfolio.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Sourcing Criteria */}
      <section className="py-(--spacing-section) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <div className="lg:w-80 shrink-0">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Sourcing Approach
                </p>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight m-0">
                  Producers are evaluated based on:
                </h2>
              </FadeIn>
            </div>
            <div className="flex-1">
              <div className="space-y-5">
                {sourcingCriteria.map((item, i) => (
                  <FadeIn key={item.title} delay={i * 0.08}>
                    <div className="flex gap-6 bg-cream p-6 rounded-sm border border-mist/30">
                      <div className="w-px bg-gold shrink-0 self-stretch" />
                      <div>
                        <h3 className="font-luxury text-base font-medium text-obsidian m-0 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-stone text-sm leading-relaxed m-0">{item.description}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network / Regions */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Our Network
              </p>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian tracking-tight m-0">
                Where We Source
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((r, i) => (
              <FadeIn key={r.label} delay={i * 0.08}>
                <div className="bg-parchment p-8 rounded-sm border border-mist/30 text-center">
                  <div className="w-8 h-px bg-gold mx-auto mb-5" />
                  <h3 className="font-luxury text-xl font-medium text-obsidian m-0 mb-3">
                    {r.label}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{r.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-(--spacing-section-lg) bg-obsidian">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="flex-1">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
                  Sustainability Perspective
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.15] tracking-tight m-0 mb-6">
                  Responsible sourcing contributes to long-term ingredient availability.
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="font-luxury italic text-cream/60 text-base lg:text-lg font-light leading-relaxed m-0 mb-5">
                  We prioritise producers implementing controlled production processes and
                  resource-conscious methods. Supplier selection considers environmental awareness,
                  product stability, and supply continuity.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-cream/50 text-sm leading-relaxed m-0">
                  Our model supports the long-term viability of the producers we partner with —
                  maintaining fair, stable relationships that sustain quality over time.
                </p>
              </FadeIn>
            </div>

            {/* Traceability */}
            <div className="flex-1 max-w-md">
              <FadeIn direction="right" delay={0.2}>
                <div className="rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm p-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-6">
                    Traceability
                  </p>
                  <ul className="space-y-4 list-none m-0 p-0">
                    {traceabilityPoints.map((point) => (
                      <li key={point} className="flex items-start gap-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                        <span className="text-cream/70 text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
              Partner With Us
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian tracking-tight m-0 mb-6 max-w-2xl mx-auto">
              Interested in supplying to Delicious Planet?
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-stone text-base leading-relaxed m-0 mb-10 max-w-lg mx-auto">
              We are always evaluating new producers who meet our sourcing criteria. Submit a
              supplier inquiry and our team will respond accordingly.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <MagneticButton>
              <Link
                href="/vendors"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
              >
                Become a Vendor
              </Link>
            </MagneticButton>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
