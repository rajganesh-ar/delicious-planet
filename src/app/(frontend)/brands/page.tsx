import { getPayload } from 'payload'
import config from '@/payload.config'
import { BrandsPageClient } from '@/components/sections/BrandsPageClient'
import { brandLogo, resolveBrandMarks, stockedBrands } from '@/lib/brand-marks'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brands',
  description:
    'Our portfolio includes internationally recognized producers known for consistency and technical expertise. Each brand is selected for product specialisation and professional kitchen relevance.',
}

export default async function BrandsPage() {
  const payload = await getPayload({ config: await config })

  const [brandsRes, productsRes] = await Promise.all([
    // depth 1 so `logo` comes back populated — brandLogo prefers the upload
    // over the bundled file.
    payload.find({ collection: 'brands', limit: 0, pagination: false, depth: 1 }),
    // Only brands with something to buy are listed; each row links to them.
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      select: { brand: true, origin: true },
    }),
  ])

  const stocked = stockedBrands(brandsRes.docs, productsRes.docs)

  return (
    <BrandsPageClient
      brands={stocked.map(({ brand, count, country }) => ({
        slug: brand.slug,
        name: brand.title,
        description: brand.description ?? null,
        website: brand.website ?? null,
        logo: brandLogo(brand),
        country,
        count,
      }))}
      brandMarks={resolveBrandMarks(stocked.map(({ brand }) => brand))}
    />
  )
}
