'use client'

import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import type { OfficeLocation, Media } from '@/payload-types'
import Link from 'next/link'

interface AboutPageClientProps {
  offices: OfficeLocation[]
}

/* ── Data (content unchanged) ── */

const principles = [
  {
    title: 'Consistency',
    description: 'Stable product characteristics across production cycles.',
  },
  {
    title: 'Continuity',
    description: 'Supply structures designed to maintain predictable availability.',
  },
  {
    title: 'Clarity',
    description: 'Transparent origin pathways and documentation readiness.',
  },
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
    badge: 'Private Label',
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

const timeline = [
  {
    year: '2020',
    title: 'Foundation',
    description: 'Foundation in honey production within Algerian agricultural environments.',
    image: '/images/about/about-milestone-2020.avif',
  },
  {
    year: '2021',
    title: 'Initial Partnerships',
    description:
      'Initial sourcing partnerships established for olive oil and dried fruit categories.',
    image: '/images/about/about-milestone-2021.avif',
  },
  {
    year: '2022',
    title: 'Network Expansion',
    description: 'Expansion of supplier network across North Africa and Southern Europe.',
    image: '/images/about/about-milestone-2022.avif',
  },
  {
    year: '2023',
    title: 'Procurement Framework',
    description:
      'Development of structured procurement framework supporting multi-category sourcing.',
    image: '/images/about/about-milestone-2023.avif',
  },
  {
    year: '2024',
    title: 'Private Label',
    description: 'Introduction of private label supply coordination.',
    image: '/images/about/about-milestone-2024.avif',
  },
  {
    year: '2025',
    title: 'Distribution Growth',
    description: 'Expansion of distribution capability across Middle East markets.',
    image: '/images/about/about-milestone-2025.avif',
  },
  {
    year: '2026',
    title: 'International Structure',
    description:
      'International operational structure established with headquarters in UAE and regional offices across multiple markets.',
    image: '/images/about/about-milestone-2026.avif',
  },
]

const traction = [
  { value: '25+', label: 'Sourcing partners', accent: true },
  { value: '5', label: 'Regional operational bases' },
  { value: '20+', label: 'Product categories in development' },
  { value: '4', label: 'Continents covered' },
  { value: '7+', label: 'Years of sourcing expertise' },
  { value: '100%', label: 'Traceable production' },
]

const presenceStats = [
  { stat: '5', label: 'Regional Offices', image: '/images/about/about-region-mena.avif' },
  { stat: '4', label: 'Continents', image: '/images/about/about-region-europe.avif' },
  { stat: 'Multi', label: 'Region Capability', image: '/images/about/about-region-africa.avif' },
]

const teamRoles = ['Founder & CEO', 'Head of Sourcing', 'Creative Director', 'Head of B2B']

export function AboutPageClient({ offices }: AboutPageClientProps) {
  return (
    <>
      {/* ═══ 1. HERO — Editorial cinematic with floating credential card ═══ */}
      <section className="relative bg-obsidian overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-95" />
        {/* Decorative grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gold" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gold" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pt-28 lg:pt-36 pb-20 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
            {/* Left — copy block */}
            <div className="lg:col-span-5 lg:pb-8">
              <FadeIn>
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-px bg-gold" />
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium m-0">
                    Our Story
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="font-luxury text-[32px] sm:text-[38px] md:text-[46px] lg:text-[52px] xl:text-[64px] font-medium text-cream leading-[1.04] tracking-[-0.035em] m-0 mb-8">
                  Structured Natural Supply,{' '}
                  <span className="italic text-gold/90">Designed for Global Continuity</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-cream/70 text-base lg:text-lg leading-relaxed m-0 mb-5">
                  Delicious Planet is a sourcing and distribution platform connecting disciplined
                  agricultural production environments with professional markets requiring
                  reliability, specification consistency, and scalable procurement capability.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-cream/70 text-base lg:text-lg leading-relaxed m-0">
                  Rooted in Algeria and headquartered in the United Arab Emirates, the company
                  coordinates sourcing relationships across multiple regions to support stable
                  access to natural products across Middle East and Africa markets.
                </p>
              </FadeIn>
            </div>

            {/* Right — feature image with overlapping accent panels */}
            <div className="lg:col-span-7 relative">
              <FadeIn delay={0.15}>
                <div className="relative aspect-[5/6] sm:aspect-[4/4.5] lg:aspect-[5/5.5] rounded-2xl overflow-hidden bg-charcoal">
                  <Image
                    src="/images/about/about-hero-feature.avif"
                    alt=""
                    fill
                    sizes="(max-width:1024px) 100vw, 60vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent" />
                </div>
              </FadeIn>

              {/* Floating credential card — bottom-left overlap */}
              <FadeIn delay={0.4}>
                <div className="hidden sm:block absolute -bottom-6 lg:-bottom-10 -left-3 lg:-left-8 bg-cream rounded-xl p-5 lg:p-6 max-w-[280px] shadow-2xl">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium m-0 mb-2">
                    Established
                  </p>
                  <p className="font-luxury text-3xl lg:text-4xl text-obsidian m-0 mb-2">2020</p>
                  <p className="text-stone text-xs leading-relaxed m-0">
                    Foundation in honey production, Algeria.
                  </p>
                </div>
              </FadeIn>

              {/* Floating square image — top-right overlap */}
              <FadeIn delay={0.5}>
                <div className="hidden lg:block absolute -top-6 -right-4 w-[180px] aspect-square rounded-xl overflow-hidden border-4 border-obsidian shadow-2xl">
                  <Image
                    src="/images/about/about-hero-detail.avif"
                    alt=""
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
        <div className="h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
      </section>

      {/* ═══ 2. ORIGIN — Editorial split with vertical chapter marker ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-32 bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left — Chapter marker + image stack */}
            <div className="lg:col-span-5 relative">
              <FadeIn>
                <div className="flex items-start gap-5 mb-10">
                  <span className="font-luxury text-6xl lg:text-7xl text-gold/40 leading-none">
                    01
                  </span>
                  <div className="pt-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium m-0 mb-1">
                      Chapter One
                    </p>
                    <p className="text-stone text-sm m-0">Origin</p>
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-mist mb-5">
                  <Image
                    src="/images/about/about-origin-honey.avif"
                    alt=""
                    fill
                    sizes="(max-width:1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="aspect-square rounded-xl overflow-hidden bg-mist">
                    <Image
                      src="/images/about/about-origin-grove.avif"
                      alt=""
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-mist">
                    <Image
                      src="/images/about/about-origin-harvest.avif"
                      alt=""
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right — Editorial copy */}
            <div className="lg:col-span-7 lg:pl-8 lg:pt-12">
              <FadeIn>
                <div className="w-12 h-px bg-gold mb-8" />
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] xl:text-[56px] font-medium text-obsidian leading-[1.08] tracking-[-0.03em] m-0 mb-10">
                  Built on Agricultural Continuity
                </h2>
              </FadeIn>

              <div className="space-y-6 lg:max-w-xl">
                <FadeIn delay={0.2}>
                  <div className="flex gap-5">
                    <span className="text-gold font-luxury text-sm leading-relaxed pt-1">—</span>
                    <p className="text-stone text-base lg:text-lg leading-[1.75] m-0">
                      Delicious Planet began with honey production developed within environments
                      where product integrity depends on ecological balance, seasonal rhythm, and
                      disciplined harvesting practices.
                    </p>
                  </div>
                </FadeIn>
                <FadeIn delay={0.25}>
                  <div className="flex gap-5">
                    <span className="text-gold font-luxury text-sm leading-relaxed pt-1">—</span>
                    <p className="text-stone text-base lg:text-lg leading-[1.75] m-0">
                      Over time, sourcing capabilities expanded to include olive oil, dried figs,
                      botanical extracts, and additional natural products selected for their
                      stability of characteristics across cultivation cycles.
                    </p>
                  </div>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <div className="flex gap-5">
                    <span className="text-gold font-luxury text-sm leading-relaxed pt-1">—</span>
                    <p className="text-stone text-base lg:text-lg leading-[1.75] m-0">
                      The platform has evolved into a structured sourcing environment designed to
                      support professional buyers requiring reliable ingredient performance across
                      repeated procurement cycles.
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. MANIFESTO BANNER — Full-width cinematic statement ═══ */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/about/about-manifesto.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-obsidian/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/50 to-transparent" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 w-full">
          <div className="max-w-3xl">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.4em] text-gold font-medium mb-6">
                — Manifesto
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="font-luxury italic text-[26px] sm:text-[34px] md:text-[42px] lg:text-[52px] text-cream leading-[1.15] tracking-[-0.02em] m-0">
                "Continuity isn't an outcome — it's a discipline. We design sourcing structures so
                that natural products arrive predictable, traceable, and unchanged in character."
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ 4. INTERNATIONAL STRUCTURE — Mosaic with stat overlays ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-28 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-14">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Chapter Two — Reach
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-medium text-obsidian leading-[1.08] tracking-[-0.03em] m-0">
                  International Structure
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
              <FadeIn delay={0.15}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-4">
                  While our agricultural roots remain connected to Algeria, Delicious Planet
                  operates through an internationally coordinated structure designed to support
                  reliable sourcing pathways and commercial distribution continuity.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone text-base leading-relaxed m-0">
                  Geographic positioning supports coordination between agricultural environments
                  and commercial supply requirements.
                </p>
              </FadeIn>
            </div>
          </div>

          {/* Asymmetric mosaic */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
            {presenceStats.map((item, i) => {
              const layout = [
                'md:col-span-5 aspect-[4/5]',
                'md:col-span-7 aspect-[16/10] md:mt-12',
                'md:col-span-12 lg:col-span-12 aspect-[21/8]',
              ][i]
              return (
                <FadeIn key={item.label} delay={0.1 + i * 0.1}>
                  <div className={`relative rounded-2xl overflow-hidden bg-mist ${layout}`}>
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width:768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 flex items-end justify-between gap-4">
                      <p className="text-cream/80 text-sm lg:text-base m-0">{item.label}</p>
                      <p className="font-luxury text-5xl lg:text-7xl text-cream m-0 leading-none">
                        {item.stat}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ 5. CAPABILITIES — Bento grid with feature image card ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-7">
              <FadeIn>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Chapter Three — Capabilities
                </p>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-medium text-obsidian leading-[1.08] tracking-[-0.03em] m-0">
                  Structured Supply for{' '}
                  <span className="italic text-gold/80">Professional Environments</span>
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-5 lg:pt-4">
              <FadeIn delay={0.1}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  Delicious Planet operates as a coordination layer between producers maintaining
                  stable agricultural output and professional buyers requiring predictable
                  procurement structures.
                </p>
              </FadeIn>
            </div>
          </div>

          {/* Bento — feature image card mixed with capability cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Feature image card spanning 2 cols */}
            <FadeIn>
              <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden bg-charcoal aspect-square md:aspect-auto h-full min-h-[300px]">
                <Image
                  src="/images/about/about-capability-feature.avif"
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 35vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-8">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium m-0 mb-3">
                    Coordination Layer
                  </p>
                  <p className="font-luxury text-2xl lg:text-3xl text-cream leading-tight m-0">
                    From cultivation cycle to commercial shelf.
                  </p>
                </div>
              </div>
            </FadeIn>

            {capabilities.map((cap) => (
              <FadeIn key={cap.badge}>
                <div
                  className={`md:col-span-2 rounded-2xl p-7 lg:p-8 h-full flex flex-col min-h-[200px] ${
                    cap.accent ? 'bg-forest text-cream' : 'bg-parchment text-obsidian'
                  }`}
                >
                  <span
                    className={`inline-block text-[10px] uppercase tracking-[0.15em] font-medium px-3 py-1.5 rounded-full border w-fit mb-5 ${
                      cap.accent ? 'border-cream/30 text-cream/80' : 'border-stone/20 text-stone'
                    }`}
                  >
                    {cap.badge}
                  </span>
                  <p
                    className={`text-[15px] leading-relaxed m-0 ${
                      cap.accent ? 'text-cream/90 font-medium' : 'text-stone'
                    }`}
                  >
                    {cap.text}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. PRINCIPLES — Numbered editorial cards ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-28 bg-obsidian relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <Image
            src="/images/about/about-principles-bg.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <FadeIn>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                Chapter Four — Principles
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-medium text-cream leading-[1.08] tracking-[-0.03em] m-0">
                Six disciplines that shape every sourcing decision.
              </h2>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cream/10 rounded-2xl overflow-hidden">
            {principles.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.06}>
                <div className="bg-obsidian p-8 lg:p-10 h-full group hover:bg-charcoal transition-colors duration-300">
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="font-luxury text-3xl text-gold/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="w-8 h-px bg-gold/40 group-hover:w-16 transition-all duration-300" />
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-cream m-0 mb-4">
                    {v.title}
                  </h3>
                  <p className="text-cream/60 text-sm leading-relaxed m-0">{v.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. TIMELINE — Horizontal milestone showcase ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-28 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
            <div className="lg:col-span-7">
              <FadeIn>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Chapter Five — Journey
                </p>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-medium text-obsidian leading-[1.08] tracking-[-0.03em] m-0">
                  Development Timeline
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-4">
              <FadeIn delay={0.1}>
                <p className="text-stone text-sm leading-relaxed m-0">
                  From a single agricultural product to an internationally coordinated sourcing
                  platform — built deliberately, year by year.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Horizontal scroll lane */}
        <div className="overflow-x-auto pb-6 [scrollbar-width:thin]">
          <div className="flex gap-5 lg:gap-6 px-5 sm:px-6 md:px-8 lg:px-12 min-w-max">
            {timeline.map((item, i) => (
              <FadeIn key={item.year} delay={i * 0.05}>
                <div className="w-[280px] lg:w-[340px] flex-shrink-0">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-mist mb-5">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="340px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                      <span className="font-luxury text-xl text-cream bg-obsidian/60 backdrop-blur px-3 py-1 rounded-full">
                        {item.year}
                      </span>
                      <span className="text-cream/60 text-[10px] uppercase tracking-widest">
                        {String(i + 1).padStart(2, '0')} / {timeline.length}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-obsidian m-0 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. TRACTION — Big editorial numbers ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-14 pb-8 border-b border-stone/15">
            <div>
              <FadeIn>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Chapter Six — Scale
                </p>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-medium text-obsidian leading-[1.08] tracking-[-0.03em] m-0">
                  Operational Scope
                </h2>
              </FadeIn>
            </div>
            <FadeIn delay={0.1}>
              <p className="text-stone text-sm uppercase tracking-[0.2em] m-0">
                As of 2026
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-stone/15">
            {traction.map((item) => (
              <FadeIn key={item.label}>
                <div
                  className={`p-8 lg:p-12 h-full ${item.accent ? 'bg-forest/10' : 'bg-cream'}`}
                >
                  <p className="font-luxury text-5xl lg:text-7xl xl:text-8xl font-medium text-obsidian leading-none m-0 mb-4 tracking-tight">
                    {item.value}
                  </p>
                  <div className="w-8 h-px bg-gold mb-3" />
                  <p className="text-stone text-sm uppercase tracking-[0.15em] m-0">
                    {item.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. FOUNDER — Magazine-style spread ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-32 bg-parchment relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Portrait */}
            <div className="lg:col-span-5 relative">
              <FadeIn>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-mist">
                  <Image
                    src="/images/about/about-founder-portrait.avif"
                    alt="Nabila Mellaz, Founder & CEO"
                    fill
                    sizes="(max-width:1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              {/* Name plate overlap */}
              <FadeIn delay={0.2}>
                <div className="hidden md:block absolute -bottom-6 -right-4 lg:-right-8 bg-cream px-7 py-5 rounded-xl shadow-2xl">
                  <p className="font-luxury text-2xl lg:text-3xl text-obsidian m-0 leading-tight">
                    Nabila Mellaz
                  </p>
                  <p className="text-gold text-[10px] uppercase tracking-[0.25em] m-0 mt-1">
                    Founder &amp; CEO
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Editorial copy */}
            <div className="lg:col-span-7 lg:pt-8 relative">
              <FadeIn>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Founder Perspective
                </p>
              </FadeIn>
              {/* Decorative oversize quote */}
              <div className="absolute -top-4 lg:-top-8 -left-2 font-luxury text-[120px] lg:text-[180px] text-gold/15 leading-none pointer-events-none select-none">
                &ldquo;
              </div>
              <FadeIn delay={0.1}>
                <p className="relative font-luxury italic text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] text-obsidian leading-[1.3] tracking-[-0.02em] m-0 mb-10">
                  Delicious Planet was developed from direct exposure to the complexity of
                  maintaining product consistency within natural agricultural environments. Working
                  closely with honey production highlighted the importance of continuity across
                  cultivation cycles.
                </p>
              </FadeIn>
              <div className="space-y-5 lg:max-w-xl">
                <FadeIn delay={0.2}>
                  <p className="text-stone text-base leading-relaxed m-0">
                    As sourcing expanded into additional categories, the objective remained
                    consistent: establish structured coordination between production environments
                    and professional markets requiring reliability.
                  </p>
                </FadeIn>
                <FadeIn delay={0.25}>
                  <p className="text-stone text-base leading-relaxed m-0">
                    The platform continues to focus on strengthening supply continuity, supporting
                    producers capable of maintaining product integrity, and improving accessibility
                    of natural products across regional markets.
                  </p>
                </FadeIn>
              </div>
              <FadeIn delay={0.3}>
                <div className="md:hidden mt-8 pt-6 border-t border-stone/15">
                  <p className="font-luxury text-2xl text-obsidian m-0 leading-tight">
                    Nabila Mellaz
                  </p>
                  <p className="text-gold text-[10px] uppercase tracking-[0.25em] m-0 mt-1">
                    Founder &amp; CEO
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 10. TEAM ═══ */}
      <section className="py-14 sm:py-16 md:py-20 lg:py-28 bg-obsidian">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-14 pb-8 border-b border-cream/10">
            <div>
              <FadeIn>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                  Our People
                </p>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-medium text-cream leading-[1.08] tracking-[-0.03em] m-0">
                  The Team Behind the Taste
                </h2>
              </FadeIn>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {teamRoles.map((role, i) => (
              <FadeIn key={role} delay={i * 0.08}>
                <div className="group">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-charcoal mb-4">
                    <Image
                      src={`/images/about/about-team-${i + 1}.avif`}
                      alt=""
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 font-luxury text-cream/40 text-sm">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <p className="text-cream font-serif text-base m-0">Team Member</p>
                  <p className="text-gold text-[10px] uppercase tracking-[0.25em] m-0 mt-1">
                    {role}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11. OFFICES (CMS-driven) ═══ */}
      {offices.length > 0 && (
        <section className="py-(--spacing-section) bg-cream">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-14 pb-8 border-b border-stone/15">
              <div>
                <FadeIn>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                    Global Presence
                  </p>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <h2 className="font-luxury text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] font-medium text-obsidian leading-[1.08] tracking-[-0.03em] m-0">
                    Our Offices
                  </h2>
                </FadeIn>
              </div>
              <FadeIn delay={0.1}>
                <p className="text-stone text-sm uppercase tracking-[0.2em] m-0">
                  {offices.length} Locations
                </p>
              </FadeIn>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {offices.map((office, i) => {
                const imgUrl =
                  typeof office.image === 'object' && office.image !== null
                    ? ((office.image as Media).sizes?.card?.url ??
                      (office.image as Media).url ??
                      null)
                    : null
                return (
                  <FadeIn key={office.id} delay={i * 0.08}>
                    <div className="bg-parchment rounded-2xl overflow-hidden group">
                      <div className="aspect-[4/3] relative bg-mist overflow-hidden">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={`${office.city}, ${office.country}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-mist to-parchment" />
                        )}
                        <div className="absolute top-4 left-4 bg-cream/90 backdrop-blur px-3 py-1 rounded-full">
                          <span className="font-luxury text-xs text-obsidian">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                      <div className="p-7">
                        <h3 className="font-serif text-xl font-medium text-obsidian m-0 mb-1">
                          {office.city}
                        </h3>
                        <p className="text-gold text-[10px] uppercase tracking-[0.25em] m-0 mb-4">
                          {office.country}
                        </p>
                        {office.address && (
                          <p className="text-stone/80 text-xs leading-relaxed m-0 mb-3">
                            {office.address}
                          </p>
                        )}
                        {office.phone && (
                          <p className="text-stone/70 text-xs m-0 mb-1">
                            <a
                              href={`tel:${office.phone}`}
                              className="text-stone/70 no-underline hover:text-gold transition-colors"
                            >
                              {office.phone}
                            </a>
                          </p>
                        )}
                        {office.email && (
                          <p className="text-stone/70 text-xs m-0">
                            <a
                              href={`mailto:${office.email}`}
                              className="text-stone/70 no-underline hover:text-gold transition-colors"
                            >
                              {office.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 12. CTA — Full-bleed image with overlay ═══ */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/about/about-cta-bg.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-forest/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/60 via-forest/80 to-forest/95" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-medium mb-6">
              — Get in Touch
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-[30px] sm:text-[38px] md:text-[46px] lg:text-[56px] xl:text-[64px] font-medium text-cream leading-[1.05] tracking-[-0.03em] m-0 mb-6 max-w-3xl mx-auto">
              Continuity of Origin,{' '}
              <span className="italic text-gold/90">Structured for Scale</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/70 text-lg m-0 mb-10 max-w-xl mx-auto">
              Whether you&apos;re a professional buyer, chef, or specialty retailer — we&apos;d love
              to discuss how we can support your sourcing requirements.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <MagneticButton>
              <Link
                href="/contact"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-12 py-5 rounded-sm no-underline hover:bg-gold-light transition-colors"
              >
                Get in Touch
              </Link>
            </MagneticButton>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
