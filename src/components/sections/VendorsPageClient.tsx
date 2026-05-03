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
    img: '/images/vendor/vendor-agriculture.avif',
    span: 'lg:col-span-7',
    aspect: 'aspect-[16/10]',
  },
  {
    n: '02',
    label: 'Marine',
    title: 'Fisheries & aquaculture operators',
    body: 'Sustainable wild-catch and aquaculture operators with chain-of-custody documentation.',
    img: '/images/vendor/vendor-fisheries.avif',
    span: 'lg:col-span-5',
    aspect: 'aspect-[4/3]',
  },
  {
    n: '03',
    label: 'Manufacture',
    title: 'Food processors & manufacturers',
    body: 'Specialty processors with documented batch consistency and export-ready capability.',
    img: '/images/vendor/vendor-processors.avif',
    span: 'lg:col-span-5',
    aspect: 'aspect-[4/3]',
  },
  {
    n: '04',
    label: 'Distribution',
    title: 'Aggregators & export houses',
    body: 'Volume aggregators and export specialists capable of meeting international compliance.',
    img: '/images/vendor/vendor-aggregators.avif',
    span: 'lg:col-span-7',
    aspect: 'aspect-[16/10]',
  },
  {
    n: '05',
    label: 'Logistics',
    title: 'Logistics & cold chain partners',
    body: 'Operators maintaining temperature integrity from producer to port to shelf.',
    img: '/images/vendor/vendor-logistics.avif',
    span: 'lg:col-span-12',
    aspect: 'aspect-[21/8]',
  },
]

const requirements = [
  {
    n: '01',
    kicker: 'Quality & Food Safety',
    headline: 'Consistent. Traceable. Verifiable.',
    points: [
      'Implementation of recognised food safety practices (HACCP-aligned)',
      'Demonstrable product consistency across production batches',
      'Traceability maintained at lot or batch level',
    ],
  },
  {
    n: '02',
    kicker: 'Regulatory Compliance',
    headline: 'Documented at every step.',
    points: [
      'Compliance with applicable local and international regulations',
      'Valid certifications and documentation, where required',
      'Transparency in product origin and handling processes',
    ],
  },
  {
    n: '03',
    kicker: 'Ethical & Labour Practices',
    headline: 'Non-negotiable.',
    points: [
      'No use of forced or child labour',
      'Safe and compliant working conditions',
      'Adherence to applicable labour laws',
    ],
  },
  {
    n: '04',
    kicker: 'Operational Capability',
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
    title: 'Initial Assessment',
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
    title: 'Approval & Integration',
    body: 'Formal onboarding, agreement on specifications, and inclusion in the supplier network.',
  },
]

const tiers = [
  {
    label: 'Tier 01',
    name: 'Developmental',
    summary: 'Suppliers in active onboarding — meeting baselines and building toward category alignment.',
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
    summary: 'Long-term partners integrated into category planning, demand forecasting, and growth.',
    markers: [
      'Multi-year, performance-tied partnership',
      'Joint planning on volume and specification',
      'Priority engagement on new opportunities',
    ],
  },
]

const performanceMetrics = [
  {
    metric: 'Quality',
    detail: 'Product specification adherence and batch-to-batch consistency.',
  },
  {
    metric: 'Reliability',
    detail: 'On-time delivery and order fulfilment against agreed schedules.',
  },
  {
    metric: 'Compliance',
    detail: 'Continued adherence to documented standards and certifications.',
  },
  {
    metric: 'Responsiveness',
    detail: 'Communication, issue resolution, and collaborative engagement.',
  },
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
    label: 'Market Access',
    title: 'Regional distribution networks',
    body: 'Partners enabling efficient market reach across the regions we operate in.',
  },
]

const inquiryChecklist = [
  'Company profile and product categories',
  'Certifications and compliance documentation',
  'Production capacity and geographic coverage',
]

/* ────────────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────────────── */

export function VendorsPageClient() {
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
      {/* ═══ Hero — cinematic parallax with split layout ═══ */}
      <section
        ref={refCallback}
        className="relative min-h-[88vh] flex items-end overflow-hidden bg-obsidian"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/vendor/hero-vendor.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/30" />
        </motion.div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pb-20 lg:pb-28 pt-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <motion.p
                className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Vendors &amp; Partnerships
              </motion.p>
              <motion.h1
                className="font-luxury text-4xl sm:text-5xl lg:text-[64px] xl:text-[76px] font-light text-cream leading-[1.02] tracking-[-0.03em] m-0"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Built on standards.
                <br />
                <span className="text-gold">Grown through trust.</span>
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
                A supplier network engineered for credibility — selective at entry, structured in
                governance, and long-term in intent.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Approach — editorial intro with three pillars ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 lg:mb-20">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Our Approach
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Selective at entry.
                  <br />
                  Structured in growth.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <FadeIn delay={0.1}>
                <p className="text-stone text-lg lg:text-xl leading-relaxed m-0 mb-6">
                  We are building a network of suppliers and partners aligned with our commitment
                  to quality, reliability, and responsible sourcing. As a growing organisation, we
                  are deliberate in establishing relationships that can scale sustainably over time.
                </p>
                <p className="text-stone/80 text-base lg:text-lg leading-relaxed m-0">
                  Our model favours operational discipline and global supply readiness over volume
                  alone. We add suppliers slowly — and grow alongside them.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist/40 rounded-sm overflow-hidden">
            {approachPillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <div className="bg-cream p-8 lg:p-10 h-full">
                  <span className="font-luxury text-gold text-xs tracking-[0.3em] block mb-5">
                    0{i + 1}
                  </span>
                  <h3 className="font-luxury text-xl lg:text-2xl font-medium text-obsidian m-0 mb-3">
                    {p.title}
                  </h3>
                  <p className="text-stone text-sm lg:text-base leading-relaxed m-0">{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Who We Work With — bento mosaic across 5 supplier types ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14 lg:mb-16">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Who We Work With
                </p>
                <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  An integrated network — origin to delivery.
                </h2>
              </div>
              <p className="text-stone text-sm max-w-sm">
                Five supplier types form the backbone of a single, coordinated supply ecosystem.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            {networkTypes.map((t, i) => (
              <FadeIn key={t.n} delay={i * 0.08}>
                <article className={`group relative ${t.span} overflow-hidden rounded-sm bg-cream`}>
                  <div className={`relative ${t.aspect} overflow-hidden`}>
                    <Image
                      src={t.img}
                      alt={t.title}
                      fill
                      sizes="(max-width:1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/30 to-transparent" />
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                      <span className="font-luxury text-gold text-xs tracking-[0.3em]">{t.n}</span>
                      <div className="w-8 h-px bg-gold/60" />
                      <span className="text-[10px] uppercase tracking-[0.3em] text-cream/80 font-medium">
                        {t.label}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9">
                      <h3 className="font-luxury text-xl lg:text-2xl font-medium text-cream m-0 mb-2">
                        {t.title}
                      </h3>
                      <p className="text-cream/75 text-sm leading-relaxed m-0 max-w-md">
                        {t.body}
                      </p>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Supplier Requirements — 4 quadrant on obsidian ═══ */}
      <section className="py-(--spacing-section-lg) bg-obsidian">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-14 lg:mb-16">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
                  Supplier Requirements
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight m-0">
                  Four standards.
                  <br />
                  Zero exceptions.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <p className="text-cream/65 text-base lg:text-lg leading-relaxed m-0">
                  We recognise varying levels of maturity across suppliers — but adherence to core
                  baselines is non-negotiable. These four pillars define the floor for entry.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream/10 rounded-sm overflow-hidden">
            {requirements.map((r, i) => (
              <FadeIn key={r.n} delay={i * 0.08}>
                <div className="bg-obsidian p-8 lg:p-10 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-luxury text-gold/80 text-xs tracking-[0.3em]">
                      {r.n}
                    </span>
                    <div className="w-8 h-px bg-gold/40" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-cream/60 font-medium">
                      {r.kicker}
                    </span>
                  </div>
                  <h3 className="font-luxury text-2xl lg:text-[28px] font-light text-cream leading-tight m-0 mb-6">
                    {r.headline}
                  </h3>
                  <ul className="list-none m-0 p-0 space-y-3">
                    {r.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3">
                        <span className="text-gold mt-[2px] shrink-0" aria-hidden>
                          —
                        </span>
                        <span className="text-cream/75 text-sm leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Onboarding Journey — 4 stepped progression with connecting line ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Onboarding Journey
              </p>
              <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0 mb-6">
                A phased path from inquiry to integration.
              </h2>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                Every supplier follows the same structured progression — designed to confirm
                alignment, reduce operational risk, and build a foundation that lasts.
              </p>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gold/30" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
              {onboardingSteps.map((s, i) => (
                <FadeIn key={s.n} delay={i * 0.1}>
                  <div className="relative">
                    <div className="hidden lg:flex w-4 h-4 rounded-full bg-gold absolute top-8 left-0 -translate-y-1/2 ring-8 ring-cream" />
                    <div className="lg:pl-10">
                      <span className="font-luxury text-gold text-sm tracking-[0.3em] block mb-3">
                        {s.n}
                      </span>
                      <h3 className="font-luxury text-xl lg:text-2xl font-medium text-obsidian m-0 mb-3">
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

      {/* ═══ Partnership Tiers — three-stage maturity model ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14 lg:mb-16">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Partnership Tiers
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Relationships evolve.
                  <br />
                  So does engagement.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  We treat every supplier engagement as a long-term partnership rather than a
                  transaction. Volume grows with reliability — and engagement deepens with proven
                  alignment.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t, i) => (
              <FadeIn key={t.label} delay={i * 0.1}>
                <div
                  className={`rounded-sm p-8 lg:p-10 h-full flex flex-col ${
                    i === 2 ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase tracking-[0.3em] font-medium mb-4 ${
                      i === 2 ? 'text-gold' : 'text-gold'
                    }`}
                  >
                    {t.label}
                  </span>
                  <h3
                    className={`font-luxury text-2xl lg:text-3xl font-light m-0 mb-4 ${
                      i === 2 ? 'text-cream' : 'text-obsidian'
                    }`}
                  >
                    {t.name}
                  </h3>
                  <p
                    className={`text-sm lg:text-base leading-relaxed m-0 mb-6 ${
                      i === 2 ? 'text-cream/70' : 'text-stone'
                    }`}
                  >
                    {t.summary}
                  </p>
                  <ul
                    className={`list-none m-0 p-0 space-y-3 mt-auto pt-6 border-t ${
                      i === 2 ? 'border-cream/15' : 'border-mist/40'
                    }`}
                  >
                    {t.markers.map((m) => (
                      <li key={m} className="flex items-start gap-3">
                        <span className={`mt-[2px] shrink-0 ${i === 2 ? 'text-gold' : 'text-gold'}`}>
                          —
                        </span>
                        <span
                          className={`text-xs lg:text-sm leading-relaxed ${
                            i === 2 ? 'text-cream/80' : 'text-stone'
                          }`}
                        >
                          {m}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Partnership Philosophy — image + pull-quote split ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <FadeIn delay={0.05}>
              <div className="lg:col-span-5 relative aspect-[4/5] rounded-sm overflow-hidden">
                <Image
                  src="/images/vendor/vendor-philosophy.avif"
                  alt="Supplier collaboration"
                  fill
                  sizes="(max-width:1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/30 to-transparent" />
              </div>
            </FadeIn>

            <div className="lg:col-span-6 lg:col-start-7">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5">
                  Partnership Philosophy
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="font-luxury text-2xl lg:text-[34px] font-light text-obsidian leading-[1.25] tracking-tight m-0 mb-8">
                  &ldquo;Reliable supply isn&apos;t purchased. It&apos;s built — through clear
                  expectations, predictable demand, and the discipline to honour both.&rdquo;
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="w-12 h-px bg-gold mb-6" />
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    {
                      t: 'Performance-tied growth',
                      d: 'Volumes grow with demonstrated reliability.',
                    },
                    {
                      t: 'Predictable demand',
                      d: 'Clear forecasts where commercial conditions allow.',
                    },
                    {
                      t: 'Continuous alignment',
                      d: 'Ongoing communication on quality and improvements.',
                    },
                    {
                      t: 'Stable engagement',
                      d: 'Long-term commitment over short-term price plays.',
                    },
                  ].map((x) => (
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

      {/* ═══ Supplier Development — forest-green split ═══ */}
      <section className="bg-forest text-cream">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <FadeIn>
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[600px]">
              <Image
                src="/images/vendor/vendor-development.avif"
                alt="Supplier development"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-forest/20 via-transparent to-forest/40" />
            </div>
          </FadeIn>

          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-16 lg:py-24 flex flex-col justify-center">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5">
                Supplier Development
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight m-0 mb-6">
                We grow capability — not just volume.
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/75 text-base lg:text-lg leading-relaxed m-0 mb-10">
                As we expand, we are building structured frameworks to support suppliers in
                strengthening their operations — within our current scale today, and at network
                scale tomorrow.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <ul className="list-none m-0 p-0 space-y-5">
                {[
                  {
                    t: 'Standards alignment',
                    d: 'Guided progression toward food safety and quality benchmarks.',
                  },
                  {
                    t: 'Process improvement',
                    d: 'Working alongside producers on consistency and efficiency.',
                  },
                  {
                    t: 'Sustainability adoption',
                    d: 'Gradual integration of sustainable practices across the network.',
                  },
                ].map((x, i) => (
                  <li key={x.t} className="flex items-start gap-5 border-t border-cream/15 pt-5">
                    <span className="font-luxury text-gold text-sm tracking-[0.3em] shrink-0 pt-1">
                      0{i + 1}
                    </span>
                    <div>
                      <p className="font-luxury text-lg text-cream m-0 mb-1">{x.t}</p>
                      <p className="text-cream/70 text-sm leading-relaxed m-0">{x.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ Governance & Zero Tolerance — manifesto on obsidian ═══ */}
      <section className="py-(--spacing-section-lg) bg-obsidian relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/images/vendor/vendor-governance-bg.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/85 to-obsidian" />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-5">
              Governance &amp; Integrity
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[52px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-10 lg:mb-14">
              The line we hold — across every partnership.
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-cream/65 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto m-0 mb-14 lg:mb-16">
              A formal Supplier Code of Conduct, documented record-keeping requirements, and
              internal performance review govern every relationship in the network.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70 font-medium mb-6">
              Zero Tolerance
            </p>
          </FadeIn>
          <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
            {zeroTolerance.map((z, i) => (
              <FadeIn key={z} delay={0.25 + i * 0.06}>
                <span className="inline-block border border-gold/40 text-cream/85 text-xs lg:text-sm tracking-wide px-5 lg:px-6 py-3 rounded-full">
                  {z}
                </span>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Performance Indicators — KPI grid ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-14">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Performance &amp; Evaluation
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Measured continuously.
                  <br />
                  Reviewed openly.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  Performance against four core dimensions informs every future engagement —
                  expansion of supply volumes, category breadth, and tier progression.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {performanceMetrics.map((m, i) => (
              <FadeIn key={m.metric} delay={i * 0.08}>
                <div className="bg-parchment rounded-sm p-8 lg:p-9 h-full flex flex-col border border-mist/30">
                  <span className="font-luxury text-gold text-3xl lg:text-4xl font-light leading-none mb-6">
                    0{i + 1}
                  </span>
                  <div className="w-8 h-px bg-gold/60 mb-5" />
                  <h3 className="font-luxury text-xl lg:text-2xl font-medium text-obsidian m-0 mb-3">
                    {m.metric}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{m.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Strategic Partnerships — ecosystem mini grid ═══ */}
      <section className="py-(--spacing-section) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-12">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Strategic Partnerships
                </p>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.15] tracking-tight m-0">
                  Beyond suppliers — the wider ecosystem.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  We collaborate with organisations that strengthen the operating environment
                  itself. Selection is based on operational alignment, scalability, and long-term
                  value creation.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {ecosystemPartners.map((p, i) => (
              <FadeIn key={p.label} delay={i * 0.1}>
                <div className="bg-cream rounded-sm p-8 lg:p-10 h-full flex flex-col border border-mist/30">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-5">
                    {p.label}
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

      {/* ═══ Become a Vendor — checklist + CTA ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="bg-obsidian rounded-sm p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-32 -bottom-32 w-80 h-80 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <FadeIn>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                    Become a Vendor
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                    Partnerships built deliberately — supplier by supplier.
                  </h2>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <p className="text-cream/70 text-base leading-relaxed m-0 mb-8">
                    We welcome inquiries from suppliers who meet our standards and share a
                    long-term view. To express interest, please share:
                  </p>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <ul className="list-none m-0 p-0 space-y-3 mb-10">
                    {inquiryChecklist.map((c) => (
                      <li key={c} className="flex items-start gap-3">
                        <span
                          className="w-5 h-5 rounded-full border border-gold/60 shrink-0 flex items-center justify-center mt-[2px]"
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
                      Submit Vendor Inquiry
                    </Link>
                  </MagneticButton>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <Link
                    href="/contact"
                    className="block text-center mt-4 text-cream/60 text-xs uppercase tracking-widest hover:text-gold transition-colors no-underline"
                  >
                    or speak with our sourcing team →
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
