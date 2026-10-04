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
  hero: { src: siteImage('/images/experience/experience-experts.avif'), label: 'Ecosystem hero — 4:3' },
  originA: { src: siteImage('/images/experience/experience-cultivation.avif'), label: 'Cultivation — 4:5', alt: 'Olives ripening on the branch' },
  originB: { src: siteImage('/images/experience/experience-harvest.avif'), label: 'Harvest — 4:5', alt: 'Hands sorting harvested olives into a crate' },
  specialty: { src: siteImage('/images/experience/experience-specialty.avif'), label: 'Vineyards & estates — 16:9', alt: 'Vineyard rows on a hillside estate in low sun' },
  processing: { src: siteImage('/images/experience/experience-processing.avif'), label: 'Processing & cold chain — 16:9', alt: 'Racks of cheese in a temperature-controlled room' },
  endUse: { src: siteImage('/images/experience/experience-chef.avif'), label: 'Foodservice — 16:9' },
  retail: { src: siteImage('/images/experience/experience-dish.avif'), label: 'Retail & consumer — 16:9' },
} satisfies Record<string, { src: string | null; label: string; alt?: string }>

/* ── Content ── */

const heroStats = [
  { value: '01', label: 'Origin' },
  { value: '02', label: 'Specialty' },
  { value: '03', label: 'Handling' },
  { value: '04', label: 'Consumption' },
]

const originPoints = [
  'Understanding cultivation & production',
  'Assessing quality consistency & yield',
  'Evaluating environmental & operational conditions',
]

const stages = [
  {
    kicker: '02 · Specialty',
    title: 'Vineyards & value-added production',
    body: 'For premium products, origin characteristics are critical. We are developing exposure to vineyards, estate-based systems, and region-specific agricultural products to understand differentiation at its source — aligning sourcing with the quality and positioning our partners require.',
    media: MEDIA.specialty,
  },
  {
    kicker: '03 · Handling',
    title: 'Processing & handling environments',
    body: 'Between origin and consumption, handling and processing determine whether product integrity survives the journey. We build familiarity with processing units, cold chain infrastructure, and quality control so standards and coordination hold across the supply chain.',
    media: MEDIA.processing,
  },
  {
    kicker: '04 · Consumption',
    title: 'Restaurants, foodservice & retail',
    body: 'Understanding how products are used is essential to distributing them well. We engage with restaurants, hospitality groups, and retail environments to align specifications with real-world usage, read demand patterns, and improve supply consistency.',
    media: MEDIA.endUse,
  },
]

const whyItMatters = [
  { title: 'Context & precision', body: 'Source products aligned with actual usage requirements.' },
  { title: 'Improved communication', body: 'Bridge the gap between suppliers and end-buyers.' },
  { title: 'Anticipate & adapt', body: 'Foresee demand shifts and operational constraints.' },
  {
    title: 'Strengthened assurance',
    body: 'Enhance traceability and quality control from end to end.',
  },
]

export function ExperiencePageClient() {
  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">Our ecosystem</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Connecting <span className="text-gold">source to table</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  We operate across the food value chain, from production environments to
                  end-consumption spaces. That integrated perspective informs how we source,
                  evaluate, and distribute products.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/products">Browse the catalogue</Cta>
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

        {/* The four stages double as the hero's stat bar. */}
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

      {/* ═══ 2 · AT THE SOURCE ══════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="01 · Origin"
          title="At the source: farms & primary production"
          lede="Our engagement begins where quality is fundamentally determined."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
          <div className="lg:col-span-7 grid grid-cols-2 gap-3 md:gap-4">
            <FadeIn>
              <ImagePlaceholder
                {...MEDIA.originA}
                ratio="4/5"
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="rounded-sm"
              />
            </FadeIn>
            <FadeIn delay={0.06}>
              <ImagePlaceholder
                {...MEDIA.originB}
                ratio="4/5"
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="rounded-sm"
              />
            </FadeIn>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5 flex flex-col justify-center">
              <p className="m-0! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
                We build relationships with agricultural producers, fisheries, and cooperatives to
                understand cultivation practices, assess quality, and evaluate environmental
                conditions. This proximity to origin supports better sourcing decisions and
                improved traceability.
              </p>
              <ul className="list-none m-0 p-0 mt-4 pt-4 border-t border-stone/10 flex flex-col gap-2">
                {originPoints.map((pt) => (
                  <Point key={pt}>{pt}</Point>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3 · THE REST OF THE CHAIN ══════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="The value chain"
          title="From specialty production to the plate"
          lede="Each stage carries its own failure modes — we build familiarity with all of them."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {stages.map((s, i) => (
            <FadeIn key={s.kicker} delay={i * 0.06}>
              <article className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden">
                <ImagePlaceholder
                  {...s.media}
                  ratio="16/9"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="p-4 md:p-5 flex-1">
                  <Eyebrow>{s.kicker}</Eyebrow>
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

      {/* ═══ 4 · RETAIL INTERFACE ═══════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="Consumer interface"
          title="Where the product finally meets someone"
          lede="Shelf, menu, and packaging are the last places a sourcing decision gets tested."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <FadeIn>
            <ImagePlaceholder
              {...MEDIA.retail}
              ratio="16/9"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-sm"
            >
              <div className="absolute inset-0 bg-linear-to-t from-obsidian/85 via-obsidian/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <Eyebrow tone="light">Retail</Eyebrow>
                <span className="block font-luxury text-cream font-semibold leading-tight text-lg md:text-xl mt-1.5">
                  Retail &amp; consumer interface
                </span>
              </div>
            </ImagePlaceholder>
          </FadeIn>
          <FadeIn delay={0.06}>
            <ImagePlaceholder
              {...MEDIA.endUse}
              ratio="16/9"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-sm"
            >
              <div className="absolute inset-0 bg-linear-to-t from-obsidian/85 via-obsidian/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <Eyebrow tone="light">Foodservice</Eyebrow>
                <span className="block font-luxury text-cream font-semibold leading-tight text-lg md:text-xl mt-1.5">
                  Foodservice &amp; hospitality
                </span>
              </div>
            </ImagePlaceholder>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 5 · WHY IT MATTERS ═════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-obsidian')}>
        <SectionHead
          eyebrow="Why this matters"
          title="A connected understanding of the entire system"
          tone="light"
        />

        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-cream/12 rounded-sm overflow-hidden">
          {whyItMatters.map((p, i) => (
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
              <p className="m-0! mt-2! font-sans text-[12.5px] text-cream/60 leading-relaxed">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ 6 · CTA ════════════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-forest-green rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-xl">
              <Eyebrow tone="light">Explore our portfolio</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  Sourced with the whole chain in view
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/75 text-[13px] md:text-sm leading-relaxed">
                Products chosen with an understanding of where they come from and how they get
                used — from origin to your environment.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Cta href="/products" variant="light">
                Browse all products
              </Cta>
              <Cta href="/contact" variant="outline">
                Talk to us
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
