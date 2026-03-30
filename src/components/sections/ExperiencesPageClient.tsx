'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import type { Category, Media } from '@/payload-types'

interface ExperiencesPageClientProps {
  categories: Category[]
}

const themes = [
  {
    title: 'The Art of Caviar',
    description:
      'Discover the ancient craft of caviar production, from the pristine Caspian Sea to your table. Our Admiral Caviar partnership brings you the finest Beluga, Oscietra, and Sevruga.',
    accent: 'gold',
    bgClass: 'bg-obsidian',
    textClass: 'text-cream',
  },
  {
    title: 'Mediterranean Oils & Vinegars',
    description:
      'Sun-drenched groves across Italy, Spain, and Greece yield oils of extraordinary depth. Cold-pressed within hours of harvest, each bottle tells the story of its terroir.',
    accent: 'forest',
    bgClass: 'bg-parchment',
    textClass: 'text-obsidian',
  },
  {
    title: 'Rare Spices & Seasonings',
    description:
      'From the saffron fields of Iran to the vanilla orchids of Madagascar, we source spices at the peak of their potency — hand-harvested, sun-dried, and perfectly packed.',
    accent: 'gold',
    bgClass: 'bg-forest',
    textClass: 'text-cream',
  },
  {
    title: 'Artisan Chocolates & Confections',
    description:
      'Single-origin cacao transformed by master chocolatiers into creations of unparalleled complexity. Bean-to-bar excellence from Ecuador, Venezuela, and beyond.',
    accent: 'gold',
    bgClass: 'bg-obsidian',
    textClass: 'text-cream',
  },
]

function ParallaxThemeSection({ theme, index }: { theme: (typeof themes)[number]; index: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [target, setTarget] = useState<HTMLDivElement | null>(null)

  const refCallback = (node: HTMLDivElement | null) => {
    containerRef.current = node
    setTarget(node)
  }

  const { scrollYProgress } = useScroll({
    ...(target ? { target: { current: target } } : {}),
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  const isEven = index % 2 === 0

  return (
    <section
      ref={refCallback}
      className={`relative py-(--spacing-section-lg) overflow-hidden ${theme.bgClass}`}
    >
      <motion.div style={{ y }} className="absolute inset-0 opacity-10">
        <div className="w-full h-[120%] bg-gradient-to-br from-current to-transparent" />
      </motion.div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div
          className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
        >
          <div className="flex-1 max-w-xl">
            <FadeIn>
              <span
                className={`text-xs uppercase tracking-[0.3em] font-medium text-${theme.accent} mb-3 block`}
              >
                Experience {String(index + 1).padStart(2, '0')}
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2
                className={`font-serif text-3xl lg:text-[44px] font-medium tracking-tight leading-[1.1] m-0 mb-6 ${theme.textClass}`}
              >
                {theme.title}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className={`text-lg leading-relaxed m-0 mb-8 ${theme.textClass} opacity-70`}>
                {theme.description}
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <MagneticButton>
                <Link
                  href="/products"
                  className={`inline-block text-sm uppercase tracking-widest no-underline border-b pb-1 text-${theme.accent} border-${theme.accent}/40 hover:border-${theme.accent} transition-colors`}
                >
                  Explore Products
                </Link>
              </MagneticButton>
            </FadeIn>
          </div>

          <div className="flex-1 max-w-lg w-full">
            <FadeIn direction={isEven ? 'right' : 'left'} delay={0.2}>
              <div className="aspect-[3/4] rounded-sm overflow-hidden bg-stone/20">
                <div className={`w-full h-full ${theme.bgClass} opacity-30`} />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ExperiencesPageClient({ categories }: ExperiencesPageClientProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-obsidian overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-charcoal to-forest opacity-90" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Curated Experiences
          </motion.p>
          <motion.h1
            className="font-serif text-4xl sm:text-5xl lg:text-[50px] font-medium text-cream leading-[1.1] tracking-[-0.04em] m-0"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            The World Through <span className="text-gold">Flavour</span>
          </motion.h1>
          <motion.p
            className="text-cream/60 text-lg mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Immerse yourself in the stories, origins, and craft behind every ingredient
          </motion.p>
        </div>
      </section>

      {/* Theme sections */}
      {themes.map((theme, i) => (
        <ParallaxThemeSection key={theme.title} theme={theme} index={i} />
      ))}

      {/* Categories CTA */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl lg:text-[44px] font-medium text-obsidian tracking-tight m-0 mb-4">
              Browse by Category
            </h2>
            <p className="text-stone text-lg m-0 mb-12 max-w-lg mx-auto">
              Find exactly what you&apos;re looking for in our curated collections
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => {
              const imgUrl =
                typeof cat.image === 'object' && cat.image !== null
                  ? ((cat.image as Media).sizes?.card?.url ?? (cat.image as Media).url ?? null)
                  : null
              return (
                <FadeIn key={cat.id} delay={i * 0.05}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group block no-underline text-obsidian"
                  >
                    <div className="aspect-square rounded-sm overflow-hidden bg-parchment mb-3 relative">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={cat.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-parchment to-mist" />
                      )}
                    </div>
                    <p className="text-sm font-medium m-0 group-hover:text-gold transition-colors">
                      {cat.title}
                    </p>
                  </Link>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
