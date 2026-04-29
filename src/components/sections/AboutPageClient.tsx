'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import type { OfficeLocation, Media } from '@/payload-types'
import Link from 'next/link'

interface AboutPageClientProps {
  offices: OfficeLocation[]
}

/* ── Data ── */

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
  },
  {
    year: '2021',
    title: 'Initial Partnerships',
    description:
      'Initial sourcing partnerships established for olive oil and dried fruit categories.',
  },
  {
    year: '2022',
    title: 'Network Expansion',
    description: 'Expansion of supplier network across North Africa and Southern Europe.',
  },
  {
    year: '2023',
    title: 'Procurement Framework',
    description:
      'Development of structured procurement framework supporting multi-category sourcing.',
  },
  {
    year: '2024',
    title: 'Private Label',
    description: 'Introduction of private label supply coordination.',
  },
  {
    year: '2025',
    title: 'Distribution Growth',
    description: 'Expansion of distribution capability across Middle East markets.',
  },
  {
    year: '2026',
    title: 'International Structure',
    description:
      'International operational structure established with headquarters in UAE and regional offices across multiple markets.',
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
  { stat: '5', label: 'Regional Offices' },
  { stat: '4', label: 'Continents' },
  { stat: 'Multi', label: 'Region Capability' },
]

export function AboutPageClient({ offices }: AboutPageClientProps) {
  return (
    <>
      {/* ═══ Hero — Editorial Grid (Image 1 + 4 hybrid) ═══ */}
      <section className="bg-cream overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left — copy */}
            <div className="flex-shrink-0 lg:w-[38%] pt-4 lg:pt-8">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5">
                  Our Story
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="font-serif text-4xl sm:text-5xl xl:text-[56px] font-medium text-obsidian leading-[1.08] tracking-[-0.04em] m-0 mb-8">
                  Structured Natural Supply, Designed for Global Continuity
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-5">
                  Delicious Planet is a sourcing and distribution platform connecting disciplined
                  agricultural production environments with professional markets requiring
                  reliability, specification consistency, and scalable procurement capability.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  Rooted in Algeria and headquartered in the United Arab Emirates, the company
                  coordinates sourcing relationships across multiple regions to support stable
                  access to natural products across Middle East and Africa markets.
                </p>
              </FadeIn>
            </div>

            {/* Right — asymmetric image grid */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {/* Large portrait — spans 1 col, 2 rows */}
                <FadeIn delay={0.15}>
                  <div className="row-span-2 aspect-[3/4] rounded-lg overflow-hidden bg-parchment">
                    <div className="w-full h-full bg-gradient-to-br from-forest/20 via-parchment to-gold/10" />
                  </div>
                </FadeIn>
                {/* Top-right landscape */}
                <FadeIn delay={0.25}>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-mist">
                    <div className="w-full h-full bg-gradient-to-br from-mist via-stone/10 to-parchment" />
                  </div>
                </FadeIn>
                {/* Bottom-right — 2 small side by side */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <FadeIn delay={0.35}>
                    <div className="aspect-square rounded-lg overflow-hidden bg-parchment">
                      <div className="w-full h-full bg-gradient-to-br from-gold/15 via-parchment to-mist" />
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.4}>
                    <div className="aspect-square rounded-lg overflow-hidden bg-mist">
                      <div className="w-full h-full bg-gradient-to-br from-forest/10 via-mist to-parchment" />
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Brand Introduction — Centered Text ═══ */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="w-12 h-px bg-gold mx-auto mb-10" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian leading-[1.15] tracking-[-0.03em] m-0 mb-8">
              Built on Agricultural Continuity
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-stone text-lg leading-relaxed m-0 mb-5">
              Delicious Planet began with honey production developed within environments where
              product integrity depends on ecological balance, seasonal rhythm, and disciplined
              harvesting practices.
            </p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <p className="text-stone text-lg leading-relaxed m-0 mb-5">
              Over time, sourcing capabilities expanded to include olive oil, dried figs, botanical
              extracts, and additional natural products selected for their stability of
              characteristics across cultivation cycles.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-stone text-lg leading-relaxed m-0">
              The platform has evolved into a structured sourcing environment designed to support
              professional buyers requiring reliable ingredient performance across repeated
              procurement cycles.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Global Presence — Stat + Image Columns (Image 4 style) ═══ */}
      <section className="py-20 lg:py-28 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left — headline + text */}
            <div className="lg:w-[35%] flex-shrink-0">
              <FadeIn>
                <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian leading-[1.12] tracking-[-0.03em] m-0 mb-6">
                  International Structure
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-stone text-base leading-relaxed m-0 mb-4">
                  While our agricultural roots remain connected to Algeria, Delicious Planet
                  operates through an internationally coordinated structure designed to support
                  reliable sourcing pathways and commercial distribution continuity.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="text-stone text-base leading-relaxed m-0">
                  Geographic positioning supports coordination between agricultural environments and
                  commercial supply requirements.
                </p>
              </FadeIn>
            </div>

            {/* Right — 3 tall stat-image cards */}
            <div className="flex-1 grid grid-cols-3 gap-3 lg:gap-4">
              {presenceStats.map((item, i) => (
                <FadeIn key={item.label} delay={0.1 + i * 0.1}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-mist">
                    {/* Placeholder image */}
                    <div className="absolute inset-0 bg-gradient-to-b from-stone/20 via-mist to-parchment" />
                    {/* Stat overlay */}
                    <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 bg-gradient-to-b from-cream/90 to-cream/0">
                      <p className="text-2xl lg:text-3xl font-serif font-medium text-obsidian m-0">
                        {item.stat}
                      </p>
                      <p className="text-stone text-xs lg:text-sm m-0 mt-1">{item.label}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Capabilities — Card Grid (Image 2 style) ═══ */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-[-0.03em] m-0 mb-4">
              Structured Supply for Professional Environments
            </h2>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="text-stone text-lg m-0 mb-12 max-w-2xl">
              Delicious Planet operates as a coordination layer between producers maintaining stable
              agricultural output and professional buyers requiring predictable procurement
              structures.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, i) => (
              <FadeIn key={cap.badge} delay={i * 0.06}>
                <div
                  className={`rounded-2xl p-7 lg:p-8 h-full flex flex-col ${
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

      {/* ═══ Operational Principles — 3×2 Grid ═══ */}
      <section className="py-20 lg:py-28 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Our Principles
              </p>
              <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-tight m-0">
                Operational Principles
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {principles.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.06}>
                <div className="text-center p-8 bg-cream rounded-xl">
                  <div className="w-6 h-px bg-gold mx-auto mb-5" />
                  <h3 className="font-serif text-xl font-medium text-obsidian m-0 mb-3">
                    {v.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed m-0">{v.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Timeline — 2020–2026 ═══ */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Our Journey
              </p>
              <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-tight m-0">
                Development Timeline
              </h2>
            </div>
          </FadeIn>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-gold/20 -translate-x-1/2" />

            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0
              return (
                <FadeIn key={item.year} delay={i * 0.06}>
                  <div
                    className={`relative flex items-start mb-12 last:mb-0 pl-16 lg:pl-0 ${isLeft ? 'lg:pr-[calc(50%+2rem)]' : 'lg:pl-[calc(50%+2rem)]'}`}
                  >
                    {/* Dot */}
                    <div className="absolute left-6 lg:left-1/2 w-3 h-3 rounded-full bg-gold -translate-x-1/2 mt-2 z-10" />

                    <div>
                      <span className="text-gold font-luxury text-sm uppercase tracking-[0.2em] font-medium block mb-1">
                        {item.year}
                      </span>
                      <h3 className="font-serif text-xl font-medium text-obsidian m-0 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-stone text-sm leading-relaxed m-0">{item.description}</p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ Traction — Stat Cards (Image 3 style) ═══ */}
      <section className="py-20 lg:py-28 bg-parchment">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-[-0.03em] m-0 mb-12">
              Operational Scope
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {traction.map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.06}>
                <div
                  className={`rounded-2xl p-7 lg:p-8 ${item.accent ? 'bg-forest/15' : 'bg-cream'}`}
                >
                  <p className="text-3xl lg:text-5xl font-serif font-medium text-obsidian m-0 mb-2">
                    {item.value}
                  </p>
                  <p className="text-stone text-sm m-0">{item.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Founder Section ═══ */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            {/* Portrait placeholder */}
            <div className="lg:w-[40%] flex-shrink-0 w-full max-w-md">
              <FadeIn>
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-parchment">
                  <div className="w-full h-full bg-gradient-to-br from-parchment via-mist to-gold/10" />
                </div>
              </FadeIn>
            </div>

            {/* Text */}
            <div className="flex-1">
              <FadeIn delay={0.1}>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Founder Perspective
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <h2 className="font-serif text-3xl lg:text-[40px] font-medium text-obsidian leading-[1.15] tracking-[-0.03em] m-0 mb-2">
                  Nabila Mellaz
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone/60 text-sm uppercase tracking-widest m-0 mb-8">
                  Founder &amp; CEO
                </p>
              </FadeIn>
              <FadeIn delay={0.25}>
                <blockquote className="border-l-2 border-gold pl-6 m-0 mb-5">
                  <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                    Delicious Planet was developed from direct exposure to the complexity of
                    maintaining product consistency within natural agricultural environments.
                    Working closely with honey production highlighted the importance of continuity
                    across cultivation cycles.
                  </p>
                </blockquote>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-stone text-base leading-relaxed m-0 mb-4">
                  As sourcing expanded into additional categories, the objective remained
                  consistent: establish structured coordination between production environments and
                  professional markets requiring reliability.
                </p>
              </FadeIn>
              <FadeIn delay={0.35}>
                <p className="text-stone text-base leading-relaxed m-0">
                  The platform continues to focus on strengthening supply continuity, supporting
                  producers capable of maintaining product integrity, and improving accessibility of
                  natural products across regional markets.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Team Placeholder ═══ */}
      <section className="py-(--spacing-section) bg-obsidian">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Our People
              </p>
              <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-cream tracking-tight m-0">
                The Team Behind the Taste
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {['Founder & CEO', 'Head of Sourcing', 'Creative Director', 'Head of B2B'].map(
              (role, i) => (
                <FadeIn key={role} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="aspect-square rounded-sm overflow-hidden bg-charcoal mb-4">
                      <div className="w-full h-full bg-gradient-to-br from-charcoal to-forest/30" />
                    </div>
                    <p className="text-cream font-medium text-sm m-0">Team Member</p>
                    <p className="text-cream/50 text-xs m-0 mt-1">{role}</p>
                  </div>
                </FadeIn>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ═══ Office Locations (CMS-driven) ═══ */}
      {offices.length > 0 && (
        <section className="py-(--spacing-section) bg-parchment">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <FadeIn>
              <div className="text-center mb-16">
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Global Presence
                </p>
                <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-tight m-0">
                  Our Offices
                </h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {offices.map((office, i) => {
                const imgUrl =
                  typeof office.image === 'object' && office.image !== null
                    ? ((office.image as Media).sizes?.card?.url ??
                      (office.image as Media).url ??
                      null)
                    : null
                return (
                  <FadeIn key={office.id} delay={i * 0.1}>
                    <div className="bg-cream rounded-sm overflow-hidden">
                      <div className="aspect-video relative bg-mist">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={`${office.city}, ${office.country}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-mist to-parchment" />
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-serif text-xl font-medium text-obsidian m-0 mb-1">
                          {office.city}
                        </h3>
                        <p className="text-stone text-sm m-0 mb-3">{office.country}</p>
                        {office.address && (
                          <p className="text-stone/70 text-xs m-0 mb-2">{office.address}</p>
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

      {/* ═══ CTA / Closing ═══ */}
      <section className="py-(--spacing-section) bg-forest">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-cream tracking-tight m-0 mb-4">
              Continuity of Origin, Structured for Scale
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/60 text-lg m-0 mb-8 max-w-xl mx-auto">
              Whether you&apos;re a professional buyer, chef, or specialty retailer — we&apos;d love
              to discuss how we can support your sourcing requirements.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <MagneticButton>
              <Link
                href="/contact"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
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
