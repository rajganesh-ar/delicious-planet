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

const pillars = [
  {
    n: '01',
    title: 'Quality & Safety',
    line: 'Without compromise.',
    body: 'Every product entering our network meets internationally recognised food safety benchmarks — from HACCP-aligned processes to lot-level traceability.',
    img: '/images/sourcing/pillar-quality.avif',
  },
  {
    n: '02',
    title: 'Responsible Procurement',
    line: 'Ethical at origin.',
    body: 'We engage suppliers operating within fair labour practices, lawful employment standards, and environmentally conscious production methods.',
    img: '/images/sourcing/pillar-ethics.avif',
  },
  {
    n: '03',
    title: 'Resilient Supply',
    line: 'Diversified by design.',
    body: 'Geographic spread and multi-supplier strategies reduce exposure to regional disruption — keeping availability stable across cycles.',
    img: '/images/sourcing/pillar-resilience.avif',
  },
]

const networkApproach = [
  {
    label: 'Direct',
    title: 'Producer Relationships',
    body: 'We work directly with producers, cooperatives, and processors — removing intermediaries to preserve quality signal and accountability.',
    img: '/images/sourcing/network-direct.avif',
  },
  {
    label: 'Strategic',
    title: 'Regional Partnerships',
    body: 'Strategic alliances in key agricultural and production regions ensure continuity of supply and category depth.',
    img: '/images/sourcing/network-strategic.avif',
  },
  {
    label: 'Phased',
    title: 'Measured Expansion',
    body: 'Suppliers are added gradually, based on demonstrated performance and compliance — never on volume alone.',
    img: '/images/sourcing/network-phased.avif',
  },
]

const standards = [
  {
    kicker: 'Food Safety & Quality',
    points: [
      'HACCP-based production processes',
      'Compliance with applicable regulatory frameworks',
      'Product traceability at batch or lot level',
      'Defined timelines for suppliers working toward formal certification',
    ],
  },
  {
    kicker: 'Regulatory Compliance',
    points: [
      'Adherence to local and international food regulations',
      'Documented production, processing, and export records',
      'Transparency as a precondition of engagement',
    ],
  },
  {
    kicker: 'Ethical Practices',
    points: [
      'No forced or child labour',
      'Safe and compliant working conditions',
      'Fair and lawful employment practices',
    ],
  },
]

const traceabilitySteps = [
  { n: '01', title: 'Origin Recorded', body: 'Producer, region, and batch documented at source.' },
  { n: '02', title: 'Documentation Captured', body: 'Specifications, certifications, and lot records filed.' },
  { n: '03', title: 'Logistics Controlled', body: 'Movement tracked through approved partners only.' },
  { n: '04', title: 'Visibility Delivered', body: 'End-to-end records available to commercial partners.' },
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
    title: 'Capability Build',
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

/* ────────────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────────────── */

export function SourcingPageClient() {
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
      {/* ═══ Hero — Editorial split, parallax background ═══ */}
      <section
        ref={refCallback}
        className="relative min-h-[88vh] flex items-end overflow-hidden bg-obsidian"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/sourcing/hero-sourcing.avif"
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
                Sourcing
              </motion.p>
              <motion.h1
                className="font-luxury text-4xl sm:text-5xl lg:text-[64px] xl:text-[76px] font-light text-cream leading-[1.02] tracking-[-0.03em] m-0"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Sourced with intent.
                <br />
                <span className="text-gold">Built on trust.</span>
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
                A sourcing ecosystem designed for reliability, transparency, and long-term
                sustainability — built deliberately, partner by partner.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Approach Statement ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Our Approach
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Principles before scale.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <FadeIn delay={0.1}>
                <p className="text-stone text-lg lg:text-xl leading-relaxed m-0 mb-6">
                  As a growing organisation, our advantage isn&apos;t scale — it&apos;s judgement.
                  Every supplier we add is selected deliberately, evaluated against fixed
                  standards, and onboarded into a system designed to grow without compromising
                  what it stands for.
                </p>
                <p className="text-stone/80 text-base lg:text-lg leading-relaxed m-0">
                  We are deliberate in selecting partners who align with our principles and
                  committed to scaling responsibly alongside us.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Three Pillars — large numbered editorial ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14 lg:mb-20">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Three Priorities
                </p>
                <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0 max-w-2xl">
                  The non-negotiables that shape every sourcing decision.
                </h2>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((p, i) => (
              <FadeIn key={p.n} delay={i * 0.1}>
                <article className="group h-full flex flex-col bg-cream rounded-sm overflow-hidden">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent" />
                    <span className="absolute top-6 left-6 font-luxury text-cream/90 text-sm tracking-[0.3em]">
                      {p.n}
                    </span>
                  </div>
                  <div className="p-7 lg:p-8 flex-1 flex flex-col">
                    <h3 className="font-luxury text-2xl font-medium text-obsidian m-0 mb-1">
                      {p.title}
                    </h3>
                    <p className="font-luxury italic text-gold text-sm m-0 mb-5">{p.line}</p>
                    <p className="text-stone text-sm leading-relaxed m-0">{p.body}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Global Supply Network — 3-column with imagery ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14 lg:mb-16">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Building the Network
                </p>
                <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  A geographically diverse supplier base — built phase by phase.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex items-end">
              <FadeIn delay={0.1}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  A phased approach lets us maintain control over quality while scaling
                  efficiently. Diversity protects continuity; discipline protects integrity.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mist/40 rounded-sm overflow-hidden">
            {networkApproach.map((a, i) => (
              <FadeIn key={a.label} delay={i * 0.1}>
                <div className="bg-cream h-full flex flex-col">
                  <div className="relative aspect-[5/3] overflow-hidden">
                    <Image
                      src={a.img}
                      alt={a.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-7 lg:p-9 flex-1 flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                      {a.label}
                    </span>
                    <h3 className="font-luxury text-xl lg:text-2xl font-medium text-obsidian m-0 mb-3">
                      {a.title}
                    </h3>
                    <p className="text-stone text-sm leading-relaxed m-0">{a.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Supplier Standards — Standards | Image | Three blocks ═══ */}
      <section className="py-(--spacing-section-lg) bg-obsidian relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
                  Supplier Standards
                </p>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight m-0 mb-6">
                  Our network expands. Our standards do not.
                </h2>
                <p className="text-cream/60 text-base leading-relaxed m-0 mb-8">
                  Every supplier moves through a structured onboarding and evaluation process
                  before any product enters our portfolio.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
                  <Image
                    src="/images/sourcing/sourcing-lab.avif"
                    alt="Quality verification"
                    fill
                    sizes="(max-width:1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-7 lg:col-start-6 space-y-px bg-white/10 rounded-sm overflow-hidden">
              {standards.map((s, i) => (
                <FadeIn key={s.kicker} delay={i * 0.1}>
                  <div className="bg-obsidian p-7 lg:p-9">
                    <div className="flex items-center gap-4 mb-5">
                      <span className="font-luxury text-gold/80 text-xs tracking-[0.3em]">
                        0{i + 1}
                      </span>
                      <div className="w-8 h-px bg-gold/40" />
                      <h3 className="font-luxury text-lg lg:text-xl font-medium text-cream m-0">
                        {s.kicker}
                      </h3>
                    </div>
                    <ul className="list-none m-0 p-0 space-y-3">
                      {s.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-3">
                          <span className="text-gold mt-[2px] shrink-0" aria-hidden>
                            —
                          </span>
                          <span className="text-cream/70 text-sm leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Responsible Sourcing Commitments — split editorial ═══ */}
      <section className="bg-forest text-cream">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <FadeIn>
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[640px]">
              <Image
                src="/images/sourcing/sustainability-environmental.avif"
                alt="Environmental responsibility"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-forest/30 via-transparent to-forest/30" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-14">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Environmental Responsibility
                </p>
                <h3 className="font-luxury text-2xl lg:text-[32px] font-light text-cream leading-[1.15] tracking-tight m-0 mb-6">
                  Better practices, lower impact.
                </h3>
                <ul className="list-none m-0 p-0 space-y-3 max-w-md">
                  {[
                    'Preference for sustainable agricultural and production practices',
                    'Reduced waste and improved resource efficiency',
                    'Environmental impact integrated into supplier selection',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                      <span className="text-cream/80 text-sm leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[640px]">
              <Image
                src="/images/sourcing/sustainability-social.avif"
                alt="Social impact"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-forest/30 via-transparent to-forest/30" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-14">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Social Impact
                </p>
                <h3 className="font-luxury text-2xl lg:text-[32px] font-light text-cream leading-[1.15] tracking-tight m-0 mb-6">
                  Inclusive by intent.
                </h3>
                <ul className="list-none m-0 p-0 space-y-3 max-w-md">
                  {[
                    'Engagement with small and mid-sized producers where feasible',
                    'Encouragement of inclusive and equitable business practices',
                    'Working toward recognised sustainability certifications as we expand',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                      <span className="text-cream/80 text-sm leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Traceability — horizontal stepped journey ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Traceability & Transparency
              </p>
              <h2 className="font-luxury text-3xl lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                From origin to shipment — visibility at every step.
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            {/* connecting line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gold/30" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
              {traceabilitySteps.map((s, i) => (
                <FadeIn key={s.n} delay={i * 0.1}>
                  <div className="relative">
                    <div className="hidden lg:flex w-4 h-4 rounded-full bg-gold absolute top-8 left-0 -translate-y-1/2 ring-8 ring-cream" />
                    <div className="lg:pl-10">
                      <span className="font-luxury text-gold text-sm tracking-[0.3em] block mb-3">
                        {s.n}
                      </span>
                      <h3 className="font-luxury text-xl font-medium text-obsidian m-0 mb-3">
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

      {/* ═══ Risk Management & Continuity ═══ */}
      <section className="py-(--spacing-section) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Risk & Continuity
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0 mb-6">
                  Resilience is engineered, not assumed.
                </h2>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  Global food supply chains carry inherent volatility. We embed risk management
                  into our sourcing model from day one — not as a reaction to disruption, but as
                  the structure that prevents it.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 space-y-4">
              {riskPrinciples.map((r, i) => (
                <FadeIn key={r.title} delay={i * 0.1}>
                  <div className="flex items-start gap-6 bg-cream rounded-sm p-7 lg:p-8 border border-mist/30">
                    <span className="font-luxury text-gold text-2xl lg:text-3xl font-light shrink-0">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-luxury text-lg font-medium text-obsidian m-0 mb-2">
                        {r.title}
                      </h3>
                      <p className="text-stone text-sm leading-relaxed m-0">{r.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Partnerships — editorial pull-quote ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <FadeIn delay={0.05}>
              <div className="lg:col-span-5 relative aspect-[4/5] rounded-sm overflow-hidden">
                <Image
                  src="/images/sourcing/partnership.avif"
                  alt="Supplier partnership"
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
                  Supplier Partnerships
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="font-luxury text-2xl lg:text-[34px] font-light text-obsidian leading-[1.25] tracking-tight m-0 mb-8">
                  &ldquo;Sourcing is collaborative — not transactional. We grow with the suppliers
                  who grow with us.&rdquo;
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="w-12 h-px bg-gold mb-6" />
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { t: 'Clear expectations', d: 'Performance criteria defined up front.' },
                    { t: 'Open feedback loops', d: 'Continuous, two-way communication.' },
                    { t: 'Gradual scaling', d: 'Engagement grows with reliability.' },
                    { t: 'Process support', d: 'Helping suppliers meet required standards.' },
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

      {/* ═══ Governance & Integrity — manifesto ═══ */}
      <section className="py-(--spacing-section-lg) bg-obsidian">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-5">
              Governance & Integrity
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[52px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-12 lg:mb-16">
              Trust is the only currency that compounds across a supply chain.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 max-w-2xl mx-auto text-left">
            {governancePrinciples.map((p, i) => (
              <FadeIn key={p} delay={0.15 + i * 0.06}>
                <div className="flex items-start gap-4 border-t border-cream/15 pt-5">
                  <span className="font-luxury text-gold/70 text-xs tracking-[0.3em] shrink-0 mt-1">
                    0{i + 1}
                  </span>
                  <p className="text-cream/80 text-base leading-relaxed m-0">{p}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Looking Ahead — Now/Next/Later ═══ */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Looking Ahead
                </p>
                <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.1] tracking-tight m-0">
                  Where the sourcing strategy goes next.
                </h2>
              </div>
              <p className="text-stone text-sm max-w-sm">
                A future-ready sourcing network — efficient, scalable, and responsible.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmap.map((r, i) => (
              <FadeIn key={r.horizon} delay={i * 0.1}>
                <div
                  className={`rounded-sm p-8 lg:p-10 h-full flex flex-col ${
                    i === 0
                      ? 'bg-obsidian text-cream'
                      : i === 1
                        ? 'bg-cream text-obsidian'
                        : 'bg-cream/60 text-obsidian'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase tracking-[0.3em] font-medium mb-6 ${
                      i === 0 ? 'text-gold' : 'text-gold'
                    }`}
                  >
                    {r.horizon}
                  </span>
                  <h3
                    className={`font-luxury text-2xl lg:text-3xl font-light m-0 mb-4 ${
                      i === 0 ? 'text-cream' : 'text-obsidian'
                    }`}
                  >
                    {r.title}
                  </h3>
                  <p
                    className={`text-sm lg:text-base leading-relaxed m-0 ${
                      i === 0 ? 'text-cream/70' : 'text-stone'
                    }`}
                  >
                    {r.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Become a Supplier — checklist + CTA ═══ */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="bg-obsidian rounded-sm p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <FadeIn>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                    Become a Supplier
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.1] tracking-tight m-0 mb-6">
                    Building a sourcing network — partner by partner.
                  </h2>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <p className="text-cream/70 text-base leading-relaxed m-0 mb-8">
                    We are actively engaging with producers and partners who meet our standards
                    and share our long-term vision. To express interest, please share:
                  </p>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <ul className="list-none m-0 p-0 space-y-3 mb-10">
                    {supplierChecklist.map((c) => (
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
                      href="/vendors"
                      className="inline-block w-full text-center bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-5 rounded-sm no-underline hover:bg-gold-light transition-colors"
                    >
                      Submit Supplier Inquiry
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
