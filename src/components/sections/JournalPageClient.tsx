'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import type { BlogPost, BlogCategory, Media, User } from '@/payload-types'

interface JournalPageClientProps {
  posts: BlogPost[]
  categories: BlogCategory[]
  totalPages: number
  currentPage: number
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const imgUrl =
    typeof post.featuredImage === 'object' && post.featuredImage !== null
      ? ((post.featuredImage as Media).sizes?.card?.url ??
        (post.featuredImage as Media).url ??
        null)
      : null

  const author =
    typeof post.author === 'object' && post.author !== null ? (post.author as User) : null

  const categoryNames = (post.categories ?? [])
    .map((c) => (typeof c === 'object' && c !== null ? (c as BlogCategory).title : null))
    .filter(Boolean)

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <FadeIn delay={index * 0.05}>
      <Link href={`/journal/${post.slug}`} className="group block no-underline text-obsidian">
        <div className="aspect-[16/10] rounded-sm overflow-hidden bg-parchment mb-4 relative">
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-parchment to-mist" />
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-2 text-xs text-stone">
          {categoryNames.length > 0 && (
            <span className="text-gold uppercase tracking-widest font-medium">
              {categoryNames[0]}
            </span>
          )}
          {date && <span>{date}</span>}
        </div>

        <h3 className="font-luxury text-[18px] sm:text-[20px] md:text-[22px] lg:text-2xl font-medium m-0 mb-2 group-hover:text-forest-green transition-colors leading-snug">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-stone text-sm leading-relaxed m-0 line-clamp-2">{post.excerpt}</p>
        )}

        {author && (
          <p className="text-xs text-stone/60 m-0 mt-3">By {author.name || author.email}</p>
        )}
      </Link>
    </FadeIn>
  )
}

export function JournalPageClient({
  posts,
  categories,
  totalPages,
  currentPage,
}: JournalPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredPosts = activeCategory
    ? posts.filter((p) =>
        (p.categories ?? []).some(
          (c) => typeof c === 'object' && c !== null && (c as BlogCategory).slug === activeCategory,
        ),
      )
    : posts

  return (
    <>
      {/* Hero */}
      <section className="relative bg-obsidian overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.p
            className="text-[11px] uppercase tracking-[0.22em] text-gold/80 font-heading font-medium m-0 mb-4 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
            The Journal
          </motion.p>
          <motion.h1
            className="font-luxury text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] xl:text-[56px] font-medium m-0 text-cream tracking-[-0.03em] leading-[1.08]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Stories &amp; Insights
          </motion.h1>
          <motion.p
            className="text-cream/60 text-[15px] sm:text-[16px] mt-4 mb-0 max-w-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Recipes, origin stories, and behind-the-scenes from the world of premium ingredients.
          </motion.p>
        </div>
      </section>

      {/* Category tabs */}
      {categories.length > 0 && (
        <section className="bg-cream border-b border-mist/60 sticky z-30" style={{ top: 'var(--header-h)' }}>
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
            <div className="flex gap-5 sm:gap-6 overflow-x-auto py-3 sm:py-4 -mb-px">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
                  !activeCategory
                    ? 'border-forest-green text-forest-green font-medium'
                    : 'border-transparent text-stone hover:text-obsidian'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
                    activeCategory === cat.slug
                      ? 'border-forest-green text-forest-green font-medium'
                      : 'border-transparent text-stone hover:text-obsidian'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts grid */}
      <section className="bg-cream py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <p className="text-stone text-lg m-0">No posts found in this category.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12 sm:mt-16 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/journal?page=${page}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-sm text-sm no-underline transition-colors ${
                    page === currentPage
                      ? 'bg-forest-green text-cream font-medium'
                      : 'bg-parchment text-stone hover:bg-mist'
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
