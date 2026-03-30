import { getPayload } from 'payload'
import config from '@/payload.config'
import { HomePageClient } from '@/components/sections/HomePageClient'

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const [featuredRes, categoriesRes, testimonialsRes, suppliersRes, collectionsRes] =
    await Promise.all([
      payload.find({
        collection: 'products',
        where: { isFeatured: { equals: true }, _status: { equals: 'published' } },
        limit: 6,
        depth: 2,
      }),
      payload.find({ collection: 'categories', limit: 10, depth: 1 }),
      payload.find({ collection: 'testimonials', limit: 8, depth: 1 }),
      payload.find({ collection: 'suppliers', limit: 10, depth: 1 }),
      payload.find({ collection: 'product-collections', limit: 20, depth: 1, sort: 'sortOrder' }),
    ])

  return (
    <HomePageClient
      featuredProducts={featuredRes.docs}
      categories={categoriesRes.docs}
      testimonials={testimonialsRes.docs}
      suppliers={suppliersRes.docs}
      productCollections={collectionsRes.docs}
    />
  )
}
