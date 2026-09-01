'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { BAND, Cta, Eyebrow, GUTTER, Point, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

/* ──────────────────────────────────────────────────────────────
 * Media slots.
 *
 * Every image on this page is declared here. `src: null` renders the
 * designed placeholder from <ImagePlaceholder>; dropping a file in and
 * setting its path is the only change needed to go live with real art.
 * ────────────────────────────────────────────────────────────── */
const MEDIA = {
  hero: { src: '/images/b2b/commercial-logistics.avif', label: 'B2B hero — 4:3' },
  horeca: { src: '/images/b2b/commercial-resturant.avif', label: 'Foodservice — 16:9' },
  manufacturer: { src: '/images/b2b/commercial-factory.avif', label: 'Manufacturing — 16:9' },
  institutional: { src: '/images/b2b/commercial-cafe.avif', label: 'Institutional — 16:9' },
  wholesale: { src: '/images/b2b/commercial-farm.avif', label: 'Wholesale — 16:9' },
  quality: { src: null, label: 'Quality verification' },
  customisation: { src: null, label: 'Contract supply — 16:9' },
} satisfies Record<string, { src: string | null; label: string }>

/* ── Content ── */

const heroStats = [
  { value: 'Multi', label: 'Origin sourcing' },
  { value: '1', label: 'Accountable interface' },
  { value: 'Scheduled', label: 'Contract delivery' },
  { value: '4', label: 'Buyer segments' },
]

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
    title: 'Foodservice operators',
    body: 'Restaurants, hotel groups, and catering services running multi-site operations that depend on uninterrupted supply.',
    media: MEDIA.horeca,
  },
  {
    label: 'Segment 02',
    title: 'Food manufacturers',
    body: 'Processors and ingredient buyers requiring spec-aligned inputs at industrial volume and consistent grade.',
    media: MEDIA.manufacturer,
  },
  {
    label: 'Segment 03',
    title: 'Institutional buyers',
    body: 'Corporate kitchens, healthcare, and education operating to budget cycles, audit standards, and capacity plans.',
    media: MEDIA.institutional,
  },
  {
    label: 'Segment 04',
    title: 'Wholesale distributors',
    body: 'Resellers and regional distributors needing predictable allocation and clean documentation across SKUs.',
    media: MEDIA.wholesale,
  },
]

const categories = [
  {
    n: '01',
    title: 'Fresh & perishable',
    body: 'Produce and short-shelf-life inputs handled through controlled, time-critical flows.',
  },
  {
    n: '02',
    title: 'Frozen & temperature-controlled',
    body: 'Cold-chain integrity from origin to delivery — preserved across handoffs and geographies.',
  },
  {
    n: '03',
    title: 'Dry & bulk commodities',
    body: 'High-volume staples, sourced consistently and documented for institutional procurement.',
  },
  {
    n: '04',
    title: 'Processed & semi-processed',
    body: 'Ingredient-grade inputs aligned to manufacturing and foodservice specifications.',
  },
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
    kicker: 'Supplier qualification',
    points: [
      'Onboarding aligned to international food safety standards',
      'Documented capability before product enters the network',
      'Defined timelines for certification upgrades where required',
    ],
  },
  {
    kicker: 'Product documentation',
    points: [
      'Specifications, certificates, and lot records on file',
      'Batch-level traceability across the supply chain',
      'Partner-specific protocols supported on request',
    ],
  },
  {
    kicker: 'Handling & storage',
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
    title: 'Forecast capture',
    body: 'Partner demand cycles, volume commitments, and lead-time constraints captured up front.',
  },
  {
    n: '02',
    title: 'Origin allocation',
    body: 'Volumes mapped against qualified origins with capacity buffers built into the allocation.',
  },
  {
    n: '03',
    title: 'Coordinated execution',
    body: 'Procurement and logistics co-ordinated through one accountable interface across the cycle.',
  },
  {
    n: '04',
    title: 'Performance review',
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
  {
    t: 'Transparent communication',
    d: 'A single accountable channel across forecasts, escalations, and reviews.',
  },
  { t: 'Long-term orientation', d: 'Engagement structured for recurring cycles, not spot transactions.' },
  { t: 'Earned scaling', d: 'Volume grows with demonstrated reliability — never on volume alone.' },
]

const infrastructure = [
  {
    horizon: 'Now',
    title: 'Operational foundations',
    body: 'Qualified supplier base, structured documentation, defined fulfilment processes, and accountable partner onboarding.',
  },
  {
    horizon: 'Next',
    title: 'Capacity & network expansion',
    body: 'Storage and handling capability, broader category coverage, and deeper logistics co-ordination across regions.',
  },
  {
    horizon: 'Later',
    title: 'Integrated supply partner',
    body: 'Multi-region distribution at scale, advanced demand-planning integration, and deeper supplier-side data integration.',
  },
]

const inquiryChecklist = [
  'Product requirements and specifications',
  'Expected volumes and delivery frequency',
  'Geographic scope and regulatory context',
]

export function B2BSolutionsPageClient() {
  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">B2B solutions</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Built for operations. <span className="text-gold">Engineered for scale.</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  Structured sourcing and distribution for businesses that depend on consistency,
                  volume capability, and supply discipline — across foodservice, manufacturing, and
                  wholesale.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <p className="m-0! mt-3! font-sans text-cream/55 text-[13px] md:text-sm leading-relaxed max-w-xl">
                  We structure supply around the operational rhythm of the partners we serve, and
                  scale capability deliberately — paced by the standards, not by the volume.
                </p>
              </FadeIn>
              <FadeIn delay={0.24}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/contact#enquiry">Start an inquiry</Cta>
                  <Cta href="/policies#b2b-terms" variant="outline">
                    Commercial terms
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
          eyebrow="Our B2B approach"
          title="Operations first, volume second"
          lede="Built for partners who measure suppliers on consistency, fill rate, and continuity — not on price alone."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-3 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {approachPillars.map((p) => (
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

      {/* ═══ 3 · SEGMENTS ═══════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Who we supply"
          title="Four buyer segments, four operating rhythms"
          lede="Each one measures a supplier differently. The supply structure follows the buyer, not the catalogue."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {segments.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.05}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...s.media}
                  ratio="16/9"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 24vw"
                />
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{s.label}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {s.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 4 · CATEGORY COVERAGE ══════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Category coverage"
          title="Four temperature and handling regimes"
          lede="Every category carries its own risk profile, and its own documentation trail."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {categories.map((c) => (
            <li
              key={c.n}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-stone/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-forest-green/60 leading-none">{c.n}</span>
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                  {c.title}
                </span>
              </div>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 5 · SUPPLY CHAIN ═══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Supply chain & fulfilment"
          title="Procurement, inventory, delivery"
          lede="Three moving parts, co-ordinated through one accountable interface."
          tone="light"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {supplyChainBlocks.map((b, i) => (
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

      {/* ═══ 6 · QUALITY & COMPLIANCE ═══════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Quality & compliance"
          title="What a buyer can ask us to produce"
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

      {/* ═══ 7 · CUSTOMISATION ══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Customisation & contract supply"
          title="Supply shaped to your specification"
          lede="Contract terms, product spec, and pack format are all negotiable inputs."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-5">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.customisation}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="rounded-sm h-full min-h-55"
              />
            </FadeIn>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {customisation.map((c, i) => (
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

      {/* ═══ 8 · DEMAND PLANNING & CONTINUITY ═══════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Demand planning & continuity"
          title="Forecast, allocate, execute, review"
          lede="A cycle that repeats — and gets measured every time it does."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {planningSteps.map((s) => (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
          {continuityLevers.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.06}>
              <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5 flex items-start gap-4">
                <span className="shrink-0 font-luxury text-2xl font-semibold text-forest-green/30 leading-none">
                  0{i + 1}
                </span>
                <div className="min-w-0">
                  <span className="block font-luxury text-base font-semibold text-obsidian leading-tight">
                    {r.title}
                  </span>
                  <p className="m-0! mt-1.5! font-sans text-[12.5px] text-stone leading-relaxed">
                    {r.body}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 9 · PARTNERSHIP MODEL ══════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Partnership model"
          title="How the relationship is run"
          lede="Structured for recurring cycles, not spot transactions."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {partnershipPrinciples.map((x, i) => (
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

      {/* ═══ 10 · ROADMAP ═══════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Infrastructure & roadmap"
          title="Where the B2B capability goes next"
          lede="Capability paced by the standards it has to hold, not by the volume on offer."
          tone="light"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {infrastructure.map((r, i) => (
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

      {/* ═══ 11 · WORK WITH US ══════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-forest-green rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <Eyebrow tone="light">Work with us</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  One structured supply relationship at a time
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/75 text-[13px] md:text-sm leading-relaxed max-w-xl">
                Share the operational shape of your requirement and we respond with a structured
                assessment, not a generic catalogue.
              </p>
              <ul className="list-none m-0 p-0 mt-4 flex flex-col gap-2">
                {inquiryChecklist.map((c) => (
                  <Point key={c} tone="light">
                    {c}
                  </Point>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
              <Cta href="/contact#enquiry" variant="light">
                Submit an inquiry
              </Cta>
              <Cta href="/policies#b2b-terms" variant="outline">
                Commercial terms
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
