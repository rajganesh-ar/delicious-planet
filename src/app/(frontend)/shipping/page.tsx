import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { BAND, Cta, Eyebrow, GUTTER, Point, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description:
    'Shipping scope, processing timelines, logistics handling, and delivery variables for Delicious Planet orders.',
}

/**
 * Fixed on purpose: rendering `new Date()` here would claim the policy was
 * revised today on every request. Update this when the copy below changes.
 */
const LAST_UPDATED = 'May 2026'

const MEDIA = {
  hero: { src: '/images/policy/shipping-policy.avif', label: 'Shipping hero — 4:3' },
}

type Section = {
  id: string
  label: string
  paragraphs: string[]
  points?: string[]
}

const sections: Section[] = [
  {
    id: 'scope',
    label: 'Scope',
    paragraphs: [
      'Shipping availability varies based on product category, destination, and handling requirements. Not all products are available for delivery to all regions.',
      'Delivery timelines depend on logistics routing and the specific characteristics of the products ordered.',
    ],
  },
  {
    id: 'processing',
    label: 'Processing',
    paragraphs: [
      'Orders are processed according to product availability and operational timelines. You will receive a confirmation when your order has been dispatched.',
      'Bulk and B2B orders may require additional processing coordination. Our team will be in touch to confirm lead times for larger volume orders.',
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    paragraphs: [
      'Shipping methods are selected based on product handling requirements and destination. Temperature-controlled logistics are applied where the product category requires it.',
      'We work with controlled logistics partners to maintain product integrity throughout transit.',
    ],
  },
  {
    id: 'variables',
    label: 'Delivery variables',
    paragraphs: ['Actual delivery times are influenced by:'],
    points: [
      'Destination region',
      'Order volume',
      'Product handling needs',
      'Customs processing timelines',
    ],
  },
]

const heroStats = [
  { value: '40+', label: 'Countries served' },
  { value: 'Cold chain', label: 'Where required' },
  { value: 'Tracked', label: 'Every dispatch' },
  { value: LAST_UPDATED, label: 'Last updated' },
]

export default function ShippingPolicyPage() {
  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <FadeIn>
                <Eyebrow tone="light">Policies</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Shipping <span className="text-gold">policy</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  How orders are processed, routed, and handled in transit — and what moves a
                  delivery date.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="/contact#enquiry">Ask about an order</Cta>
                  <Cta href="/policies" variant="outline">
                    All policies
                  </Cta>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-5">
              <FadeIn delay={0.1}>
                <ImagePlaceholder
                  {...MEDIA.hero}
                  ratio="4/3"
                  tone="dark"
                  priority
                  sizes="(max-width: 1024px) 100vw, 38vw"
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

      {/* ═══ 2 · POLICY ═════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="The detail"
          title="How we ship"
          lede="Scope, processing, logistics handling, and the variables that shift a delivery window."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
          {/* Contents */}
          <nav aria-label="Shipping policy sections" className="lg:col-span-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div className="bg-white border border-stone/15 rounded-sm p-4 md:p-5">
              <Eyebrow>Contents</Eyebrow>
              <ul className="list-none m-0 p-0 mt-3">
                {sections.map((s, i) => (
                  <li key={s.id} className="border-t border-stone/10 first:border-t-0">
                    {/* Colour sits on the span — `a { color: currentColor }` in
                        styles.css is unlayered and outranks text utilities. */}
                    <a href={`#${s.id}`} className="group no-underline flex items-baseline gap-3 py-2.5">
                      <span className="font-luxury text-[13px] text-stone/40 leading-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-sans text-[12.5px] text-stone group-hover:text-obsidian transition-colors leading-snug">
                        {s.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Sections */}
          <div className="lg:col-span-8 flex flex-col gap-3 md:gap-4">
            {sections.map((section, i) => (
              <FadeIn key={section.id}>
                {/* scroll-mt is keyed to the navbar height the header publishes at runtime. */}
                <article
                  id={section.id}
                  className="bg-white border border-stone/15 rounded-sm p-4 md:p-6 scroll-mt-[calc(var(--header-h)+1.5rem)]"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-luxury text-lg text-forest-green/60 leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="m-0!">
                      <span className="block font-luxury text-lg md:text-xl font-semibold text-obsidian leading-tight">
                        {section.label}
                      </span>
                    </h3>
                  </div>

                  <div className="mt-3 flex flex-col gap-3">
                    {section.paragraphs.map((p) => (
                      <p
                        key={p}
                        className="m-0! font-sans text-[13px] md:text-sm text-stone leading-relaxed"
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  {section.points ? (
                    <ul className="list-none m-0 p-0 mt-4 pt-4 border-t border-stone/10 flex flex-col gap-2">
                      {section.points.map((pt) => (
                        <Point key={pt}>{pt}</Point>
                      ))}
                    </ul>
                  ) : null}
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 · QUESTIONS ══════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-obsidian rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-xl">
              <Eyebrow tone="light">Questions</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  Shipping query on a specific order or region?
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed">
                Send us the order reference and destination. Response timelines vary by inquiry
                category.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Cta href="/contact#enquiry" variant="light">
                Contact us
              </Cta>
              <Cta href="/policies" variant="outline">
                All policies
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
