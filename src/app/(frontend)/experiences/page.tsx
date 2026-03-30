import { getPayload } from 'payload'
import config from '@/payload.config'
import { ExperiencesPageClient } from '@/components/sections/ExperiencesPageClient'

export const metadata = {
  title: 'Experiences — Delicious Planet',
  description:
    'Immerse yourself in the stories, origins, and craft behind every premium ingredient.',
}

export default async function ExperiencesPage() {
  const payload = await getPayload({ config: await config })

  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 12,
    depth: 1,
  })

  return <ExperiencesPageClient categories={categoriesRes.docs} />
}
