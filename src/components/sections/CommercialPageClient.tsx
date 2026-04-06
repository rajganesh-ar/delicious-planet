'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(overlayRef.current, {
        opacity: 0.7,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/commercial/close-up-of-professional-chef-cooking-int-he-kitch-2026-03-16-03-30-27-utc.avif"
          alt="Professional commercial kitchen — Delicious Planet"
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
              Commercial Supply
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-4xl sm:text-5xl lg:text-[68px] font-light text-cream leading-[1.06] tracking-tight mb-7">
              Structured Ingredient Supply for Professional Operations
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/70 text-base lg:text-lg leading-relaxed max-w-xl mb-10">
              Delicious Planet provides coordinated supply access to natural products and specialty
              ingredients for organizations operating within professional food environments. Our
              commercial supply structure is designed to support operational continuity, predictable
              product characteristics, and scalable procurement requirements across multiple
              categories.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton>
                <Link
                  href="/contact"
                  className="inline-block bg-gold text-obsidian font-heading text-xs uppercase tracking-[0.2em] px-8 py-4 no-underline hover:bg-gold/90 transition-colors"
                >
                  Submit Commercial Inquiry
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/sourcing"
                  className="inline-block border border-cream/30 text-cream font-heading text-xs uppercase tracking-[0.2em] px-8 py-4 no-underline hover:border-cream/60 transition-colors"
                >
                  Sourcing Network
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px border border-cream/10">
          {[
            { value: '12+', label: 'Product Categories' },
            { value: 'MEA', label: 'Primary Markets' },
            { value: 'Multi-region', label: 'Sourcing Pathways' },
            { value: 'Contract', label: 'Supply Structures' },
          ].map((stat) => (
            <div key={stat.label} className="bg-obsidian/40 backdrop-blur-sm px-6 py-5">
              <p className="font-luxury text-2xl text-gold mb-1">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-cream/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Operational Scope ───────────────────────────────────────────────────────

function OperationalScope() {
  const imgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  const clientTypes = [
    'Restaurants & Culinary Groups',
    'Hotel Kitchens & Hospitality Operators',
    'Food Manufacturers',
    'Catering Companies',
    'Specialty Retailers',
    'Premium Supermarkets',
    'Regional Distributors',
    'Food Service Providers',
  ]

  return (
    <section ref={sectionRef} className="py-[var(--spacing-section-lg)] bg-cream overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1 max-w-xl">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Operational Scope
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-tight mb-6">
                Supply for Professional Food Environments
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed mb-8">
                Our commercial supply capability supports organizations operating across multiple
                segments of the food industry. Supply structures are designed to align with
                organizations requiring consistent product specifications across repeated
                procurement cycles.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="grid grid-cols-1 gap-2">
                {clientTypes.map((type, i) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-gold font-heading text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-obsidian text-sm font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div className="flex-1 relative h-[520px] overflow-hidden">
            <FadeIn direction="right" delay={0.2}>
              <div ref={imgRef} className="absolute inset-[-40px]">
                <Image
                  src="/images/commercial/antonio-araujo-xyel_GFkqh4-unsplash.avif"
                  alt="Professional food service operation"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Category Coverage ───────────────────────────────────────────────────────

function CategoryCoverage() {
  const categories = [
    { name: 'Honey & Hive-Derived Products', status: 'active' },
    { name: 'Olive Oil & Botanical Oils', status: 'active' },
    { name: 'Dried Fruits & Natural Sweeteners', status: 'active' },
    { name: 'Plant Extracts & Concentrates', status: 'active' },
    { name: 'Specialty Culinary Ingredients', status: 'active' },
    { name: 'Functional Food Components', status: 'evaluating' },
    { name: 'Premium Pantry Products', status: 'active' },
  ]

  return (
    <section className="py-[var(--spacing-section)] bg-parchment">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="lg:w-1/3">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Product Categories
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight mb-6">
                Category Coverage
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base leading-relaxed">
                Our sourcing network supports a range of product categories aligned with
                professional ingredient requirements. All categories are selected based on their
                ability to maintain stable characteristics across supply cycles.
              </p>
            </FadeIn>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat, i) => (
                <FadeIn key={cat.name} delay={i * 0.07}>
                  <div className="bg-cream border border-mist/30 px-6 py-5 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-obsidian">{cat.name}</p>
                    <span
                      className={`shrink-0 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 font-heading ${
                        cat.status === 'active'
                          ? 'bg-forest/10 text-forest'
                          : 'bg-gold/10 text-gold'
                      }`}
                    >
                      {cat.status === 'active' ? 'Active' : 'Expanding'}
                    </span>
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

// ─── Volume Pricing ──────────────────────────────────────────────────────────

function VolumePricing() {
  const imgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  const factors = [
    'Order volume thresholds',
    'Procurement frequency',
    'Category requirements',
    'Logistics configuration',
    'Contract duration',
  ]

  return (
    <section ref={sectionRef} className="py-[var(--spacing-section-lg)] bg-cream overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1 relative h-[500px] overflow-hidden order-2 lg:order-1">
            <FadeIn>
              <div ref={imgRef} className="absolute inset-[-40px]">
                <Image
                  src="/images/commercial/sebastian-coman-photography-eBmyH7oO5wY-unsplash.avif"
                  alt="Commercial ingredient supply — volume pricing"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>

          <div className="flex-1 max-w-xl order-1 lg:order-2">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Volume Pricing
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-tight mb-6">
                Structured Pricing Frameworks
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed mb-6">
                Commercial supply relationships operate within structured pricing frameworks aligned
                with procurement volume and order frequency. Tiered pricing structures enable
                alignment between procurement scale and commercial efficiency.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-stone text-base leading-relaxed mb-8">
                Volume-based frameworks support predictable cost structures for organizations
                operating within planned procurement environments.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="border-l-2 border-gold pl-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gold font-heading mb-4">
                  Pricing calibrated by
                </p>
                {factors.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                    <p className="text-sm text-stone">{f}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Continuity Planning ─────────────────────────────────────────────────────

function ContinuityPlanning() {
  const pillars = [
    {
      title: 'Procurement Cycle Coordination',
      description:
        'Forward coordination of procurement cycles to maintain supply flow across seasonal transitions.',
    },
    {
      title: 'Parallel Sourcing Pathways',
      description:
        'Multiple sourcing routes within defined categories to reduce single-origin dependency.',
    },
    {
      title: 'Buffer Capacity Alignment',
      description:
        'Strategic buffer capacity coordination where applicable to maintain available inventory.',
    },
    {
      title: 'Structured Forecasting',
      description:
        'Collaborative forecasting communication enabling production and procurement alignment.',
    },
    {
      title: 'Production Cycle Synchronisation',
      description:
        'Synchronisation with natural production cycles to maintain consistent product characteristics.',
    },
  ]

  return (
    <section className="py-[var(--spacing-section)] bg-obsidian">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="mb-14">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Continuity Planning
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.15] tracking-tight max-w-2xl">
              Maintaining Stable Availability Across Procurement Cycles
            </h2>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cream/10">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 0.08}>
              <div className="bg-obsidian p-8 h-full flex flex-col">
                <div className="w-8 h-px bg-gold mb-6" />
                <h3 className="font-luxury text-xl font-light text-cream mb-3">{pillar.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{pillar.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <div className="mt-12 p-8 border border-cream/10 max-w-3xl">
            <p className="text-cream/60 text-sm leading-relaxed italic font-luxury">
              Continuity planning helps reduce variability in ingredient availability and supports
              consistent operational output. Stable supply availability reduces the need for
              frequent product substitution or reformulation.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Specification Stability ─────────────────────────────────────────────────

function SpecificationStability() {
  const imgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  const considerations = [
    'Composition consistency',
    'Moisture stability where applicable',
    'Processing discipline',
    'Grading uniformity',
    'Packaging integrity',
    'Shelf-life reliability',
  ]

  return (
    <section ref={sectionRef} className="py-[var(--spacing-section-lg)] bg-cream overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1 max-w-xl">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Specification Stability
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-tight mb-6">
                Consistent Product Characteristics
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed mb-6">
                Professional culinary and manufacturing environments require ingredients capable of
                maintaining consistent characteristics across repeated use conditions. Stable
                product characteristics contribute to predictable performance in food preparation,
                formulation, and packaging processes.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-stone text-base leading-relaxed mb-8">
                Specification alignment reduces variability across operational workflows.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="grid grid-cols-1 gap-3">
                {considerations.map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <svg
                      className="w-4 h-4 text-gold shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-obsidian font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div className="flex-1 relative h-[520px] overflow-hidden">
            <FadeIn direction="right" delay={0.2}>
              <div ref={imgRef} className="absolute inset-[-40px]">
                <Image
                  src="/images/commercial/engin-akyurt-zmHMBcbxk1g-unsplash.avif"
                  alt="Ingredient specification — quality consistency"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Multi-Region Procurement ────────────────────────────────────────────────

function MultiRegion() {
  const imgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-[var(--spacing-section-lg)] bg-parchment overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1 relative h-[500px] overflow-hidden">
            <FadeIn>
              <div ref={imgRef} className="absolute inset-[-40px]">
                <Image
                  src="/images/commercial/derick-mckinney-1FR4o4B7RfA-unsplash.avif"
                  alt="Multi-region procurement — global sourcing"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>

          <div className="flex-1 max-w-xl">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Multi-Region Procurement
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-tight mb-6">
                Parallel Sourcing Across Regions
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed mb-6">
                Our supply structure incorporates sourcing pathways across multiple geographic
                regions capable of maintaining defined product characteristics. Multi-region
                procurement supports continuity by reducing dependency on single-origin production
                variability.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-stone text-base leading-relaxed mb-8">
                Regional sourcing flexibility enables adaptation to seasonal variation while
                maintaining specification consistency. Parallel sourcing pathways strengthen
                reliability across procurement cycles.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="border border-mist/40 bg-cream p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gold font-heading mb-5">
                  Primary Markets
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Middle East', icon: '◈' },
                    { label: 'North Africa', icon: '◈' },
                    { label: 'Sub-Saharan Africa', icon: '◈' },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="text-gold font-luxury text-xl mb-1">{m.icon}</p>
                      <p className="text-xs text-obsidian font-medium">{m.label}</p>
                    </div>
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

// ─── Private Label Development ───────────────────────────────────────────────

function PrivateLabel() {
  const items = [
    {
      title: 'Product Specification Alignment',
      description:
        'Technical specification coordination ensuring private label products meet defined quality parameters.',
    },
    {
      title: 'Packaging Format Coordination',
      description:
        'Coordinated packaging design and format selection aligned with brand identity requirements.',
    },
    {
      title: 'Production Capability Assessment',
      description:
        'Assessment of production partner capabilities against required volume and specification standards.',
    },
    {
      title: 'Volume Feasibility Evaluation',
      description: 'Evaluation of production capacity aligned with commercial volume commitments.',
    },
    {
      title: 'Supply Continuity Planning',
      description:
        'Long-term sourcing structures enabling stable ongoing supply of private label product lines.',
    },
  ]

  return (
    <section className="py-[var(--spacing-section)] bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="mb-14">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Private Label
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-24 items-start">
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-tight lg:max-w-sm">
                Proprietary Product Development
              </h2>
              <p className="text-stone text-base lg:text-lg leading-relaxed max-w-xl pt-2">
                Organizations seeking proprietary product offerings may access private label
                development supported through controlled sourcing partnerships. Private label
                structures enable commercial clients to maintain differentiated product identity
                supported by stable sourcing infrastructure.
              </p>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="bg-parchment border border-mist/30 p-8 h-full flex flex-col">
                <div className="w-8 h-px bg-gold mb-6" />
                <h3 className="font-luxury text-xl font-light text-obsidian mb-3">{item.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{item.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Logistics Coordination ──────────────────────────────────────────────────

function LogisticsCoordination() {
  const imgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  const factors = [
    'Transport conditions aligned with product sensitivity',
    'Delivery scheduling consistency',
    'Export documentation readiness',
    'Handling requirements across distribution cycles',
    'Regional logistics infrastructure compatibility',
  ]

  return (
    <section
      ref={sectionRef}
      className="py-[var(--spacing-section-lg)] bg-obsidian overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1 relative h-[520px] overflow-hidden">
            <FadeIn>
              <div ref={imgRef} className="absolute inset-[-40px]">
                <Image
                  src="/images/commercial/filipp-romanovski-pc0gbeNDUw4-unsplash.avif"
                  alt="Commercial logistics coordination"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>

          <div className="flex-1 max-w-xl">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Logistics Coordination
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Aligned Procurement & Delivery Timelines
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed mb-8">
                Commercial supply requires alignment between procurement scheduling and delivery
                timelines. Coordinated logistics planning supports predictable product arrival
                timelines and reduces operational uncertainty.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="space-y-3 mb-8">
                {factors.map((f) => (
                  <div key={f} className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-2" />
                    <p className="text-stone text-sm leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <blockquote className="border-l-2 border-gold pl-6">
                <p className="font-luxury italic text-cream/60 text-base leading-relaxed">
                  Delivery structures are aligned with regional infrastructure conditions across
                  Middle East and Africa markets.
                </p>
              </blockquote>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Contract Supply ─────────────────────────────────────────────────────────

function ContractSupply() {
  const contractItems = [
    {
      num: '01',
      title: 'Fixed-Term Pricing Alignment',
      description:
        'Agreed pricing structures maintained across defined contract durations supporting operational budget planning.',
    },
    {
      num: '02',
      title: 'Forecast-Based Procurement Planning',
      description:
        'Procurement schedules coordinated against operational forecasts enabling proactive supply management.',
    },
    {
      num: '03',
      title: 'Category Allocation Agreements',
      description:
        'Defined product category allocations ensuring consistent access to priority product lines.',
    },
    {
      num: '04',
      title: 'Volume Stability Expectations',
      description:
        'Structured volume commitments providing mutual visibility across supply and procurement cycles.',
    },
    {
      num: '05',
      title: 'Delivery Cycle Coordination',
      description:
        'Delivery schedules aligned with operational requirements and regional logistics capabilities.',
    },
  ]

  return (
    <section className="py-[var(--spacing-section)] bg-parchment">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          <div className="col-span-12 lg:col-span-4">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Contract Supply
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight mb-6">
                Structured Long-Term Frameworks
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base leading-relaxed">
                Where applicable, structured supply relationships may operate within defined
                commercial frameworks supporting long-term procurement planning. Contract frameworks
                support operational predictability and strengthen supply continuity across extended
                procurement cycles.
              </p>
            </FadeIn>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-1 gap-px bg-mist/30">
              {contractItems.map((item, i) => (
                <FadeIn key={item.num} delay={i * 0.07}>
                  <div className="bg-parchment px-8 py-6 flex gap-8 items-start">
                    <span className="text-xs font-heading text-gold/60 shrink-0 pt-1">
                      {item.num}
                    </span>
                    <div>
                      <h3 className="font-heading text-sm font-medium text-obsidian uppercase tracking-wide mb-2">
                        {item.title}
                      </h3>
                      <p className="text-stone text-sm leading-relaxed">{item.description}</p>
                    </div>
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

// ─── Scalable Procurement ────────────────────────────────────────────────────

function ScalableProcurement() {
  const scalabilityFactors = [
    'Production capacity stability',
    'Specification consistency across increased output',
    'Logistics alignment with increased order volume',
    'Continuity of sourcing pathways',
  ]

  return (
    <section className="py-[var(--spacing-section)] bg-cream">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="flex-1 max-w-xl">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Scalable Procurement
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-tight mb-6">
                Growing With Your Operations
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed mb-6">
                Commercial clients may scale procurement volumes according to operational expansion
                requirements. Scalable supply structures enable organizations to expand operations
                without requiring significant adjustments to ingredient sourcing structures.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-stone text-base leading-relaxed">
                Supply scalability supports operational growth across multiple locations.
              </p>
            </FadeIn>
          </div>

          <div className="flex-1">
            <FadeIn delay={0.2}>
              <div className="bg-parchment border border-mist/40 p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-gold font-heading mb-6">
                  Scalability considerations
                </p>
                <div className="space-y-4">
                  {scalabilityFactors.map((f, i) => (
                    <div key={f} className="flex items-start gap-4">
                      <span className="text-xs font-heading text-gold/60 shrink-0 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-obsidian font-medium">{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-obsidian p-6 text-center">
                  <p className="font-luxury text-3xl text-gold mb-2">Multi</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-cream/50">
                    Location Support
                  </p>
                </div>
                <div className="bg-obsidian p-6 text-center">
                  <p className="font-luxury text-3xl text-gold mb-2">Flexible</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-cream/50">Volume Tiers</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Statement ───────────────────────────────────────────────────────────────

function Statement() {
  return (
    <section className="py-[var(--spacing-section)] bg-parchment">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 text-center">
        <FadeIn>
          <span className="inline-block w-8 h-px bg-gold mb-10" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-6">
            Our Positioning
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <blockquote className="font-luxury text-2xl lg:text-[40px] font-light text-obsidian leading-[1.3] tracking-tight max-w-4xl mx-auto mb-8">
            Commercial food environments require ingredients that remain consistent across repeated
            operational use. Our supply structure is designed to align product characteristics with
            professional preparation standards and manufacturing requirements.
          </blockquote>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="text-stone text-base leading-relaxed max-w-2xl mx-auto">
            Structured commercial relationships support continuity across procurement cycles while
            maintaining defined product specifications. Commercial clients benefit from coordinated
            sourcing aligned with operational reliability requirements.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Commercial CTA ──────────────────────────────────────────────────────────

function CommercialCTA() {
  const imgRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-[var(--spacing-section-lg)] bg-obsidian overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1 max-w-xl">
            <FadeIn>
              <span className="inline-block w-8 h-px bg-gold mb-8" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Commercial Inquiry
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-cream leading-[1.1] tracking-tight mb-6">
                Submit a Commercial Inquiry
              </h2>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-stone text-base lg:text-lg leading-relaxed mb-4">
                Organizations seeking structured ingredient supply may submit procurement inquiries
                outlining product categories, estimated volume requirements, and regional location.
              </p>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="text-stone text-base leading-relaxed mb-10">
                Supply feasibility is evaluated based on category availability, logistics alignment,
                and production continuity considerations.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton>
                  <Link
                    href="/contact"
                    className="inline-block bg-gold text-obsidian font-heading text-xs uppercase tracking-[0.2em] px-10 py-4 no-underline hover:bg-gold/90 transition-colors"
                  >
                    Submit Commercial Inquiry
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href="/sourcing"
                    className="inline-block border border-cream/30 text-cream font-heading text-xs uppercase tracking-[0.2em] px-8 py-4 no-underline hover:border-cream/60 transition-colors"
                  >
                    View Sourcing Network
                  </Link>
                </MagneticButton>
              </div>
            </FadeIn>
          </div>

          <div className="flex-1 relative h-[560px] overflow-hidden">
            <FadeIn direction="right" delay={0.2}>
              <div ref={imgRef} className="absolute inset-[-40px]">
                <Image
                  src="/images/commercial/nahima-aparicio-xYiVI-TQvAE-unsplash.avif"
                  alt="Commercial supply partnership — Delicious Planet"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page Export ─────────────────────────────────────────────────────────────

export function CommercialPageClient() {
  return (
    <>
      <Hero />
      <OperationalScope />
      <CategoryCoverage />
      <VolumePricing />
      <ContinuityPlanning />
      <SpecificationStability />
      <MultiRegion />
      <PrivateLabel />
      <LogisticsCoordination />
      <ContractSupply />
      <ScalableProcurement />
      <Statement />
      <CommercialCTA />
    </>
  )
}
