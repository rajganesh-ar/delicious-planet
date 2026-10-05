import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { JournalPostClient } from '@/components/sections/JournalPostClient'
import type { Metadata } from 'next'

/** Cached per post on first visit and refreshed every 300s, like product pages. */
export const revalidate = 300

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  // Published only, like the page below: without it a draft's title and
  // description were served on its URL even though the page itself 404s.
  const result = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 0,
  })

  const post = result.docs[0]
  if (!post) return { title: 'Post Not Found' }

  // The layout's title template appends "— Delicious Planet"; adding it here
  // too doubled it.
  const title = post.meta?.title || `${post.title} — Journal`
  const description = post.meta?.description || post.excerpt || undefined

  return {
    title,
    description,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { type: 'article', title, description, url: `/journal/${post.slug}` },
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
