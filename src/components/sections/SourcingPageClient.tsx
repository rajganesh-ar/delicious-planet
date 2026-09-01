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
  hero: { src: '/images/sourcing/sourcing-farmer.avif', label: 'Sourcing hero — 4:3' },
  pillarQuality: { src: '/images/sourcing/sourcing-lab.avif', label: 'Quality & safety — 4:3' },
  pillarEthics: { src: '/images/sourcing/sourcing-farmer-2.avif', label: 'Responsible procurement — 4:3' },
  pillarResilience: { src: '/images/sourcing/sourcing-farm-2.avif', label: 'Resilient supply — 4:3' },
  networkDirect: { src: '/images/sourcing/sourcing-1.avif', label: 'Producer relationships — 16:9' },
  networkStrategic: { src: '/images/sourcing/sourcing-agriculture.avif', label: 'Regional partnerships — 16:9' },
  networkPhased: { src: null, label: 'Measured expansion — 16:9' },
  standards: { src: null, label: 'Quality verification — 4:5' },
  environmental: { src: null, label: 'Environmental responsibility — 16:9' },
  social: { src: null, label: 'Social impact — 16:9' },
  partnership: { src: null, label: 'Supplier partnership — 4:3' },
} satisfies Record<string, { src: string | null; label: string }>

/* ── Content ── */

const heroStats = [
  { value: '3', label: 'Sourcing priorities' },
  { value: '4', label: 'Traceability stages' },
  { value: 'Multi', label: 'Supplier strategy' },
  { value: '100%', label: 'Documented origin' },
]

const pillars = [
  {
    n: '01',
    title: 'Quality & safety',
    line: 'Without compromise.',
    body: 'Every product entering our network meets internationally recognised food safety benchmarks — from HACCP-aligned processes to lot-level traceability.',
    media: MEDIA.pillarQuality,
  },
  {
    n: '02',
    title: 'Responsible procurement',
    line: 'Ethical at origin.',
    body: 'We engage suppliers operating within fair labour practices, lawful employment standards, and environmentally conscious production methods.',
    media: MEDIA.pillarEthics,
  },
  {
    n: '03',
    title: 'Resilient supply',
    line: 'Diversified by design.',
    body: 'Geographic spread and multi-supplier strategies reduce exposure to regional disruption — keeping availability stable across cycles.',
    media: MEDIA.pillarResilience,
  },
]

const networkApproach = [
  {
    label: 'Direct',
    title: 'Producer relationships',
    body: 'We work directly with producers, cooperatives, and processors — removing intermediaries to preserve quality signal and accountability.',
    media: MEDIA.networkDirect,
  },
  {
    label: 'Strategic',
    title: 'Regional partnerships',
    body: 'Strategic alliances in key agricultural and production regions ensure continuity of supply and category depth.',
    media: MEDIA.networkStrategic,
  },
  {
    label: 'Phased',
    title: 'Measured expansion',
    body: 'Suppliers are added gradually, based on demonstrated performance and compliance — never on volume alone.',
    media: MEDIA.networkPhased,
  },
]

const standards = [
  {
    kicker: 'Food safety & quality',
    points: [
      'HACCP-based production processes',
      'Compliance with applicable regulatory frameworks',
      'Product traceability at batch or lot level',
      'Defined timelines for suppliers working toward formal certification',
    ],
  },
  {
    kicker: 'Regulatory compliance',
    points: [
      'Adherence to local and international food regulations',
      'Documented production, processing, and export records',
      'Transparency as a precondition of engagement',
    ],
  },
  {
    kicker: 'Ethical practices',
    points: [
      'No forced or child labour',
      'Safe and compliant working conditions',
      'Fair and lawful employment practices',
    ],
  },
]

const commitments = [
  {
    eyebrow: 'Environmental responsibility',
    title: 'Better practices, lower impact.',
    media: MEDIA.environmental,
    points: [
      'Preference for sustainable agricultural and production practices',
      'Reduced waste and improved resource efficiency',
      'Environmental impact integrated into supplier selection',
    ],
  },
  {
    eyebrow: 'Social impact',
    title: 'Inclusive by intent.',
    media: MEDIA.social,
    points: [
      'Engagement with small and mid-sized producers where feasible',
      'Encouragement of inclusive and equitable business practices',
      'Working toward recognised sustainability certifications as we expand',
    ],
  },
]

const traceabilitySteps = [
  { n: '01', title: 'Origin recorded', body: 'Producer, region, and batch documented at source.' },
  {
    n: '02',
    title: 'Documentation captured',
    body: 'Specifications, certifications, and lot records filed.',
  },
  { n: '03', title: 'Logistics controlled', body: 'Movement tracked through approved partners only.' },
  {
    n: '04',
    title: 'Visibility delivered',
    body: 'End-to-end records available to commercial partners.',
  },
]

const riskPrinciples = [
  {
    title: 'Multi-supplier strategy',
    body: 'Critical categories are sourced from more than one qualified supplier wherever possible.',
  },
  {
    title: 'Continuous performance review',
    body: 'Supplier reliability is assessed against delivery, specification, and compliance metrics.',
  },
  {
    title: 'External risk monitoring',
    body: 'Geopolitical, environmental, and logistical signals are tracked and built into planning.',
  },
]

const partnershipTraits = [
  { t: 'Clear expectations', d: 'Performance criteria defined up front.' },
  { t: 'Open feedback loops', d: 'Continuous, two-way communication.' },
  { t: 'Gradual scaling', d: 'Engagement grows with reliability.' },
  { t: 'Process support', d: 'Helping suppliers meet required standards.' },
]

const governancePrinciples = [
  'A defined supplier code of conduct',
  'Internal review for supplier selection and approval',
  'Zero tolerance for bribery or misrepresentation',
  'Mandatory documentation and disclosure',
]

const roadmap = [
  {
    horizon: 'Now',
    title: 'Foundations',
    body: 'Supplier code of conduct, structured onboarding, batch-level traceability, regional supplier base under active development.',
  },
  {
    horizon: 'Next',
    title: 'Capability build',
    body: 'Formal supplier auditing programmes, expanded sustainability evaluation, deeper digital traceability across categories.',
  },
  {
    horizon: 'Later',
    title: 'Maturity',
    body: 'Recognised sustainability certifications across the network, end-to-end digital visibility, public sustainability reporting.',
  },
]

const supplierChecklist = [
  'Company profile and product categories',
  'Relevant certifications and compliance documentation',
  'Operational capabilities and geographic coverage',
]

export function SourcingPageClient() {
  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">Sourcing</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Sourced with intent. <span className="text-gold">Built on trust.</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  A sourcing ecosystem designed for reliability, transparency, and long-term
                  sustainability — built deliberately, partner by partner.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <p className="m-0! mt-3! font-sans text-cream/55 text-[13px] md:text-sm leading-relaxed max-w-xl">
                  Our advantage isn&apos;t scale — it&apos;s judgement. Every supplier is selected
                  deliberately, evaluated against fixed standards, and onboarded into a system
                  built to grow without compromising what it stands for.
                </p>
              </FadeIn>
              <FadeIn delay={0.24}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/vendors">Become a supplier</Cta>
                  <Cta href="/sustainability" variant="outline">
                    Sustainability
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
          eyebrow="Three priorities"
          title="The non-negotiables behind every sourcing decision"
          lede="Principles before scale — the criteria a supplier meets before any product enters the portfolio."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {pillars.map((p, i) => (
            <FadeIn key={p.n} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...p.media}
                  ratio="4/3"
                  sizes="(max-width: 768px) 100vw, 33vw"
                >
                  <span className="absolute top-3 left-3 font-luxury text-[13px] font-semibold text-obsidian bg-cream/90 px-2 py-0.5 rounded-sm">
                    {p.n}
                  </span>
                </ImagePlaceholder>
                <div className="p-4 md:p-5 flex-1">
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                    {p.title}
                  </span>
                  <span className="block font-luxury italic text-[13px] text-forest-green/85 mt-1">
                    {p.line}
                  </span>
                  <p className="m-0! mt-2.5! font-sans text-[12.5px] text-stone leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 3 · NETWORK ════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Building the network"
          title="A geographically diverse supplier base"
          lede="Diversity protects continuity; discipline protects integrity. The base grows phase by phase."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {networkApproach.map((a, i) => (
            <FadeIn key={a.label} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...a.media}
                  ratio="16/9"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{a.label}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {a.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {a.body}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 4 · SUPPLIER STANDARDS ═════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Supplier standards"
          title="Our network expands. Our standards do not."
          lede="Every supplier moves through structured onboarding and evaluation before a single product is listed."
          tone="light"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-4">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.standards}
                tone="dark"
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="rounded-sm h-full min-h-55"
              />
            </FadeIn>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {standards.map((s, i) => (
              <FadeIn key={s.kicker} delay={i * 0.06}>
                <div className="h-full border border-cream/12 rounded-sm p-4 md:p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-luxury text-lg text-gold/70 leading-none">
                      0{i + 1}
                    </span>
                    <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight">
                      {s.kicker}
                    </span>
                  </div>
                  <ul className="list-none m-0 p-0 mt-3 flex flex-col gap-2">
                    {s.points.map((pt) => (
                      <Point key={pt} tone="light">
                        {pt}
                      </Point>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5 · COMMITMENTS ════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Responsible sourcing"
          title="What we commit to at origin"
          lede="Environmental and social criteria sit alongside price and specification in every supplier decision."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {commitments.map((c, i) => (
            <FadeIn key={c.eyebrow} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...c.media}
                  ratio="16/9"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{c.eyebrow}</Eyebrow>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2">
                    {c.title}
                  </span>
                  <ul className="list-none m-0 p-0 mt-3 flex flex-col gap-2">
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

      {/* ═══ 6 · TRACEABILITY & CONTINUITY ══════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Traceability & continuity"
          title="Visibility at every step, resilience by design"
          lede="Global food supply carries inherent volatility. Risk management is structural here, not reactive."
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-stone/15 rounded-sm overflow-hidden">
          {traceabilitySteps.map((s) => (
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
          {riskPrinciples.map((r, i) => (
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

      {/* ═══ 7 · PARTNERSHIPS ═══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Supplier partnerships"
          title="Sourcing is collaborative — not transactional"
          lede="We grow with the suppliers who grow with us."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-5">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.partnership}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="rounded-sm h-full min-h-55"
              />
            </FadeIn>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {partnershipTraits.map((x, i) => (
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

      {/* ═══ 8 · GOVERNANCE ═════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Governance & integrity"
          title="Trust is the only currency that compounds across a supply chain"
          tone="light"
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-cream/12 rounded-sm overflow-hidden">
          {governancePrinciples.map((p, i) => (
            <li
              key={p}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-cream/10 last:border-r-0"
            >
              <span className="block font-luxury text-lg text-gold/70 leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="m-0! mt-2.5! font-sans text-[12.5px] text-cream/70 leading-relaxed">
                {p}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 9 · ROADMAP ════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Looking ahead"
          title="Where the sourcing strategy goes next"
          lede="A future-ready network — efficient, scalable, and responsible."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {roadmap.map((r, i) => (
            <FadeIn key={r.horizon} delay={i * 0.06}>
              <div
                className={cn(
                  'h-full rounded-sm border p-4 md:p-5',
                  i === 0 ? 'bg-forest-green border-forest-green' : 'bg-white border-stone/15',
                )}
              >
                <Eyebrow tone={i === 0 ? 'light' : 'dark'}>{r.horizon}</Eyebrow>
                <span
                  className={cn(
                    'block font-luxury text-base md:text-lg font-semibold leading-tight mt-2',
                    i === 0 ? 'text-cream' : 'text-obsidian',
                  )}
                >
                  {r.title}
                </span>
                <p
                  className={cn(
                    'm-0! mt-2! font-sans text-[12.5px] leading-relaxed',
                    i === 0 ? 'text-cream/80' : 'text-stone',
                  )}
                >
                  {r.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 10 · BECOME A SUPPLIER ═════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-obsidian rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <Eyebrow tone="light">Become a supplier</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  Building a sourcing network, partner by partner
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed max-w-xl">
                We are actively engaging producers who meet our standards and share our long-term
                vision. To express interest, please share:
              </p>
              <ul className="list-none m-0 p-0 mt-4 flex flex-col gap-2">
                {supplierChecklist.map((c) => (
                  <Point key={c} tone="light">
                    {c}
                  </Point>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
              <Cta href="/vendors" variant="light">
                Submit supplier inquiry
              </Cta>
              <Cta href="/contact" variant="outline">
                Speak with our team
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
