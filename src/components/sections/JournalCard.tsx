'use client'

import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { Eyebrow } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import type { BlogPost, BlogCategory, Media, User } from '@/payload-types'

/** Pulls the display fields off a post, resolving Payload's relation unions. */
export function readPost(post: BlogPost, size: 'card' | 'hero' = 'card') {
  const media = typeof post.featuredImage === 'object' ? (post.featuredImage as Media) : null
  const author = typeof post.author === 'object' && post.author !== null ? (post.author as User) : null

  return {
    href: `/journal/${post.slug}`,
    image: media?.sizes?.[size]?.url ?? media?.url ?? null,
    author: author?.name || author?.email || null,
    category:
      (post.categories ?? [])
        .map((c) => (typeof c === 'object' && c !== null ? (c as BlogCategory).title : null))
        .filter(Boolean)[0] ?? null,
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null,
  }
}

/** "Category · date · author" line above a card title. */
export function PostMeta({
  category,
  date,
  author,
  tone = 'dark',
}: {
  category: string | null
  date: string | null
  author?: string | null
  tone?: 'dark' | 'light'
}) {
  const parts = [date, author ? `By ${author}` : null].filter(Boolean)
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {category ? <Eyebrow tone={tone}>{category}</Eyebrow> : null}
      {parts.length > 0 ? (
        <span
          className={cn(
            'font-sans text-[11px] md:text-xs',
            tone === 'dark' ? 'text-stone/70' : 'text-cream/50',
          )}
        >
          {parts.join(' · ')}
        </span>
      ) : null}
    </div>
  )
}

export function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const p = readPost(post)

  return (
    <FadeIn delay={Math.min(index, 5) * 0.05}>
      <article className="h-full">
        <Link href={p.href} className="group no-underline block h-full">
          <div className="h-full flex flex-col bg-white border border-stone/15 rounded-sm overflow-hidden transition-colors group-hover:border-stone/35">
            <ImagePlaceholder
              src={p.image}
              alt={post.title}
              label="Article image"
              ratio="16/9"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              imageClassName="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="p-4 md:p-5 flex-1 flex flex-col">
              <PostMeta category={p.category} date={p.date} />
              <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2 transition-colors group-hover:text-forest-green">
                {post.title}
              </span>
              {post.excerpt ? (
                <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              ) : null}
              {p.author ? (
                <span className="block font-sans text-[11px] text-stone/60 mt-3 pt-3 border-t border-stone/10">
                  By {p.author}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </article>
    </FadeIn>
  )
}

/** The most recent post, given the full width of the grid. */
export function FeaturedPost({ post }: { post: BlogPost }) {
  const p = readPost(post, 'hero')

  return (
    <FadeIn>
      <article>
        <Link href={p.href} className="group no-underline block">
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-stone/15 rounded-sm overflow-hidden transition-colors group-hover:border-stone/35">
            <div className="lg:col-span-7">
              <ImagePlaceholder
                src={p.image}
                alt={post.title}
                label="Lead article image"
                ratio="16/9"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="h-full"
                imageClassName="transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="lg:col-span-5 p-5 md:p-7 flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <Eyebrow>Latest</Eyebrow>
                <span aria-hidden className="block h-px w-6 bg-forest-green/40" />
              </div>
              <span className="block font-luxury text-xl md:text-2xl font-semibold text-obsidian leading-tight tracking-tight mt-3 transition-colors group-hover:text-forest-green">
                {post.title}
              </span>
              {post.excerpt ? (
                <p className="m-0! mt-3! font-sans text-[13px] md:text-sm text-stone leading-relaxed line-clamp-4">
                  {post.excerpt}
                </p>
              ) : null}
              <div className="mt-4 pt-4 border-t border-stone/10">
                <PostMeta category={p.category} date={p.date} author={p.author} />
              </div>
            </div>
          </div>
        </Link>
      </article>
    </FadeIn>
  )
}

