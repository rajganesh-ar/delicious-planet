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

const stats = [
  { value: '8+', label: 'Source Regions' },
  { value: '50+', label: 'Active Vendors' },
  { value: '6', label: 'Step Evaluation' },
  { value: '99%', label: 'Order Fulfillment' },
]

const partnerProfiles = [
  {
    title: 'Agricultural Producers',
    desc: 'Cultivators managing olives, figs, botanicals, and hive-based production within controlled harvest cycles. We work directly with farming operations that prioritize regenerative land management and traceable crop-to-shelf workflows.',
  },
  {
    title: 'Ingredient Manufacturers',
    desc: 'Facilities producing processed natural ingredients — cold-pressed oils, dried fruit, plant extracts — requiring standardized formulation, repeatable quality output, and batch-level consistency documentation.',
  },
  {
    title: 'Export-Oriented Producers',
    desc: 'Organizations maintaining the full regulatory documentation portfolio required for cross-border trade: phytosanitary certificates, COO declarations, halal/kosher certification, and destination-specific compliance.',
  },
  {
    title: 'Private Label Manufacturers',
    desc: 'Producers capable of confidential production under partner brand identity with dedicated line capacity, custom formulation capabilities, and strict IP protection protocols.',
  },
  {
    title: 'Specialized Cooperatives',
    desc: 'Collective production entities operating with standardized processing across member farms, traceable raw material sourcing, and pooled quality assurance infrastructure.',
  },
]

const evaluationSteps = [
  {
    num: '01',
    title: 'Capability Review',
    desc: 'Comprehensive assessment of production capacity, processing infrastructure, workforce capability, and historical output consistency. We evaluate facility certifications, technology stack, and operational maturity.',
  },
  {
    num: '02',
    title: 'Documentation Audit',
    desc: 'Thorough verification of quality certifications (ISO, HACCP, GMP), laboratory analyses, full traceability records, export credentials, and regulatory compliance across target markets.',
  },
  {
    num: '03',
    title: 'Sample Evaluation',
    desc: 'Multi-stage quality assessment against defined grading parameters, composition benchmarks, organoleptic evaluation, shelf-life stability testing, and packaging integrity validation.',
  },
  {
    num: '04',
    title: 'Specification Alignment',
    desc: 'Collaborative calibration of product specifications including packaging materials, labeling compliance, formulation tolerances, and logistics requirements specific to each distribution channel.',
  },
  {
    num: '05',
    title: 'Trial Order',
    desc: 'Controlled small-scale production run to validate end-to-end consistency across manufacturing, packaging, logistics coordination, delivery timelines, and post-arrival condition assessment.',
  },
  {
    num: '06',
    title: 'Supply Activation',
    desc: 'Full integration into active procurement cycles with defined order cadence, ongoing quality monitoring protocols, quarterly performance reviews, and continuous improvement alignment.',
  },
]

const partnershipModels = [
  {
    title: 'Direct Supply Partnership',
    desc: 'Structured procurement relationships for agricultural and natural ingredient products with predictable demand planning, forward volume commitments, and seasonal ordering frameworks that give producers planning certainty.',
    features: ['Volume forecasting', 'Seasonal planning', 'Priority procurement', 'Growth pathway'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Private Label Manufacturing',
    desc: 'Confidential production aligned with partner brand identity. We provide comprehensive support from formulation development through packaging design to market positioning — all under strict NDA protection.',
    features: ['Custom formulation', 'Brand packaging', 'IP protection', 'Market support'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    title: 'Regional Distribution Access',
    desc: 'Market entry support for producers seeking structured distribution across the Middle East and Africa. Our established logistics networks and regulatory expertise reduce the complexity of entering new territories.',
    features: ['Market analysis', 'Logistics network', 'Regulatory guidance', 'Channel placement'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
]

const commitments = [
  {
    title: 'Predictable Procurement Planning',
    desc: 'Forward visibility into demand expectations and structured ordering cadence that supports production planning across seasonal cycles.',
  },
  {
    title: 'Specification Transparency',
    desc: 'Clear documentation of grading requirements, packaging parameters, and labeling standards shared well before production cycles begin.',
  },
  {
    title: 'Controlled Market Positioning',
    desc: 'Placement within curated distribution channels that maintain premium positioning and protect brand integrity across all markets.',
  },
  {
    title: 'Multi-Region Distribution',
    desc: 'Structured pathways into Middle East and Africa markets through coordinated logistics networks and established trade relationships.',
  },
  {
    title: 'Relationship Continuity',
    desc: 'Strong preference for stable, long-term partnerships built on mutual growth over opportunistic or transactional sourcing arrangements.',
  },
]

const operationalExpectations = [
  'Batch-level product consistency and quality uniformity',
  'Complete traceability documentation from farm to shelf',
  'Export-compliant packaging meeting destination standards',
  'Shelf-life stability validated under transport conditions',
  'Clear and accurate product specification documentation',
  'Transparent origin declaration and chain of custody',
  'Production scheduling reliability aligned with contracts',
  'Responsive communication and issue resolution protocols',
]

const categories = [
  { name: 'Honey & Hive Products', active: true },
  { name: 'Olive Oil & Botanical Oils', active: true },
  { name: 'Dried Fruits', active: true },
  { name: 'Plant Extracts', active: true },
  { name: 'Specialty Culinary Ingredients', active: true },
  { name: 'Natural Sweeteners', active: true },
  { name: 'Functional Agricultural Products', active: false },
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
    <section ref={containerRef} className="relative min-h-[100svh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/vendor/vendor-farm-road.avif"
          alt="Agricultural landscape"
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
              Vendors & Partnerships
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-4xl sm:text-5xl lg:text-[68px] font-light text-cream leading-[1.06] tracking-tight mb-7">
              Structured Supply
              <br />
              <span className="text-gold/90">Relationships</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p className="text-cream/60 text-lg lg:text-xl font-light leading-relaxed mb-5 max-w-xl">
              We develop enduring sourcing partnerships with producers and manufacturers capable
              of supporting professional supply environments across multiple regions and product categories.
            </p>
          </FadeIn>
          <FadeIn delay={0.22}>
            <p className="text-cream/40 text-sm leading-relaxed mb-10 max-w-lg">
              Vendor selection is guided by operational reliability, documentation clarity, and the
              ability to maintain product stability across production cycles and seasonal variation.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <MagneticButton>
                <Link
                  href="/vendors/apply"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                >
                  Apply as Vendor
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/sourcing"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-cream/40 transition-colors duration-300"
                >
                  Our Sourcing Philosophy
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.4}>
          <div className="mt-20 pt-8 border-t border-cream/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
              {stats.map((s) => (
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
   2. PARTNERSHIP SCOPE
   ═══════════════════════════════════════════════════════ */

function PartnershipScope() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg)">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-24 mb-16 lg:mb-20">
          <div className="lg:w-1/2">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Partnership Scope
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-0">
                Who We Partner With
              </h2>
            </FadeIn>
          </div>
          <div className="lg:w-1/2 lg:pt-10">
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base lg:text-lg leading-relaxed m-0">
                Delicious Planet develops sourcing relationships with organizations across the
                agricultural supply chain — from farm-level producers to vertically integrated
                manufacturers. Our vendor ecosystem spans multiple geographies and product categories,
                unified by a shared commitment to quality and transparency.
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1">
            <div className="space-y-0">
              {partnerProfiles.map((p, i) => (
                <FadeIn key={p.title} delay={i * 0.05}>
                  <div className="group flex gap-5 items-start py-6 border-b border-cream/[0.06] last:border-b-0">
                    <div className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gold/40 transition-colors duration-500">
                      <span className="text-gold/50 text-xs font-heading font-bold group-hover:text-gold/80 transition-colors duration-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-semibold text-cream/90 mb-2 tracking-tight">
                        {p.title}
                      </h3>
                      <p className="text-cream/40 text-sm leading-relaxed m-0">{p.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className="lg:w-[400px] shrink-0">
            <FadeIn delay={0.15}>
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden lg:sticky lg:top-32">
                <Image
                  src="/images/vendor/vendor-female.avif"
                  alt="Vendor partnership"
                  fill
                  sizes="400px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-cream/60 text-sm font-light leading-relaxed m-0">
                    Our vendor relationships are built on mutual respect, operational transparency,
                    and a shared vision for quality.
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
   3. ORIGIN STORY — Image + Content Section (Grapes)
   ═══════════════════════════════════════════════════════ */

function OriginStory() {
  const { wrapRef, imgRef } = useParallax(40)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[70vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-40px]">
            <Image
              src="/images/vendor/vendors_grapes.avif"
              alt="Vineyard — agricultural sourcing origins"
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
                Our Sourcing Philosophy
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Every Product Has
                <br />
                an Origin Story
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                From vineyards in the Mediterranean basin to olive groves across North Africa,
                we trace every ingredient back to the land and the people who cultivate it.
                This isn&apos;t just transparency — it&apos;s a commitment to understanding
                the full chain of custody for every product we distribute.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Vendors who join our network become part of a supply ecosystem that values
                documentation as much as product quality. We believe that clear provenance
                is the foundation of lasting commercial relationships and consumer trust.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex items-center gap-6 pt-6 border-t border-cream/[0.06]">
                <div>
                  <span className="block font-luxury text-2xl font-light text-gold">12+</span>
                  <span className="text-cream/30 text-[10px] uppercase tracking-[0.2em] font-heading">Countries</span>
                </div>
                <div className="w-px h-8 bg-cream/[0.08]" />
                <div>
                  <span className="block font-luxury text-2xl font-light text-gold">100%</span>
                  <span className="text-cream/30 text-[10px] uppercase tracking-[0.2em] font-heading">Traceable</span>
                </div>
                <div className="w-px h-8 bg-cream/[0.08]" />
                <div>
                  <span className="block font-luxury text-2xl font-light text-gold">Direct</span>
                  <span className="text-cream/30 text-[10px] uppercase tracking-[0.2em] font-heading">Relationships</span>
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
   4. EVALUATION PROCESS
   ═══════════════════════════════════════════════════════ */

function EvaluationProcess() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Vendor Evaluation Pathway
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-5">
              From Initial Review
              <br />
              to Supply Activation
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/45 text-base lg:text-lg leading-relaxed">
              Every vendor partnership begins with a structured six-step evaluation designed to
              validate capability, ensure alignment with our quality standards, and establish
              the operational foundations for a productive long-term relationship.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-0">
          {evaluationSteps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.04}>
              <div className="group grid grid-cols-1 lg:grid-cols-12 gap-6 py-8 lg:py-10 border-b border-cream/[0.06] last:border-b-0 items-start">
                <div className="lg:col-span-2">
                  <span className="font-luxury text-5xl lg:text-7xl font-light text-gold/12 leading-none group-hover:text-gold/22 transition-colors duration-600">
                    {step.num}
                  </span>
                </div>
                <div className="lg:col-span-3 lg:pt-3">
                  <h3 className="font-heading text-lg font-semibold text-cream tracking-tight m-0">
                    {step.title}
                  </h3>
                </div>
                <div className="lg:col-span-7 lg:pt-3">
                  <p className="text-cream/40 text-sm lg:text-base leading-relaxed m-0">
                    {step.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p className="text-cream/25 text-xs leading-relaxed mt-8 max-w-xl">
            The evaluation timeline varies by category and documentation readiness, typically
            spanning 4–8 weeks from initial inquiry to trial order. Detailed sourcing standards
            are documented within our{' '}
            <Link
              href="/sourcing"
              className="text-gold/40 hover:text-gold/70 underline underline-offset-2 transition-colors"
            >
              Sourcing &amp; Sustainability
            </Link>{' '}
            framework.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   5. PRODUCTION STANDARDS — Image + Content (Processing)
   ═══════════════════════════════════════════════════════ */

function ProductionStandards() {
  const { wrapRef, imgRef } = useParallax(35)

  const standards = [
    { label: 'Facility Certification', detail: 'ISO 22000, HACCP, GMP compliance verification' },
    { label: 'Process Documentation', detail: 'SOPs, flow diagrams, critical control point mapping' },
    { label: 'Quality Testing', detail: 'In-house laboratory capability or accredited third-party access' },
    { label: 'Batch Traceability', detail: 'Full chain of custody from raw input to finished product' },
  ]

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[70vh]">
        {/* Content — left */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Production Environment
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Where Discipline
                <br />
                Meets Craft
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-8">
                We evaluate vendor facilities not just for current output quality, but for
                the operational discipline that ensures consistency at scale. Production
                environments must demonstrate controlled processes, documented workflows,
                and measurable quality benchmarks across every batch.
              </p>
            </FadeIn>

            <div className="space-y-5">
              {standards.map((s, i) => (
                <FadeIn key={s.label} delay={0.15 + i * 0.04}>
                  <div className="group flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-gold/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gold/30 transition-colors duration-500">
                      <svg className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold/70 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-cream/80 text-sm font-heading font-semibold tracking-wide mb-0.5">
                        {s.label}
                      </p>
                      <p className="text-cream/35 text-sm leading-relaxed m-0">{s.detail}</p>
                    </div>
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
              src="/images/vendor/vendor-processing.avif"
              alt="Production facility — quality controlled environment"
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
   6. PARTNERSHIP MODELS
   ═══════════════════════════════════════════════════════ */

function PartnershipModels() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="max-w-2xl mb-14 lg:mb-20">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Engagement Models
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-5">
              Partnership Structures
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/45 text-base lg:text-lg leading-relaxed m-0">
              We offer three distinct engagement pathways, each designed to accommodate different
              production profiles and business objectives. Every model prioritizes long-term
              stability over short-term transactional arrangements.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {partnershipModels.map((model, i) => (
            <FadeIn key={model.title} delay={i * 0.08}>
              <motion.div
                className="group relative border border-cream/[0.06] rounded-sm bg-obsidian h-full hover:border-gold/25 transition-colors duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-px w-0 group-hover:w-full bg-gold/40 transition-all duration-700 ease-out" />
                <div className="p-8 lg:p-10">
                  <div className="w-14 h-14 rounded-full border border-gold/15 flex items-center justify-center text-gold/50 mb-6 group-hover:border-gold/30 group-hover:text-gold/80 transition-all duration-500">
                    {model.icon}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-cream mb-3 tracking-tight">
                    {model.title}
                  </h3>
                  <p className="text-cream/40 text-sm leading-relaxed mb-6">
                    {model.desc}
                  </p>
                  <div className="pt-5 border-t border-cream/[0.06]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cream/25 font-heading font-semibold mb-3">
                      Key Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {model.features.map((f) => (
                        <span
                          key={f}
                          className="text-xs text-cream/50 bg-cream/[0.03] px-3 py-1.5 rounded-full border border-cream/[0.06]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
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
   7. AGRICULTURAL RESILIENCE — Image + Content (Farm)
   ═══════════════════════════════════════════════════════ */

function AgriculturalResilience() {
  const { wrapRef, imgRef } = useParallax(35)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[65vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[50%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-35px]">
            <Image
              src="/images/vendor/vendor-farm.avif"
              alt="Agricultural operations — seasonal resilience"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content — right */}
        <div className="lg:w-[50%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-lg">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Seasonal Continuity
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Building Resilience
                <br />
                Into Every Harvest
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Agricultural supply is inherently variable. Weather patterns, soil conditions,
                and regional policy environments all influence output. We design vendor relationships
                to absorb this variability — building redundancy across sourcing regions and creating
                procurement frameworks that adapt to seasonal realities.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Partners who demonstrate the ability to communicate seasonal challenges early,
                maintain production forecasting accuracy, and plan for contingencies are the
                foundation of our supply security. We invest in these relationships because
                operational predictability is a shared responsibility.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <blockquote className="border-l-2 border-gold/20 pl-5 py-2">
                <p className="text-cream/55 text-sm italic leading-relaxed mb-2">
                  &ldquo;Consistency is not the absence of variation — it is the ability to
                  manage variation without compromising product integrity or delivery commitments.&rdquo;
                </p>
                <cite className="text-gold/40 text-xs uppercase tracking-wider font-heading not-italic">
                  Delicious Planet Procurement Principles
                </cite>
              </blockquote>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   8. COMMITMENTS & EXPECTATIONS
   ═══════════════════════════════════════════════════════ */

function CommitmentsAndExpectations() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="flex-1">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Our Commitments to You
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                What You Can Expect
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-base leading-relaxed mb-10">
                Partnership is reciprocal. We hold ourselves to the same standards of transparency,
                reliability, and professionalism that we ask of our vendors. Here is what every
                approved partner receives.
              </p>
            </FadeIn>

            <div className="space-y-6">
              {commitments.map((c, i) => (
                <FadeIn key={c.title} delay={0.12 + i * 0.04}>
                  <div className="group border-l-2 border-gold/15 pl-6 py-1 hover:border-gold/40 transition-colors duration-500">
                    <h3 className="font-heading text-sm font-semibold text-cream/90 mb-1.5 tracking-wide">
                      {c.title}
                    </h3>
                    <p className="text-cream/38 text-sm leading-relaxed m-0">{c.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className="lg:w-[440px] shrink-0">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                What We Ask of Vendors
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[32px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Operational Standards
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-sm leading-relaxed mb-8">
                Vendors are expected to maintain measurable standards across operational domains
                relevant to commercial distribution and regulatory compliance.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="border border-cream/[0.06] rounded-sm p-7 lg:p-8 bg-cream/[0.015]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cream/30 font-heading font-semibold mb-5">
                  Core Operational Requirements
                </p>
                <ul className="space-y-3.5 list-none m-0 p-0">
                  {operationalExpectations.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-[7px] shrink-0" />
                      <span className="text-cream/50 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   9. PEOPLE & RELATIONSHIPS — Image + Content (Paddy)
   ═══════════════════════════════════════════════════════ */

function PeopleAndRelationships() {
  const { wrapRef, imgRef } = useParallax(30)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[65vh]">
        {/* Content — left */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-12 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Beyond Transactions
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Partnerships Built
                <br />
                on Shared Growth
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                We don&apos;t seek vendors — we seek partners. The distinction is fundamental
                to how we operate. A vendor fills an order. A partner collaborates on product
                development, anticipates market shifts, and invests in the relationship beyond
                the scope of any single purchase order.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                This philosophy shapes everything from our evaluation process to our preferred
                contract structures. We offer multi-year frameworks, joint capacity planning,
                and market intelligence sharing — because when our partners succeed, the entire
                supply ecosystem benefits.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-cream/[0.06]">
                <div>
                  <span className="block font-luxury text-2xl font-light text-gold mb-1">3+ Years</span>
                  <span className="text-cream/30 text-xs leading-relaxed">
                    Average vendor relationship duration across our active partner network
                  </span>
                </div>
                <div>
                  <span className="block font-luxury text-2xl font-light text-gold mb-1">92%</span>
                  <span className="text-cream/30 text-xs leading-relaxed">
                    Partner retention rate — reflecting long-term mutual alignment and satisfaction
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-30px]">
            <Image
              src="/images/vendor/vendor-paddy-field.avif"
              alt="Paddy field — sustainable agricultural partnership"
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
   10. CATEGORIES
   ═══════════════════════════════════════════════════════ */

function CategoriesSection() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-[380px] shrink-0">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Categories Under Review
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Product Verticals
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-base leading-relaxed mb-4">
                We maintain ongoing sourcing review across the following product categories.
                Suppliers operating in these verticals are encouraged to apply.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/30 text-sm leading-relaxed">
                Additional categories may be considered where production capability aligns with
                structured supply requirements and market demand.
              </p>
            </FadeIn>
          </div>

          <div className="flex-1">
            <div className="space-y-0">
              {categories.map((cat, i) => (
                <FadeIn key={cat.name} delay={i * 0.04}>
                  <div className="flex items-center justify-between py-5 border-b border-cream/[0.06] last:border-b-0 group">
                    <div className="flex items-center gap-4">
                      <span className="w-2 h-2 rounded-full bg-gold/25 group-hover:bg-gold/50 transition-colors duration-500 shrink-0" />
                      <span className="text-cream/70 text-base font-medium group-hover:text-cream transition-colors duration-300">
                        {cat.name}
                      </span>
                    </div>
                    {cat.active ? (
                      <span className="text-[10px] uppercase tracking-wider text-gold/70 font-heading font-semibold bg-gold/[0.08] px-3 py-1.5 rounded-full border border-gold/10">
                        Actively Sourcing
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-cream/30 font-heading font-semibold bg-cream/[0.03] px-3 py-1.5 rounded-full border border-cream/[0.06]">
                        Coming Soon
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
   11. THE PEOPLE — Image + Content (Person)
   ═══════════════════════════════════════════════════════ */

function ThePeople() {
  const { wrapRef, imgRef } = useParallax(25)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[60vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[50%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-25px]">
            <Image
              src="/images/vendor/vendor-person.avif"
              alt="The people behind Delicious Planet's supply chain"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content — right */}
        <div className="lg:w-[50%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Human-Centered Supply
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Every Partnership
                <br />
                Begins With People
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Behind every certificate, every batch number, and every logistics coordinate
                are real people making daily decisions about quality. We invest in understanding
                the teams behind our vendor operations — their expertise, their challenges,
                and their vision for growth.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Dedicated account management, regular operational reviews, and transparent
                communication channels are standard for every active vendor partnership.
                When challenges arise — and they will — we work alongside our partners
                to find solutions, not replacements.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex flex-wrap gap-3">
                {['Dedicated Account Manager', 'Quarterly Reviews', 'Direct Communication', 'Joint Problem-Solving'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs text-cream/45 bg-cream/[0.03] px-4 py-2 rounded-full border border-cream/[0.06]"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   12. STATEMENT
   ═══════════════════════════════════════════════════════ */

function Statement() {
  return (
    <section className="bg-obsidian py-28 lg:py-40 border-t border-cream/[0.06]">
      <div className="max-w-[720px] mx-auto px-6 text-center">
        <FadeIn>
          <div className="w-12 h-px bg-gold/30 mx-auto mb-10" />
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="font-luxury text-2xl sm:text-3xl lg:text-[34px] font-light text-cream/70 leading-[1.55] tracking-tight mb-8">
            We prioritize long-term alignment with producers capable of maintaining defined
            product characteristics across time, geography, and volume variation. Operational
            predictability is valued alongside product integrity.
          </p>
        </FadeIn>
        <FadeIn delay={0.12}>
          <p className="text-cream/30 text-base font-light leading-relaxed mb-6">
            Vendor relationships are designed to support consistent product availability across
            changing seasonal and regional conditions — building resilience into every link of
            the supply chain.
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
   13. CTA — Final Application Section (Olive Farm)
   ═══════════════════════════════════════════════════════ */

function VendorCTA() {
  const { wrapRef, imgRef } = useParallax(20)

  return (
    <section className="bg-obsidian">
      <div className="flex flex-col lg:flex-row min-h-[70vh]">
        {/* Text side */}
        <div className="lg:w-1/2 flex items-center px-6 lg:px-16 py-20 lg:py-0">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-5">
                Start Your Partnership
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight mb-6">
                Ready to Supply
                <br />
                the World?
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-4">
                Organizations interested in establishing structured supply relationships
                are invited to submit preliminary capability documentation through our
                vendor application portal. We review every submission with care.
              </p>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="text-cream/35 text-sm leading-relaxed mb-4">
                Our procurement team reviews every application within 5 business days.
                Applications are evaluated based on category demand, documentation completeness,
                and alignment with our quality and sourcing standards.
              </p>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p className="text-cream/25 text-xs leading-relaxed mb-10">
                For general inquiries about partnership opportunities or questions about
                the evaluation process, please visit our{' '}
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
                    Submit Application
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href="/sourcing"
                    className="inline-flex items-center text-sm font-heading font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-gold/40 transition-colors duration-300"
                  >
                    Our Sourcing
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
              src="/images/vendor/vendor-olive-farm.avif"
              alt="Olive orchards — partnership origins"
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

export function VendorsPageClient() {
  return (
    <>
      {/* 1. Full-screen hero with stats */}
      <Hero />

      {/* 2. Who we partner with — profiles + portrait */}
      <PartnershipScope />

      {/* 3. Origin story — vineyard image + sourcing philosophy */}
      <OriginStory />

      {/* 4. Six-step evaluation process */}
      <EvaluationProcess />

      {/* 5. Production standards — facility image + checklist */}
      <ProductionStandards />

      {/* 6. Three partnership models */}
      <PartnershipModels />

      {/* 7. Agricultural resilience — farm image + seasonal story */}
      <AgriculturalResilience />

      {/* 8. Mutual commitments and expectations */}
      <CommitmentsAndExpectations />

      {/* 9. People & relationships — paddy field + partnership depth */}
      <PeopleAndRelationships />

      {/* 10. Product category verticals */}
      <CategoriesSection />

      {/* 11. The people — human-centered supply story */}
      <ThePeople />

      {/* 12. Philosophical statement */}
      <Statement />

      {/* 13. Final CTA — olive farm + application */}
      <VendorCTA />
    </>
  )
}
