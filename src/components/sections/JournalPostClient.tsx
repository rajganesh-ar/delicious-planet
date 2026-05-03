'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import type { BlogPost, BlogCategory, Media, User } from '@/payload-types'

interface JournalPostClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export function JournalPostClient({ post, relatedPosts }: JournalPostClientProps) {
  const imgUrl =
    typeof post.featuredImage === 'object' && post.featuredImage !== null
      ? ((post.featuredImage as Media).sizes?.hero?.url ??
        (post.featuredImage as Media).url ??
        null)
      : null

  const author =
    typeof post.author === 'object' && post.author !== null ? (post.author as User) : null

  const categories = (post.categories ?? [])
    .map((c) => (typeof c === 'object' && c !== null ? (c as BlogCategory) : null))
    .filter(Boolean) as BlogCategory[]

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-cream">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <motion.div
            className="flex items-center gap-2 text-xs text-stone mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/journal"
              className="text-stone no-underline hover:text-gold transition-colors"
            >
              Journal
            </Link>
            <span>/</span>
            <span className="text-obsidian">{post.title}</span>
          </motion.div>

          {/* Meta */}
          <motion.div
            className="flex items-center gap-3 mb-4 text-xs text-stone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {categories.length > 0 && (
              <span className="text-gold uppercase tracking-widest font-medium">
                {categories[0].title}
              </span>
            )}
            {date && <span>{date}</span>}
            {author && <span>By {author.name || author.email}</span>}
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-serif text-3xl sm:text-4xl lg:text-[50px] font-medium text-obsidian leading-[1.1] tracking-[-0.04em] m-0 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {post.title}
          </motion.h1>

          {post.excerpt && (
            <motion.p
              className="text-stone text-lg leading-relaxed m-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {post.excerpt}
            </motion.p>
          )}
        </div>
      </section>

      {/* Featured image */}
      {imgUrl && (
        <section className="bg-cream pb-12">
          <div className="max-w-4xl mx-auto px-6">
            <FadeIn>
              <div className="aspect-video rounded-sm overflow-hidden relative bg-parchment">
                <Image
                  src={imgUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 56rem"
                  className="object-cover"
                  priority
                />
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 bg-cream">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="prose prose-lg max-w-none text-stone leading-relaxed">
              <p className="text-stone/80">
                {/* Rich text content rendered as plain text fallback */}
                {extractTextFromLexical(post.content)}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-(--spacing-section) bg-parchment">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
            <FadeIn>
              <h2 className="font-serif text-2xl lg:text-3xl font-medium text-obsidian tracking-tight m-0 mb-10">
                Related Articles
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((rp, i) => {
                const rpImg =
                  typeof rp.featuredImage === 'object' && rp.featuredImage !== null
                    ? ((rp.featuredImage as Media).sizes?.card?.url ??
                      (rp.featuredImage as Media).url ??
                      null)
                    : null
                return (
                  <FadeIn key={rp.id} delay={i * 0.1}>
                    <Link
                      href={`/journal/${rp.slug}`}
                      className="group block no-underline text-obsidian"
                    >
                      <div className="aspect-[16/10] rounded-sm overflow-hidden bg-cream mb-4 relative">
                        {rpImg ? (
                          <Image
                            src={rpImg}
                            alt={rp.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cream to-mist" />
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-medium m-0 group-hover:text-gold transition-colors">
                        {rp.title}
                      </h3>
                      {rp.excerpt && (
                        <p className="text-stone text-sm m-0 mt-2 line-clamp-2">{rp.excerpt}</p>
                      )}
                    </Link>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function extractTextFromLexical(content: BlogPost['content']): string {
  if (!content?.root?.children) return ''

  function walkNode(node: Record<string, unknown>): string {
    if (typeof node.text === 'string') return node.text
    const children = node.children as Record<string, unknown>[] | undefined
    if (Array.isArray(children)) {
      return children.map(walkNode).join('')
    }
    return ''
  }

  return content.root.children
    .map((child) => walkNode(child as Record<string, unknown>))
    .join('\n\n')
}
