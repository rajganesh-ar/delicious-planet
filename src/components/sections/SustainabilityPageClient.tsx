'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

const priorities = [
  {
    number: '01',
    eyebrow: 'Environmental',
    title: 'Reducing impact across the value chain.',
    body: 'Logistics efficiency, resource-conscious production partners, and lower-impact packaging — embedded into sourcing decisions from day one.',
    image: '/images/sustainability/sustainability-environmental.avif',
  },
  {
    number: '02',
    eyebrow: 'Social',
    title: 'Supporting responsible, inclusive supply ecosystems.',
    body: 'Fair labor practices, safe working conditions, and a sourcing model designed to remain accessible to small and medium producers as we scale.',
    image: '/images/sustainability/sustainability-social.avif',
  },
  {
    number: '03',
    eyebrow: 'Governance',
    title: 'Maintaining transparent, accountable governance.',
    body: 'A formal supplier code of conduct, structured onboarding reviews, and audit-ready documentation across our compliance perimeter.',
    image: '/images/sustainability/sustainability-governance.avif',
  },
]

const environmentalFocus = [
  {
    label: 'Climate & Emissions',
    image: '/images/sustainability/sustainability-climate.avif',
    headline: 'Building a carbon baseline before setting the targets.',
    body: 'We are establishing baseline measurements across sourcing, transportation, and storage. As operations scale, we will formalise emissions tracking and reduction targets.',
    points: [
      'Optimised logistics routing to reduce fuel consumption',
      'Preference for suppliers with efficient production practices',
      'Evaluation of lower-impact packaging and transport options',
    ],
  },
  {
    label: 'Resource Efficiency',
    image: '/images/sustainability/sustainability-resource.avif',
    headline: 'Water, energy, and waste — embedded in supplier selection.',
    body: 'Resource discipline is a sourcing criterion. We weigh water management, energy efficiency, and waste reduction across every partner we onboard.',
    points: [
      'Preference for suppliers practicing responsible water management',
      'Energy-efficient operations across storage and processing',
      'Minimising product loss through improved handling',
    ],
  },
  {
    label: 'Sustainable Sourcing',
    image: '/images/sustainability/sustainability-factory.avif',
    headline: 'Origin choices that support long-term supply integrity.',
    body: 'Sustainability is a sourcing factor from the outset. As our network matures, we plan to expand the share of certified sustainable sourcing within our portfolio.',
    points: [
      'Suppliers using environmentally responsible production methods',
      'Products aligned with recognised sustainability standards',
      'Reduced reliance on high-impact regions where alternatives exist',
    ],
  },
]

const governancePrinciples = [
  {
    label: 'Supplier Code of Conduct',
    detail:
      'A documented framework covering environmental, social, and ethical standards — applied during onboarding and renewed at evaluation cycles.',
  },
  {
    label: 'Internal Review Processes',
    detail:
      'Structured supplier review covering production capability, compliance posture, and ongoing performance monitoring.',
  },
  {
    label: 'Documentation & Audit Trails',
    detail:
      'Compliance evidence is captured, retained, and made available for review — supporting credible reporting and customer due diligence.',
  },
  {
    label: 'Zero-Tolerance Standard',
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
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  return (
    <>
      {/* ─── Hero ─── */}
      <section
        ref={refCallback}
        className="relative h-[90vh] min-h-[620px] flex items-end overflow-hidden"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/sustainability/sustainability-cover.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-obsidian/30 to-obsidian/85" />
        </motion.div>
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pb-16 lg:pb-24">
          <div className="max-w-3xl">
            <motion.p
              className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Sustainability
            </motion.p>
            <motion.h1
              className="font-luxury text-4xl sm:text-5xl lg:text-[64px] font-light text-cream leading-[1.05] tracking-[-0.03em] m-0 mb-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Built sustainable.
              <br />
              <span className="italic text-gold/90">Not certified after the fact.</span>
            </motion.h1>
            <motion.p
              className="text-cream/70 text-base lg:text-lg leading-relaxed max-w-xl m-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              We are integrating environmental, social, and governance considerations
              into the structure of our business — measurably, credibly, and from the
              ground up.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── Honest Manifesto ─── */}
      <section className="py-20 sm:py-24 lg:py-32 bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Our Approach
                </p>
                <div className="w-12 h-px bg-gold mb-6" />
                <p className="text-stone text-sm leading-relaxed m-0">
                  Sustainability as a foundational principle — not a retrospective
                  obligation.
                </p>
              </FadeIn>
            </div>
            <div className="lg:col-span-8">
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] lg:text-[48px] xl:text-[54px] font-light text-obsidian leading-[1.1] tracking-[-0.03em] m-0 mb-10">
                  We are at the beginning. So we get to do this{' '}
                  <span className="italic text-gold">right.</span>
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-5 max-w-2xl">
                  As a global food distribution company in its early stages, we are
                  designing our sourcing and distribution networks with environmental,
                  social, and governance considerations embedded into core
                  decision-making — rather than added on later.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 max-w-2xl">
                  Meaningful progress requires time, measurable action, and continuous
                  improvement. Our focus is on building the right systems from the
                  outset — and being honest about where we are along the way.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Three Priorities — Editorial cards ─── */}
      <section className="py-20 sm:py-24 lg:py-32 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 lg:mb-20">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Three Priorities
                </p>
                <h2 className="font-luxury text-[28px] sm:text-[34px] lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 max-w-2xl">
                  The framework we are building from.
                </h2>
              </div>
              <p className="text-stone text-sm lg:text-base leading-relaxed max-w-sm m-0">
                Each priority is supported by concrete operational practices —
                structured to mature with us as the business scales.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {priorities.map((p, i) => (
              <FadeIn key={p.number} delay={i * 0.1}>
                <div className="group bg-cream rounded-sm overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.eyebrow}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-5 left-5">
                      <span className="font-luxury text-3xl text-cream drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                        {p.number}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 lg:p-8 flex-1 flex flex-col">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium mb-3">
                      {p.eyebrow}
                    </p>
                    <h3 className="font-luxury text-xl lg:text-2xl font-medium text-obsidian leading-[1.2] tracking-[-0.02em] m-0 mb-4">
                      {p.title}
                    </h3>
                    <p className="text-stone text-sm leading-relaxed m-0">{p.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Environmental Deep-Dive — alternating splits ─── */}
      <section className="py-20 sm:py-24 lg:py-32 bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16 lg:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                Environmental Responsibility
              </p>
              <h2 className="font-luxury text-[28px] sm:text-[34px] lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 max-w-3xl mx-auto">
                Minimising impact while supporting long-term resource resilience.
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-20 lg:space-y-28">
            {environmentalFocus.map((item, i) => (
              <div
                key={item.label}
                className={`flex flex-col gap-10 lg:gap-16 items-center ${
                  i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <FadeIn className="lg:w-[50%] w-full">
                  <div className="relative aspect-[5/4] rounded-sm overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      sizes="(max-width:1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </FadeIn>
                <div className="flex-1">
                  <FadeIn delay={0.1}>
                    <div className="flex items-center gap-4 mb-5">
                      <span className="font-luxury text-gold text-2xl">
                        0{i + 1}
                      </span>
                      <span className="w-12 h-px bg-gold" />
                      <p className="text-[11px] uppercase tracking-[0.3em] text-stone font-medium">
                        {item.label}
                      </p>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.15}>
                    <h3 className="font-luxury text-2xl sm:text-3xl lg:text-[34px] font-light text-obsidian leading-[1.2] tracking-[-0.02em] m-0 mb-5">
                      {item.headline}
                    </h3>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <p className="text-stone text-base leading-relaxed m-0 mb-7">
                      {item.body}
                    </p>
                  </FadeIn>
                  <FadeIn delay={0.25}>
                    <ul className="space-y-3 list-none m-0 p-0 border-t border-mist/40 pt-6">
                      {item.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-stone text-sm leading-relaxed"
                        >
                          <span className="text-gold mt-1 shrink-0">—</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </FadeIn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mid Banner — editorial quote ─── */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/sustainability/sustainability-misc.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-forest/75" />
        </div>
        <div className="relative z-10 max-w-[1100px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="font-luxury text-gold/90 text-xs uppercase tracking-[0.4em] mb-8">
              On Long-Term Thinking
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="font-luxury italic text-cream text-2xl sm:text-3xl lg:text-[42px] font-light leading-[1.25] tracking-[-0.01em] m-0">
              “Food supply chains are deeply interconnected with livelihoods,
              landscapes, and communities. We are building ours to honour that.”
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Social Responsibility — diptych ─── */}
      <section className="py-20 sm:py-24 lg:py-32 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16 lg:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                Social Responsibility
              </p>
              <h2 className="font-luxury text-[28px] sm:text-[34px] lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 max-w-3xl mx-auto">
                Supply chains carry livelihoods. We treat them accordingly.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <FadeIn>
              <div className="bg-cream rounded-sm overflow-hidden h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/sustainability/sustainability-fair.avif"
                    alt="Fair and ethical practices"
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-8 lg:p-10 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium mb-3">
                    Fair & Ethical Practices
                  </p>
                  <h3 className="font-luxury text-2xl lg:text-[28px] font-light text-obsidian leading-[1.2] tracking-[-0.02em] m-0 mb-5">
                    Non-negotiable expectations of every partner.
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0 mb-6">
                    We expect all partners to adhere to basic human and labor rights.
                    These expectations are formalised within our supplier engagement
                    framework.
                  </p>
                  <ul className="space-y-3 list-none m-0 p-0 border-t border-mist/40 pt-5">
                    <li className="flex items-start gap-3 text-stone text-sm">
                      <span className="text-gold mt-1 shrink-0">—</span>
                      <span>Safe working environments</span>
                    </li>
                    <li className="flex items-start gap-3 text-stone text-sm">
                      <span className="text-gold mt-1 shrink-0">—</span>
                      <span>Fair compensation practices</span>
                    </li>
                    <li className="flex items-start gap-3 text-stone text-sm">
                      <span className="text-gold mt-1 shrink-0">—</span>
                      <span>Compliance with applicable labor regulations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-cream rounded-sm overflow-hidden h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/sustainability/sustainability-inclusive.avif"
                    alt="Inclusive supply chains"
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-8 lg:p-10 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium mb-3">
                    Inclusive Supply Chains
                  </p>
                  <h3 className="font-luxury text-2xl lg:text-[28px] font-light text-obsidian leading-[1.2] tracking-[-0.02em] m-0 mb-5">
                    Designing for participation as we grow.
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0 mb-6">
                    Our current scale limits direct intervention, but our sourcing
                    model is structured to enable inclusive participation as we
                    expand.
                  </p>
                  <ul className="space-y-3 list-none m-0 p-0 border-t border-mist/40 pt-5">
                    <li className="flex items-start gap-3 text-stone text-sm">
                      <span className="text-gold mt-1 shrink-0">—</span>
                      <span>Engaging small and medium-scale producers where feasible</span>
                    </li>
                    <li className="flex items-start gap-3 text-stone text-sm">
                      <span className="text-gold mt-1 shrink-0">—</span>
                      <span>Encouraging equitable participation across our base</span>
                    </li>
                    <li className="flex items-start gap-3 text-stone text-sm">
                      <span className="text-gold mt-1 shrink-0">—</span>
                      <span>Supporting capacity-building initiatives over time</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Governance — Dark code of conduct ─── */}
      <section className="relative py-20 sm:py-24 lg:py-32 bg-obsidian overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/images/sustainability/sustainabilty-logisitcs.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/90 to-obsidian" />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/90 font-medium mb-5">
                  Governance & Accountability
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] lg:text-[44px] font-light text-cream leading-[1.15] tracking-[-0.03em] m-0 mb-8">
                  Commitments only count when they are{' '}
                  <span className="italic text-gold/90">enforceable.</span>
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-cream/65 text-base leading-relaxed m-0 mb-10 max-w-md">
                  Strong governance is critical to ensuring that sustainability
                  commitments translate into practice. The frameworks below structure
                  how we onboard, monitor, and hold partners accountable.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="border-l-2 border-gold pl-5 py-2">
                  <p className="font-luxury italic text-cream/85 text-base lg:text-lg leading-relaxed m-0">
                    Zero tolerance for corruption, misrepresentation, and unethical
                    practices.
                  </p>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-7">
              <div className="space-y-px bg-white/10">
                {governancePrinciples.map((g, i) => (
                  <FadeIn key={g.label} delay={0.1 + i * 0.05}>
                    <div className="bg-obsidian/80 backdrop-blur-sm p-7 lg:p-8 flex gap-6 hover:bg-obsidian/60 transition-colors">
                      <span className="font-luxury text-gold/80 text-xl shrink-0 w-8">
                        0{i + 1}
                      </span>
                      <div>
                        <h3 className="font-luxury text-lg lg:text-xl font-medium text-cream m-0 mb-2">
                          {g.label}
                        </h3>
                        <p className="text-cream/60 text-sm leading-relaxed m-0">
                          {g.detail}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Traceability — Horizontal flow ─── */}
      <section className="py-20 sm:py-24 lg:py-32 bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 lg:mb-20 items-end">
            <div className="lg:col-span-7">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5">
                  Traceability & Transparency
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] lg:text-[48px] font-light text-obsidian leading-[1.1] tracking-[-0.03em] m-0">
                  From batch identifier
                  <br />
                  to destination handover.
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={0.2}>
                <p className="text-stone text-base leading-relaxed m-0">
                  We are implementing foundational systems for product traceability,
                  supplier data verification, and documentation of sourcing and
                  compliance practices.
                </p>
              </FadeIn>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-mist/40 border border-mist/40">
            {traceabilitySteps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.08}>
                <div className="bg-cream p-6 lg:p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-luxury text-gold text-2xl">{s.step}</span>
                    <span className="w-8 h-px bg-gold" />
                  </div>
                  <h3 className="font-luxury text-lg lg:text-xl font-medium text-obsidian m-0 mb-3">
                    {s.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{s.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Roadmap — Three Phases ─── */}
      <section className="py-20 sm:py-24 lg:py-32 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16 lg:mb-20">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
                Continuous Improvement
              </p>
              <h2 className="font-luxury text-[28px] sm:text-[34px] lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 max-w-3xl mx-auto">
                A roadmap, honestly staged.
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            <div className="hidden md:block absolute top-[60px] left-0 right-0 h-px bg-gold/30" />
            {roadmap.map((r, i) => (
              <FadeIn key={r.phase} delay={i * 0.1}>
                <div className="relative bg-cream rounded-sm p-8 lg:p-10 h-full">
                  <div className="hidden md:flex absolute -top-3 left-10 items-center gap-2 bg-cream px-3">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium">
                      {r.phase}
                    </span>
                  </div>
                  <p className="md:hidden text-[11px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                    {r.phase}
                  </p>
                  <h3 className="font-luxury text-xl lg:text-2xl font-light text-obsidian leading-[1.2] tracking-[-0.02em] m-0 mb-6 mt-2">
                    {r.headline}
                  </h3>
                  <ul className="space-y-3 list-none m-0 p-0">
                    {r.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-stone text-sm leading-relaxed"
                      >
                        <span className="text-gold mt-1 shrink-0">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Looking Ahead — Reflective close ─── */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/sustainability/sustainability-roadmap.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-obsidian/75" />
        </div>
        <div className="relative z-10 max-w-[1100px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-8">
              Looking Ahead
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-2xl sm:text-3xl lg:text-[42px] font-light text-cream leading-[1.2] tracking-[-0.02em] m-0 mb-8">
              A supply chain that is efficient, transparent, and responsible —{' '}
              <span className="italic text-gold/90">from the ground up.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/70 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto m-0">
              We are committed to progressing in a way that is measurable, credible,
              and aligned with long-term industry and environmental needs. Our
              approach will refine as our operations grow and as expectations evolve.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 sm:py-24 lg:py-32 bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4">
              Work With Us
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-[28px] sm:text-[32px] lg:text-[44px] font-light text-obsidian tracking-tight m-0 mb-6 max-w-2xl mx-auto">
              Want to understand our standards in detail?
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-stone text-base leading-relaxed m-0 mb-10 max-w-lg mx-auto">
              Whether you are a buyer, importer, or prospective supplier, we welcome
              conversations about our sourcing criteria and sustainability framework.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link
                  href="/contact"
                  className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
                >
                  Contact Us
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/sourcing"
                  className="inline-block border border-obsidian text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-obsidian hover:text-cream transition-colors"
                >
                  Our Sourcing
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
