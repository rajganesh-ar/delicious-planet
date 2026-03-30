'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import type { OfficeLocation, Media } from '@/payload-types'
import Link from 'next/link'

interface AboutPageClientProps {
  offices: OfficeLocation[]
}

const values = [
  {
    title: 'Provenance',
    description:
      'Every ingredient is traceable to its source. Transparency in origin is a non-negotiable standard across our entire portfolio.',
  },
  {
    title: 'Consistency',
    description:
      'Producers are evaluated against defined quality criteria and verified across delivery cycles — not just at onboarding.',
  },
  {
    title: 'Sustainability',
    description:
      'We prioritise producers implementing controlled production processes and resource-conscious methods.',
  },
  {
    title: 'Partnership',
    description:
      'We build long-term supply relationships that support product stability and shared growth.',
  },
]

const timeline = [
  {
    phase: 'Development',
    title: 'Building the Foundation',
    description:
      'Initial supplier network established. Portfolio development across specialty ingredients. International brand partnerships initiated.',
  },
  {
    phase: 'Expansion',
    title: 'Scaling the Network',
    description:
      'Multi-region sourcing capability developed. Introduction of proprietary olive oil and sesame oil. Expansion into structured B2B supply.',
  },
  {
    phase: 'Growth',
    title: 'Strengthening the Portfolio',
    description:
      'Expanded supplier network. Broader ingredient portfolio across categories. Strengthened logistics partnerships and development of the culinary content platform.',
  },
  {
    phase: 'Forward Direction',
    title: 'Continued Expansion',
    description:
      'Expanded sourcing partnerships. Private label development. Regional supply chain strengthening and continued portfolio expansion.',
  },
]

export function AboutPageClient({ offices }: AboutPageClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [target, setTarget] = useState<HTMLDivElement | null>(null)

  const refCallback = (node: HTMLDivElement | null) => {
    containerRef.current = node
    setTarget(node)
  }

  const { scrollYProgress } = useScroll({
    ...(target ? { target: { current: target } } : {}),
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <>
      {/* Hero */}
      <section
        ref={refCallback}
        className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-obsidian overflow-hidden"
      >
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-gradient-to-br from-forest/80 via-obsidian to-obsidian"
        />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our Story
          </motion.p>
          <motion.h1
            className="font-serif text-4xl sm:text-5xl lg:text-[50px] font-medium text-cream leading-[1.1] tracking-[-0.04em] m-0"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Rooted in <span className="text-gold">Quality</span>
          </motion.h1>
        </div>
      </section>

      {/* Brand story */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="flex-1">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Who We Are
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian leading-[1.15] tracking-[-0.036em] m-0 mb-6">
                  A Passion for the Extraordinary
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone text-lg leading-relaxed m-0 mb-4">
                  Delicious Planet was born from a simple belief: that the finest ingredients
                  deserve the finest journey — from source to table, with every detail considered.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-stone text-lg leading-relaxed m-0">
                  We are curators, not just distributors. Each product in our collection has been
                  hand-selected after visiting the producers, tasting their offerings, and
                  understanding their craft. We work directly with artisans, farmers, and makers who
                  share our uncompromising standards.
                </p>
              </FadeIn>
            </div>
            <div className="flex-1 max-w-lg w-full">
              <FadeIn direction="right" delay={0.2}>
                <div className="aspect-[4/5] rounded-sm overflow-hidden bg-parchment">
                  <div className="w-full h-full bg-gradient-to-br from-parchment via-mist to-gold/10" />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-(--spacing-section) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Our Principles
              </p>
              <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-tight m-0">
                What We Stand For
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.1}>
                <div className="text-center p-8 bg-cream rounded-sm">
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

      {/* Timeline */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Our Journey
              </p>
              <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-tight m-0">
                Milestones
              </h2>
            </div>
          </FadeIn>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-gold/20 -translate-x-1/2" />

            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0
              return (
                <FadeIn key={item.phase} delay={i * 0.08}>
                  <div
                    className={`relative flex items-start mb-12 last:mb-0 pl-16 lg:pl-0 ${isLeft ? 'lg:pr-[calc(50%+2rem)]' : 'lg:pl-[calc(50%+2rem)]'}`}
                  >
                    {/* Dot */}
                    <div className="absolute left-6 lg:left-1/2 w-3 h-3 rounded-full bg-gold -translate-x-1/2 mt-2 z-10" />

                    <div>
                      <span className="text-gold font-luxury text-sm uppercase tracking-[0.2em] font-medium block mb-1">
                        {item.phase}
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

      {/* Team placeholder */}
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

      {/* Office Locations */}
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

      {/* CTA */}
      <section className="py-(--spacing-section) bg-forest">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-cream tracking-tight m-0 mb-4">
              Ready to Partner With Us?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/60 text-lg m-0 mb-8 max-w-lg mx-auto">
              Whether you&apos;re a chef, hotelier, or food lover — we&apos;d love to hear from you.
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
