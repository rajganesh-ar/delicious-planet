'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

export function BecomeVendorCTA() {
  return (
    <section className="relative py-(--spacing-section-lg) overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/misc/become-a-vendor.avif"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-obsidian/55" />

      {/* Glassmorphism card */}
      <div className="relative z-10 px-6 lg:px-16 flex justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl px-8 py-14 lg:px-14 lg:py-16 text-center">
          <FadeIn>
            <span className="inline-block w-8 h-px bg-gold mb-5" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold/80 font-medium m-0 mb-4">
              For Producers &amp; Suppliers
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[48px] font-medium text-cream tracking-tight m-0 mb-6">
              Become a Vendor
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-luxury italic text-cream/60 text-base lg:text-lg font-light leading-relaxed m-0 mb-10 max-w-lg mx-auto">
              We collaborate with producers capable of maintaining consistent production standards
              and reliable supply continuity. Export-capable specialty ingredient manufacturers are
              welcome to apply.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <MagneticButton>
              <Link
                href="/vendors"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
              >
                Partner With Us
              </Link>
            </MagneticButton>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
