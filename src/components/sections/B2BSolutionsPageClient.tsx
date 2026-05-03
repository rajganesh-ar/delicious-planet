'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { Button } from '@/components/ui/Button'

const clientTypes = [
  'Restaurants & Fine Dining',
  'Hotels & Hospitality Groups',
  'Specialty Retailers',
  'Food Manufacturers',
  'Catering Operations',
  'Wholesale Distributors',
]

const capabilities = [
  {
    title: 'Volume Pricing Structures',
    description: 'Tiered pricing frameworks calibrated to order volume and supply frequency.',
  },
  {
    title: 'Supply Continuity Planning',
    description:
      'Forward inventory commitments and buffer stock coordination for operational reliability.',
  },
  {
    title: 'Private Label Development',
    description:
      'Proprietary product development under your brand identity through controlled sourcing partnerships.',
  },
  {
    title: 'Multi-Region Sourcing',
    description:
      'Parallel procurement across Europe, North Africa, the United Kingdom, and the United States.',
  },
  {
    title: 'Logistics Coordination',
    description:
      'Temperature-controlled handling, customs compliance support, and delivery scheduling.',
  },
  {
    title: 'Contract Pricing',
    description:
      'Fixed-term supply agreements providing operational predictability across product categories.',
  },
]

const processSteps = [
  {
    step: '01',
    title: 'Submit Your Requirements',
    description:
      'Share product categories, target volumes, and delivery specifications through our B2B inquiry form.',
  },
  {
    step: '02',
    title: 'Sourcing Assessment',
    description:
      'Our team evaluates supply availability, quality benchmarks, and logistics pathways aligned to your needs.',
  },
  {
    step: '03',
    title: 'Structured Supply Agreement',
    description:
      'Formalise volume pricing, delivery schedules, and continuity commitments through a tailored supply contract.',
  },
]

const stats = [
  { value: '4', label: 'Sourcing Regions' },
  { value: '200+', label: 'Product Lines' },
  { value: '6', label: 'Supply Capabilities' },
  { value: '5+', label: 'Years of Operations' },
]

export function B2BSolutionsPageClient() {
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
      {/* Hero */}
      <section
        ref={refCallback}
        className="relative h-[65vh] min-h-120 flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/b2b/commercial-farm.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-b from-obsidian/55 via-obsidian/40 to-obsidian/70" />

        <div className="relative z-10 max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            B2B Solutions
          </motion.p>
          <motion.h1
            className="font-luxury text-4xl sm:text-5xl lg:text-[56px] font-light text-cream leading-[1.1] tracking-[-0.03em] m-0 mb-4"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Professional Supply,{' '}
            <span className="text-gold">at Scale</span>
          </motion.h1>
          <motion.p
            className="font-luxury italic text-cream/70 text-base lg:text-lg font-light max-w-xl mx-auto m-0 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Ingredient sourcing partner for restaurants, hotels, retailers, and food manufacturers.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            <Button as="link" href="/contact" variant="primary">
              Submit B2B Inquiry
            </Button>
            <Button as="link" href="#capabilities" variant="dark">
              View Capabilities
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-(--spacing-section) bg-cream overflow-hidden">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center">

            <div className="lg:w-1/2">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Who We Serve
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 mb-4">
                  Structured Supply for Demanding Operations
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone text-base leading-relaxed m-0 mb-6">
                  From single-site restaurants to multi-location hospitality groups, we maintain
                  supply structures that match your operational rhythm — with sourcing depth to
                  sustain it across seasons and regions.
                </p>
              </FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {clientTypes.map((type, i) => (
                  <FadeIn key={type} delay={0.25 + i * 0.06}>
                    <div className="flex items-center gap-3 py-2.5 border-b border-mist/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                      <p className="text-sm font-medium text-obsidian m-0">{type}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            <FadeIn direction="right" delay={0.2} className="lg:w-1/2 w-full">
              <div className="relative aspect-4/5 rounded-sm overflow-hidden">
                <Image
                  src="/images/b2b/commercial-resturant.avif"
                  alt="Commercial restaurant kitchen"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/50 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-cream/70 font-medium m-0">
                    Professional kitchen supply
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <Image
          src="/images/b2b/commercial-cafe.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-obsidian/75" />
        <div className="relative z-10 max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium m-0">
              Our Reach
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08} className="text-center">
                <p className="font-luxury text-3xl lg:text-4xl font-light text-gold m-0 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-cream/60 font-medium m-0">
                  {stat.label}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-(--spacing-section) bg-parchment">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Capabilities
              </p>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian tracking-tight m-0 mb-3">
                What We Offer
              </h2>
              <p className="text-stone text-base max-w-lg mx-auto m-0">
                A full suite of B2B supply services built for professional food operations.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, i) => (
              <FadeIn key={cap.title} delay={i * 0.07}>
                <div className="bg-cream p-6 rounded-sm border border-mist/30 h-full flex flex-col">
                  <div className="w-8 h-px bg-gold mb-5" />
                  <h3 className="font-luxury text-lg font-medium text-obsidian m-0 mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0 flex-1">{cap.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Operations Showcase */}
      <section className="py-(--spacing-section) bg-obsidian overflow-hidden">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
              Our Operations
            </p>
            <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream tracking-tight m-0">
              From Production to Delivery
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FadeIn delay={0.1}>
              <div className="relative aspect-4/3 rounded-sm overflow-hidden group">
                <Image
                  src="/images/b2b/commercial-factory.avif"
                  alt="Commercial food production facility"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/80 via-obsidian/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold font-medium mb-1.5 m-0">
                    Production
                  </p>
                  <h3 className="font-luxury text-lg lg:text-xl font-light text-cream m-0 mb-1.5">
                    Controlled Manufacturing
                  </h3>
                  <p className="text-cream/70 text-sm leading-relaxed m-0">
                    Facility-level quality controls and production standards maintained across supply
                    cycles.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="relative aspect-4/3 rounded-sm overflow-hidden group">
                <Image
                  src="/images/b2b/commercial-logistics.avif"
                  alt="Commercial food logistics and warehousing"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/80 via-obsidian/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold font-medium mb-1.5 m-0">
                    Logistics
                  </p>
                  <h3 className="font-luxury text-lg lg:text-xl font-light text-cream m-0 mb-1.5">
                    End-to-End Coordination
                  </h3>
                  <p className="text-cream/70 text-sm leading-relaxed m-0">
                    Temperature-controlled handling, customs compliance, and scheduled delivery
                    management.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
              Process
            </p>
            <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian tracking-tight m-0">
              How We Work Together
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {processSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.12}>
                <div className="flex flex-col">
                  <span className="font-luxury text-5xl lg:text-6xl font-light text-gold/25 leading-none mb-3">
                    {step.step}
                  </span>
                  <div className="w-8 h-px bg-gold mb-4" />
                  <h3 className="font-luxury text-lg font-medium text-obsidian m-0 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-(--spacing-section) bg-obsidian overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-forest/20 via-obsidian to-obsidian" />
        <div className="relative z-10 max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <span className="inline-block w-8 h-px bg-gold mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-3">
              Get Started
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream tracking-tight m-0 mb-4 max-w-2xl mx-auto">
              Ready to discuss your supply requirements?
            </h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="font-luxury italic text-cream/50 text-base font-light m-0 mb-8 max-w-md mx-auto">
              Our team handles structured B2B inquiries including volume pricing, private label, and
              logistics coordination.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <Button as="link" href="/contact" variant="primary">
              Submit B2B Inquiry
            </Button>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
