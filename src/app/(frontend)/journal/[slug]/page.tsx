import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { JournalPostClient } from '@/components/sections/JournalPostClient'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const result = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const post = result.docs[0]
  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.meta?.title || `${post.title} — Delicious Planet Journal`,
    description: post.meta?.description || post.excerpt || undefined,
  }
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const result = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })

  const post = result.docs[0]
  if (!post) notFound()

  // Related posts from same categories
  const categoryIds = (post.categories ?? [])
    .map((c) => (typeof c === 'object' && c !== null ? c.id : c))
    .filter(Boolean)

  const relatedRes =
    categoryIds.length > 0
      ? await payload.find({
          collection: 'blog-posts',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { id: { not_equals: post.id } },
              { categories: { in: categoryIds } },
            ],
          },
          limit: 3,
          depth: 1,
          sort: '-publishedAt',
        })
      : await payload.find({
          collection: 'blog-posts',
          where: {
            and: [{ _status: { equals: 'published' } }, { id: { not_equals: post.id } }],
          },
          limit: 3,
          depth: 1,
          sort: '-publishedAt',
        })

  return <JournalPostClient post={post} relatedPosts={relatedRes.docs} />
}
