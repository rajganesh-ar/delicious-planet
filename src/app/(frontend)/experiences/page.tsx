import type { Metadata } from 'next'
import { ExperiencePageClient } from '@/components/sections/ExperiencePageClient'

export const metadata: Metadata = {
  title: 'Experiences — Delicious Planet',
  description:
    'Explore our integrated ecosystem, from farms and vineyards to restaurants and retail. We connect source to table with deep operational context.',
}

export default function ExperiencesPage() {
  // In a real app, you might fetch data from Payload CMS here
  // For example: const pageData = await getPage('experiences')
  return <ExperiencePageClient />
}
