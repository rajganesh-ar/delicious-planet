import { getPayload } from 'payload'
import config from '@/payload.config'
import { ProductsListing } from '@/components/sections/ProductsListing'
import type { Where } from 'payload'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const payload = await getPayload({ config: await config })

  const page = Number(params.page) || 1
  const sort = (typeof params.sort === 'string' ? params.sort : '-createdAt') as string
  const categorySlug = typeof params.category === 'string' ? params.category : ''
  const supplierSlug = typeof params.supplier === 'string' ? params.supplier : ''

  // Build where clause
  const where: Where = {
    _status: { equals: 'published' },
  }

  if (categorySlug) {
    // Resolve category ID from slug
    const cat = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
    })
    if (cat.docs[0]) {
      where.category = { equals: cat.docs[0].id }
    }
  }

  if (supplierSlug) {
    const sup = await payload.find({
      collection: 'suppliers',
      where: { slug: { equals: supplierSlug } },
      limit: 1,
      depth: 0,
    })
    if (sup.docs[0]) {
      where.supplier = { equals: sup.docs[0].id }
    }
  }

  const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
    payload.find({
      collection: 'products',
      where,
      sort,
      page,
      limit: 12,
      depth: 2,
    }),
    payload.find({ collection: 'categories', limit: 50, depth: 0 }),
    payload.find({ collection: 'suppliers', limit: 50, depth: 0 }),
  ])

  return (
    <ProductsListing
      products={productsRes.docs}
      categories={categoriesRes.docs}
      suppliers={suppliersRes.docs}
      totalPages={productsRes.totalPages}
      currentPage={productsRes.page ?? 1}
    />
  )
}
