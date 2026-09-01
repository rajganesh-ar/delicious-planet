'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { BAND, Cta, Eyebrow, GUTTER, Point, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

/* ──────────────────────────────────────────────────────────────
 * Media slots.
 *
 * `public/images/vendor/` does not exist, so every slot here renders the
 * designed placeholder from <ImagePlaceholder>. Dropping a file in and
 * setting its path is the only change needed to go live.
 *
 * `misc/become-a-vendor.avif` is named for this page but is an abstract
 * purple texture — deliberately not used here.
 * ────────────────────────────────────────────────────────────── */
const MEDIA = {
  hero: { src: null, label: 'Vendors hero — 4:3' },
  producers: { src: null, label: 'Producers — 16:9' },
  marine: { src: null, label: 'Fisheries & aquaculture — 16:9' },
  processors: { src: null, label: 'Processors — 16:9' },
  aggregators: { src: null, label: 'Aggregators & export — 16:9' },
  logistics: { src: null, label: 'Cold chain & logistics — 16:9' },
  philosophy: { src: null, label: 'Partnership philosophy' },
  development: { src: null, label: 'Supplier development' },
} satisfies Record<string, { src: string | null; label: string }>

/* ── Content ── */

const heroStats = [
  { value: '5', label: 'Partner types' },
  { value: '4', label: 'Entry requirements' },
  { value: '4', label: 'Onboarding stages' },
  { value: '3', label: 'Partnership tiers' },
]

const approachPillars = [
  {
    title: 'Structured onboarding',
    body: 'Clear standards, documented processes, and a phased path from inquiry to integration.',
  },
  {
    title: 'Performance-driven growth',
    body: 'Engagement scales with reliability. Volume follows trust — never the other way around.',
  },
  {
    title: 'Mutual accountability',
    body: 'Transparent expectations. Two-way communication. A shared definition of quality.',
  },
]

const networkTypes = [
  {
    n: '01',
    label: 'Producers',
    title: 'Agricultural producers & farmer groups',
    body: 'Origin-side partners working at the source — from smallholder cooperatives to organised farms.',
    media: MEDIA.producers,
  },
  {
    n: '02',
    label: 'Marine',
    title: 'Fisheries & aquaculture operators',
    body: 'Sustainable wild-catch and aquaculture operators with chain-of-custody documentation.',
    media: MEDIA.marine,
  },
  {
    n: '03',
    label: 'Manufacture',
    title: 'Food processors & manufacturers',
    body: 'Specialty processors with documented batch consistency and export-ready capability.',
    media: MEDIA.processors,
  },
  {
    n: '04',
    label: 'Distribution',
    title: 'Aggregators & export houses',
    body: 'Volume aggregators and export specialists capable of meeting international compliance.',
    media: MEDIA.aggregators,
  },
  {
    n: '05',
    label: 'Logistics',
    title: 'Logistics & cold chain partners',
    body: 'Operators maintaining temperature integrity from producer to port to shelf.',
    media: MEDIA.logistics,
  },
]

const requirements = [
  {
    n: '01',
    kicker: 'Quality & food safety',
    headline: 'Consistent. Traceable. Verifiable.',
    points: [
      'Implementation of recognised food safety practices (HACCP-aligned)',
      'Demonstrable product consistency across production batches',
      'Traceability maintained at lot or batch level',
    ],
  },
  {
    n: '02',
    kicker: 'Regulatory compliance',
    headline: 'Documented at every step.',
    points: [
      'Compliance with applicable local and international regulations',
      'Valid certifications and documentation, where required',
      'Transparency in product origin and handling processes',
    ],
  },
  {
    n: '03',
    kicker: 'Ethical & labour practices',
    headline: 'Non-negotiable.',
    points: [
      'No use of forced or child labour',
      'Safe and compliant working conditions',
      'Adherence to applicable labour laws',
    ],
  },
  {
    n: '04',
    kicker: 'Operational capability',
    headline: 'Built to deliver.',
    points: [
      'Ability to meet agreed volumes and delivery timelines',
      'Infrastructure for handling, storage, and transportation',
      'Willingness to align with defined quality and process standards',
    ],
  },
]

const onboardingSteps = [
  {
    n: '01',
    title: 'Initial assessment',
    body: 'Submission of company profile, product details, certifications, and operational capabilities.',
  },
  {
    n: '02',
    title: 'Evaluation',
    body: 'Review of compliance, quality systems, and supply capacity against our standards.',
  },
  {
    n: '03',
    title: 'Verification',
    body: 'Where applicable, site visits, documentation checks, or third-party audits.',
  },
  {
    n: '04',
    title: 'Approval & integration',
    body: 'Formal onboarding, agreement on specifications, and inclusion in the supplier network.',
  },
]

const tiers = [
  {
    label: 'Tier 01',
    name: 'Developmental',
    summary:
      'Suppliers in active onboarding — meeting baselines and building toward category alignment.',
    markers: [
      'Baseline standards verified',
      'Pilot or initial supply window',
      'Capability development support available',
    ],
  },
  {
    label: 'Tier 02',
    name: 'Approved',
    summary: 'Qualified suppliers with consistent performance across multiple delivery cycles.',
    markers: [
      'Full compliance documentation on file',
      'Stable performance against agreed metrics',
      'Active engagement across categories',
    ],
  },
  {
    label: 'Tier 03',
    name: 'Strategic',
    summary:
      'Long-term partners integrated into category planning, demand forecasting, and growth.',
    markers: [
      'Multi-year, performance-tied partnership',
      'Joint planning on volume and specification',
      'Priority engagement on new opportunities',
    ],
  },
]

const developmentCommitments = [
  { t: 'Performance-tied growth', d: 'Volumes grow with demonstrated reliability.' },
  { t: 'Predictable demand', d: 'Clear forecasts where commercial conditions allow.' },
  { t: 'Continuous alignment', d: 'Ongoing communication on quality and improvements.' },
  {
    t: 'Sustainability adoption',
    d: 'Gradual integration of sustainable practices across the network.',
  },
]

const performanceMetrics = [
  { metric: 'Quality', detail: 'Product specification adherence and batch-to-batch consistency.' },
  { metric: 'Reliability', detail: 'On-time delivery and order fulfilment against agreed schedules.' },
  { metric: 'Compliance', detail: 'Continued adherence to documented standards and certifications.' },
  { metric: 'Responsiveness', detail: 'Communication, issue resolution, and collaborative engagement.' },
]

const zeroTolerance = [
  'Misrepresentation of product or origin',
  'Non-compliance with regulatory requirements',
  'Unethical business practices',
]

const ecosystemPartners = [
  {
    label: 'Logistics',
    title: 'Cold chain & freight specialists',
    body: 'Partners maintaining the conditions that protect product integrity at scale.',
  },
  {
    label: 'Technology',
    title: 'Traceability & operations',
    body: 'Platforms that strengthen visibility, documentation, and supplier data management.',
  },
  {
    label: 'Market access',
    title: 'Regional distribution networks',
    body: 'Partners enabling efficient market reach across the regions we operate in.',
  },
]

const inquiryChecklist = [
  'Company profile and product categories',
  'Certifications and compliance documentation',
  'Production capacity and geographic coverage',
]

export function VendorsPageClient() {
  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">Vendors &amp; partnerships</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Built on standards. <span className="text-gold">Grown through trust.</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  A supplier network engineered for credibility — selective at entry, structured in
                  governance, and long-term in intent.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <p className="m-0! mt-3! font-sans text-cream/55 text-[13px] md:text-sm leading-relaxed max-w-xl">
                  Our model favours operational discipline and global supply readiness over volume
                  alone. We add suppliers slowly — and grow alongside them.
                </p>
              </FadeIn>
              <FadeIn delay={0.24}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/contact#enquiry">Apply as a supplier</Cta>
                  <Cta href="/sourcing" variant="outline">
                    How we source
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
          eyebrow="Our approach"
          title="Selective at entry, structured in growth"
          lede="We build relationships that can scale sustainably — deliberately, and over time."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-3 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {approachPillars.map((p, i) => (
            <li
              key={p.title}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-stone/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-forest-green/60 leading-none">
                  0{i + 1}
                </span>
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

      {/* ═══ 3 · WHO WE WORK WITH ═══════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Who we work with"
          title="Five kinds of partner across the chain"
          lede="From the people who grow it to the people who keep it cold in transit."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {networkTypes.map((t, i) => (
            <FadeIn key={t.n} delay={i * 0.05}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...t.media}
                  ratio="16/9"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                >
                  <span className="absolute top-3 left-3 font-luxury text-[13px] font-semibold text-obsidian bg-cream/90 px-2 py-0.5 rounded-sm">
                    {t.n}
                  </span>
                </ImagePlaceholder>
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{t.label}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {t.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {t.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 4 · REQUIREMENTS ═══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Supplier requirements"
          title="What a supplier has to hold before we list them"
          lede="Four gates. All of them evidenced, none of them optional."
          tone="light"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {requirements.map((r, i) => (
            <FadeIn key={r.n} delay={i * 0.05}>
              <div className="h-full border border-cream/12 rounded-sm p-4 md:p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-luxury text-lg text-gold/70 leading-none">{r.n}</span>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight">
                    {r.kicker}
                  </span>
                </div>
                <span className="block font-luxury italic text-[13px] text-gold/80 mt-1.5">
                  {r.headline}
                </span>
                <ul className="list-none m-0 p-0 mt-3 flex flex-col gap-2">
                  {r.points.map((pt) => (
                    <Point key={pt} tone="light">
                      {pt}
                    </Point>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 5 · ONBOARDING ═════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Onboarding journey"
          title="Assess, evaluate, verify, integrate"
          lede="A phased path from first inquiry to an approved place in the network."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {onboardingSteps.map((s) => (
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
      </section>

      {/* ═══ 6 · TIERS ══════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Partnership tiers"
          title="Three stages of maturity"
          lede="Where a supplier sits is earned by performance, not negotiated at signing."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {tiers.map((t, i) => (
            <FadeIn key={t.label} delay={i * 0.06}>
              <div
                className={cn(
                  'h-full rounded-sm border p-4 md:p-5',
                  i === 2 ? 'bg-forest-green border-forest-green' : 'bg-white border-stone/15',
                )}
              >
                <Eyebrow tone={i === 2 ? 'light' : 'dark'}>{t.label}</Eyebrow>
                <span
                  className={cn(
                    'block font-luxury text-base md:text-lg font-semibold leading-tight mt-2',
                    i === 2 ? 'text-cream' : 'text-obsidian',
                  )}
                >
                  {t.name}
                </span>
                <p
                  className={cn(
                    'm-0! mt-2! font-sans text-[12.5px] leading-relaxed',
                    i === 2 ? 'text-cream/80' : 'text-stone',
                  )}
                >
                  {t.summary}
                </p>
                <ul
                  className={cn(
                    'list-none m-0 p-0 mt-3.5 pt-3.5 border-t flex flex-col gap-2',
                    i === 2 ? 'border-cream/20' : 'border-stone/10',
                  )}
                >
                  {t.markers.map((m) => (
                    <Point key={m} tone={i === 2 ? 'light' : 'dark'}>
                      {m}
                    </Point>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 7 · PHILOSOPHY ═════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <FadeIn>
          <ImagePlaceholder
            {...MEDIA.philosophy}
            tone="dark"
            glyph={false}
            sizes="100vw"
            className="rounded-sm min-h-55 md:min-h-65 flex items-center"
          >
            {MEDIA.philosophy.src ? (
              <div className="absolute inset-0 bg-linear-to-r from-obsidian/90 via-obsidian/65 to-obsidian/20" />
            ) : null}
            <div className="relative z-10 max-w-3xl px-6 md:px-10 lg:px-14 py-8 md:py-10">
              <Eyebrow tone="light">Partnership philosophy</Eyebrow>
              <blockquote className="m-0! mt-3!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl lg:text-[34px]">
                  &ldquo;Reliable supply isn&apos;t purchased. It&apos;s built — through clear
                  standards, honest communication, and time.&rdquo;
                </span>
              </blockquote>
            </div>
          </ImagePlaceholder>
        </FadeIn>
      </section>

      {/* ═══ 8 · SUPPLIER DEVELOPMENT ═══════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Supplier development"
          title="We grow capability, not just volume"
          lede="Structured frameworks to help suppliers strengthen operations — at our current scale, and at network scale later."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-5">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.development}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="rounded-sm h-full min-h-55"
              />
            </FadeIn>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {developmentCommitments.map((x, i) => (
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
        </div>
      </section>

      {/* ═══ 9 · PERFORMANCE & GOVERNANCE ═══════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Performance & governance"
          title="What we measure, and what ends a relationship"
          lede="Four indicators reviewed every cycle — and three things that disqualify immediately."
          tone="light"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
          <ul className="lg:col-span-8 list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 border border-cream/12 rounded-sm overflow-hidden">
            {performanceMetrics.map((m, i) => (
              <li
                key={m.metric}
                className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-cream/10 last:border-r-0"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-luxury text-lg text-gold/70 leading-none">
                    0{i + 1}
                  </span>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight">
                    {m.metric}
                  </span>
                </div>
                <p className="m-0! mt-2! font-sans text-[12.5px] text-cream/60 leading-relaxed">
                  {m.detail}
                </p>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-4">
            <FadeIn>
              <div className="h-full bg-forest-green rounded-sm p-4 md:p-5">
                <Eyebrow tone="light">Zero tolerance</Eyebrow>
                <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight mt-2">
                  Immediate disqualification
                </span>
                <ul className="list-none m-0 p-0 mt-3 flex flex-col gap-2">
                  {zeroTolerance.map((z) => (
                    <Point key={z} tone="light">
                      {z}
                    </Point>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ 10 · ECOSYSTEM PARTNERS ════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Strategic partnerships"
          title="Beyond suppliers"
          lede="The logistics, technology, and distribution partners the network runs on."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {ecosystemPartners.map((p, i) => (
            <FadeIn key={p.label} delay={i * 0.06}>
              <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5">
                <Eyebrow>{p.label}</Eyebrow>
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                  {p.title}
                </span>
                <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                  {p.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 11 · BECOME A VENDOR ═══════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-forest-green rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <Eyebrow tone="light">Become a vendor</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  Partnerships built deliberately, supplier by supplier
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/75 text-[13px] md:text-sm leading-relaxed max-w-xl">
                We welcome inquiries from suppliers who meet our standards and share a long-term
                view. To open a conversation, share:
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
              <Cta href="/sourcing" variant="outline">
                Our standards
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
