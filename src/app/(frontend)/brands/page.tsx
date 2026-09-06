import { getPayload } from 'payload'
import config from '@/payload.config'
import { BrandsPageClient } from '@/components/sections/BrandsPageClient'
import { resolveBrandMarks } from '@/lib/brand-marks'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brands',
  description:
    'Our portfolio includes internationally recognized producers known for consistency and technical expertise. Each brand is selected for product specialisation and professional kitchen relevance.',
}

export default async function BrandsPage() {
  const payload = await getPayload({ config: await config })

  const [suppliersRes, brandsRes] = await Promise.all([
    payload.find({
      collection: 'suppliers',
      limit: 50,
      depth: 1,
    }),
    // depth 1 so `logo` comes back populated — resolveBrandMarks needs the
    // upload resolved to prefer it over the bundled file.
    payload.find({ collection: 'brands', limit: 50, depth: 1, sort: 'title' }),
  ])

  return (
    <BrandsPageClient
      suppliers={suppliersRes.docs}
      brandMarks={resolveBrandMarks(brandsRes.docs)}
    />
  )
}
