import { getPayload } from 'payload'
import config from '@/payload.config'
import { JournalPageClient } from '@/components/sections/JournalPageClient'

export const metadata = {
  title: 'Journal — Delicious Planet',
  description:
    'Recipes, origin stories, and behind-the-scenes from the world of premium food ingredients.',
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
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

  return (
    <JournalPageClient
      posts={postsRes.docs}
      categories={categoriesRes.docs}
      totalPages={postsRes.totalPages}
      currentPage={page}
    />
  )
}
