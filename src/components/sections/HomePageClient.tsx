'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { CategoryStrip } from '@/components/sections/CategoryStrip'
import { FeaturedGrid } from '@/components/sections/FeaturedGrid'
import { TestimonialCarousel } from '@/components/sections/TestimonialCarousel'
import { ContactUsSection } from '@/components/sections/NewsletterSection'
import { PartnersMarquee } from '@/components/sections/PartnersMarquee'
import { CollectionCards } from '@/components/sections/CollectionCards'
import { SustainabilitySection } from '@/components/sections/SustainabilitySection'
import { WordReveal } from '@/components/animations/WordReveal'
import { FadeIn } from '@/components/animations/FadeIn'
import ElegantCarousel, { type CarouselSlide } from '@/components/sections/ElegantCarousel'
import type { Product, Category, Testimonial, Supplier, ProductCollection } from '@/payload-types'

const EXPERIENCE_SLIDES: CarouselSlide[] = [
  {
    image: '/images/experience/experience-experts.avif',
    title: 'Curated by Experts',
    subtitle:
      'Our team of culinary specialists personally visits producers, tastes every offering, and selects only ingredients that meet our exacting standards.',
    cta: 'Meet the Team',
    href: '/about',
  },
  {
    image: '/images/experience/experience-dish.avif',
    title: 'From Source to Table',
    subtitle:
      'We work directly with artisans and growers — no middlemen, no compromise. Every product is traceable to its exact origin.',
    cta: 'Our Sourcing',
    href: '/sourcing',
  },
  {
    image: '/images/experience/experience-chef.avif',
    title: 'For Chefs & Home Cooks',
    subtitle:
      'Whether you run a Michelin-starred kitchen or cook for family and friends, our ingredients elevate every dish to something extraordinary.',
    cta: 'Explore Products',
    href: '/products',
  },
]

interface HomePageClientProps {
  featuredProducts: Product[]
  categories: Category[]
  testimonials: Testimonial[]
  suppliers: Supplier[]
  productCollections: ProductCollection[]
}

export function HomePageClient({
  featuredProducts,
  categories,
  testimonials,
  suppliers,
  productCollections,
}: HomePageClientProps) {
  return (
    <>
      <HeroSection />

      {/* Brand philosophy with video background */}
      <section className="relative h-[70vh] md:h-[80vh] lg:h-screen flex items-end overflow-hidden">
        {/* Autoplay background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/planet-philosophy.mp4"
        />
        {/* Gradient overlay — heavier at bottom for text legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10 md:bg-linear-to-tr md:from-black/70 md:via-black/30 md:to-transparent" />

        {/* Content — bottom-left flush */}
        <div className="relative z-10 w-full px-5 md:px-8 lg:px-16 pb-8 md:pb-10 lg:pb-16">
          <div className="max-w-2xl text-left">
            <FadeIn>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-heading font-medium m-0 mb-3 md:mb-4 flex items-center gap-3">
                <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
                Our Philosophy
              </p>
            </FadeIn>
            <WordReveal
              text="Sourced from the world's finest producers, every ingredient in our collection is chosen for its craft, origin, and character — because extraordinary cooking starts with extraordinary produce."
              className="font-luxury text-cream/90 leading-[1.4] tracking-[-0.01em] font-light m-0"
              style={{ fontSize: 'clamp(1.1rem, 2.5vw, 2rem)' }}
            />
          </div>
        </div>
      </section>

      {/* Collection cards */}
      <CollectionCards collections={productCollections} />

      {/* Sustainability */}
      <SustainabilitySection />

      {/* Delicious Experience — elegant carousel */}
      <section className="bg-cream border-t border-mist/40 py-10 md:py-14 lg:py-20">
        <div className="max-w-360 mx-auto px-5 md:px-8 lg:px-16 mb-6 md:mb-8">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-heading font-medium m-0 mb-2 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              The Delicious Experience
            </p>
          </FadeIn>
        </div>
        <ElegantCarousel items={EXPERIENCE_SLIDES} autoPlayInterval={6000} />
      </section>

      {/* Category exploration */}
      <CategoryStrip categories={categories} />

      {/* Featured products */}
      <FeaturedGrid products={featuredProducts} />

      {/* Testimonials */}
      <TestimonialCarousel testimonials={testimonials} />

      {/* Contact Us */}
      <ContactUsSection />

      {/* Partners marquee */}
      <PartnersMarquee suppliers={suppliers} />
    </>
  )
}
