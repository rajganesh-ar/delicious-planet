'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

/* ────────────────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────────────────── */

const focusPoints = [
  {
    n: '01',
    title: 'Reliable availability',
    body: 'Multi-origin sourcing and disciplined fulfilment to keep shelves stocked through cycles.',
  },
  {
    n: '02',
    title: 'Quality and compliance',
    body: 'Verified suppliers, batch-level traceability, and documentation aligned to retailer protocols.',
  },
  {
    n: '03',
    title: 'Partner-oriented flexibility',
    body: 'Distribution structures that adapt to format, geography, and demand cadence.',
  },
]

const portfolio = [
  {
    label: 'Category 01',
    title: 'Fresh & Perishable',
    body: 'Produce, dairy, and short-shelf-life lines moved through controlled, time-critical flows.',
    img: '/images/retail/category-fresh.avif',
    span: 'lg:col-span-7',
    aspect: 'aspect-[16/10]',
  },
  {
    label: 'Category 02',
    title: 'Packaged & Shelf-Stable',
    body: 'Pantry essentials and ambient ranges built for predictable replenishment cycles.',
    img: '/images/retail/category-shelfstable.avif',
    span: 'lg:col-span-5',
    aspect: 'aspect-[4/3]',
  },
  {
    label: 'Category 03',
    title: 'Specialty & Regional',
    body: 'Origin-specific items that differentiate assortments and serve local consumption patterns.',
    img: '/images/retail/category-specialty.avif',
    span: 'lg:col-span-5',
    aspect: 'aspect-[4/3]',
  },
  {
    label: 'Category 04',
    title: 'Private Label–Ready',
    body: 'Sourced and finished to retailer brand specifications, with flexible packaging support.',
    img: '/images/retail/category-privatelabel.avif',
    span: 'lg:col-span-7',
    aspect: 'aspect-[16/10]',
  },
]

const fulfilment = [
  {
    kicker: 'Sourcing',
    title: 'Multi-origin strategy',
    body: 'Critical lines sourced from more than one qualified region to absorb disruption without breaking supply.',
  },
  {
    kicker: 'Coordination',
    title: 'Centralised procurement',
    body: 'Procurement and distribution coordinated centrally — one accountable interface across origins.',
  },
  {
    kicker: 'Replenishment',
    title: 'Defined cycles',
    body: 'Scheduled deliveries and inventory triggers that align to retailer forecasting rhythms.',
  },
]

const compliance = [
  {
    kicker: 'Supplier Qualification',
    points: [
      'Verified onboarding before any product enters the network',
      'Documented food safety and hygiene capability',
      'Defined timelines for upgrading to formal certification',
    ],
  },
  {
    kicker: 'Product Documentation',
    points: [
      'Specifications, certificates, and lot records on file',
      'Batch-level traceability across the supply chain',
      'Retailer-specific quality protocols supported on request',
    ],
  },
  {
    kicker: 'Handling & Storage',
    points: [
      'Temperature integrity maintained across distribution points',
      'Approved logistics partners with documented handling standards',
      'Compliance with local regulatory frameworks',
    ],
  },
]

const privateLabelCapabilities = [
  {
    n: '01',
    title: 'Brand-aligned sourcing',
    body: 'Inputs selected against retailer brand specifications — taste profile, origin, certifications.',
  },
  {
    n: '02',
    title: 'Flexible packaging',
    body: 'Pack format, labelling, and language adapted to retail format and market.',
  },
  {
    n: '03',
    title: 'Approved manufacturing',
    body: 'Co-ordination with vetted manufacturing partners under structured oversight.',
  },
]

const demandSteps = [
  {
    n: '01',
    title: 'Demand Signal',
    body: 'Sales and inventory data captured through structured retailer communication.',
  },
  {
    n: '02',
    title: 'Forecast Alignment',
    body: 'Demand patterns mapped against sourcing lead times and origin capacity.',
  },
  {
    n: '03',
    title: 'Replenishment',
    body: 'Volume and cadence adjusted in coordination with retailer planning cycles.',
  },
  {
    n: '04',
    title: 'Review',
    body: 'Service levels, fill rate, and accuracy reviewed and refined over time.',
  },
]

const partnershipAttributes = [
  { t: 'Defined service levels', d: 'Expectations set up front, not negotiated mid-cycle.' },
  { t: 'Open communication', d: 'A single channel for forecasts, escalations, and issue resolution.' },
  { t: 'Demand-responsive', d: 'Capacity adjusts in line with retailer cycles, not the other way round.' },
  { t: 'Incremental scaling', d: 'Engagement expands with reliability — never with volume alone.' },
]

const regions = [
  {
    label: 'Established',
    title: 'Mature Retail Markets',
    body: 'Modern trade chains and specialty retailers in markets with structured demand and clear regulatory frameworks.',
    img: '/images/retail/region-mature.avif',
  },
  {
    label: 'Emerging',
    title: 'Growth Markets',
    body: 'Selected emerging markets where sourcing feasibility and regulatory clarity allow disciplined entry.',
    img: '/images/retail/region-growth.avif',
  },
  {
    label: 'Adaptive',
    title: 'Local Assortment',
    body: 'Product mix calibrated to regional consumption patterns, not transplanted from one market to another.',
    img: '/images/retail/region-local.avif',
  },
]

const roadmap = [
  {
    horizon: 'Now',
    title: 'Operational Foundations',
    body: 'Defined fulfilment processes, qualified supplier base, batch-level documentation, and structured partner onboarding.',
  },
  {
    horizon: 'Next',
    title: 'Capability Expansion',
    body: 'Broader category depth, deeper logistics infrastructure, and improved demand-planning integration with retailers.',
  },
  {
    horizon: 'Later',
    title: 'Network Maturity',
    body: 'Multi-region distribution at scale, advanced data and analytics, and a private-label programme operating across categories.',
  },
]

const partnerChecklist = [
  'Product categories of interest',
  'Market and geographic coverage',
  'Volume requirements and timelines',
]

/* ────────────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────────────── */

export function RetailPageClient() {
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
      {/* ═══ Hero — Editorial split, parallax background ═══ */}
      <section
        ref={refCallback}
        className="relative min-h-[88vh] flex items-end overflow-hidden bg-obsidian"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/retail/hero-retail.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/70 to-obsidian/30" />
        </motion.div>

        <div className="relative z-10 max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pb-20 lg:pb-28 pt-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <motion.p
                className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Retail
              </motion.p>
              <motion.h1
                className="font-luxury text-4xl sm:text-5xl lg:text-[64px] xl:text-[76px] font-light text-cream leading-[1.02] tracking-[-0.03em] m-0"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Built to supply.
                <br />
                <span className="text-gold">Designed to scale.</span>
              </motion.h1>
            </div>

            <motion.div
              className="lg:col-span-4 lg:col-start-9"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6 }}
            >
              <div className="w-12 h-px bg-gold mb-5" />
              <p className="text-cream/70 text-base lg:text-lg leading-relaxed m-0">
                A retail supply model engineered around reliability, transparency, and structured
                partnership — bridging global sourcing with local market requirements.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Approach Statement ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Our Retail Approach
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Built to be relied upon.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FadeIn delay={0.1}>
                <p className="text-stone text-lg lg:text-xl leading-relaxed m-0 mb-6">
                  We work with retail partners to deliver consistent, high-quality food products
                  supported by dependable supply and transparent sourcing — bridging global
                  capability with the rhythm of local markets.
                </p>
                <p className="text-stone/80 text-base lg:text-lg leading-relaxed m-0">
                  Our objective is to be a structured and predictable supply partner for retailers
                  operating in both established and emerging markets.
                </p>
              </FadeIn>
            </div>
          </div>

          {/* Three focus points — minimal numbered grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist/40 mt-16 lg:mt-24 rounded-sm overflow-hidden">
            {focusPoints.map((p, i) => (
              <FadeIn key={p.n} delay={i * 0.1}>
                <div className="bg-cream p-8 lg:p-10 h-full">
                  <span className="font-luxury text-gold text-sm tracking-[0.3em] block mb-5">
                    {p.n}
                  </span>
                  <h3 className="font-luxury text-xl lg:text-2xl font-medium text-obsidian m-0 mb-3">
                    {p.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Product Portfolio — bento mosaic ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14 lg:mb-20">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Product Portfolio
                </p>
                <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  A portfolio shaped by retail demand — not by what&rsquo;s easy to source.
                </h2>
              </div>
              <p className="text-stone text-sm max-w-sm">
                Curated categories aligned to retail demand patterns, scalable supply, and evolving
                consumer preferences.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {portfolio.map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.08} className={`${c.span} group`}>
                <article className="relative h-full bg-cream rounded-sm overflow-hidden">
                  <div className={`relative ${c.aspect} overflow-hidden`}>
                    <Image
                      src={c.img}
                      alt={c.title}
                      fill
                      sizes="(max-width:1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-obsidian/55 via-obsidian/10 to-transparent" />
                    <span className="absolute top-6 left-6 text-[10px] uppercase tracking-[0.3em] text-cream/85 font-medium">
                      {c.label}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9">
                      <h3 className="font-luxury text-2xl lg:text-3xl font-medium text-cream m-0 mb-3">
                        {c.title}
                      </h3>
                      <p className="text-cream/75 text-sm lg:text-base leading-relaxed m-0 max-w-md">
                        {c.body}
                      </p>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <p className="text-stone/70 text-sm italic font-luxury mt-10 max-w-2xl">
              As our sourcing network expands, category depth and geographic variety will broaden
              alongside it — paced by quality, not quantity.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Supply Reliability & Fulfilment ═══ */}
      <section className="py-(--spacing-section-lg) bg-obsidian">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-14 lg:mb-20">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
                  Supply Reliability
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                  Predictable supply, engineered.
                </h2>
                <p className="text-cream/65 text-base lg:text-lg leading-relaxed m-0">
                  Retail operations run on predictability. Our supply chain is structured to deliver
                  it — through diversified sourcing, central coordination, and disciplined
                  replenishment.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-3 gap-6 lg:gap-10 w-full">
                  {[
                    { v: 'Multi', l: 'Origin sourcing' },
                    { v: '1', l: 'Central interface' },
                    { v: '24/7', l: 'Forecast aligned' },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className="font-luxury text-3xl lg:text-5xl font-light text-gold m-0 mb-2">
                        {s.v}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-cream/50 font-medium m-0">
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-cream/10 rounded-sm overflow-hidden">
            {fulfilment.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className="bg-obsidian p-8 lg:p-10 h-full flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold/80 font-medium mb-6">
                    {f.kicker}
                  </span>
                  <h3 className="font-luxury text-xl lg:text-2xl font-medium text-cream m-0 mb-4">
                    {f.title}
                  </h3>
                  <p className="text-cream/65 text-sm leading-relaxed m-0">{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Quality & Compliance — sticky image + standards stack ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Quality & Compliance
                </p>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.15] tracking-tight m-0 mb-6">
                  Compliance is the floor.
                  <br />
                  Not the ceiling.
                </h2>
                <p className="text-stone text-base leading-relaxed m-0 mb-8">
                  Every product supplied to retail partners is aligned with applicable food safety
                  and regulatory requirements — supported by documentation that holds up to audit.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="relative aspect-4/5 rounded-sm overflow-hidden">
                  <Image
                    src="/images/retail/retail-quality.avif"
                    alt="Quality verification"
                    fill
                    sizes="(max-width:1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian/40 to-transparent" />
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-7 lg:col-start-6 space-y-px bg-mist/40 rounded-sm overflow-hidden">
              {compliance.map((s, i) => (
                <FadeIn key={s.kicker} delay={i * 0.1}>
                  <div className="bg-cream p-7 lg:p-9">
                    <div className="flex items-center gap-4 mb-5">
                      <span className="font-luxury text-gold text-xs tracking-[0.3em]">
                        0{i + 1}
                      </span>
                      <div className="w-8 h-px bg-gold/50" />
                      <h3 className="font-luxury text-lg lg:text-xl font-medium text-obsidian m-0">
                        {s.kicker}
                      </h3>
                    </div>
                    <ul className="list-none m-0 p-0 space-y-3">
                      {s.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-3">
                          <span className="text-gold mt-0.5 shrink-0" aria-hidden>
                            —
                          </span>
                          <span className="text-stone text-sm leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Private Label — full-bleed split feature ═══ */}
      <section className="bg-forest text-cream overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <FadeIn className="lg:col-span-6">
            <div className="relative aspect-4/5 lg:aspect-auto lg:min-h-170">
              <Image
                src="/images/retail/retail-privatelabel.avif"
                alt="Private label packaging"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-forest/30 via-transparent to-forest/30" />
            </div>
          </FadeIn>

          <div className="lg:col-span-6 px-5 sm:px-6 md:px-10 lg:px-16 py-16 lg:py-24 flex flex-col justify-center">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5">
                Private Label & Customisation
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                Your brand.
                <br />
                Our infrastructure.
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/75 text-base lg:text-lg leading-relaxed m-0 mb-10 max-w-lg">
                Structured private-label support — sourcing, packaging, and manufacturing
                co-ordination — that maintains consistency in quality and supply while letting your
                brand take the foreground.
              </p>
            </FadeIn>

            <div className="space-y-px bg-cream/15 rounded-sm overflow-hidden max-w-xl">
              {privateLabelCapabilities.map((c, i) => (
                <FadeIn key={c.n} delay={0.2 + i * 0.08}>
                  <div className="bg-forest p-6 lg:p-7 flex items-start gap-6">
                    <span className="font-luxury text-gold text-sm tracking-[0.3em] shrink-0 mt-1">
                      {c.n}
                    </span>
                    <div>
                      <h3 className="font-luxury text-lg font-medium text-cream m-0 mb-2">
                        {c.title}
                      </h3>
                      <p className="text-cream/70 text-sm leading-relaxed m-0">{c.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Data & Demand Alignment — horizontal stepped journey ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Data & Demand Alignment
              </p>
              <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                Demand visibility, not guesswork.
              </h2>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mt-6 max-w-2xl mx-auto">
                Supply that aligns to retail demand cycles — through structured planning,
                tracking, and two-way communication that improves with each cycle.
              </p>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gold/30" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
              {demandSteps.map((s, i) => (
                <FadeIn key={s.n} delay={i * 0.1}>
                  <div className="relative">
                    <div className="hidden lg:flex w-4 h-4 rounded-full bg-gold absolute top-8 left-0 -translate-y-1/2 ring-8 ring-cream" />
                    <div className="lg:pl-10">
                      <span className="font-luxury text-gold text-sm tracking-[0.3em] block mb-3">
                        {s.n}
                      </span>
                      <h3 className="font-luxury text-xl font-medium text-obsidian m-0 mb-3">
                        {s.title}
                      </h3>
                      <p className="text-stone text-sm leading-relaxed m-0">{s.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Partnership Model — editorial pull-quote ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <FadeIn delay={0.05} className="lg:col-span-5">
              <div className="relative aspect-4/5 rounded-sm overflow-hidden">
                <Image
                  src="/images/retail/retail-partnership.avif"
                  alt="Retail partnership"
                  fill
                  sizes="(max-width:1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/30 to-transparent" />
              </div>
            </FadeIn>

            <div className="lg:col-span-6 lg:col-start-7">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5">
                  Partnership Model
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="font-luxury text-2xl lg:text-[34px] font-light text-obsidian leading-tight tracking-tight m-0 mb-8">
                  &ldquo;Distributors transact. Partners build. We measure ourselves on the
                  relationships that compound — not the orders that close.&rdquo;
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="w-12 h-px bg-gold mb-6" />
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {partnershipAttributes.map((x) => (
                    <div key={x.t}>
                      <p className="font-luxury text-base text-obsidian m-0 mb-1">{x.t}</p>
                      <p className="text-stone text-sm leading-relaxed m-0">{x.d}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Geographic Expansion — region mosaic ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14 lg:mb-16">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Geographic Expansion
                </p>
                <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Global by design.
                  <br />
                  Local by execution.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  Expansion is paced to maintain operational control. We enter markets where
                  sourcing and logistics feasibility align — and adapt the assortment to local
                  consumption rather than transplanting it.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist/40 rounded-sm overflow-hidden">
            {regions.map((r, i) => (
              <FadeIn key={r.label} delay={i * 0.1}>
                <div className="bg-cream h-full flex flex-col">
                  <div className="relative aspect-5/3 overflow-hidden">
                    <Image
                      src={r.img}
                      alt={r.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-7 lg:p-9 flex-1 flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                      {r.label}
                    </span>
                    <h3 className="font-luxury text-xl lg:text-2xl font-medium text-obsidian m-0 mb-3">
                      {r.title}
                    </h3>
                    <p className="text-stone text-sm leading-relaxed m-0">{r.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Looking Ahead — Now/Next/Later ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Looking Ahead
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  The retail roadmap.
                </h2>
              </div>
              <p className="text-stone text-sm max-w-sm">
                Becoming a dependable, scalable retail supply partner — paced by quality and
                operational discipline.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmap.map((r, i) => (
              <FadeIn key={r.horizon} delay={i * 0.1}>
                <div
                  className={`rounded-sm p-8 lg:p-10 h-full flex flex-col ${
                    i === 0
                      ? 'bg-obsidian text-cream'
                      : i === 1
                        ? 'bg-cream text-obsidian'
                        : 'bg-cream/60 text-obsidian'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-6">
                    {r.horizon}
                  </span>
                  <h3
                    className={`font-luxury text-2xl lg:text-3xl font-light m-0 mb-4 ${
                      i === 0 ? 'text-cream' : 'text-obsidian'
                    }`}
                  >
                    {r.title}
                  </h3>
                  <p
                    className={`text-sm lg:text-base leading-relaxed m-0 ${
                      i === 0 ? 'text-cream/70' : 'text-stone'
                    }`}
                  >
                    {r.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Partner With Us — checklist + CTA ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-275 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="bg-obsidian rounded-sm p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <FadeIn>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                    Partner With Us
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                    Engaging retail partners — one structured relationship at a time.
                  </h2>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <p className="text-cream/70 text-base leading-relaxed m-0 mb-8">
                    We are actively engaging with retail partners seeking a structured and reliable
                    sourcing and distribution partner. To explore collaboration, share:
                  </p>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <ul className="list-none m-0 p-0 space-y-3 mb-10">
                    {partnerChecklist.map((c) => (
                      <li key={c} className="flex items-start gap-3">
                        <span
                          className="w-5 h-5 rounded-full border border-gold/60 shrink-0 flex items-center justify-center mt-0.5"
                          aria-hidden
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        </span>
                        <span className="text-cream/85 text-sm leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              </div>

              <div className="lg:col-span-4 lg:col-start-9">
                <FadeIn delay={0.25}>
                  <MagneticButton>
                    <Link
                      href="/contact"
                      className="inline-block w-full text-center bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-5 rounded-sm no-underline hover:bg-gold-light transition-colors"
                    >
                      Start a Retail Conversation
                    </Link>
                  </MagneticButton>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <Link
                    href="/b2b"
                    className="block text-center mt-4 text-cream/60 text-xs uppercase tracking-widest hover:text-gold transition-colors no-underline"
                  >
                    or explore B2B distribution &rarr;
                  </Link>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
