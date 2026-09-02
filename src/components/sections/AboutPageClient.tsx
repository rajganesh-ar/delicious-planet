'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { BAND, Cta, Eyebrow, GUTTER, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import { mediaUrl } from '@/lib/images'
import type { OfficeLocation, Media, Team } from '@/payload-types'

interface AboutPageClientProps {
  offices: OfficeLocation[]
  team: Team[]
}

/**
 * Alt text for a portrait. A vacancy has no person in the frame, so it gets the
 * role on its own rather than the words "Open role", which mean nothing read
 * aloud in place of a face.
 */
function memberAlt(member: Team): string {
  return member.name ? `${member.name}, ${member.role}` : member.role
}

/* ──────────────────────────────────────────────────────────────
 * Media slots.
 *
 * Every image on this page is declared here. `src: null` renders the
 * designed placeholder from <ImagePlaceholder>; dropping a file in and
 * setting its path is the only change needed to go live with real art.
 * ────────────────────────────────────────────────────────────── */
const MEDIA = {
  hero: { src: '/images/about/about-timeline.avif', label: 'Hero — 4:3' },
  originA: { src: '/images/about/about-customer.avif', label: 'Producer — 4:3' },
  originB: { src: null, label: 'Apiary — 4:3' },
  originC: { src: null, label: 'Harvest — 4:3' },
  manifesto: { src: '/images/about/about-cover.avif', label: 'Manifesto backdrop' },
  reach: { src: '/images/about/about-retail.avif', label: 'Regional operations — 4:3' },
  capability: { src: '/images/about/about-resturant.avif', label: 'Coordination layer' },
} satisfies Record<string, { src: string | null; label: string }>

/* ── Content ── */

const heroStats = [
  { value: '25+', label: 'Sourcing partners' },
  { value: '20+', label: 'Product categories' },
  { value: '5', label: 'Operational bases' },
  { value: '4', label: 'Continents covered' },
]

const originParagraphs = [
  'Delicious Planet began with honey production developed within environments where product integrity depends on ecological balance, seasonal rhythm, and disciplined harvesting practices.',
  'Over time, sourcing capabilities expanded to include olive oil, dried figs, botanical extracts, and additional natural products selected for their stability of characteristics across cultivation cycles.',
  'The platform has evolved into a structured sourcing environment designed to support professional buyers requiring reliable ingredient performance across repeated procurement cycles.',
]

const reachRows = [
  { region: 'North Africa', detail: 'Agricultural origin and producer relationships', tag: 'Origin' },
  { region: 'Middle East', detail: 'Headquarters and commercial coordination', tag: 'HQ' },
  { region: 'Southern Europe', detail: 'Category expansion and export pathways', tag: 'Supply' },
  { region: 'Global markets', detail: 'Distribution and documentation readiness', tag: '4 continents' },
]

const capabilities = [
  {
    badge: 'Sourcing',
    text: 'Multi-region sourcing coordination connecting disciplined agricultural environments with professional markets.',
  },
  {
    badge: 'Quality',
    text: 'Product specification alignment ensuring consistent characteristics across procurement cycles.',
  },
  {
    badge: 'How we deliver',
    text: 'Continuity planning across harvest cycles with documentation readiness for international distribution.',
    accent: true,
  },
  {
    badge: 'Private label',
    text: 'Private label product development through controlled production partnerships.',
  },
  {
    badge: 'Scale',
    text: 'Scalable procurement frameworks designed for organizations requiring consistent product characteristics.',
  },
  {
    badge: 'Compliance',
    text: 'Export compliance and documentation readiness supporting international distribution across markets.',
  },
]

const principles = [
  { title: 'Consistency', description: 'Stable product characteristics across production cycles.' },
  {
    title: 'Continuity',
    description: 'Supply structures designed to maintain predictable availability.',
  },
  { title: 'Clarity', description: 'Transparent origin pathways and documentation readiness.' },
  {
    title: 'Alignment',
    description: 'Coordination between production environments and commercial requirements.',
  },
  {
    title: 'Scalability',
    description:
      'Supply frameworks capable of supporting volume growth without compromising product stability.',
  },
  {
    title: 'Integrity',
    description:
      'Preservation of natural product characteristics across sourcing and distribution processes.',
  },
]

const timeline = [
  {
    year: '2020',
    title: 'Foundation',
    description: 'Foundation in honey production within Algerian agricultural environments.',
  },
  {
    year: '2021',
    title: 'Initial partnerships',
    description: 'Sourcing partnerships established for olive oil and dried fruit categories.',
  },
  {
    year: '2022',
    title: 'Network expansion',
    description: 'Expansion of supplier network across North Africa and Southern Europe.',
  },
  {
    year: '2023',
    title: 'Procurement framework',
    description: 'Structured procurement framework supporting multi-category sourcing.',
  },
  {
    year: '2024',
    title: 'Private label',
    description: 'Introduction of private label supply coordination.',
  },
  {
    year: '2025',
    title: 'Distribution growth',
    description: 'Expansion of distribution capability across Middle East markets.',
  },
  {
    year: '2026',
    title: 'International structure',
    description: 'Headquarters in the UAE with regional offices across multiple markets.',
  },
]

/* Founder is featured separately above, so the grid picks up from the next desk.
   Reachable addresses for these people live in `@/lib/contact`. */

export function AboutPageClient({ offices, team }: AboutPageClientProps) {
  // Nothing stops two rows carrying `isFounder`; the page takes the first the
  // sort gives it rather than rendering the card twice.
  const founder = team.find((member) => member.isFounder) ?? null
  const members = team.filter((member) => member !== founder)

  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">Our story</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Structured natural supply,{' '}
                    <span className="text-gold">designed for global continuity</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  Delicious Planet connects disciplined agricultural production environments with
                  professional markets requiring reliability, specification consistency, and
                  scalable procurement capability.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <p className="m-0! mt-3! font-sans text-cream/55 text-[13px] md:text-sm leading-relaxed max-w-xl">
                  Rooted in Algeria and headquartered in the United Arab Emirates, coordinating
                  sourcing relationships across multiple regions.
                </p>
              </FadeIn>
              <FadeIn delay={0.24}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/contact">Talk to sourcing</Cta>
                  <Cta href="/products" variant="outline">
                    Browse catalogue
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

        {/* Stat bar */}
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

      {/* ═══ 2 · ORIGIN ═════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Chapter one — Origin"
          title="Built on agricultural continuity"
          lede="From a single agricultural product to an internationally coordinated sourcing platform."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            {originParagraphs.map((text, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <p className="m-0! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
                  {text}
                </p>
              </FadeIn>
            ))}
          </div>

          <div className="lg:col-span-5">
            <FadeIn delay={0.08}>
              <ImagePlaceholder
                {...MEDIA.originA}
                ratio="16/10"
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="rounded-sm"
              />
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
          {[MEDIA.originB, MEDIA.originC].map((slot, i) => (
            <FadeIn key={slot.label} delay={0.1 + i * 0.06}>
              <ImagePlaceholder
                {...slot}
                ratio="4/3"
                sizes="(max-width: 1024px) 50vw, 24vw"
                className="rounded-sm"
              />
            </FadeIn>
          ))}
          <FadeIn delay={0.22} className="col-span-2">
            <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5 flex flex-col justify-center">
              <Eyebrow>Established</Eyebrow>
              <span className="block font-luxury text-3xl md:text-4xl font-semibold text-obsidian leading-none mt-2">
                2020
              </span>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                Foundation in honey production, Algeria — the discipline every later category was
                built on.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 3 · MANIFESTO ══════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <ImagePlaceholder
            {...MEDIA.manifesto}
            tone="dark"
            glyph={false}
            sizes="100vw"
            className="rounded-sm min-h-65 md:min-h-80 flex items-center"
          >
            {MEDIA.manifesto.src ? (
              <div className="absolute inset-0 bg-linear-to-r from-obsidian/90 via-obsidian/65 to-obsidian/20" />
            ) : null}
            <div className="relative z-10 max-w-2xl px-6 md:px-10 lg:px-14 py-10">
              <Eyebrow tone="light">Manifesto</Eyebrow>
              <blockquote className="m-0! mt-3!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl lg:text-[34px]">
                  &ldquo;Continuity isn&apos;t an outcome — it&apos;s a discipline.&rdquo;
                </span>
              </blockquote>
              <p className="m-0! mt-3! md:mt-4! font-sans text-cream/75 text-[13px] md:text-sm leading-relaxed max-w-lg">
                We design sourcing structures so that natural products arrive predictable,
                traceable, and unchanged in character.
              </p>
            </div>
          </ImagePlaceholder>
        </FadeIn>
      </section>

      {/* ═══ 4 · REACH ══════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Chapter two — Reach"
          title="International structure"
          lede="Geographic positioning that keeps agricultural environments and commercial supply requirements in step."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-7">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.reach}
                ratio="16/9"
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="rounded-sm"
              />
            </FadeIn>
          </div>
          <div className="lg:col-span-5">
            {/* flex-1 rows so the card fills the image's height instead of
                leaving a dead strip under the last region. */}
            <ul className="list-none m-0 p-0 h-full flex flex-col bg-white border border-stone/15 rounded-sm">
              {reachRows.map((row) => (
                <li
                  key={row.region}
                  className="flex-1 flex items-center justify-between gap-4 px-4 md:px-5 py-3.5 border-b border-stone/10 last:border-b-0"
                >
                  <span className="min-w-0">
                    <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                      {row.region}
                    </span>
                    <span className="block font-sans text-[11.5px] md:text-xs text-stone leading-snug mt-0.5">
                      {row.detail}
                    </span>
                  </span>
                  <span className="shrink-0 font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green">
                    {row.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ 5 · CAPABILITIES ═══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Chapter three — Capabilities"
          title="Structured supply for professional environments"
          lede="A coordination layer between producers with stable output and buyers who need predictable procurement."
        />

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4">
          {/* row-span-3 keeps the block square: six half-width cards over three
              rows match the feature card's height exactly. */}
          <FadeIn className="md:col-span-2 md:row-span-3">
            <ImagePlaceholder
              {...MEDIA.capability}
              tone="dark"
              sizes="(max-width: 768px) 100vw, 33vw"
              className="rounded-sm h-full min-h-55"
            >
              <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/45 to-obsidian/5" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <Eyebrow tone="light">Coordination layer</Eyebrow>
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-lg md:text-xl mt-1.5">
                  From cultivation cycle to commercial shelf.
                </span>
              </div>
            </ImagePlaceholder>
          </FadeIn>

          {capabilities.map((cap, i) => (
            <FadeIn key={cap.badge} delay={i * 0.04} className="md:col-span-2">
              <div
                className={cn(
                  'h-full rounded-sm border p-4 md:p-5 flex flex-col',
                  cap.accent ?
                    'bg-forest-green border-forest-green'
                  : 'bg-white border-stone/15',
                )}
              >
                <span
                  className={cn(
                    'block font-sans text-[10px] uppercase tracking-[0.16em] font-medium',
                    cap.accent ? 'text-gold' : 'text-forest-green',
                  )}
                >
                  {cap.badge}
                </span>
                <p
                  className={cn(
                    'm-0! mt-2.5! font-sans text-[12.5px] leading-relaxed',
                    cap.accent ? 'text-cream/85' : 'text-stone',
                  )}
                >
                  {cap.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 6 · PRINCIPLES ═════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Chapter four — Principles"
          title="Six disciplines behind every sourcing decision"
          tone="light"
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 border border-cream/12 rounded-sm overflow-hidden">
          {principles.map((p, i) => (
            <li
              key={p.title}
              className="px-4 md:px-5 py-4 md:py-5 border-b border-r border-cream/10 last:border-r-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-luxury text-lg text-gold/70 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight">
                  {p.title}
                </span>
              </div>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-cream/55 leading-relaxed">
                {p.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 7 · TIMELINE ═══════════════════════════════════════ */}
      <section className={cn(BAND, 'bg-parchment overflow-hidden')}>
        <div className={GUTTER}>
          <SectionHead
            eyebrow="Chapter five — Journey"
            title="Development timeline"
            lede="Built deliberately, year by year."
          />

          {/* Scroller starts at the gutter so card one lines up with the heading,
              and bleeds off the right edge. */}
          <div className="overflow-x-auto [scrollbar-width:thin] -mr-6 lg:-mr-16">
            <div className="flex gap-3 md:gap-4 min-w-max pr-6 lg:pr-16">
              {timeline.map((item, i) => (
                <FadeIn key={item.year} delay={Math.min(i, 4) * 0.04}>
                  <article className="w-56 md:w-64">
                    <ImagePlaceholder
                      src={null}
                      label={item.year}
                      ratio="4/3"
                      sizes="256px"
                      className="rounded-sm"
                    >
                      <span className="absolute top-3 left-3 font-luxury text-sm font-semibold text-obsidian bg-cream/90 px-2 py-0.5 rounded-sm">
                        {item.year}
                      </span>
                    </ImagePlaceholder>
                    <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-3">
                      {item.title}
                    </span>
                    <p className="m-0! mt-1.5! font-sans text-[12.5px] text-stone leading-relaxed">
                      {item.description}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8 · FOUNDER + TEAM (CMS) ═══════════════════════════ */}
      {team.length > 0 && (
        <section className={cn(GUTTER, BAND)}>
          <SectionHead eyebrow="Our people" title="The team behind the taste" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
            {/* Founder — the row with `isFounder`, rendered wide with its quote.
                Without one the grid takes the full twelve columns. */}
            {founder ? (
              <FadeIn className="lg:col-span-5">
                <div className="bg-white border border-stone/15 rounded-sm overflow-hidden h-full">
                  <div className="grid grid-cols-5">
                    <ImagePlaceholder
                      src={mediaUrl(founder.photo)}
                      alt={memberAlt(founder)}
                      label="Founder portrait"
                      ratio="4/5"
                      sizes="(max-width: 1024px) 40vw, 16vw"
                      className="col-span-2"
                    />
                    <div className="col-span-3 p-4 md:p-5 flex flex-col justify-center">
                      <Eyebrow>Founder perspective</Eyebrow>
                      <span className="block font-luxury text-lg md:text-xl font-semibold text-obsidian leading-tight mt-2">
                        {founder.name ?? 'Open role'}
                      </span>
                      <span className="block font-sans text-[11px] uppercase tracking-[0.16em] text-stone mt-1">
                        {founder.role}
                      </span>
                      {founder.quote ? (
                        <p className="m-0! mt-3! font-sans text-[12.5px] text-stone leading-relaxed">
                          &ldquo;{founder.quote}&rdquo;
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ) : null}

            {/* Team grid */}
            <div
              className={cn(
                'grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4',
                founder ? 'lg:col-span-7' : 'lg:col-span-12',
              )}
            >
              {members.map((member, i) => (
                <FadeIn key={member.id} delay={i * 0.05}>
                  <ImagePlaceholder
                    src={mediaUrl(member.photo)}
                    alt={memberAlt(member)}
                    label={member.name ?? 'Portrait'}
                    ratio="1/1"
                    sizes="(max-width: 640px) 50vw, 18vw"
                    className="rounded-sm"
                  />
                  <span className="block font-sans text-[12px] font-medium text-obsidian leading-tight mt-2">
                    {member.name ?? 'Open role'}
                  </span>
                  <span className="block font-sans text-[11px] text-stone/70 leading-tight mt-0.5">
                    {member.role}
                  </span>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 9 · OFFICES (CMS) ══════════════════════════════════ */}
      {offices.length > 0 && (
        <section className={cn(GUTTER, BAND, 'bg-parchment')}>
          <SectionHead
            eyebrow="Global presence"
            title="Our offices"
            lede={`${offices.length} coordinated ${offices.length === 1 ? 'location' : 'locations'}.`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {offices.map((office, i) => {
              const media = typeof office.image === 'object' ? (office.image as Media) : null
              const imgUrl = media?.sizes?.card?.url ?? media?.url ?? null
              return (
                <FadeIn key={office.id} delay={i * 0.05}>
                  <article className="h-full bg-white border border-stone/15 rounded-sm overflow-hidden">
                    <ImagePlaceholder
                      src={imgUrl}
                      alt={`${office.city}, ${office.country}`}
                      label={office.city}
                      ratio="4/3"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                    />
                    <div className="p-4 md:p-5">
                      <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                        {office.city}
                      </span>
                      <span className="block font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green mt-1">
                        {office.country}
                      </span>
                      {office.address ? (
                        <p className="m-0! mt-2.5! font-sans text-[11.5px] text-stone leading-relaxed">
                          {office.address}
                        </p>
                      ) : null}
                      {office.phone ? (
                        <a href={`tel:${office.phone}`} className="group no-underline block mt-2">
                          <span className="font-sans text-[11.5px] text-stone group-hover:text-forest-green transition-colors">
                            {office.phone}
                          </span>
                        </a>
                      ) : null}
                      {office.email ? (
                        <a
                          href={`mailto:${office.email}`}
                          className="group no-underline block mt-0.5"
                        >
                          <span className="font-sans text-[11.5px] text-stone group-hover:text-forest-green transition-colors">
                            {office.email}
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </article>
                </FadeIn>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ 10 · CTA ═══════════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-forest-green rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-xl">
              <Eyebrow tone="light">Get in touch</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  Continuity of origin, structured for scale
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/75 text-[13px] md:text-sm leading-relaxed">
                Professional buyer, chef, or specialty retailer — tell us what your sourcing
                requires.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Cta href="/contact" variant="light">
                Contact us
              </Cta>
              <Cta href="/b2b" variant="outline">
                Wholesale &amp; B2B
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
