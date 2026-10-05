import { getPayload } from 'payload'
import config from '@/payload.config'
import { JournalPageClient } from '@/components/sections/JournalPageClient'
import { pageParam } from '@/lib/pagination'

export const metadata = {
  title: 'Journal',
  description:
    'Recipes, origin stories, and behind-the-scenes from the world of premium food ingredients.',
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const params = await searchParams
  const page = pageParam(params.page)
  const limit = 12

  const payload = await getPayload({ config: await config })

  const [postsRes, categoriesRes] = await Promise.all([
    payload.find({
      collection: 'blog-posts',
      where: { _status: { equals: 'published' } },
      limit,
      page,
      sort: '-publishedAt',
      depth: 2,
    }),
    payload.find({
      collection: 'blog-categories',
      limit: 20,
      depth: 0,
    }),
  ])

  // /recipes deep-links here with ?category=<slug>. An unknown slug would strand
  // the reader on "nothing in this category yet", so only honour a real one.
  const initialCategory = categoriesRes.docs.some((c) => c.slug === params.category)
    ? (params.category ?? null)
    : null

  return (
    <JournalPageClient
      posts={postsRes.docs}
      categories={categoriesRes.docs}
      totalPages={postsRes.totalPages}
      currentPage={page}
      initialCategory={initialCategory}
    />
  )
}
