import { getPayload } from 'payload'
import config from '@/payload.config'
import { AboutPageClient } from '@/components/sections/AboutPageClient'

export const metadata = {
  title: 'About — Delicious Planet',
  description:
    'Rooted in Algeria. Structured for global supply. Delicious Planet connects natural agricultural producers with professional buyers across international markets.',
}

export default async function AboutPage() {
  const payload = await getPayload({ config: await config })

  const officesRes = await payload.find({
    collection: 'office-locations',
    limit: 10,
    depth: 1,
  })

  return <AboutPageClient offices={officesRes.docs} />
}
