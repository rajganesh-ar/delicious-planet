import { getPayload } from 'payload'
import config from '@/payload.config'
import { AboutPageClient } from '@/components/sections/AboutPageClient'

export const metadata = {
  title: 'About — Delicious Planet',
  description:
    'The story behind Delicious Planet. Our mission, values, and the team bringing the finest ingredients to your table.',
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
