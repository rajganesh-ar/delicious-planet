'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { BAND, Cta, Eyebrow, GUTTER, Point, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import { siteImage } from '@/lib/site-image'

/* ──────────────────────────────────────────────────────────────
 * Media slots.
 *
 * Every image on this page is declared here. `src: null` renders the
 * designed placeholder from <ImagePlaceholder>; dropping a file in and
 * setting its path is the only change needed to go live with real art.
 * ────────────────────────────────────────────────────────────── */
const MEDIA = {
  hero: { src: siteImage('/images/retail/retail-grocery.avif'), label: 'Retail hero — 4:3' },
  fresh: { src: siteImage('/images/retail/retail-fresh.avif'), label: 'Fresh & perishable — 16:9' },
  shelfStable: { src: siteImage('/images/retail/retail-breads.avif'), label: 'Packaged & shelf-stable — 16:9' },
  specialty: { src: siteImage('/images/retail/retail-organic.avif'), label: 'Specialty & regional — 16:9' },
  privateLabel: { src: siteImage('/images/retail/retail-dairy.avif'), label: 'Private label — 16:9' },
  quality: { src: siteImage('/images/retail/retail-cold.avif'), label: 'Quality & compliance' },
  privateLabelFeature: { src: siteImage('/images/retail/retail-veg.avif'), label: 'Private label programme' },
  regionMature: { src: siteImage('/images/retail/retail-mature.avif'), label: 'Mature markets — 16:9', alt: 'Shelves of a specialty delicatessen' },
  regionGrowth: { src: siteImage('/images/retail/retail-growth.avif'), label: 'Growth markets — 16:9', alt: 'Shoppers in a busy covered market' },
  regionLocal: { src: siteImage('/images/retail/retail-softdrinks.avif'), label: 'Local assortment — 16:9' },
} satisfies Record<string, { src: string | null; label: string; alt?: string }>

/* ── Content ── */

const heroStats = [
  { value: '4', label: 'Portfolio categories' },
  { value: 'Multi', label: 'Origin sourcing' },
  { value: 'Scheduled', label: 'Replenishment' },
  { value: '1', label: 'Accountable interface' },
]

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
    title: 'Fresh & perishable',
    body: 'Produce, dairy, and short-shelf-life lines moved through controlled, time-critical flows.',
    media: MEDIA.fresh,
  },
  {
    label: 'Category 02',
    title: 'Packaged & shelf-stable',
    body: 'Pantry essentials and ambient ranges built for predictable replenishment cycles.',
    media: MEDIA.shelfStable,
  },
  {
    label: 'Category 03',
    title: 'Specialty & regional',
    body: 'Origin-specific items that differentiate assortments and serve local consumption patterns.',
    media: MEDIA.specialty,
  },
  {
    label: 'Category 04',
    title: 'Private label–ready',
    body: 'Sourced and finished to retailer brand specifications, with flexible packaging support.',
    media: MEDIA.privateLabel,
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
    kicker: 'Supplier qualification',
    points: [
      'Verified onboarding before any product enters the network',
      'Documented food safety and hygiene capability',
      'Defined timelines for upgrading to formal certification',
    ],
  },
  {
    kicker: 'Product documentation',
    points: [
      'Specifications, certificates, and lot records on file',
      'Batch-level traceability across the supply chain',
      'Retailer-specific quality protocols supported on request',
    ],
  },
  {
    kicker: 'Handling & storage',
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
    title: 'Demand signal',
    body: 'Sales and inventory data captured through structured retailer communication.',
  },
  {
    n: '02',
    title: 'Forecast alignment',
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
  {
    t: 'Demand-responsive',
    d: 'Capacity adjusts in line with retailer cycles, not the other way round.',
  },
  { t: 'Incremental scaling', d: 'Engagement expands with reliability — never with volume alone.' },
]

const regions = [
  {
    label: 'Established',
    title: 'Mature retail markets',
    body: 'Modern trade chains and specialty retailers in markets with structured demand and clear regulatory frameworks.',
    media: MEDIA.regionMature,
  },
  {
    label: 'Emerging',
    title: 'Growth markets',
    body: 'Selected emerging markets where sourcing feasibility and regulatory clarity allow disciplined entry.',
    media: MEDIA.regionGrowth,
  },
  {
    label: 'Adaptive',
    title: 'Local assortment',
    body: 'Product mix calibrated to regional consumption patterns, not transplanted from one market to another.',
    media: MEDIA.regionLocal,
  },
]

const roadmap = [
  {
    horizon: 'Now',
    title: 'Operational foundations',
    body: 'Defined fulfilment processes, qualified supplier base, batch-level documentation, and structured partner onboarding.',
  },
  {
    horizon: 'Next',
    title: 'Capability expansion',
    body: 'Broader category depth, deeper logistics infrastructure, and improved demand-planning integration with retailers.',
  },
  {
    horizon: 'Later',
    title: 'Network maturity',
    body: 'Multi-region distribution at scale, advanced data and analytics, and a private-label programme operating across categories.',
  },
]

const partnerChecklist = [
  'Product categories of interest',
  'Market and geographic coverage',
  'Volume requirements and timelines',
]

export function RetailPageClient() {
  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">Retail</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Built to supply. <span className="text-gold">Designed to scale.</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  A retail supply model engineered around reliability, transparency, and structured
                  partnership — bridging global sourcing with local market requirements.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <p className="m-0! mt-3! font-sans text-cream/55 text-[13px] md:text-sm leading-relaxed max-w-xl">
                  Consistent, high-quality food products supported by dependable supply and
                  transparent sourcing — built to be relied upon.
                </p>
              </FadeIn>
              <FadeIn delay={0.24}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/contact#enquiry">Start a conversation</Cta>
                  <Cta href="/b2b" variant="outline">
                    B2B distribution
                  </Cta>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-6">
              <FadeIn delay={0.1}>
                <ImagePlaceholder
                  {...MEDIA.hero}
                  ratio="4/3"
                  tone="dark"
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="rounded-sm"
                />
              </FadeIn>
            </div>
          </div>
        </div>

        <div className={cn(GUTTER, 'border-t border-cream/10')}>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {heroStats.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.05}>
                <div className="py-4 md:py-5 pr-4">
                  <span className="block font-luxury text-2xl md:text-3xl font-semibold text-cream leading-none">
                    {s.value}
                  </span>
                  <span className="block font-sans text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-cream/45 mt-2">
                    {s.label}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 2 · APPROACH ═══════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Our retail approach"
          title="Built to be relied upon"
          lede="Three things a retail buyer actually measures — availability, compliance, and how well a supplier bends to their cadence."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-3 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {focusPoints.map((p) => (
            <li
              key={p.n}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-stone/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-forest-green/60 leading-none">{p.n}</span>
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                  {p.title}
                </span>
              </div>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 3 · PORTFOLIO ══════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Product portfolio"
          title="Four categories, four handling regimes"
          lede="From time-critical fresh flows to ambient ranges built for predictable replenishment."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {portfolio.map((c, i) => (
            <FadeIn key={c.label} delay={i * 0.05}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...c.media}
                  ratio="16/9"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 24vw"
                />
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{c.label}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {c.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {c.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 4 · FULFILMENT ═════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Supply reliability & fulfilment"
          title="Sourcing, coordination, replenishment"
          lede="The three levers that decide whether a shelf stays stocked."
          tone="light"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {fulfilment.map((b, i) => (
            <FadeIn key={b.kicker} delay={i * 0.06}>
              <div className="h-full border border-cream/12 rounded-sm p-4 md:p-5">
                <Eyebrow tone="light">{b.kicker}</Eyebrow>
                <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight mt-2">
                  {b.title}
                </span>
                <p className="m-0! mt-2! font-sans text-[12.5px] text-cream/60 leading-relaxed">
                  {b.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 5 · QUALITY & COMPLIANCE ═══════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Quality & compliance"
          title="What a retail buyer can ask us to produce"
          lede="Qualification, documentation, and handling — evidenced rather than asserted."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-4">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.quality}
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="rounded-sm h-full min-h-55"
              />
            </FadeIn>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {compliance.map((c, i) => (
              <FadeIn key={c.kicker} delay={i * 0.06}>
                <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-luxury text-lg text-forest-green/60 leading-none">
                      0{i + 1}
                    </span>
                    <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                      {c.kicker}
                    </span>
                  </div>
                  <ul className="list-none m-0 p-0 mt-3 flex flex-col gap-2">
                    {c.points.map((pt) => (
                      <Point key={pt}>{pt}</Point>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6 · PRIVATE LABEL ══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Private label"
          title="Your brand, our supply discipline"
          lede="Sourced and finished to retailer specification, from taste profile to pack language."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-5">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.privateLabelFeature}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="rounded-sm h-full min-h-55"
              />
            </FadeIn>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {privateLabelCapabilities.map((c, i) => (
              <FadeIn key={c.n} delay={i * 0.05}>
                <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5">
                  <span className="block font-luxury text-lg text-forest-green/50 leading-none">
                    {c.n}
                  </span>
                  <span className="block font-luxury text-base font-semibold text-obsidian leading-tight mt-2">
                    {c.title}
                  </span>
                  <p className="m-0! mt-1.5! font-sans text-[12.5px] text-stone leading-relaxed">
                    {c.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7 · DEMAND ALIGNMENT ═══════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Data & demand alignment"
          title="Signal, forecast, replenish, review"
          lede="A loop that tightens each time it runs."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {demandSteps.map((s) => (
            <li
              key={s.n}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-stone/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-forest-green/60 leading-none">{s.n}</span>
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                  {s.title}
                </span>
              </div>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                {s.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
          {partnershipAttributes.map((x, i) => (
            <FadeIn key={x.t} delay={i * 0.05}>
              <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5">
                <span className="block font-luxury text-base font-semibold text-obsidian leading-tight">
                  {x.t}
                </span>
                <p className="m-0! mt-1.5! font-sans text-[12.5px] text-stone leading-relaxed">
                  {x.d}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 8 · GEOGRAPHIC REACH ═══════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Geographic expansion"
          title="Entered market by market, not all at once"
          lede="Assortment calibrated to regional consumption rather than transplanted between markets."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {regions.map((r, i) => (
            <FadeIn key={r.label} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...r.media}
                  ratio="16/9"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{r.label}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {r.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {r.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 9 · ROADMAP ════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Looking ahead"
          title="Where the retail capability goes next"
          lede="Depth before breadth — category coverage grows as the infrastructure earns it."
          tone="light"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {roadmap.map((r, i) => (
            <FadeIn key={r.horizon} delay={i * 0.06}>
              <div
                className={cn(
                  'h-full rounded-sm border p-4 md:p-5',
                  i === 0 ? 'bg-forest-green border-forest-green' : 'border-cream/12',
                )}
              >
                <Eyebrow tone="light">{r.horizon}</Eyebrow>
                <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight mt-2">
                  {r.title}
                </span>
                <p
                  className={cn(
                    'm-0! mt-2! font-sans text-[12.5px] leading-relaxed',
                    i === 0 ? 'text-cream/80' : 'text-cream/60',
                  )}
                >
                  {r.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 10 · PARTNER WITH US ═══════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-forest-green rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <Eyebrow tone="light">Partner with us</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  One structured retail relationship at a time
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/75 text-[13px] md:text-sm leading-relaxed max-w-xl">
                We are actively engaging retail partners looking for a structured, reliable sourcing
                and distribution partner. To explore collaboration, share:
              </p>
              <ul className="list-none m-0 p-0 mt-4 flex flex-col gap-2">
                {partnerChecklist.map((c) => (
                  <Point key={c} tone="light">
                    {c}
                  </Point>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
              <Cta href="/contact#enquiry" variant="light">
                Start a conversation
              </Cta>
              <Cta href="/b2b" variant="outline">
                B2B distribution
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
