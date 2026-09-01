'use client'

import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder, RichText } from '@/components/ui'
import { PostCard } from '@/components/sections/JournalCard'
import { BAND, Cta, Eyebrow, GUTTER, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import type { BlogPost, BlogCategory, Media, User } from '@/payload-types'

interface JournalPostClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

function imageUrl(post: BlogPost, size: 'card' | 'hero') {
  const media = typeof post.featuredImage === 'object' ? (post.featuredImage as Media) : null
  return media?.sizes?.[size]?.url ?? media?.url ?? null
}

function formatDate(value?: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function JournalPostClient({ post, relatedPosts }: JournalPostClientProps) {
  const heroImg = imageUrl(post, 'hero')
  const author = typeof post.author === 'object' ? (post.author as User) : null
  const authorLabel = author?.name || author?.email || null
  const categories = (post.categories ?? []).filter(
    (c): c is BlogCategory => typeof c === 'object' && c !== null,
  )
  const date = formatDate(post.publishedAt)

  return (
    <div className="bg-cream">
      {/* ═══ 1 · HEADER ═════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-8 pb-8 md:pt-10 md:pb-10')}>
          {/* Colour sits on the span — `a { color: currentColor }` in styles.css
              is unlayered and outranks text utilities on the anchor itself. */}
          <FadeIn>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2">
              <Link href="/journal" className="group no-underline">
                <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-cream/45 group-hover:text-cream transition-colors">
                  Journal
                </span>
              </Link>
              <span aria-hidden className="text-cream/25 text-[11px]">
                /
              </span>
              <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-cream/70 line-clamp-1">
                {post.title}
              </span>
            </nav>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 mt-5 lg:items-end">
            <div className="lg:col-span-8">
              {categories.length > 0 ? (
                <FadeIn delay={0.04}>
                  <Eyebrow tone="light">{categories[0].title}</Eyebrow>
                </FadeIn>
              ) : null}
              <FadeIn delay={0.08}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.15] tracking-tight text-[clamp(1.6rem,4vw,2.75rem)]">
                    {post.title}
                  </span>
                </h1>
              </FadeIn>
            </div>

            <div className="lg:col-span-4">
              <FadeIn delay={0.12}>
                <dl className="m-0 flex flex-wrap lg:justify-end gap-x-8 gap-y-2">
                  {date ? (
                    <div>
                      <dt className="font-sans text-[10px] uppercase tracking-[0.16em] text-cream/40">
                        Published
                      </dt>
                      <dd className="m-0 font-sans text-[12.5px] text-cream mt-1">{date}</dd>
                    </div>
                  ) : null}
                  {authorLabel ? (
                    <div>
                      <dt className="font-sans text-[10px] uppercase tracking-[0.16em] text-cream/40">
                        Written by
                      </dt>
                      <dd className="m-0 font-sans text-[12.5px] text-cream mt-1">{authorLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2 · ARTICLE ════════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
          {/* Body */}
          <div className="lg:col-span-8">
            {heroImg || post.excerpt ? (
              <FadeIn>
                <ImagePlaceholder
                  src={heroImg}
                  alt={post.title}
                  label={post.title}
                  ratio="16/9"
                  priority
                  sizes="(max-width: 1024px) 100vw, 64vw"
                  className="rounded-sm mb-5 md:mb-7"
                />
              </FadeIn>
            ) : null}

            {post.excerpt ? (
              <FadeIn delay={0.04}>
                <p className="m-0! mb-5! md:mb-7! font-sans text-base md:text-lg text-obsidian leading-relaxed border-l-2 border-forest-green pl-4 md:pl-5">
                  {post.excerpt}
                </p>
              </FadeIn>
            ) : null}

            <FadeIn delay={0.08}>
              <RichText content={post.content} />
            </FadeIn>
          </div>

          {/* Aside */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-3 md:gap-4">
            {categories.length > 0 ? (
              <FadeIn delay={0.1}>
                <div className="bg-white border border-stone/15 rounded-sm p-4 md:p-5">
                  <Eyebrow>Filed under</Eyebrow>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {categories.map((c) => (
                      <span
                        key={c.id}
                        className="font-sans text-[11px] text-stone border border-stone/20 rounded-sm px-2.5 py-1"
                      >
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ) : null}

            <FadeIn delay={0.14}>
              <div className="bg-obsidian rounded-sm p-4 md:p-5">
                <Eyebrow tone="light">From the source</Eyebrow>
                <span className="block font-luxury text-base md:text-lg font-semibold text-cream leading-tight mt-2">
                  Every story starts at origin
                </span>
                <p className="m-0! mt-2! font-sans text-[12.5px] text-cream/70 leading-relaxed">
                  The producers behind these articles supply the catalogue too.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Cta href="/products" variant="light">
                    Shop
                  </Cta>
                  <Cta href="/sourcing" variant="outline">
                    Sourcing
                  </Cta>
                </div>
              </div>
            </FadeIn>
          </aside>
        </div>
      </section>

      {/* ═══ 3 · RELATED ════════════════════════════════════════ */}
      {relatedPosts.length > 0 && (
        <section className={cn(GUTTER, BAND, 'bg-parchment')}>
          <SectionHead
            eyebrow="Keep reading"
            title="Related articles"
            lede="More from the same corner of the catalogue."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {relatedPosts.map((rp, i) => (
              <PostCard key={rp.id} post={rp} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
