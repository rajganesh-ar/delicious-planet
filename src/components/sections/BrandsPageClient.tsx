'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import type { Supplier, Media } from '@/payload-types'

interface BrandsPageClientProps {
  suppliers: Supplier[]
}

export function BrandsPageClient({ suppliers }: BrandsPageClientProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-obsidian py-24 sm:py-32 md:py-40 lg:py-52 overflow-hidden pt-32 sm:pt-36">
        <div className="absolute inset-0 bg-gradient-to-br from-espresso/80 via-obsidian to-obsidian" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our Brands
          </motion.p>
          <motion.h1
            className="font-luxury text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] xl:text-[56px] font-light text-cream leading-[1.08] tracking-[-0.03em] m-0 mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            The Producers
            <br />
            <span className="text-gold">Behind Every Ingredient</span>
          </motion.h1>
          <motion.p
            className="font-luxury italic text-cream/60 text-lg lg:text-xl font-light max-w-2xl mx-auto m-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Internationally recognised producers selected for consistency, technical expertise, and
            professional kitchen relevance.
          </motion.p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight m-0 mb-6">
                A curated portfolio of specialty brands and proprietary products
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                Each brand in our portfolio is selected based on product specialisation, production
                reliability, and professional kitchen relevance. Our network includes specialty
                ingredient producers across Europe and global markets.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Brands grid */}
      {suppliers.length > 0 ? (
        <section className="py-(--spacing-section-lg) bg-parchment">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {suppliers.map((supplier, i) => {
                const logoUrl =
                  typeof supplier.logo === 'object' && supplier.logo !== null
                    ? ((supplier.logo as Media).url ?? null)
                    : null

                return (
                  <FadeIn key={supplier.id} delay={i * 0.08}>
                    <div className="bg-cream rounded-sm border border-mist/30 overflow-hidden flex flex-col">
                      {/* Logo area */}
                      <div className="aspect-[16/9] bg-parchment flex items-center justify-center p-8 border-b border-mist/20">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={supplier.name}
                            width={200}
                            height={80}
                            className="max-h-16 w-auto object-contain"
                          />
                        ) : (
                          <p className="font-luxury text-2xl font-medium text-obsidian/40 text-center">
                            {supplier.name}
                          </p>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-luxury text-xl font-medium text-obsidian m-0">
                            {supplier.name}
                          </h3>
                          <span className="text-xs text-stone bg-parchment px-2 py-1 rounded-sm shrink-0 border border-mist/30">
                            {supplier.country}
                          </span>
                        </div>

                        {supplier.description && (
                          <p className="text-stone text-sm leading-relaxed m-0 mb-4 flex-1">
                            {supplier.description}
                          </p>
                        )}

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-mist/30">
                          <Link
                            href={`/products?supplier=${supplier.slug}`}
                            className="text-xs uppercase tracking-widest text-gold font-medium no-underline hover:text-gold/70 transition-colors"
                          >
                            View Products
                          </Link>
                          {supplier.website && (
                            <a
                              href={
                                supplier.website.startsWith('http')
                                  ? supplier.website
                                  : `https://${supplier.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-stone/60 hover:text-stone transition-colors no-underline"
                            >
                              Website ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-(--spacing-section-lg) bg-parchment">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
            <FadeIn>
              <p className="text-stone text-lg">Portfolio details coming soon.</p>
            </FadeIn>
          </div>
        </section>
      )}

      {/* CTA — become a vendor */}
      <section className="py-(--spacing-section) bg-obsidian">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4">
              For Producers
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream tracking-tight m-0 mb-6 max-w-2xl mx-auto">
              Interested in joining our brand portfolio?
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
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
      </section>
    </>
  )
}
