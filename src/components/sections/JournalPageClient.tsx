'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { FeaturedPost, PostCard } from '@/components/sections/JournalCard'
import { BAND, Cta, Eyebrow, GUTTER, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import type { BlogPost, BlogCategory } from '@/payload-types'

interface JournalPageClientProps {
  posts: BlogPost[]
  categories: BlogCategory[]
  totalPages: number
  currentPage: number
  /** Category to open on, from `?category=` — already validated server-side. */
  initialCategory?: string | null
}

export function JournalPageClient({
  posts,
  categories,
  totalPages,
  currentPage,
  initialCategory = null,
}: JournalPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory)

  const filteredPosts = activeCategory
    ? posts.filter((p) =>
        (p.categories ?? []).some(
          (c) => typeof c === 'object' && c !== null && (c as BlogCategory).slug === activeCategory,
        ),
      )
    : posts

  // The lead card only earns its width when there is a grid beneath it.
  const showFeatured = !activeCategory && currentPage === 1 && filteredPosts.length >= 3
  const [featured, ...rest] = filteredPosts
  const gridPosts = showFeatured ? rest : filteredPosts

  // Filtering happens client-side over the current page only, so paging
  // through a filtered view would silently skip matches on other pages.
  const showPagination = totalPages > 1 && !activeCategory

  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 lg:items-end">
            <div className="lg:col-span-7">
              <FadeIn>
                <Eyebrow tone="light">The journal</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Stories &amp; <span className="text-gold">insights</span>
                  </span>
                </h1>
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={0.12}>
                <p className="m-0! font-sans text-cream/75 text-sm md:text-base leading-relaxed lg:text-right">
                  Recipes, origin stories, and behind-the-scenes from the world of premium
                  ingredients.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2 · CATEGORY FILTER ════════════════════════════════ */}
      {categories.length > 0 && (
        <section
          className={cn(GUTTER, 'bg-cream border-b border-stone/12 sticky z-30')}
          style={{ top: 'var(--header-h)' }}
          aria-label="Filter by category"
        >
          <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:thin]">
            {[{ slug: null, title: 'All' }, ...categories].map((cat) => {
              const active = activeCategory === cat.slug
              return (
                <button
                  key={cat.slug ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={cn(
                    'shrink-0 h-9 px-4 rounded-sm border cursor-pointer transition-colors font-sans text-[11px] uppercase tracking-[0.14em] font-medium',
                    active
                      ? 'bg-forest-green border-forest-green text-cream'
                      : 'bg-white border-stone/20 text-stone hover:border-stone/40 hover:text-obsidian',
                  )}
                >
                  {cat.title}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ 3 · POSTS ══════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        {filteredPosts.length > 0 ? (
          <>
            {showFeatured ? (
              <div className="mb-3 md:mb-4">
                <FeaturedPost post={featured} />
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {gridPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {showPagination ? (
              <nav
                aria-label="Pagination"
                className="flex justify-center flex-wrap gap-2 mt-6 md:mt-8"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const current = page === currentPage
                  return (
                    <Link
                      key={page}
                      href={`/journal?page=${page}`}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'w-9 h-9 flex items-center justify-center rounded-sm border no-underline transition-colors',
                        current
                          ? 'bg-forest-green border-forest-green'
                          : 'bg-white border-stone/20 hover:border-stone/40',
                      )}
                    >
                      <span
                        className={cn(
                          'font-sans text-[12px]',
                          current ? 'text-cream font-medium' : 'text-stone',
                        )}
                      >
                        {page}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            ) : null}
          </>
        ) : (
          <FadeIn>
            <div className="bg-white border border-stone/15 rounded-sm px-6 py-10 md:py-14 text-center">
              <span className="inline-flex w-12 h-12 rounded-sm bg-parchment items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="text-stone/60"
                >
                  <path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z" />
                  <path d="M19 8h1.5a1.5 1.5 0 0 1 1.5 1.5V18a2 2 0 0 1-2 2" />
                  <path d="M8 8h7M8 12h7M8 16h4" />
                </svg>
              </span>
              <span className="block font-luxury text-lg md:text-xl font-semibold text-obsidian leading-tight mt-4">
                {activeCategory ? 'Nothing in this category yet' : 'No articles published yet'}
              </span>
              {/* Centring lives on the wrapper: `m-0!` on the <p> is important
                  (it has to beat the unlayered base rule) and would kill mx-auto. */}
              <div className="max-w-md mx-auto mt-2">
                <p className="m-0! font-sans text-[13px] text-stone leading-relaxed">
                  {activeCategory
                    ? 'Try another category, or browse everything we have published so far.'
                    : 'Recipes, origin stories and sourcing notes are on the way. In the meantime, the catalogue is the best place to start.'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {activeCategory ? (
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="group inline-flex items-center justify-center h-11 px-7 bg-forest-green border-0 rounded-sm cursor-pointer transition-colors hover:bg-bud-green"
                  >
                    <span className="text-cream text-[11px] uppercase tracking-[0.16em] font-heading font-semibold">
                      Show all articles
                    </span>
                  </button>
                ) : (
                  <Cta href="/products">Browse products</Cta>
                )}
                <Cta href="/recipes" variant="dark-outline">
                  Recipes
                </Cta>
              </div>
            </div>
          </FadeIn>
        )}
      </section>

      {/* ═══ 4 · SOURCING NUDGE ═════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Beyond the journal"
          title="Where the stories come from"
          lede="The sourcing model and the standards behind every product we list."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {[
            {
              href: '/sourcing',
              title: 'Our sourcing',
              body: 'How suppliers are selected, evaluated, and onboarded.',
            },
            {
              href: '/sustainability',
              title: 'Sustainability',
              body: 'The environmental, social, and governance work underneath.',
            },
            {
              href: '/experiences',
              title: 'Our ecosystem',
              body: 'From farms and processing to restaurants and retail.',
            },
          ].map((l, i) => (
            <FadeIn key={l.href} delay={i * 0.06}>
              <Link href={l.href} className="group block no-underline h-full">
                <div className="h-full bg-white border border-stone/15 rounded-sm p-4 md:p-5 hover:border-stone/35 transition-colors">
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                    {l.title}
                  </span>
                  <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                    {l.body}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green">
                    Read more
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}
