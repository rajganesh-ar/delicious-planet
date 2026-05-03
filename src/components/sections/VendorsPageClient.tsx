'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

const partnerProfiles = [
  { label: 'Export-capable producers', detail: 'Regulatory readiness for international markets' },
  {
    label: 'Specialty ingredient manufacturers',
    detail: 'Focused on a defined category with documented expertise',
  },
  { label: 'Olive oil producers', detail: 'Controlled cold-press operations with traceability' },
  { label: 'Grain mills', detail: 'Heritage and specialty flour with batch consistency' },
  { label: 'Condiment manufacturers', detail: 'Vinegars, preserves, sauces, and dressings' },
  { label: 'Caviar producers', detail: 'Aquaculture and sustainable wild-catch operations' },
]

const collaborationFocus = [
  'Long-term supply relationships',
  'Quality consistency across delivery cycles',
  'Traceable production documentation',
  'Export compliance capability',
]

export function VendorsPageClient() {
  return (
    <>
      {/* Hero — background become-a-vendor image */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/misc/become-a-vendor.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-obsidian/60" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Vendors &amp; Partnerships
          </motion.p>
          <motion.h1
            className="font-luxury text-4xl sm:text-5xl lg:text-[56px] font-light text-cream leading-[1.1] tracking-[-0.03em] m-0 mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Partner with
            <br />
            <span className="text-gold">Delicious Planet</span>
          </motion.h1>
          <motion.p
            className="font-luxury italic text-cream/60 text-lg lg:text-xl font-light max-w-2xl mx-auto m-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            We collaborate with producers capable of maintaining consistent production standards and
            reliable supply continuity.
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-(--spacing-section-lg) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Introduction
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight m-0 mb-6">
                Our sourcing network includes specialty ingredient manufacturers, agricultural
                producers, and private label partners.
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                We build structured, long-term supply relationships with producers who meet our
                standards for consistency, traceability, and export capability. Our partnerships are
                evaluated against the same criteria we apply to every product in our portfolio.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Partner Profile */}
      <section className="py-(--spacing-section) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <div className="lg:w-72 shrink-0">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Partner Profile
                </p>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight m-0">
                  Who we work with
                </h2>
              </FadeIn>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {partnerProfiles.map((profile, i) => (
                  <FadeIn key={profile.label} delay={i * 0.07}>
                    <div className="bg-cream p-6 rounded-sm border border-mist/30">
                      <div className="w-6 h-px bg-gold mb-4" />
                      <h3 className="font-luxury text-base font-medium text-obsidian m-0 mb-2">
                        {profile.label}
                      </h3>
                      <p className="text-stone text-sm leading-relaxed m-0">{profile.detail}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Focus */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="flex-1">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Collaboration Focus
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight m-0 mb-6">
                  What we look for in a partnership
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <ul className="space-y-4 list-none m-0 p-0">
                  {collaborationFocus.map((item, i) => (
                    <li key={item} className="flex items-start gap-4">
                      <span className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                      <span className="text-stone text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
            <div className="flex-1 max-w-md">
              <FadeIn direction="right" delay={0.2}>
                <div className="bg-obsidian rounded-sm p-10 text-center">
                  <p className="font-luxury italic text-cream/60 text-lg font-light leading-relaxed m-0">
                    &ldquo;We prioritise producers implementing controlled production processes,
                    resource-conscious methods, and supply continuity that our partners can depend
                    upon.&rdquo;
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <span className="inline-block w-8 h-px bg-gold mb-6" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian tracking-tight m-0 mb-4">
                Ready to submit a supplier inquiry?
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-stone text-base leading-relaxed m-0 mb-10">
                Use the contact form and select the supplier inquiry category. Response timelines
                vary depending on inquiry volume and the completeness of your submission.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <MagneticButton>
                <Link
                  href="/contact"
                  className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
                >
                  Submit Supplier Inquiry
                </Link>
              </MagneticButton>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  )
}
