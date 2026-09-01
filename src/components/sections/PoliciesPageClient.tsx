'use client'

import { useEffect, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { BAND, Cta, Eyebrow, GUTTER, Point, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

type Policy = {
  id: string
  title: string
  summary: string
  points: string[]
}

/** Shown beside the heading; update when the policy text changes. */
const LAST_UPDATED = 'May 2026'

const MEDIA = {
  hero: { src: '/images/policy/policy-cover.avif', label: 'Policies hero — 4:3' },
} satisfies Record<string, { src: string | null; label: string }>

const policies: Policy[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    summary:
      'By accessing the Delicious Planet website and placing orders, you agree to our terms of service. These terms govern your use of our platform and purchasing relationship.',
    points: [
      'All prices are displayed in the selected currency and may vary by region.',
      'Delicious Planet reserves the right to update product listings and pricing without prior notice.',
      'Orders are subject to availability and confirmation of payment.',
      'We reserve the right to cancel orders where products are unavailable or where pricing errors have occurred.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    summary:
      'Your personal data is handled in accordance with applicable data protection regulations. We collect only the information necessary to fulfil your orders and improve your experience.',
    points: [
      'Personal data collected includes name, email, delivery address, and payment information.',
      'We do not sell personal data to third parties.',
      'Data is retained for as long as required to fulfil legal and operational obligations.',
      'You may request access to or deletion of your personal data by contacting us.',
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping Policy',
    summary:
      'We dispatch orders through carriers selected for reliability, traceability, and category-appropriate handling. Lead times vary by destination and product type.',
    points: [
      'Standard orders are dispatched within 2–4 business days of confirmation.',
      'Temperature-sensitive products are shipped using cold-chain carriers only.',
      'International shipments may be subject to customs duties payable by the recipient.',
      'Tracking details are issued by email at the time of dispatch.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    summary:
      'We are committed to the quality of every product we ship. If you receive a damaged or incorrect item, please contact us within 48 hours of delivery.',
    points: [
      'Returns are accepted for damaged or incorrectly dispatched items only.',
      'Perishable and temperature-controlled products cannot be returned once delivered.',
      'Refunds are processed to the original payment method within 7–10 business days.',
      'For B2B orders, returns are subject to the terms agreed at the time of order.',
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    summary:
      'Orders may be cancelled before dispatch. Once an order has been dispatched, cancellations cannot be processed.',
    points: [
      'To cancel an order, contact us as soon as possible after placing it.',
      'Cancellations are not guaranteed once order processing has begun.',
      'B2B and contract orders are subject to separate cancellation terms.',
    ],
  },
  {
    id: 'b2b-terms',
    title: 'Commercial Terms (B2B)',
    summary:
      'Business-to-business supply agreements are governed by individually negotiated terms. The following general principles apply unless otherwise specified in a written agreement.',
    points: [
      'Volume pricing, lead times, and payment terms are confirmed in writing prior to first delivery.',
      'Minimum order quantities apply and vary by product category.',
      'Supply continuity commitments are subject to producer availability and logistics conditions.',
      'Quality disputes must be raised within 48 hours of delivery with photographic documentation.',
    ],
  },
]

export function PoliciesPageClient() {
  const [activeId, setActiveId] = useState<string>(policies[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    policies.forEach((p) => {
      const el = document.getElementById(p.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <FadeIn>
                <Eyebrow tone="light">Legal &amp; compliance</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Policies &amp; <span className="text-gold">terms</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  Structured policies keep every transaction clear and consistent — for individual
                  customers and B2B partners alike.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="#b2b-terms">Commercial terms</Cta>
                  <Cta href="/contact#enquiry" variant="outline">
                    Ask a question
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
            {[
              { value: String(policies.length), label: 'Policy sections' },
              { value: '48h', label: 'Quality dispute window' },
              { value: '2–4 days', label: 'Dispatch window' },
              { value: LAST_UPDATED, label: 'Last updated' },
            ].map((s, i) => (
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

      {/* ═══ 2 · POLICIES ═══════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <SectionHead
          eyebrow="The framework"
          title="What governs our service"
          lede="We aim for transparency in every commercial relationship — these are the terms behind it."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
          {/* Contents — sticky on lg, a plain list below it. */}
          <nav aria-label="Policy sections" className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-white border border-stone/15 rounded-sm p-4 md:p-5">
              <Eyebrow>Contents</Eyebrow>
              <ul className="list-none m-0 p-0 mt-3">
                {policies.map((p, i) => {
                  const active = activeId === p.id
                  return (
                    <li key={p.id} className="border-t border-stone/10 first:border-t-0">
                      {/* Colour sits on the span — `a { color: currentColor }` in
                          styles.css is unlayered and outranks text utilities. */}
                      <a
                        href={`#${p.id}`}
                        aria-current={active ? 'true' : undefined}
                        className="group no-underline flex items-baseline gap-3 py-2.5"
                      >
                        <span
                          className={cn(
                            'font-luxury text-[13px] leading-none transition-colors',
                            active ? 'text-forest-green' : 'text-stone/40',
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={cn(
                            'font-sans text-[12.5px] leading-snug transition-colors',
                            active ?
                              'text-forest-green font-medium'
                            : 'text-stone group-hover:text-obsidian',
                          )}
                        >
                          {p.title}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Sections */}
          <div className="lg:col-span-8 flex flex-col gap-3 md:gap-4">
            {policies.map((policy, i) => (
              <FadeIn key={policy.id}>
                {/* scroll-mt is keyed to the navbar height the header publishes at runtime. */}
                <article
                  id={policy.id}
                  className="bg-white border border-stone/15 rounded-sm p-4 md:p-6 scroll-mt-[calc(var(--header-h)+1.5rem)]"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-luxury text-lg text-forest-green/60 leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="m-0!">
                      <span className="block font-luxury text-lg md:text-xl font-semibold text-obsidian leading-tight">
                        {policy.title}
                      </span>
                    </h3>
                  </div>

                  <p className="m-0! mt-3! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
                    {policy.summary}
                  </p>

                  <ul className="list-none m-0 p-0 mt-4 pt-4 border-t border-stone/10 flex flex-col gap-2">
                    {policy.points.map((pt) => (
                      <Point key={pt}>{pt}</Point>
                    ))}
                  </ul>
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
                  Need clarification on any of these terms?
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed">
                We respond to policy and terms inquiries within two business days. For B2B contract
                questions, include your company details in the message.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Cta href="/contact#enquiry" variant="light">
                Contact us
              </Cta>
              <Cta href="/b2b" variant="outline">
                B2B solutions
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
