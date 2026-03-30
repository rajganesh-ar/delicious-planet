import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { CategoryPageClient } from '@/components/sections/CategoryPageClient'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const payload = await getPayload({ config: await config })

  const catResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const category = catResult.docs[0]
  if (!category) notFound()

  const page = Number(sp.page) || 1
  const sort = (typeof sp.sort === 'string' ? sp.sort : '-createdAt') as string

  const productsRes = await payload.find({
    collection: 'products',
    where: {
      category: { equals: category.id },
      _status: { equals: 'published' },
    },
    sort,
    page,
    limit: 12,
    depth: 2,
  })

  return (
    <CategoryPageClient
      category={category}
      products={productsRes.docs}
      totalPages={productsRes.totalPages}
      currentPage={productsRes.page ?? 1}
    />
  )
}
