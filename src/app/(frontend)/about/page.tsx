import { getPayload } from 'payload'
import config from '@/payload.config'
import { AboutPageClient } from '@/components/sections/AboutPageClient'

export const metadata = {
  title: 'About',
  description:
    'The story behind Delicious Planet. Our mission, values, and the team bringing the finest ingredients to your table.',
}

export default async function AboutPage() {
  const payload = await getPayload({ config: await config })

  const [officesRes, teamRes] = await Promise.all([
    payload.find({
      collection: 'office-locations',
      limit: 10,
      depth: 1,
    }),
    // `not_equals: false` rather than `equals: true` so a row written before the
    // field existed — or one saved with it null — still shows.
    payload.find({
      collection: 'team',
      where: { active: { not_equals: false } },
      limit: 50,
      depth: 1,
      sort: 'sortOrder',
    }),
  ])

  return <AboutPageClient offices={officesRes.docs} team={teamRes.docs} />
}
