import { cache } from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { CategoryPageClient } from '@/components/sections/CategoryPageClient'
import { absoluteUrl } from '@/lib/site-url'
import type { Category } from '@/payload-types'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Shared by `generateMetadata` and the page so the lookup runs once per request. */
const loadCategory = cache(async (slug: string): Promise<Category | null> => {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await loadCategory(slug)
  if (!category) return { title: 'Category not found' }

  const title = category.title
  const description =
    category.description?.trim() ||
    `Browse ${category.title} from artisan producers, sourced and delivered by Delicious Planet.`
  // Paginated and filtered views self-canonicalise to the clean category URL,
  // so page 2 of a listing does not compete with page 1 in the index.
  const url = absoluteUrl(`/categories/${category.slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', title, description, url },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const payload = await getPayload({ config: await config })

  const category = await loadCategory(slug)
  if (!category) notFound()

  const page = Number(sp.page) || 1
  const sort = (typeof sp.sort === 'string' ? sp.sort : '-createdAt') as string

  // Products attach to leaves, so a department has none of its own once it has
  // children — select the whole subtree. `ancestors` turns that into one extra
  // indexed lookup rather than a recursive walk; see
  // src/collections/hooks/categoryHooks.ts.
  const descendants = await payload.find({
    collection: 'categories',
    where: { ancestors: { in: [category.id] } },
    limit: 200,
    depth: 0,
  })
  const categoryIds = [category.id, ...descendants.docs.map((c) => c.id)]

  const productsRes = await payload.find({
    collection: 'products',
    where: {
      category: { in: categoryIds },
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
