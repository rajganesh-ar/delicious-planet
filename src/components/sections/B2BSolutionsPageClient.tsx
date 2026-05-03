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

const approachPillars = [
  {
    n: '01',
    title: 'Reliable bulk supply',
    body: 'Multi-origin sourcing depth that holds steady across categories, cycles, and demand spikes.',
  },
  {
    n: '02',
    title: 'Standardised quality',
    body: 'Specifications, documentation, and compliance protocols engineered for institutional buyers.',
  },
  {
    n: '03',
    title: 'Demand-aligned fulfilment',
    body: 'Supply structures built around the operational rhythm of the partners we serve — not ours.',
  },
]

const segments = [
  {
    label: 'Segment 01',
    title: 'Foodservice Operators',
    body: 'Restaurants, hotel groups, and catering services running multi-site operations that depend on uninterrupted supply.',
    img: '/images/b2b/b2b-segment-horeca.avif',
    span: 'lg:col-span-7',
    aspect: 'aspect-[16/10]',
  },
  {
    label: 'Segment 02',
    title: 'Food Manufacturers',
    body: 'Processors and ingredient buyers requiring spec-aligned inputs at industrial volume and consistent grade.',
    img: '/images/b2b/b2b-segment-manufacturer.avif',
    span: 'lg:col-span-5',
    aspect: 'aspect-[4/3]',
  },
  {
    label: 'Segment 03',
    title: 'Institutional Buyers',
    body: 'Corporate kitchens, healthcare, and education operating to budget cycles, audit standards, and capacity plans.',
    img: '/images/b2b/b2b-segment-institutional.avif',
    span: 'lg:col-span-5',
    aspect: 'aspect-[4/3]',
  },
  {
    label: 'Segment 04',
    title: 'Wholesale Distributors',
    body: 'Resellers and regional distributors needing predictable allocation and clean documentation across SKUs.',
    img: '/images/b2b/b2b-segment-wholesale.avif',
    span: 'lg:col-span-7',
    aspect: 'aspect-[16/10]',
  },
]

const categories = [
  {
    n: '01',
    title: 'Fresh & Perishable',
    body: 'Produce and short-shelf-life inputs handled through controlled, time-critical flows.',
  },
  {
    n: '02',
    title: 'Frozen & Temperature-Controlled',
    body: 'Cold-chain integrity from origin to delivery — preserved across handoffs and geographies.',
  },
  {
    n: '03',
    title: 'Dry & Bulk Commodities',
    body: 'High-volume staples, sourced consistently and documented for institutional procurement.',
  },
  {
    n: '04',
    title: 'Processed & Semi-Processed',
    body: 'Ingredient-grade inputs aligned to manufacturing and foodservice specifications.',
  },
]

const supplyPriorities = [
  { v: 'Multi', l: 'Origin sourcing' },
  { v: '1', l: 'Accountable interface' },
  { v: 'Scheduled', l: 'Contract delivery' },
]

const supplyChainBlocks = [
  {
    kicker: 'Procurement',
    title: 'Bulk & consolidated sourcing',
    body: 'Volume orders aggregated across qualified origins to compress lead times and absorb regional disruption.',
  },
  {
    kicker: 'Inventory',
    title: 'Demand-pattern allocation',
    body: 'Stock positioned against forecast and order history — not held speculatively, not pulled reactively.',
  },
  {
    kicker: 'Delivery',
    title: 'Contract-based scheduling',
    body: 'Recurring order cycles tied to partner production schedules, with capacity to scale without rework.',
  },
]

const compliance = [
  {
    kicker: 'Supplier Qualification',
    points: [
      'Onboarding aligned to international food safety standards',
      'Documented capability before product enters the network',
      'Defined timelines for certification upgrades where required',
    ],
  },
  {
    kicker: 'Product Documentation',
    points: [
      'Specifications, certificates, and lot records on file',
      'Batch-level traceability across the supply chain',
      'Partner-specific protocols supported on request',
    ],
  },
  {
    kicker: 'Handling & Storage',
    points: [
      'Category-specific protocols across temperature zones',
      'Approved logistics partners under documented standards',
      'Compliance with regulatory frameworks at origin and destination',
    ],
  },
]

const customisation = [
  {
    n: '01',
    title: 'Contract sourcing',
    body: 'Fixed-term supply agreements with predictable pricing, allocation, and continuity commitments.',
  },
  {
    n: '02',
    title: 'Specification alignment',
    body: 'Grade, size, processing level, and origin matched to partner requirements — not catalogue defaults.',
  },
  {
    n: '03',
    title: 'Custom packaging',
    body: 'Pack format, labelling, and language adapted to operational and regional needs.',
  },
]

const planningSteps = [
  {
    n: '01',
    title: 'Forecast Capture',
    body: 'Partner demand cycles, volume commitments, and lead-time constraints captured up front.',
  },
  {
    n: '02',
    title: 'Origin Allocation',
    body: 'Volumes mapped against qualified origins with capacity buffers built into the allocation.',
  },
  {
    n: '03',
    title: 'Coordinated Execution',
    body: 'Procurement and logistics co-ordinated through one accountable interface across the cycle.',
  },
  {
    n: '04',
    title: 'Performance Review',
    body: 'Fill rate, on-time delivery, and quality indicators reviewed and refined every cycle.',
  },
]

const continuityLevers = [
  {
    title: 'Multi-origin sourcing',
    body: 'Critical commodities sourced from more than one qualified region to absorb shocks without breaking supply.',
  },
  {
    title: 'Supplier monitoring',
    body: 'Ongoing performance review across quality, on-time delivery, and documentation accuracy.',
  },
  {
    title: 'Contingency planning',
    body: 'Pre-defined fallback routes for logistics interruptions and supply-side volatility.',
  },
]

const partnershipPrinciples = [
  { t: 'Service-level clarity', d: 'Expectations agreed up front — not negotiated under pressure.' },
  { t: 'Transparent communication', d: 'A single accountable channel across forecasts, escalations, and reviews.' },
  { t: 'Long-term orientation', d: 'Engagement structured for recurring cycles, not spot transactions.' },
  { t: 'Earned scaling', d: 'Volume grows with demonstrated reliability — never on volume alone.' },
]

const infrastructure = [
  {
    horizon: 'Now',
    title: 'Operational Foundations',
    body: 'Qualified supplier base, structured documentation, defined fulfilment processes, and accountable partner onboarding.',
  },
  {
    horizon: 'Next',
    title: 'Capacity & Network Expansion',
    body: 'Storage and handling capability, broader category coverage, and deeper logistics co-ordination across regions.',
  },
  {
    horizon: 'Later',
    title: 'Integrated Supply Partner',
    body: 'Multi-region distribution at scale, advanced demand-planning integration, and deeper supplier-side data integration.',
  },
]

const inquiryChecklist = [
  'Product requirements and specifications',
  'Expected volumes and delivery frequency',
  'Geographic scope and regulatory context',
]

/* ────────────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────────────── */

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
      {/* ═══ Hero — Editorial split, parallax background ═══ */}
      <section
        ref={refCallback}
        className="relative min-h-[88vh] flex items-end overflow-hidden bg-obsidian"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/b2b/hero-b2b.avif"
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
                B2B Solutions
              </motion.p>
              <motion.h1
                className="font-luxury text-4xl sm:text-5xl lg:text-[64px] xl:text-[76px] font-light text-cream leading-[1.02] tracking-[-0.03em] m-0"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Built for operations.
                <br />
                <span className="text-gold">Engineered for scale.</span>
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
                Structured sourcing and distribution for businesses that depend on consistency,
                volume capability, and supply discipline — across foodservice, manufacturing, and
                wholesale.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ B2B Approach — split header + numbered focus grid ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Our B2B Approach
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Operations first.
                  <br />
                  Volume second.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FadeIn delay={0.1}>
                <p className="text-stone text-lg lg:text-xl leading-relaxed m-0 mb-6">
                  Our B2B model is built for partners who measure suppliers on consistency, fill
                  rate, and continuity — not on price alone. We structure supply around the
                  operational rhythm of foodservice, manufacturing, and wholesale.
                </p>
                <p className="text-stone/80 text-base lg:text-lg leading-relaxed m-0">
                  As we expand, we scale capability deliberately — paced by the standards
                  institutional buyers expect, across regional and cross-border requirements.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist/40 mt-16 lg:mt-24 rounded-sm overflow-hidden">
            {approachPillars.map((p, i) => (
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

      {/* ═══ Customer Segments — bento mosaic ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14 lg:mb-20">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Who We Serve
                </p>
                <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Different operations.
                  <br />
                  Different supply structures.
                </h2>
              </div>
              <p className="text-stone text-sm max-w-sm">
                Each segment carries distinct operational needs. We align the supply structure
                accordingly — rather than retrofitting one model to all partners.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {segments.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.08} className={`${s.span} group`}>
                <article className="relative h-full bg-cream rounded-sm overflow-hidden">
                  <div className={`relative ${s.aspect} overflow-hidden`}>
                    <Image
                      src={s.img}
                      alt={s.title}
                      fill
                      sizes="(max-width:1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-obsidian/55 via-obsidian/10 to-transparent" />
                    <span className="absolute top-6 left-6 text-[10px] uppercase tracking-[0.3em] text-cream/85 font-medium">
                      {s.label}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9">
                      <h3 className="font-luxury text-2xl lg:text-3xl font-medium text-cream m-0 mb-3">
                        {s.title}
                      </h3>
                      <p className="text-cream/75 text-sm lg:text-base leading-relaxed m-0 max-w-md">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Product & Category Coverage — image-led split + numbered list ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream overflow-hidden">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <FadeIn delay={0.05} className="lg:col-span-5">
              <div className="relative aspect-4/5 rounded-sm overflow-hidden">
                <Image
                  src="/images/b2b/b2b-categories.avif"
                  alt="B2B product categories"
                  fill
                  sizes="(max-width:1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/30 to-transparent" />
                <span className="absolute top-6 left-6 text-[10px] uppercase tracking-[0.3em] text-cream/90 font-medium">
                  Category Coverage
                </span>
              </div>
            </FadeIn>

            <div className="lg:col-span-6 lg:col-start-7">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Categories
                </p>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.15] tracking-tight m-0 mb-6">
                  Scalable categories.
                  <br />
                  Industrial-grade specifications.
                </h2>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-10">
                  Our B2B portfolio is centred on high-demand categories — sourced for batch
                  consistency, supply stability, and alignment with industry-grade specifications.
                </p>
              </FadeIn>

              <div className="space-y-px bg-mist/40 rounded-sm overflow-hidden">
                {categories.map((c, i) => (
                  <FadeIn key={c.n} delay={0.1 + i * 0.06}>
                    <div className="bg-cream p-6 lg:p-7 flex items-start gap-6">
                      <span className="font-luxury text-gold text-sm tracking-[0.3em] shrink-0 mt-1">
                        {c.n}
                      </span>
                      <div>
                        <h3 className="font-luxury text-lg font-medium text-obsidian m-0 mb-1.5">
                          {c.title}
                        </h3>
                        <p className="text-stone text-sm leading-relaxed m-0">{c.body}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.4}>
                <p className="text-stone/70 text-sm italic font-luxury mt-8">
                  As our sourcing network matures, we expand into more specialised and value-added
                  categories — paced by capability, not appetite.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Supply Chain & Fulfilment — dark section ═══ */}
      <section className="relative py-(--spacing-section-lg) bg-obsidian overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/images/b2b/b2b-supply-chain.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-obsidian via-obsidian/85 to-obsidian" />
        </div>

        <div className="relative z-10 max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-14 lg:mb-20">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
                  Supply Chain & Fulfilment
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                  Predictability,
                  <br />
                  by design.
                </h2>
                <p className="text-cream/65 text-base lg:text-lg leading-relaxed m-0">
                  B2B partners depend on precision. Our operations are structured for recurring
                  order cycles, volume scaling without disruption, and tight co-ordination with
                  partner production schedules.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-3 gap-6 lg:gap-10 w-full">
                  {supplyPriorities.map((s) => (
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
            {supplyChainBlocks.map((b, i) => (
              <FadeIn key={b.title} delay={i * 0.1}>
                <div className="bg-obsidian p-8 lg:p-10 h-full flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold/80 font-medium mb-6">
                    {b.kicker}
                  </span>
                  <h3 className="font-luxury text-xl lg:text-2xl font-medium text-cream m-0 mb-4">
                    {b.title}
                  </h3>
                  <p className="text-cream/65 text-sm leading-relaxed m-0">{b.body}</p>
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
                  Audit-ready,
                  <br />
                  not audit-anxious.
                </h2>
                <p className="text-stone text-base leading-relaxed m-0 mb-8">
                  Every product supplied through our B2B channel is aligned to applicable food
                  safety and regulatory requirements — supported by documentation that holds up to
                  partner-side and regulatory audit.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="relative aspect-4/5 rounded-sm overflow-hidden">
                  <Image
                    src="/images/b2b/b2b-quality.avif"
                    alt="Quality assurance and compliance"
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

      {/* ═══ Customisation & Contract Supply — full-bleed forest split ═══ */}
      <section className="bg-forest text-cream overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <FadeIn className="lg:col-span-6">
            <div className="relative aspect-4/5 lg:aspect-auto lg:min-h-170">
              <Image
                src="/images/b2b/b2b-customisation.avif"
                alt="Contract supply and customised packaging"
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
                Customisation & Contract Supply
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                Structured flexibility.
                <br />
                Without the inconsistency.
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/75 text-base lg:text-lg leading-relaxed m-0 mb-10 max-w-lg">
                B2B buyers rarely fit catalogue defaults. Our contract supply model adapts to
                specification, packaging, and commitment structures — without compromising
                consistency across cycles.
              </p>
            </FadeIn>

            <div className="space-y-px bg-cream/15 rounded-sm overflow-hidden max-w-xl">
              {customisation.map((c, i) => (
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

      {/* ═══ Demand Planning — horizontal stepped journey ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Demand Planning & Coordination
              </p>
              <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                Forecast in.
                <br />
                Reliability out.
              </h2>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mt-6 max-w-2xl mx-auto">
                Efficient B2B supply depends on alignment with partner demand cycles — captured
                early, allocated cleanly, and reviewed every cycle.
              </p>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gold/30" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
              {planningSteps.map((s, i) => (
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

      {/* ═══ Risk & Continuity — dark band, three levers ═══ */}
      <section className="py-(--spacing-section-lg) bg-obsidian">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-12 lg:mb-16">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
                  Risk & Continuity
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight m-0">
                  Resilience,
                  <br />
                  built into the model.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <p className="text-cream/65 text-base lg:text-lg leading-relaxed m-0">
                  Volatility is constant in food supply. We embed resilience into the B2B model so
                  partners operate with reduced exposure — without paying a premium for it.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {continuityLevers.map((l, i) => (
              <FadeIn key={l.title} delay={i * 0.08}>
                <div className="border border-cream/10 rounded-sm p-8 lg:p-10 h-full bg-obsidian/40 backdrop-blur-sm">
                  <span className="font-luxury text-gold/70 text-sm tracking-[0.3em] block mb-6">
                    0{i + 1}
                  </span>
                  <div className="w-10 h-px bg-gold mb-5" />
                  <h3 className="font-luxury text-xl lg:text-2xl font-medium text-cream m-0 mb-3">
                    {l.title}
                  </h3>
                  <p className="text-cream/65 text-sm leading-relaxed m-0">{l.body}</p>
                </div>
              </FadeIn>
            ))}
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
                  src="/images/b2b/b2b-partnership.avif"
                  alt="B2B partnership"
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
                  &ldquo;Spot supply is a transaction. B2B is an operating
                  commitment — and it has to be earned cycle after cycle, not negotiated once.&rdquo;
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="w-12 h-px bg-gold mb-6" />
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {partnershipPrinciples.map((x) => (
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

      {/* ═══ Infrastructure & Roadmap — Now/Next/Later ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Infrastructure & Looking Ahead
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Scaling the backbone.
                  <br />
                  In phases, not promises.
                </h2>
              </div>
              <p className="text-stone text-sm max-w-sm">
                Our expansion is phased to maintain service reliability while increasing capacity —
                supplier network, storage, and logistics co-ordination grown in step.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infrastructure.map((r, i) => (
              <FadeIn key={r.horizon} delay={i * 0.1}>
                <div
                  className={`rounded-sm p-8 lg:p-10 h-full flex flex-col ${
                    i === 0
                      ? 'bg-obsidian text-cream'
                      : i === 1
                        ? 'bg-parchment text-obsidian'
                        : 'bg-parchment/60 text-obsidian'
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

      {/* ═══ Work With Us — checklist + CTA ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-275 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="bg-obsidian rounded-sm p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <FadeIn>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                    Work With Us
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                    Engaging B2B partners — one structured supply relationship at a time.
                  </h2>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <p className="text-cream/70 text-base leading-relaxed m-0 mb-8">
                    To initiate a B2B partnership, share the operational shape of your requirement.
                    We respond with a structured assessment, not a generic catalogue.
                  </p>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <ul className="list-none m-0 p-0 space-y-3 mb-10">
                    {inquiryChecklist.map((c) => (
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
                      Submit B2B Inquiry
                    </Link>
                  </MagneticButton>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <Link
                    href="/retail"
                    className="block text-center mt-4 text-cream/60 text-xs uppercase tracking-widest hover:text-gold transition-colors no-underline"
                  >
                    or explore retail partnerships &rarr;
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
