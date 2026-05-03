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
  const collectionSlug = typeof params.collection === 'string' ? params.collection : ''
  const originCountry = typeof params.originCountry === 'string' ? params.originCountry : ''
  const searchTerm = typeof params.search === 'string' ? params.search.trim() : ''
  const featured = params.featured === 'true'
  const inStock = params.inStock === 'true'

  // Build where clause
  const conditions: Where[] = [{ _status: { equals: 'published' } }]

  if (searchTerm) {
    conditions.push({
      or: [
        { title: { contains: searchTerm } },
        { shortDescription: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
      ],
    })
  }

  if (featured) {
    conditions.push({ isFeatured: { equals: true } })
  }

  if (inStock) {
    conditions.push({ inStock: { equals: true } })
  }

  if (originCountry) {
    conditions.push({ countryOfOrigin: { equals: originCountry } })
  }

  if (categorySlug) {
    const cat = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
    })
    if (cat.docs[0]) {
      conditions.push({ category: { equals: cat.docs[0].id } })
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
      conditions.push({ supplier: { equals: sup.docs[0].id } })
    }
  }

  if (collectionSlug) {
    const col = await payload.find({
      collection: 'product-collections',
      where: { slug: { equals: collectionSlug } },
      limit: 1,
      depth: 0,
    })
    if (col.docs[0]) {
      conditions.push({ collection: { equals: col.docs[0].id } })
    }
  }

  const where: Where = conditions.length > 1 ? { and: conditions } : conditions[0]

  const [productsRes, categoriesRes, suppliersRes, collectionsRes, originsRes] = await Promise.all([
    payload.find({
      collection: 'products',
      where,
      sort,
      page,
      limit: 24,
      depth: 2,
    }),
    payload.find({ collection: 'categories', limit: 50, depth: 1 }),
    payload.find({ collection: 'suppliers', limit: 50, depth: 0 }),
    payload.find({ collection: 'product-collections', limit: 50, depth: 0, sort: 'sortOrder' }),
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      depth: 0,
      limit: 1000,
      select: { countryOfOrigin: true },
    }),
  ])

  const originCountries = Array.from(
    new Set(
      originsRes.docs
        .map((doc) => doc.countryOfOrigin?.trim())
        .filter((v): v is string => Boolean(v)),
    ),
  ).sort((a, b) => a.localeCompare(b))

  return (
    <ProductsListing
      products={productsRes.docs}
      categories={categoriesRes.docs}
      suppliers={suppliersRes.docs}
      collections={collectionsRes.docs}
      originCountries={originCountries}
      totalPages={productsRes.totalPages}
      totalDocs={productsRes.totalDocs}
      currentPage={productsRes.page ?? 1}
    />
  )
}
