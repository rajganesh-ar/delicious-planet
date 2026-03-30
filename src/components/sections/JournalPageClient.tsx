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

        <h3 className="font-serif text-xl lg:text-2xl font-medium m-0 mb-2 group-hover:text-gold transition-colors leading-snug">
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
      <section className="pt-32 pb-16 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The Journal
          </motion.p>
          <motion.h1
            className="font-serif text-4xl lg:text-[50px] font-medium text-obsidian tracking-[-0.04em] m-0 mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Stories & Insights
          </motion.h1>
          <motion.p
            className="text-stone text-lg max-w-xl m-0"
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
        <section className="bg-cream border-b border-mist/40">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="flex gap-6 overflow-x-auto py-4 -mb-px">
              <button
                onClick={() => setActiveCategory(null)}
                className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
                  !activeCategory
                    ? 'border-gold text-gold font-medium'
                    : 'border-transparent text-stone hover:text-obsidian'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
                    activeCategory === cat.slug
                      ? 'border-gold text-gold font-medium'
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
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-stone text-lg m-0">No posts found in this category.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/journal?page=${page}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-sm text-sm no-underline transition-colors ${
                    page === currentPage
                      ? 'bg-gold text-obsidian font-medium'
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
