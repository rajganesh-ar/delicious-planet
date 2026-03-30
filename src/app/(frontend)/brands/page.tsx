import { getPayload } from 'payload'
import config from '@/payload.config'
import { BrandsPageClient } from '@/components/sections/BrandsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brands — Delicious Planet',
  description:
    'Our portfolio includes internationally recognized producers known for consistency and technical expertise. Each brand is selected for product specialisation and professional kitchen relevance.',
}

export default async function BrandsPage() {
  const payload = await getPayload({ config: await config })

  const suppliersRes = await payload.find({
    collection: 'suppliers',
    limit: 50,
    depth: 1,
  })

  return <BrandsPageClient suppliers={suppliersRes.docs} />
}
