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
  hero: { src: '/images/sustainability/sustainability-cover.avif', label: 'Sustainability hero — 4:3' },
  environmental: { src: null, label: 'Environmental — 4:3' },
  social: { src: null, label: 'Social — 4:3' },
  governance: { src: '/images/sustainability/sustainability-lab.avif', label: 'Governance — 4:3' },
  climate: { src: '/images/sustainability/sustainabilty-logisitcs.avif', label: 'Climate & emissions — 16:9' },
  // sustainability-misc.avif is an abstract yellow texture — nothing to do with
  // water, energy or waste — so this stays a labelled placeholder.
  resource: { src: null, label: 'Resource efficiency — 16:9' },
  sourcing: { src: '/images/sustainability/sustainability-factory.avif', label: 'Sustainable sourcing — 16:9' },
  // Deliberately empty: the only spare asset is a 24MP portrait, and cropping it
  // to a full-width band would cost a 3840px fetch for a decorative backdrop.
  quote: { src: null, label: 'Quote backdrop' },
  fair: { src: null, label: 'Fair & ethical practices — 16:9' },
  inclusive: { src: null, label: 'Inclusive supply chains — 16:9' },
} satisfies Record<string, { src: string | null; label: string }>

/* ── Content ── */

const heroStats = [
  { value: '3', label: 'ESG priorities' },
  { value: '4', label: 'Governance controls' },
  { value: '4', label: 'Traceability stages' },
  { value: '3', label: 'Roadmap horizons' },
]

const priorities = [
  {
    number: '01',
    eyebrow: 'Environmental',
    title: 'Reducing impact across the value chain.',
    body: 'Logistics efficiency, resource-conscious production partners, and lower-impact packaging — embedded into sourcing decisions from day one.',
    media: MEDIA.environmental,
  },
  {
    number: '02',
    eyebrow: 'Social',
    title: 'Supporting responsible, inclusive supply ecosystems.',
    body: 'Fair labour practices, safe working conditions, and a sourcing model designed to remain accessible to small and medium producers as we scale.',
    media: MEDIA.social,
  },
  {
    number: '03',
    eyebrow: 'Governance',
    title: 'Maintaining transparent, accountable governance.',
    body: 'A formal supplier code of conduct, structured onboarding reviews, and audit-ready documentation across our compliance perimeter.',
    media: MEDIA.governance,
  },
]

const environmentalFocus = [
  {
    label: 'Climate & emissions',
    media: MEDIA.climate,
    headline: 'Building a carbon baseline before setting the targets.',
    body: 'We are establishing baseline measurements across sourcing, transportation, and storage. As operations scale, we will formalise emissions tracking and reduction targets.',
    points: [
      'Optimised logistics routing to reduce fuel consumption',
      'Preference for suppliers with efficient production practices',
      'Evaluation of lower-impact packaging and transport options',
    ],
  },
  {
    label: 'Resource efficiency',
    media: MEDIA.resource,
    headline: 'Water, energy, and waste — embedded in supplier selection.',
    body: 'Resource discipline is a sourcing criterion. We weigh water management, energy efficiency, and waste reduction across every partner we onboard.',
    points: [
      'Preference for suppliers practicing responsible water management',
      'Energy-efficient operations across storage and processing',
      'Minimising product loss through improved handling',
    ],
  },
  {
    label: 'Sustainable sourcing',
    media: MEDIA.sourcing,
    headline: 'Origin choices that support long-term supply integrity.',
    body: 'Sustainability is a sourcing factor from the outset. As our network matures, we plan to expand the share of certified sustainable sourcing within our portfolio.',
    points: [
      'Suppliers using environmentally responsible production methods',
      'Products aligned with recognised sustainability standards',
      'Reduced reliance on high-impact regions where alternatives exist',
    ],
  },
]

const socialCommitments = [
  {
    eyebrow: 'Fair & ethical practices',
    title: 'Non-negotiable expectations of every partner.',
    body: 'We expect all partners to adhere to basic human and labour rights. These expectations are formalised within our supplier engagement framework.',
    media: MEDIA.fair,
    points: [
      'Safe working environments',
      'Fair compensation practices',
      'Compliance with applicable labour regulations',
    ],
  },
  {
    eyebrow: 'Inclusive supply chains',
    title: 'Designing for participation as we grow.',
    body: 'Our current scale limits direct intervention, but our sourcing model is structured to enable inclusive participation as we expand.',
    media: MEDIA.inclusive,
    points: [
      'Engaging small and medium-scale producers where feasible',
      'Encouraging equitable participation across our base',
      'Supporting capacity-building initiatives over time',
    ],
  },
]

const governancePrinciples = [
  {
    label: 'Supplier code of conduct',
    detail:
      'A documented framework covering environmental, social, and ethical standards — applied during onboarding and renewed at evaluation cycles.',
  },
  {
    label: 'Internal review processes',
    detail:
      'Structured supplier review covering production capability, compliance posture, and ongoing performance monitoring.',
  },
  {
    label: 'Documentation & audit trails',
    detail:
      'Compliance evidence is captured, retained, and made available for review — supporting credible reporting and customer due diligence.',
  },
  {
    label: 'Zero-tolerance standard',
    detail:
      'Corruption, misrepresentation, and unethical practices result in immediate disqualification. Standards are non-negotiable.',
  },
]

const traceabilitySteps = [
  {
    step: '01',
    title: 'Origin',
    detail: 'Producer documentation, location verification, certification capture.',
  },
  {
    step: '02',
    title: 'Production',
    detail: 'Process records, batch identification, production-cycle data.',
  },
  {
    step: '03',
    title: 'Verification',
    detail: 'Quality checks, compositional review, sensory confirmation.',
  },
  {
    step: '04',
    title: 'Distribution',
    detail: 'Cold-chain integrity, carrier compliance, destination handover.',
  },
]

const roadmap = [
  {
    phase: 'Now',
    headline: 'Establishing the framework.',
    items: [
      'Defining baseline metrics for environmental and operational impact',
      'Formalising the supplier code of conduct',
      'Building structured supplier documentation systems',
    ],
  },
  {
    phase: 'Near-term',
    headline: 'Measuring what we manage.',
    items: [
      'Identifying KPIs across sourcing and logistics',
      'Expanding supplier audits and verification processes',
      'Strengthening internal reporting cadence',
    ],
  },
  {
    phase: 'Long-term',
    headline: 'Scaling responsibly.',
    items: [
      'Increasing the proportion of responsibly sourced products',
      'Aligning with recognised global sustainability standards',
      'Setting and publishing formal reduction targets',
    ],
  },
]

export function SustainabilityPageClient() {
  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">Sustainability</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Built sustainable.{' '}
                    <span className="text-gold">Not certified after the fact.</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  We are integrating environmental, social, and governance considerations into the
                  structure of our business — measurably, credibly, and from the ground up.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <p className="m-0! mt-3! font-sans text-cream/55 text-[13px] md:text-sm leading-relaxed max-w-xl">
                  We are at the beginning, so we get to do this right — building the systems from
                  the outset, and being honest about where we are along the way.
                </p>
              </FadeIn>
              <FadeIn delay={0.24}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/contact">Talk to our team</Cta>
                  <Cta href="/sourcing" variant="outline">
                    Our sourcing
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

      {/* ═══ 2 · PRIORITIES ═════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Our approach"
          title="Three priorities, embedded from the outset"
          lede="Sustainability as a foundational principle — not a retrospective obligation."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {priorities.map((p, i) => (
            <FadeIn key={p.number} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...p.media}
                  ratio="4/3"
                  sizes="(max-width: 768px) 100vw, 33vw"
                >
                  <span className="absolute top-3 left-3 font-luxury text-[13px] font-semibold text-obsidian bg-cream/90 px-2 py-0.5 rounded-sm">
                    {p.number}
                  </span>
                </ImagePlaceholder>
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{p.eyebrow}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {p.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 3 · ENVIRONMENTAL FOCUS ════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Environmental focus"
          title="Where the environmental work actually happens"
          lede="Climate, resources, and origin choices — measured before they are claimed."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {environmentalFocus.map((f, i) => (
            <FadeIn key={f.label} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...f.media}
                  ratio="16/9"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <Eyebrow>{f.label}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {f.headline}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {f.body}
                  </p>
                  <ul className="list-none m-0 p-0 mt-3.5 pt-3.5 border-t border-stone/10 flex flex-col gap-2">
                    {f.points.map((pt) => (
                      <Point key={pt}>{pt}</Point>
                    ))}
                  </ul>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 4 · QUOTE ══════════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pt-8 md:pt-11')}>
        <FadeIn>
          <ImagePlaceholder
            {...MEDIA.quote}
            tone="forest"
            glyph={false}
            sizes="100vw"
            className="rounded-sm min-h-55 md:min-h-65 flex items-center"
          >
            {MEDIA.quote.src ? <div className="absolute inset-0 bg-forest-green/85" /> : null}
            <div className="relative z-10 max-w-3xl px-6 md:px-10 lg:px-14 py-8 md:py-10">
              <Eyebrow tone="light">On long-term thinking</Eyebrow>
              <blockquote className="m-0! mt-3!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl lg:text-[34px]">
                  &ldquo;Food supply chains are deeply interconnected with livelihoods, landscapes,
                  and communities. We are building ours to honour that.&rdquo;
                </span>
              </blockquote>
            </div>
          </ImagePlaceholder>
        </FadeIn>
      </section>

      {/* ═══ 5 · SOCIAL RESPONSIBILITY ══════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Social responsibility"
          title="People are the supply chain"
          lede="Expectations we formalise with every partner, and a model built to stay open as we scale."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {socialCommitments.map((c, i) => (
            <FadeIn key={c.eyebrow} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...c.media}
                  ratio="16/9"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <Eyebrow>{c.eyebrow}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {c.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {c.body}
                  </p>
                  <ul className="list-none m-0 p-0 mt-3.5 pt-3.5 border-t border-stone/10 flex flex-col gap-2">
                    {c.points.map((pt) => (
                      <Point key={pt}>{pt}</Point>
                    ))}
                  </ul>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 6 · GOVERNANCE ═════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Governance"
          title="The controls behind the claims"
          lede="Documented, reviewed, and available for scrutiny — standards only mean something when they are enforced."
          tone="light"
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-cream/12 rounded-sm overflow-hidden">
          {governancePrinciples.map((g, i) => (
            <li
              key={g.label}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-cream/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-gold/70 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight">
                  {g.label}
                </span>
              </div>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-cream/60 leading-relaxed">
                {g.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 7 · TRACEABILITY ═══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Traceability"
          title="From origin to distribution"
          lede="Four recorded stages, each producing evidence a commercial partner can ask to see."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {traceabilitySteps.map((s) => (
            <li
              key={s.step}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-stone/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-forest-green/60 leading-none">
                  {s.step}
                </span>
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                  {s.title}
                </span>
              </div>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                {s.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 8 · ROADMAP ════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Roadmap"
          title="Now, near-term, long-term"
          lede="Progress that is measurable and credible, refined as operations grow and expectations evolve."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {roadmap.map((r, i) => (
            <FadeIn key={r.phase} delay={i * 0.06}>
              <div
                className={cn(
                  'h-full rounded-sm border p-4 md:p-5',
                  i === 0 ? 'bg-forest-green border-forest-green' : 'bg-white border-stone/15',
                )}
              >
                <Eyebrow tone={i === 0 ? 'light' : 'dark'}>{r.phase}</Eyebrow>
                <span
                  className={cn(
                    'block font-luxury text-base md:text-lg font-semibold leading-tight mt-2',
                    i === 0 ? 'text-cream' : 'text-obsidian',
                  )}
                >
                  {r.headline}
                </span>
                <ul className="list-none m-0 p-0 mt-3 flex flex-col gap-2">
                  {r.items.map((item) => (
                    <Point key={item} tone={i === 0 ? 'light' : 'dark'}>
                      {item}
                    </Point>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 9 · CTA ════════════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-obsidian rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-xl">
              <Eyebrow tone="light">Work with us</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  Want to understand our standards in detail?
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed">
                Buyer, importer, or prospective supplier — we welcome conversations about our
                sourcing criteria and sustainability framework.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Cta href="/contact" variant="light">
                Contact us
              </Cta>
              <Cta href="/sourcing" variant="outline">
                Our sourcing
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
