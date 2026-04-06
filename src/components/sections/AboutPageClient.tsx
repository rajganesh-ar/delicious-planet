'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import type { OfficeLocation, Media } from '@/payload-types'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface AboutPageClientProps {
  offices: OfficeLocation[]
}

/* ─── Data ──────────────────────────────────────────── */

const heroStats = [
  { value: '100+', label: 'Natural Products' },
  { value: '5', label: 'Global Offices' },
  { value: '7', label: 'Product Categories' },
  { value: '5+', label: 'Source Regions' },
]

const perspectives = [
  {
    title: 'Clarity of Origin',
    desc: 'Every product is traceable to its source. Provenance is a non-negotiable standard across our entire portfolio.',
  },
  {
    title: 'Consistency',
    desc: 'Product characteristics are evaluated and verified across procurement cycles — not just at onboarding.',
  },
  {
    title: 'Supply Continuity',
    desc: 'Sourcing structures maintain availability through seasonal cycles and evolving demand conditions.',
  },
  {
    title: 'Producer Coordination',
    desc: 'Long-term supply relationships with producers capable of maintaining stable characteristics across production cycles.',
  },
  {
    title: 'Commercial Alignment',
    desc: 'Supply structures align with the technical expectations of professional kitchens, retailers, and manufacturers.',
  },
]

const productCategories = [
  'Honey & Hive-Derived Products',
  'Olive Oil & Botanical Oils',
  'Dried Fruits & Natural Sweeteners',
  'Plant Extracts',
  'Specialty Ingredients',
  'Premium Natural Pantry Products',
]

const integrityConsiderations = [
  {
    label: 'Composition Stability',
    desc: 'Active and nutritional characteristics maintained through production and distribution cycles.',
  },
  {
    label: 'Traceable Origin',
    desc: 'Clear chain of custody from cultivation environment through delivery — no ambiguity in sourcing pathways.',
  },
  {
    label: 'Processing Discipline',
    desc: 'Controlled methods maintaining product structure and composition integrity throughout handling stages.',
  },
  {
    label: 'Transport Durability',
    desc: 'Packaging and logistics compatibility ensuring product stability under variable distribution conditions.',
  },
]

const staticOffices = [
  { city: 'Dubai', country: 'United Arab Emirates', role: 'Headquarters' },
  { city: 'London', country: 'United Kingdom', role: 'Regional Office' },
  { city: 'New York', country: 'United States', role: 'Regional Office' },
  { city: 'Mumbai', country: 'India', role: 'Regional Office' },
  { city: 'Algiers', country: 'Algeria', role: 'Sourcing & Operations' },
]

/* ─── Reusable: Parallax Image ──────────────────────── */

function useParallax(amount = 30) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -amount },
        {
          y: amount,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, wrapRef)
    return () => ctx.revert()
  }, [amount])

  return { wrapRef, imgRef }
}

/* ─── Reusable: Gold Divider ────────────────────────── */

function GoldDivider() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   1. HERO
   ═══════════════════════════════════════════════════════ */

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0.45 },
        {
          opacity: 0.82,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/misc/calum-lewis-rPkgYDh2bmo-unsplash.avif"
          alt="Natural agricultural landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div ref={overlayRef} className="absolute inset-0 bg-obsidian/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-16 pt-32 pb-20">
        <div className="max-w-2xl">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-6">
              About Delicious Planet
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-4xl sm:text-5xl lg:text-[68px] font-light text-cream leading-[1.06] tracking-tight mb-7">
              Rooted in Origin.
              <br />
              <span className="text-gold/90">Structured for Global Supply.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p className="text-cream/60 text-lg lg:text-xl font-light leading-relaxed mb-5 max-w-xl">
              Established to build a structured connection between natural agricultural production
              and professional markets requiring consistency, reliability, and clarity of origin.
            </p>
          </FadeIn>
          <FadeIn delay={0.22}>
            <p className="text-cream/40 text-sm leading-relaxed mb-10 max-w-lg">
              Our foundation began in Algeria through honey production — expanding into a
              coordinated sourcing and distribution platform connecting producers with professional
              buyers across multiple international markets.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <MagneticButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                >
                  Get in Touch
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/sourcing"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-cream/40 transition-colors duration-300"
                >
                  Our Sourcing
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.4}>
          <div className="mt-20 pt-8 border-t border-cream/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <span className="block font-luxury text-3xl lg:text-5xl font-light text-gold mb-1.5">
                    {s.value}
                  </span>
                  <span className="text-cream/40 text-xs uppercase tracking-[0.2em] font-heading">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   2. BRAND ORIGIN — Content + Image
   ═══════════════════════════════════════════════════════ */

function BrandOrigin() {
  const { wrapRef, imgRef } = useParallax(40)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[70vh]">
        {/* Content — left */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-12 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Our Origin
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                From Algeria&apos;s Fields
                <br />
                to Global Markets
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Delicious Planet was established with the objective of building a structured
                connection between natural agricultural production and professional markets. Our
                foundation began in Algeria through honey production, working closely with
                agricultural environments where product integrity is shaped by ecosystem stability,
                harvesting discipline, and traditional cultivation knowledge.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                As sourcing capabilities developed, the platform expanded to include olive oil,
                dried figs, oak extract, and a broader range of natural products selected for their
                ability to maintain stable characteristics across production cycles. Today,
                Delicious Planet operates as a coordinated sourcing and distribution platform.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="border border-cream/[0.06] rounded-sm p-6 bg-cream/[0.015]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cream/30 font-heading font-semibold mb-4">
                  Product Categories
                </p>
                <ul className="space-y-3 list-none m-0 p-0">
                  {productCategories.map((cat) => (
                    <li key={cat} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-[7px] shrink-0" />
                      <span className="text-cream/50 text-sm leading-relaxed">{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-40px]">
            <Image
              src="/images/misc/erol-ahmed-AEYdJTleZc0-unsplash.avif"
              alt="Natural honey production — Algeria agricultural origin"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   3. OUR PERSPECTIVE — Five-Pillar Card Grid
   ═══════════════════════════════════════════════════════ */

function OurPerspective() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-24 mb-16 lg:mb-20">
          <div className="lg:w-1/2">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Our Perspective
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-0">
                What Guides
                <br />
                Our Approach
              </h2>
            </FadeIn>
          </div>
          <div className="lg:w-1/2 lg:pt-10">
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base lg:text-lg leading-relaxed m-0">
                Natural products require structured sourcing environments capable of maintaining
                stable characteristics across agricultural cycles and geographic variability. Our
                approach prioritizes alignment between natural production environments and
                commercial requirements.
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {perspectives.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.06}>
              <motion.div
                className="group relative border border-cream/[0.06] rounded-sm bg-obsidian h-full hover:border-gold/25 transition-colors duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-px w-0 group-hover:w-full bg-gold/40 transition-all duration-700 ease-out" />
                <div className="p-6 lg:p-7">
                  <div className="w-10 h-10 rounded-full border border-gold/15 flex items-center justify-center mb-5 group-hover:border-gold/30 transition-colors duration-500">
                    <span className="text-gold/50 text-xs font-heading font-bold group-hover:text-gold/80 transition-colors duration-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-cream/90 mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-cream/38 text-sm leading-relaxed m-0">{item.desc}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   4. PRODUCT INTEGRITY — Content + Image
   ═══════════════════════════════════════════════════════ */

function ProductIntegrity() {
  const { wrapRef, imgRef } = useParallax(35)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[70vh]">
        {/* Content — left */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-12 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Product Integrity
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Integrity From
                <br />
                Harvest to Delivery
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Natural ingredients vary according to environmental conditions, harvest timing, and
                preparation methods. Maintaining product integrity requires structured coordination
                across cultivation, processing, and logistics stages.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                We collaborate with producers capable of maintaining stable product characteristics
                through controlled cultivation environments and consistent preparation processes.
                Integrity of product characteristics supports reliable use across culinary
                preparation, formulation processes, and retail environments.
              </p>
            </FadeIn>

            <div className="space-y-5">
              {integrityConsiderations.map((item, i) => (
                <FadeIn key={item.label} delay={0.2 + i * 0.04}>
                  <div className="group border-l-2 border-gold/15 pl-5 py-1 hover:border-gold/40 transition-colors duration-500">
                    <h3 className="font-heading text-sm font-semibold text-cream/90 mb-1 tracking-wide">
                      {item.label}
                    </h3>
                    <p className="text-cream/38 text-sm leading-relaxed m-0">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-35px]">
            <Image
              src="/images/vendor/vendor-processing.avif"
              alt="Product processing and quality control"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   5. GLOBAL STRUCTURE
   ═══════════════════════════════════════════════════════ */

function GlobalStructure({ offices }: { offices: OfficeLocation[] }) {
  const hasCmsOffices = offices.length > 0

  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-[380px] shrink-0">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Global Structure
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Internationally
                <br />
                Coordinated
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-base leading-relaxed mb-4">
                Headquartered in the UAE, Delicious Planet operates through an internationally
                coordinated structure designed to support supply continuity across multiple regions,
                enabling proximity to key trade routes and markets across the Middle East and
                Africa.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/30 text-sm leading-relaxed">
                Regional offices in the UK, US, India, and Algeria support sourcing coordination,
                partner relationships, and operational alignment — improving logistics coordination
                and communication efficiency across key commercial markets.
              </p>
            </FadeIn>
          </div>

          <div className="flex-1">
            {hasCmsOffices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {offices.map((office, i) => {
                  const imgUrl =
                    typeof office.image === 'object' && office.image !== null
                      ? ((office.image as Media).sizes?.card?.url ??
                        (office.image as Media).url ??
                        null)
                      : null
                  return (
                    <FadeIn key={office.id} delay={i * 0.06}>
                      <div className="border border-cream/[0.06] rounded-sm overflow-hidden hover:border-gold/20 transition-colors duration-500">
                        {imgUrl && (
                          <div className="aspect-video relative bg-charcoal">
                            <Image
                              src={imgUrl}
                              alt={`${office.city}, ${office.country}`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover opacity-70"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-heading text-sm font-semibold text-cream/90 m-0 mb-1">
                            {office.city}
                          </h3>
                          <p className="text-cream/40 text-xs m-0 mb-2">{office.country}</p>
                          {office.email && (
                            <a
                              href={`mailto:${office.email}`}
                              className="text-gold/50 text-xs hover:text-gold/80 transition-colors no-underline"
                            >
                              {office.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-0">
                {staticOffices.map((office, i) => (
                  <FadeIn key={office.city} delay={i * 0.05}>
                    <div className="flex items-center justify-between py-5 border-b border-cream/[0.06] last:border-b-0 group">
                      <div className="flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-gold/25 group-hover:bg-gold/50 transition-colors duration-500 shrink-0" />
                        <div>
                          <span className="text-cream/70 text-base font-medium group-hover:text-cream transition-colors duration-300">
                            {office.city}
                          </span>
                          <span className="text-cream/35 text-sm ml-3">{office.country}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-heading font-semibold px-3 py-1.5 rounded-full border ${
                          office.role === 'Headquarters'
                            ? 'text-gold/70 bg-gold/[0.08] border-gold/10'
                            : 'text-cream/30 bg-cream/[0.03] border-cream/[0.06]'
                        }`}
                      >
                        {office.role}
                      </span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   6. FOUNDER'S MESSAGE — Image + Quote
   ═══════════════════════════════════════════════════════ */

function FounderMessage() {
  const { wrapRef, imgRef } = useParallax(25)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[65vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[45%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-25px]">
            <Image
              src="/images/misc/priscilla-du-preez-tGtWKDdicn4-unsplash.avif"
              alt="Nabila Mellaz — Founder, Delicious Planet"
              fill
              sizes="45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/60 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content — right */}
        <div className="lg:w-[55%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-lg">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Founder&apos;s Message
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-8">
                Nabila Mellaz
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="w-10 h-px bg-gold/30 mb-8" />
            </FadeIn>
            <FadeIn delay={0.12}>
              <blockquote className="m-0 mb-7">
                <p className="font-luxury text-xl lg:text-[22px] font-light text-cream/75 leading-[1.6] tracking-tight italic">
                  &ldquo;Delicious Planet began with a focus on understanding how natural products
                  maintain their identity across cultivation, preparation, and distribution
                  environments.&rdquo;
                </p>
              </blockquote>
            </FadeIn>
            <FadeIn delay={0.18}>
              <p className="text-cream/45 text-base leading-relaxed mb-4">
                Working closely with honey production provided insight into the importance of
                continuity within agricultural systems. Product characteristics are shaped not only
                by geographic origin, but by the stability of cultivation environments and the
                discipline of harvesting practices.
              </p>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="text-cream/30 text-sm leading-relaxed mb-8">
                As the platform expanded into additional product categories, the objective remained
                consistent: maintain alignment between natural production environments and
                professional markets requiring reliability. Delicious Planet has been developed as a
                structured sourcing environment designed to support continuity of product
                characteristics across changing seasonal conditions and evolving procurement
                requirements.
              </p>
            </FadeIn>
            <FadeIn delay={0.26}>
              <p className="text-cream/20 text-xs leading-relaxed italic border-l border-gold/15 pl-4">
                The long-term objective remains the same — to preserve alignment between
                agricultural origin and professional usage environments through structured sourcing
                relationships capable of sustaining continuity.
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   7. FRAMEWORK STATEMENT
   ═══════════════════════════════════════════════════════ */

function FrameworkStatement() {
  return (
    <section className="bg-obsidian py-28 lg:py-40 border-t border-cream/[0.06]">
      <div className="max-w-[720px] mx-auto px-6 text-center">
        <FadeIn>
          <div className="w-12 h-px bg-gold/30 mx-auto mb-10" />
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="font-luxury text-2xl sm:text-3xl lg:text-[34px] font-light text-cream/70 leading-[1.55] tracking-tight mb-8">
            Delicious Planet operates as a coordination layer between disciplined producers and
            professional buyers requiring reliable access to natural products with clarity of origin
            and consistency of supply.
          </p>
        </FadeIn>
        <FadeIn delay={0.12}>
          <p className="text-cream/30 text-base font-light leading-relaxed mb-6">
            Our geographic positioning across the UAE, UK, US, India, and Algeria supports
            structured procurement across multiple production environments while maintaining
            proximity to professional buyers across Middle East, North Africa, and African regional
            markets.
          </p>
        </FadeIn>
        <FadeIn delay={0.16}>
          <div className="w-8 h-px bg-gold/20 mx-auto" />
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   8. CTA — Image + Contact
   ═══════════════════════════════════════════════════════ */

function AboutCTA() {
  const { wrapRef, imgRef } = useParallax(20)

  return (
    <section className="bg-obsidian">
      <div className="flex flex-col lg:flex-row min-h-[65vh]">
        {/* Text side */}
        <div className="lg:w-1/2 flex items-center px-6 lg:px-16 py-20 lg:py-0">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-5">
                Work With Us
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight mb-6">
                Structured Partnership
                <br />
                Starts Here
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-4">
                Whether you are a professional buyer, a retailer, a food manufacturer, or an
                agricultural producer — we welcome structured conversations about partnership
                opportunities within our supply network.
              </p>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p className="text-cream/30 text-sm leading-relaxed mb-10">
                Contact our team at{' '}
                <a
                  href="mailto:info@deliciousplanet.co"
                  className="text-gold/50 hover:text-gold/80 underline underline-offset-2 transition-colors"
                >
                  info@deliciousplanet.co
                </a>{' '}
                or reach us at our UAE headquarters at +971 50 000 0000.
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="flex flex-wrap gap-4">
                <MagneticButton>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                  >
                    Contact Us
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href="/b2b"
                    className="inline-flex items-center text-sm font-heading font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-gold/40 transition-colors duration-300"
                  >
                    B2B Inquiries
                  </Link>
                </MagneticButton>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Image side */}
        <div ref={wrapRef} className="relative lg:w-1/2 min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-20px]">
            <Image
              src="/images/misc/frank-albrecht-k-ICgGQLdkM-unsplash.avif"
              alt="Delicious Planet — global supply partnership"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-obsidian/15" />
        </div>
      </div>
    </section>
  )
}

/* ═════════════════════════════════════════════════════
   PAGE COMPOSITION
   ═════════════════════════════════════════════════════ */

export function AboutPageClient({ offices }: AboutPageClientProps) {
  return (
    <>
      {/* 1. Full-screen hero with stats */}
      <Hero />

      {/* 2. Brand origin — Algeria honey story + product categories */}
      <BrandOrigin />

      {/* 3. Our perspective — five-pillar card grid */}
      <OurPerspective />

      {/* 4. Product integrity — processing image + considerations */}
      <ProductIntegrity />

      {/* 5. Global structure — offices */}
      <GlobalStructure offices={offices} />

      {/* 6. Founder's message — Nabila Mellaz */}
      <FounderMessage />

      {/* 7. Framework position statement */}
      <FrameworkStatement />

      {/* 8. CTA — contact */}
      <AboutCTA />
    </>
  )
}
