'use client'

import ElegantCarousel, { type CarouselSlide } from '@/components/sections/ElegantCarousel'
import { SectionHeader } from './SectionHeader'
import { siteImage } from '@/lib/site-image'

const EXPERIENCE_SLIDES: CarouselSlide[] = [
  {
    image: siteImage('/images/home/experience-curated.avif'),
    title: 'Curated by Experts',
    subtitle:
      'Our team of culinary specialists personally visits producers, tastes every offering, and selects only ingredients that meet our exacting standards.',
    cta: 'Meet the Team',
    href: '/about',
  },
  {
    image: siteImage('/images/home/experience-source-to-table.avif'),
    title: 'From Source to Table',
    subtitle:
      'We work directly with artisans and growers — no middlemen, no compromise. Every product is traceable to its exact origin.',
    cta: 'Our Sourcing',
    href: '/sourcing',
  },
  {
    image: siteImage('/images/home/experience-cooks.avif'),
    title: 'For Chefs & Home Cooks',
    subtitle:
      'Whether you run a Michelin-starred kitchen or cook for family and friends, our ingredients elevate every dish to something extraordinary.',
    cta: 'Explore Products',
    href: '/products',
  },
]

/** "The Delicious Experience" — restored from the previous homepage. */
export function ExperienceCarousel() {
  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="The Delicious Experience" className="mb-5 md:mb-7" />
      <ElegantCarousel items={EXPERIENCE_SLIDES} autoPlayInterval={6000} padded={false} />
    </section>
  )
}
