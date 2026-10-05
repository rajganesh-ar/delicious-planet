'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { Cta, Eyebrow, GUTTER } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import { siteImage } from '@/lib/site-image'

/**
 * Recipes — the carte archetype.
 *
 * The only page on the site that opens on a light ground: a framed menu head
 * on parchment, then a bill of fare where each kitchen is a line with a dotted
 * leader, and a plate panel on the right that follows whichever line you are
 * reading. Same tokens as everywhere else (gutter, type ramp, `rounded-sm`,
 * forest actions) — a different spine.
 *
 * styles.css declares unlayered `a`, `h1`–`h6` and `p` rules that outrank
 * Tailwind's layered utilities, so colour lives on child spans and margins
 * carry `!`.
 */

const MEDIA = {
  cta: { src: siteImage('/images/recipes/journal-band.avif'), label: 'Kitchen at service — full bleed' },
}

type Course = {
  /** Category slug on the journal; the filter falls back to All if unknown. */
  slug: string
  course: string
  title: string
  description: string
  image: string
}

/**
 * Images are real files in R2 under site/images/recipes, 4:5 to match the plate
 * panel. They used to borrow the category tiles, so every plate repeated a
 * picture from the homepage; each kitchen has its own photo now.
 */
const MENU: Course[] = [
  {
    slug: 'italian',
    course: 'First courses',
    title: 'Italian cuisine',
    description:
      'Pasta, risotti and antipasti built on imported grains, single-estate oils and aged vinegars.',
    image: siteImage('/images/recipes/italian.avif'),
  },
  {
    slug: 'mediterranean',
    course: 'Coastal',
    title: 'Mediterranean',
    description: 'Bright, ingredient-led plates from the coasts of Spain, Greece and North Africa.',
    image: siteImage('/images/recipes/mediterranean.avif'),
  },
  {
    slug: 'bakery',
    course: 'Bakery',
    title: 'Bakery applications',
    description:
      'Breads and pastries developed around heritage flours, premium seeds and single-origin honeys.',
    image: siteImage('/images/recipes/bakery.avif'),
  },
  {
    slug: 'professional',
    course: 'Service',
    title: 'Professional kitchen',
    description:
      'Technically driven preparations sized for restaurant and catering service, with yields stated.',
    image: siteImage('/images/recipes/professional-kitchen.avif'),
  },
  {
    slug: 'vegetarian',
    course: 'Vegetable',
    title: 'Vegetarian preparations',
    description:
      'Dishes that let pantry staples, condiments and preserved produce carry the plate.',
    image: siteImage('/images/recipes/vegetarian.avif'),
  },
  {
    slug: 'fine-dining',
    course: 'Fine dining',
    title: 'Caviar & fine dining',
    description:
      'Refined small plates and pairings built around Admiral Caviar and specialty imports.',
    image: siteImage('/images/recipes/fine-dining.avif'),
  },
]

const MISE_EN_PLACE = [
  {
    title: 'Ingredient origins',
    body: 'Where the key ingredient comes from, and what the growing region does to it.',
  },
  {
    title: 'Production methods',
    body: 'How it was pressed, milled, cured or aged — because that decides how it behaves.',
  },
  {
    title: 'Culinary techniques',
    body: 'The method written out step by step, with the reasoning behind each one.',
  },
  {
    title: 'Supplier stories',
    body: 'The producer behind the ingredient, and why we list them.',
  },
  {
    title: 'Technical notes',
    body: 'Smoke points, hydration, yields and shelf life — the numbers a kitchen needs.',
  },
  {
    title: 'Substitutions',
    body: 'What to reach for when a line is out of season, and how the result shifts.',
  },
]

export function RecipesPageClient() {
  const [active, setActive] = useState(0)
  const plate = MENU[active]

  return (
    <div className="bg-cream">
      {/* ═══ 1 · THE CARTE — framed menu head on a light ground ══ */}
      <section className={cn(GUTTER, 'bg-parchment py-10 md:py-16')}>
        {/* max-w + mx-auto live on the wrapper: `m-0!` below cancels auto margins. */}
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <Eyebrow className="text-center">Recipes</Eyebrow>
          </FadeIn>
          <FadeIn delay={0.06}>
            <div className="mt-4 border-y border-obsidian/15 py-5 md:py-7">
              <h1 className="m-0!">
                <span className="block font-luxury text-obsidian font-semibold leading-[1.08] tracking-tight text-[clamp(2rem,5.5vw,3.75rem)]">
                  Ingredient first,
                  <br />
                  <span className="text-forest-green">method second</span>
                </span>
              </h1>
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="m-0! mt-5! font-sans text-stone text-sm md:text-base leading-relaxed">
              Every recipe here exists to show what an ingredient actually does — how it behaves
              under heat, what it yields, and where it will and won&apos;t hold. Written to be
              cooked in a service kitchen and at home alike.
            </p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p className="m-0! mt-5! font-sans text-[11px] md:text-[12px] uppercase tracking-[0.16em] text-stone/70">
              {MENU.length} kitchens
              <span className="text-stone/30"> · </span>
              technique-led
              <span className="text-stone/30"> · </span>
              substitutions noted
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 2 · THE BILL OF FARE ═══════════════════════════════ */}
      <section className={cn(GUTTER, 'py-8 md:py-11')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <FadeIn>
              <Eyebrow>The carte</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-xl sm:text-2xl lg:text-[28px] font-semibold text-obsidian tracking-tight">
                  Browse by kitchen
                </span>
              </h2>
            </FadeIn>

            <ul className="list-none m-0 p-0 mt-5 md:mt-7 border-t border-obsidian/20">
              {MENU.map((entry, i) => (
                <li key={entry.slug}>
                  <Link
                    href={`/journal?category=${entry.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group block no-underline border-b border-stone/12 py-4 md:py-5"
                  >
                    <span className="flex items-start gap-4">
                      {/* The plate panel is lg-only, so small screens get the
                          picture inline rather than losing it. */}
                      <span className="lg:hidden relative w-16 h-16 shrink-0 bg-mist rounded-sm overflow-hidden">
                        <Image
                          src={entry.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green">
                          {entry.course}
                        </span>

                        {/* Menu line: name, dotted leader, arrow. */}
                        <span className="mt-1.5 flex items-end gap-3">
                          <h3 className="m-0!">
                            <span className="block font-luxury text-lg md:text-xl font-semibold text-obsidian leading-none group-hover:text-forest-green transition-colors">
                              {entry.title}
                            </span>
                          </h3>
                          <span
                            aria-hidden
                            className="flex-1 border-b border-dotted border-stone/40 mb-0.5"
                          />
                          <span
                            aria-hidden
                            className="font-sans text-[13px] leading-none text-stone/50 group-hover:text-forest-green transition-colors"
                          >
                            →
                          </span>
                        </span>

                        <span className="block mt-2 font-sans text-[12.5px] md:text-[13px] text-stone leading-relaxed max-w-xl">
                          {entry.description}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Plate panel — follows whichever line is being read. */}
          <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div className="relative w-full aspect-4/5 bg-mist rounded-sm overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={plate.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={plate.image}
                    alt={plate.title}
                    fill
                    sizes="40vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-obsidian/85 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="block font-sans text-[10px] uppercase tracking-[0.16em] text-gold">
                  {plate.course}
                </span>
                <span className="block font-luxury text-xl font-semibold text-cream leading-tight mt-1.5">
                  {plate.title}
                </span>
              </div>
            </div>

            <p className="m-0! mt-3! font-sans text-[11.5px] text-stone leading-relaxed">
              Every kitchen opens the journal filtered to that category. Recipes are published there
              as they are developed.
            </p>
          </aside>
        </div>
      </section>

      {/* ═══ 3 · MISE EN PLACE ══════════════════════════════════ */}
      <section className={cn(GUTTER, 'bg-parchment py-8 md:py-11')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          <div className="lg:col-span-4">
            <FadeIn>
              <Eyebrow>Mise en place</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-xl sm:text-2xl lg:text-[28px] font-semibold text-obsidian tracking-tight">
                  What every recipe carries
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
                A method on its own is a guess. Each write-up sets out where the ingredient came
                from and how it behaves before it asks you to cook anything.
              </p>
            </FadeIn>
          </div>

          <ol className="list-none m-0 p-0 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-10">
            {MISE_EN_PLACE.map((item, i) => (
              // FadeIn renders a <div>, so it sits inside the <li>, not around it.
              <li key={item.title} className="border-t border-obsidian/15 py-3.5">
                <FadeIn delay={i * 0.05}>
                  <span className="block font-luxury text-[11px] font-semibold text-forest-green tracking-[0.16em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="m-0! mt-1.5!">
                    <span className="block font-luxury text-base font-semibold text-obsidian leading-tight">
                      {item.title}
                    </span>
                  </h3>
                  <p className="m-0! mt-1.5! font-sans text-[12.5px] text-stone leading-relaxed">
                    {item.body}
                  </p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ 4 · THE JOURNAL ════════════════════════════════════ */}
      <section className="relative bg-obsidian">
        <ImagePlaceholder
          {...MEDIA.cta}
          tone="dark"
          glyph={false}
          sizes="100vw"
          className="min-h-76 md:min-h-92"
          imageClassName="object-cover"
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-linear-to-r from-obsidian via-obsidian/80 to-obsidian/30"
          />
          <div className="absolute inset-0 flex items-center">
            <div className={cn(GUTTER, 'w-full')}>
              <div className="max-w-xl">
                <Eyebrow tone="light">Where they live</Eyebrow>
                <h2 className="m-0! mt-2.5!">
                  <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-[34px]">
                    Every recipe is published in the journal
                  </span>
                </h2>
                <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed">
                  Alongside the origin stories and production notes they draw on — one place,
                  filtered however you want to read it.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Cta href="/journal" variant="light">
                    Open the journal
                  </Cta>
                  <Cta href="/products" variant="outline">
                    Shop the ingredients
                  </Cta>
                </div>
              </div>
            </div>
          </div>
        </ImagePlaceholder>
      </section>
    </div>
  )
}
