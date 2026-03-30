'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

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

const clientTypes = [
  'Restaurants & Hotels',
  'Specialty Retailers',
  'Food Manufacturers',
  'Catering Operations',
  'Hospitality Groups',
  'Wholesale Distributors',
]

export function B2BSolutionsPageClient() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-obsidian py-40 lg:py-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest/20 via-obsidian to-obsidian" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            B2B Solutions
          </motion.p>
          <motion.h1
            className="font-luxury text-4xl sm:text-5xl lg:text-[56px] font-light text-cream leading-[1.1] tracking-[-0.03em] m-0 mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Professional Supply,
            <br />
            <span className="text-gold">at Scale</span>
          </motion.h1>
          <motion.p
            className="font-luxury italic text-cream/60 text-lg lg:text-xl font-light max-w-2xl mx-auto m-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Ingredient sourcing partner for restaurants, hotels, retailers, and food manufacturers.
          </motion.p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="flex-1 max-w-xl">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Overview
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 mb-6">
                  Structured Supply for Demanding Operations
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-5">
                  Structured supply capabilities support consistent procurement across multiple
                  product categories. Our B2B model is designed for professional operations
                  requiring reliability, consistency, and scalable supply.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  From single-site restaurants to multi-location hospitality groups, we maintain
                  supply structures that match your operational rhythm — with the sourcing depth to
                  sustain it across seasons and regions.
                </p>
              </FadeIn>
            </div>
            <div className="flex-1">
              <FadeIn direction="right" delay={0.2}>
                <div className="grid grid-cols-2 gap-3">
                  {clientTypes.map((type) => (
                    <div
                      key={type}
                      className="bg-parchment border border-mist/40 px-5 py-4 rounded-sm"
                    >
                      <p className="text-sm font-medium text-obsidian m-0">{type}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-(--spacing-section) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Capabilities
              </p>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian tracking-tight m-0">
                What We Offer
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((cap, i) => (
              <FadeIn key={cap.title} delay={i * 0.08}>
                <div className="bg-cream p-8 rounded-sm border border-mist/30 h-full flex flex-col">
                  <div className="w-8 h-px bg-gold mb-6" />
                  <h3 className="font-luxury text-xl font-medium text-obsidian m-0 mb-3">
                    {cap.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{cap.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning + CTA */}
      <section className="py-(--spacing-section-lg) bg-obsidian">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeIn>
            <span className="inline-block w-8 h-px bg-gold mb-8" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
              Our Positioning
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-cream tracking-tight m-0 mb-6 max-w-3xl mx-auto">
              Built for professional kitchens requiring reliability, consistency, and scalable
              supply.
            </h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="font-luxury italic text-cream/50 text-base lg:text-lg font-light m-0 mb-10 max-w-xl mx-auto">
              Ready to discuss supply requirements? Our team handles structured B2B inquiries
              including volume pricing, private label, and logistics coordination.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <MagneticButton>
              <Link
                href="/contact"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
              >
                Submit B2B Inquiry
              </Link>
            </MagneticButton>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
