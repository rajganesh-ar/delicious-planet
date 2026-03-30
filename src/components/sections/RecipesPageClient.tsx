'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

const cuisines = [
  {
    label: 'Italian Cuisine',
    description:
      'Pasta, risottos, and antipasti showcasing imported grains, premium oils, and aged vinegars.',
    href: '/journal?category=italian',
    image: '/images/collections/pasta.avif',
  },
  {
    label: 'Mediterranean',
    description:
      'Bright, ingredient-led dishes from the coastal regions of Spain, Greece, and North Africa.',
    href: '/journal?category=mediterranean',
    image: '/images/collections/olives.avif',
  },
  {
    label: 'Bakery Applications',
    description:
      'Breads and pastries developed around heritage flour varieties, premium seeds, and artisan honeys.',
    href: '/journal?category=bakery',
    image: '/images/collections/breads.avif',
  },
  {
    label: 'Professional Kitchen',
    description:
      'Technically driven preparations designed for restaurant and catering contexts at scale.',
    href: '/journal?category=professional',
    image: '/images/collections/spices.avif',
  },
  {
    label: 'Vegetarian Preparations',
    description:
      'Ingredient-centred recipes that let pantry staples, condiments, and preserved produce take precedence.',
    href: '/journal?category=vegetarian',
    image: '/images/collections/pantry.avif',
  },
  {
    label: 'Caviar & Fine Dining',
    description:
      'Refined small plates and pairings built around Admiral Caviar and specialty imported ingredients.',
    href: '/journal?category=fine-dining',
    image: '/images/collections/caviar.avif',
  },
]

const topics = [
  'Ingredient Origins',
  'Production Methods',
  'Culinary Techniques',
  'Supplier Stories',
  'Technical Product Insights',
  'Food Culture Analysis',
]

export function RecipesPageClient() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-obsidian py-40 lg:py-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-forest/15 via-obsidian to-obsidian" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Delicious Recipes
          </motion.p>
          <motion.h1
            className="font-luxury text-4xl sm:text-5xl lg:text-[56px] font-light text-cream leading-[1.1] tracking-[-0.03em] m-0 mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Ingredient Functionality,
            <br />
            <span className="text-gold">Culinary Versatility</span>
          </motion.h1>
          <motion.p
            className="font-luxury italic text-cream/60 text-lg lg:text-xl font-light max-w-2xl mx-auto m-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Each recipe connects product characteristics with practical application.
          </motion.p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="flex-1 max-w-xl">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                  Overview
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-obsidian leading-[1.2] tracking-tight m-0 mb-6">
                  Professionally relevant recipes, ingredient-focused preparation
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-5">
                  Our recipe content is developed to demonstrate the functional properties and
                  culinary range of our ingredient portfolio. Each preparation connects technique
                  with product knowledge.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-stone text-base lg:text-lg leading-relaxed m-0">
                  Recipes are written for culinary adaptability — applicable across professional
                  kitchen and home cook contexts, with ingredient substitutions noted where
                  appropriate.
                </p>
              </FadeIn>
            </div>
            <div className="flex-1">
              <FadeIn direction="right" delay={0.2}>
                <div className="bg-parchment rounded-sm p-8 border border-mist/30">
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5">
                    Topics Covered
                  </p>
                  <ul className="space-y-3 list-none m-0 p-0">
                    {topics.map((topic) => (
                      <li key={topic} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        <span className="text-sm text-stone">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="py-(--spacing-section-lg) bg-parchment">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3">
                Cuisine Scope
              </p>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian tracking-tight m-0">
                Browse by Category
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cuisines.map((cuisine, i) => (
              <FadeIn key={cuisine.label} delay={i * 0.08}>
                <Link
                  href={cuisine.href}
                  className="group block bg-cream rounded-sm overflow-hidden border border-mist/30 no-underline"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-mist">
                    <Image
                      src={cuisine.image}
                      alt={cuisine.label}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-luxury text-xl font-medium text-obsidian m-0 mb-2 group-hover:text-gold transition-colors">
                      {cuisine.label}
                    </h3>
                    <p className="text-stone text-sm leading-relaxed m-0">{cuisine.description}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — journal */}
      <section className="py-(--spacing-section) bg-obsidian">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeIn>
            <span className="inline-block w-8 h-px bg-gold mb-8" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream tracking-tight m-0 mb-6 max-w-2xl mx-auto">
              All recipes are published in the Delicious Planet Journal.
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-luxury italic text-cream/50 text-base lg:text-lg font-light m-0 mb-10 max-w-lg mx-auto">
              Origin stories, production insights, and technique-driven recipes — all in one place.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <MagneticButton>
              <Link
                href="/journal"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
              >
                Open The Journal
              </Link>
            </MagneticButton>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
