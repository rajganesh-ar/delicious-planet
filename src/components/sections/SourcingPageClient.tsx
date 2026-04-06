'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/* ─── Data ──────────────────────────────────────────── */

const heroStats = [
  { value: '5+', label: 'Source Regions' },
  { value: '100%', label: 'Traceable Supply' },
  { value: '7', label: 'Product Categories' },
  { value: 'Multi-Year', label: 'Partnerships' },
]

const networkNodes = [
  'Agricultural producers',
  'Specialized ingredient processors',
  'Export-oriented supply partners',
  'Private label manufacturers',
  'Category-specific production specialists',
]

const sourcingCategories = [
  { name: 'Honey & Hive-Derived Products', status: 'active' },
  { name: 'Olive Oil & Botanical Oils', status: 'active' },
  { name: 'Dried Fruits', status: 'active' },
  { name: 'Plant Extracts', status: 'active' },
  { name: 'Natural Sweeteners', status: 'active' },
  { name: 'Specialty Culinary Ingredients', status: 'active' },
  { name: 'Functional Agricultural Products', status: 'evaluation' },
]

const specificationApplications = [
  'Culinary preparation',
  'Food manufacturing',
  'Private label production',
  'Retail distribution',
  'Multi-location procurement environments',
]

const continuityPlanningItems = [
  {
    title: 'Harvest Alignment',
    desc: 'Procurement cycles coordinated with seasonal production windows across diversified growing regions.',
  },
  {
    title: 'Forecasting Communication',
    desc: 'Structured demand visibility shared with production partners well ahead of order cycles.',
  },
  {
    title: 'Buffer Capacity',
    desc: 'Inventory positioning strategies maintaining availability during supply transitions.',
  },
  {
    title: 'Parallel Qualification',
    desc: 'Multiple supplier qualification within strategic categories ensuring redundancy.',
  },
  {
    title: 'Regional Diversification',
    desc: 'Geographic spread across sourcing pathways reducing single-region dependency.',
  },
]

const qualificationCriteria = [
  'Demonstrated consistency of product characteristics',
  'Ability to maintain defined production specifications',
  'Documentation readiness for export environments',
  'Capacity to support defined volume requirements',
  'Packaging and logistics stability alignment',
  'Clarity of origin and production processes',
]

const privateLabelCapabilities = [
  {
    title: 'Supplier Identification',
    desc: 'Partners matched to product requirements and market positioning.',
  },
  {
    title: 'Specification Development',
    desc: 'Controlled formulation and composition calibration.',
  },
  {
    title: 'Production Validation',
    desc: 'Capability verification across manufacturing processes.',
  },
  { title: 'Packaging Compatibility', desc: 'Materials, formats, and compliance verification.' },
  { title: 'Volume Scalability', desc: 'Growth-ready production infrastructure evaluation.' },
]

const logisticsFactors = [
  'Packaging durability across transport cycles',
  'Product stability under variable temperature conditions',
  'Export documentation readiness',
  'Compatibility with customs handling requirements',
  'Transport efficiency across regional delivery networks',
]

const stabilityConsiderations = [
  {
    label: 'Processing Discipline',
    desc: 'Controlled methods maintaining product structure and composition integrity.',
  },
  {
    label: 'Environment Control',
    desc: 'Temperature and humidity management throughout handling stages.',
  },
  {
    label: 'Packaging Integrity',
    desc: 'Materials compatible with transport conditions and shelf-life targets.',
  },
  {
    label: 'Composition Protection',
    desc: 'Active and nutritional characteristics preserved through distribution.',
  },
]

/* ─── Reusable: Parallax Image ──────────────────────── */

function useParallax(amount = 30) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -amount },
        {
          y: amount,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, wrapRef)
    return () => ctx.revert()
  }, [amount])

  return { wrapRef, imgRef }
}

/* ─── Reusable: Gold Divider ────────────────────────── */

function GoldDivider() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   1. HERO
   ═══════════════════════════════════════════════════════ */

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0.5 },
        {
          opacity: 0.82,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/sourcing/farmer.avif"
          alt="Agricultural sourcing landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div ref={overlayRef} className="absolute inset-0 bg-obsidian/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-16 pt-32 pb-20">
        <div className="max-w-2xl">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-6">
              Sourcing
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-4xl sm:text-5xl lg:text-[68px] font-light text-cream leading-[1.06] tracking-tight mb-7">
              Structured Procurement
              <br />
              <span className="text-gold/90">for Professional Supply</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p className="text-cream/60 text-lg lg:text-xl font-light leading-relaxed mb-5 max-w-xl">
              Delicious Planet operates a structured sourcing network designed to support consistent
              supply across multiple product categories and international distribution environments.
            </p>
          </FadeIn>
          <FadeIn delay={0.22}>
            <p className="text-cream/40 text-sm leading-relaxed mb-10 max-w-lg">
              Our procurement model aligns agricultural producers, specialized processors, and
              export-capable partners within a coordinated supply framework built for reliability
              and continuity.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <MagneticButton>
                <Link
                  href="/vendors/apply"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                >
                  Become a Supplier
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-cream/40 transition-colors duration-300"
                >
                  Vendor Partnerships
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.4}>
          <div className="mt-20 pt-8 border-t border-cream/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <span className="block font-luxury text-3xl lg:text-5xl font-light text-gold mb-1.5">
                    {s.value}
                  </span>
                  <span className="text-cream/40 text-xs uppercase tracking-[0.2em] font-heading">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   2. SOURCING NETWORK — Content + Image (Processing)
   ═══════════════════════════════════════════════════════ */

function SourcingNetwork() {
  const { wrapRef, imgRef } = useParallax(40)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[70vh]">
        {/* Content — left */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-12 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Procurement Infrastructure
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                A Network Built
                <br />
                for Consistency
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Our procurement network spans agricultural regions known for stable cultivation
                conditions and consistent product characteristics. By maintaining diversified
                sourcing pathways, we support continuity across harvest cycles and reduce dependency
                on single-region variability.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Primary sourcing regions include North Africa, Southern Europe, the United Kingdom,
                and selected international production zones with demonstrated agricultural
                reliability.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="border border-cream/[0.06] rounded-sm p-6 bg-cream/[0.015]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cream/30 font-heading font-semibold mb-4">
                  Network Partners
                </p>
                <ul className="space-y-3 list-none m-0 p-0">
                  {networkNodes.map((node) => (
                    <li key={node} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-[7px] shrink-0" />
                      <span className="text-cream/50 text-sm leading-relaxed">{node}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-40px]">
            <Image
              src="/images/sourcing/processing.avif"
              alt="Processing facility — sourcing network infrastructure"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   3. CATEGORY COVERAGE
   ═══════════════════════════════════════════════════════ */

function CategoryCoverage() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-[380px] shrink-0">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Category Coverage
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Product Categories
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-base leading-relaxed mb-4">
                Our sourcing capability supports multiple product categories aligned with natural
                ingredient demand across professional supply environments.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/30 text-sm leading-relaxed">
                Additional product categories are evaluated based on supplier capability,
                specification stability, and long-term supply feasibility. Category expansion
                follows structured qualification processes.
              </p>
            </FadeIn>
          </div>

          <div className="flex-1">
            <div className="space-y-0">
              {sourcingCategories.map((cat, i) => (
                <FadeIn key={cat.name} delay={i * 0.04}>
                  <div className="flex items-center justify-between py-5 border-b border-cream/[0.06] last:border-b-0 group">
                    <div className="flex items-center gap-4">
                      <span className="w-2 h-2 rounded-full bg-gold/25 group-hover:bg-gold/50 transition-colors duration-500 shrink-0" />
                      <span className="text-cream/70 text-base font-medium group-hover:text-cream transition-colors duration-300">
                        {cat.name}
                      </span>
                    </div>
                    {cat.status === 'active' ? (
                      <span className="text-[10px] uppercase tracking-wider text-gold/70 font-heading font-semibold bg-gold/[0.08] px-3 py-1.5 rounded-full border border-gold/10">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-cream/30 font-heading font-semibold bg-cream/[0.03] px-3 py-1.5 rounded-full border border-cream/[0.06]">
                        Under Evaluation
                      </span>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   4. SPECIFICATION ALIGNMENT — Image + Content (Conveyor)
   ═══════════════════════════════════════════════════════ */

function SpecificationAlignment() {
  const { wrapRef, imgRef } = useParallax(35)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[70vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-35px]">
            <Image
              src="/images/sourcing/-converyor.avif"
              alt="Production conveyor — specification-controlled environment"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content — right */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Specification Alignment
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Performance Through
                <br />
                Precision
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Professional supply environments require ingredients that perform consistently
                across operational conditions. Our sourcing framework emphasizes alignment between
                product characteristics and technical usage requirements.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Product specifications are evaluated according to measurable parameters including
                composition stability, grading consistency, processing discipline, and packaging
                integrity.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="pt-6 border-t border-cream/[0.06]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cream/30 font-heading font-semibold mb-4">
                  Application Environments
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {specificationApplications.map((app) => (
                    <span
                      key={app}
                      className="text-xs text-cream/45 bg-cream/[0.03] px-4 py-2 rounded-full border border-cream/[0.06]"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   5. CONTINUITY PLANNING
   ═══════════════════════════════════════════════════════ */

function ContinuityPlanning() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-24 mb-16 lg:mb-20">
          <div className="lg:w-1/2">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Continuity Planning
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-0">
                Supply Without
                <br />
                Interruption
              </h2>
            </FadeIn>
          </div>
          <div className="lg:w-1/2 lg:pt-10">
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base lg:text-lg leading-relaxed m-0">
                Supply continuity is supported through forward coordination of production cycles,
                inventory positioning strategies, and parallel sourcing pathways within defined
                categories. Structured planning reduces procurement disruption and supports
                operational predictability for professional buyers.
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {continuityPlanningItems.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.06}>
              <motion.div
                className="group relative border border-cream/[0.06] rounded-sm bg-obsidian h-full hover:border-gold/25 transition-colors duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-px w-0 group-hover:w-full bg-gold/40 transition-all duration-700 ease-out" />
                <div className="p-6 lg:p-7">
                  <div className="w-10 h-10 rounded-full border border-gold/15 flex items-center justify-center mb-5 group-hover:border-gold/30 transition-colors duration-500">
                    <span className="text-gold/50 text-xs font-heading font-bold group-hover:text-gold/80 transition-colors duration-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-cream/90 mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-cream/38 text-sm leading-relaxed m-0">{item.desc}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   6. SUPPLIER QUALIFICATION — Image + Content (Plant Engineers)
   ═══════════════════════════════════════════════════════ */

function SupplierQualification() {
  const { wrapRef, imgRef } = useParallax(35)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[70vh]">
        {/* Content — left */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-12 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Supplier Qualification
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Evaluated for
                <br />
                Reliability
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Suppliers are evaluated according to their ability to maintain production stability,
                documentation clarity, and operational reliability. Qualification processes are
                calibrated according to product category complexity and supply structure
                requirements.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Each prospective partner undergoes a structured assessment designed to validate
                capability across the full production cycle — from raw material sourcing through
                finished product readiness.
              </p>
            </FadeIn>

            <div className="space-y-4">
              {qualificationCriteria.map((criterion, i) => (
                <FadeIn key={criterion} delay={0.2 + i * 0.03}>
                  <div className="group flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full border border-gold/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gold/30 transition-colors duration-500">
                      <svg
                        className="w-3 h-3 text-gold/40 group-hover:text-gold/70 transition-colors duration-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <span className="text-cream/50 text-sm leading-relaxed">{criterion}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-35px]">
            <Image
              src="/images/sourcing/plant-engineers.avif"
              alt="Plant engineers evaluating supplier production capability"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   7. PRIVATE LABEL SOURCING
   ═══════════════════════════════════════════════════════ */

function PrivateLabelSourcing() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="max-w-2xl mb-14 lg:mb-20">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Private Label Sourcing
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-5">
              Proprietary Product
              <br />
              Development
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/45 text-base lg:text-lg leading-relaxed m-0">
              Our sourcing infrastructure supports private label product development through
              controlled manufacturing partnerships capable of producing within defined formulation
              and packaging specifications. Private label partnerships operate under structured
              confidentiality and specification alignment frameworks.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {privateLabelCapabilities.map((cap, i) => (
            <FadeIn key={cap.title} delay={i * 0.06}>
              <motion.div
                className="group relative border border-cream/[0.06] rounded-sm bg-obsidian h-full hover:border-gold/25 transition-colors duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-px w-0 group-hover:w-full bg-gold/40 transition-all duration-700 ease-out" />
                <div className="p-6 lg:p-7">
                  <div className="w-10 h-10 rounded-full border border-gold/15 flex items-center justify-center mb-5 group-hover:border-gold/30 transition-colors duration-500">
                    <svg
                      className="w-4 h-4 text-gold/40 group-hover:text-gold/70 transition-colors duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-cream/90 mb-2 tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="text-cream/38 text-sm leading-relaxed m-0">{cap.desc}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.35}>
          <p className="text-cream/30 text-sm leading-relaxed mt-10 max-w-2xl">
            This capability allows professional buyers to develop proprietary product lines
            supported by stable sourcing infrastructure — from initial concept through market-ready
            production.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   8. LOGISTICS COORDINATION — Image + Content (Pallet)
   ═══════════════════════════════════════════════════════ */

function LogisticsCoordination() {
  const { wrapRef, imgRef } = useParallax(30)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[65vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-30px]">
            <Image
              src="/images/sourcing/-sourcing-pallet.avif"
              alt="Supply chain logistics — pallet staging area"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content — right */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Logistics Alignment
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Sourcing Meets
                <br />
                Distribution
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Sourcing pathways are structured in coordination with logistics considerations
                relevant to international distribution environments. Alignment between sourcing and
                logistics reduces friction across supply pathways and supports predictable delivery
                timelines.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-4 mb-8">
                {logisticsFactors.map((factor) => (
                  <div key={factor} className="flex items-start gap-3.5 group">
                    <div className="w-7 h-7 rounded-full border border-gold/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gold/30 transition-colors duration-500">
                      <svg
                        className="w-3 h-3 text-gold/40 group-hover:text-gold/70 transition-colors duration-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <span className="text-cream/50 text-sm leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.25}>
              <blockquote className="border-l-2 border-gold/20 pl-5 py-2">
                <p className="text-cream/55 text-sm italic leading-relaxed mb-0">
                  &ldquo;Procurement efficiency depends on clarity and availability of production
                  and export documentation across every stage of the supply chain.&rdquo;
                </p>
              </blockquote>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   9. DOCUMENTATION READINESS
   ═══════════════════════════════════════════════════════ */

function DocumentationReadiness() {
  const docTypes = [
    {
      title: 'Technical Specification Sheets',
      desc: 'Detailed composition parameters and product performance benchmarks.',
    },
    {
      title: 'Product Composition References',
      desc: 'Ingredient profiles, nutritional data, and active compound documentation.',
    },
    {
      title: 'Origin Documentation',
      desc: 'Provenance records, certificates of origin, and chain of custody verification.',
    },
    {
      title: 'Batch Identification Structures',
      desc: 'Lot numbering, production date coding, and traceability frameworks.',
    },
    {
      title: 'Export Compliance Documentation',
      desc: 'Phytosanitary certificates, customs declarations, and regulatory approvals.',
    },
  ]

  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Documentation Readiness
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-5">
              Clarity Across
              <br />
              Every Pathway
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/45 text-base lg:text-lg leading-relaxed">
              Structured sourcing relationships maintain documentation pathways supporting
              verification of origin, production characteristics, and specification alignment.
              Documentation clarity supports efficient coordination across procurement, logistics,
              and regulatory environments.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-0">
          {docTypes.map((doc, i) => (
            <FadeIn key={doc.title} delay={i * 0.04}>
              <div className="group grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 py-7 lg:py-8 border-b border-cream/[0.06] last:border-b-0 items-start">
                <div className="lg:col-span-2">
                  <span className="font-luxury text-4xl lg:text-6xl font-light text-gold/12 leading-none group-hover:text-gold/22 transition-colors duration-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="lg:col-span-4 lg:pt-2">
                  <h3 className="font-heading text-base font-semibold text-cream tracking-tight m-0">
                    {doc.title}
                  </h3>
                </div>
                <div className="lg:col-span-6 lg:pt-2">
                  <p className="text-cream/40 text-sm lg:text-base leading-relaxed m-0">
                    {doc.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   10. PRODUCT STABILITY — Image + Content (Plant Engineers Alt)
   ═══════════════════════════════════════════════════════ */

function ProductStability() {
  const { wrapRef, imgRef } = useParallax(30)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[65vh]">
        {/* Content — left */}
        <div className="lg:w-[50%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Product Stability
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Integrity From
                <br />
                Harvest to Shelf
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Natural products require structured handling from harvest through processing and
                packaging stages to preserve product characteristics. Sourcing partners are
                evaluated on their ability to maintain product stability throughout production and
                preparation processes.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Maintaining stability across supply stages ensures consistency upon delivery —
                protecting both product value and customer expectations across distribution cycles.
              </p>
            </FadeIn>

            <div className="space-y-5">
              {stabilityConsiderations.map((item, i) => (
                <FadeIn key={item.label} delay={0.2 + i * 0.04}>
                  <div className="group border-l-2 border-gold/15 pl-5 py-1 hover:border-gold/40 transition-colors duration-500">
                    <h3 className="font-heading text-sm font-semibold text-cream/90 mb-1 tracking-wide">
                      {item.label}
                    </h3>
                    <p className="text-cream/38 text-sm leading-relaxed m-0">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[50%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-30px]">
            <Image
              src="/images/sourcing/plant-engineers-a.avif"
              alt="Quality engineers assessing product stability"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   11. SCALABLE SUPPLY & MULTI-REGION
   ═══════════════════════════════════════════════════════ */

function ScalableSupply() {
  const scalabilityFactors = [
    {
      title: 'Production Infrastructure',
      desc: 'Capacity assessment across manufacturing facilities and processing lines.',
    },
    {
      title: 'Specification Consistency',
      desc: 'Ability to maintain product characteristics across increased output volumes.',
    },
    {
      title: 'Raw Material Pathways',
      desc: 'Stability of upstream sourcing for key agricultural inputs and ingredients.',
    },
    {
      title: 'Quality Control Alignment',
      desc: 'Scalable QC processes that maintain standards at higher production volumes.',
    },
  ]

  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="flex-1">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Scalable Supply Capability
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Growing With
                <br />
                Market Demand
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-base leading-relaxed mb-10">
                Structured sourcing relationships support gradual scaling of procurement volume
                while maintaining defined product characteristics. Scalable sourcing ensures supply
                capacity can expand alongside market demand without compromising reliability.
              </p>
            </FadeIn>

            <div className="space-y-6">
              {scalabilityFactors.map((factor, i) => (
                <FadeIn key={factor.title} delay={0.12 + i * 0.04}>
                  <div className="group border-l-2 border-gold/15 pl-6 py-1 hover:border-gold/40 transition-colors duration-500">
                    <h3 className="font-heading text-sm font-semibold text-cream/90 mb-1.5 tracking-wide">
                      {factor.title}
                    </h3>
                    <p className="text-cream/38 text-sm leading-relaxed m-0">{factor.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className="lg:w-[440px] shrink-0">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Multi-Region Procurement
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[32px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Parallel Sourcing
                <br />
                Pathways
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-sm leading-relaxed mb-8">
                Where applicable, product categories are supported through multiple sourcing regions
                capable of maintaining comparable product characteristics. Multi-region procurement
                strengthens supply continuity and provides flexibility in response to regional
                production variability.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="border border-cream/[0.06] rounded-sm p-7 lg:p-8 bg-cream/[0.015]">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="block font-luxury text-2xl font-light text-gold mb-1">5+</span>
                    <span className="text-cream/30 text-xs leading-relaxed">
                      Active sourcing regions with established supply infrastructure
                    </span>
                  </div>
                  <div>
                    <span className="block font-luxury text-2xl font-light text-gold mb-1">
                      Parallel
                    </span>
                    <span className="text-cream/30 text-xs leading-relaxed">
                      Supplier qualification within each strategic product category
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-cream/[0.06]">
                  <p className="text-cream/35 text-sm leading-relaxed m-0">
                    Parallel sourcing pathways support continuity planning while maintaining defined
                    specification parameters across supplier networks — allowing procurement
                    stability without compromising product consistency.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   12. FRAMEWORK STATEMENT
   ═══════════════════════════════════════════════════════ */

function FrameworkStatement() {
  return (
    <section className="bg-obsidian py-28 lg:py-40 border-t border-cream/[0.06]">
      <div className="max-w-[720px] mx-auto px-6 text-center">
        <FadeIn>
          <div className="w-12 h-px bg-gold/30 mx-auto mb-10" />
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="font-luxury text-2xl sm:text-3xl lg:text-[34px] font-light text-cream/70 leading-[1.55] tracking-tight mb-8">
            Delicious Planet operates as a structured procurement intermediary aligning disciplined
            producers with professional buyers requiring continuity, specification stability, and
            operational predictability.
          </p>
        </FadeIn>
        <FadeIn delay={0.12}>
          <p className="text-cream/30 text-base font-light leading-relaxed mb-6">
            Sourcing decisions are guided by long-term viability, specification alignment, and
            supply reliability across regional distribution environments. Our framework supports
            consistent availability while maintaining product characteristics suitable for
            professional usage environments.
          </p>
        </FadeIn>
        <FadeIn delay={0.16}>
          <div className="w-8 h-px bg-gold/20 mx-auto" />
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   13. CTA — Image + Contact (Factory)
   ═══════════════════════════════════════════════════════ */

function SourcingCTA() {
  const { wrapRef, imgRef } = useParallax(20)

  return (
    <section className="bg-obsidian">
      <div className="flex flex-col lg:flex-row min-h-[70vh]">
        {/* Text side */}
        <div className="lg:w-1/2 flex items-center px-6 lg:px-16 py-20 lg:py-0">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-5">
                Partner With Us
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight mb-6">
                Structured Supply
                <br />
                Starts Here
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-4">
                Organizations operating within our sourcing categories — from agricultural producers
                to specialized processors — are invited to explore partnership opportunities through
                our vendor application portal.
              </p>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="text-cream/35 text-sm leading-relaxed mb-4">
                Our procurement team reviews every submission with care. Applications are evaluated
                based on category alignment, production capability, documentation readiness, and
                long-term supply viability.
              </p>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p className="text-cream/25 text-xs leading-relaxed mb-10">
                For general inquiries about sourcing partnerships or questions about our procurement
                framework, please visit our{' '}
                <Link
                  href="/contact"
                  className="text-gold/40 hover:text-gold/70 underline underline-offset-2 transition-colors"
                >
                  contact page
                </Link>
                .
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="flex flex-wrap gap-4">
                <MagneticButton>
                  <Link
                    href="/vendors/apply"
                    className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                  >
                    Apply as Supplier
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href="/vendors"
                    className="inline-flex items-center text-sm font-heading font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-gold/40 transition-colors duration-300"
                  >
                    Vendor Partnerships
                  </Link>
                </MagneticButton>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Image side */}
        <div ref={wrapRef} className="relative lg:w-1/2 min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-20px]">
            <Image
              src="/images/sourcing/sourcing-factory-a.avif"
              alt="Sourcing facility — partnership infrastructure"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-obsidian/10" />
        </div>
      </div>
    </section>
  )
}

/* ═════════════════════════════════════════════════════
   PAGE COMPOSITION
   ═════════════════════════════════════════════════════ */

export function SourcingPageClient() {
  return (
    <>
      {/* 1. Full-screen hero with stats */}
      <Hero />

      {/* 2. Sourcing network — processing image + network nodes */}
      <SourcingNetwork />

      {/* 3. Product category coverage listing */}
      <CategoryCoverage />

      {/* 4. Specification alignment — conveyor image + application tags */}
      <SpecificationAlignment />

      {/* 5. Continuity planning — five-pillar card grid */}
      <ContinuityPlanning />

      {/* 6. Supplier qualification — plant engineers image + criteria */}
      <SupplierQualification />

      {/* 7. Private label sourcing — capabilities grid */}
      <PrivateLabelSourcing />

      {/* 8. Logistics coordination — pallet image + factors */}
      <LogisticsCoordination />

      {/* 9. Documentation readiness — numbered list */}
      <DocumentationReadiness />

      {/* 10. Product stability — engineers image + stability factors */}
      <ProductStability />

      {/* 11. Scalable supply & multi-region procurement */}
      <ScalableSupply />

      {/* 12. Framework position statement */}
      <FrameworkStatement />

      {/* 13. Final CTA — factory image + application */}
      <SourcingCTA />
    </>
  )
}
