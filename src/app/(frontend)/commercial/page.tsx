import { CommercialPageClient } from '@/components/sections/CommercialPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commercial Supply — Delicious Planet',
  description:
    'Structured ingredient supply for professional food operations. Volume pricing, private label development, continuity planning, and multi-region procurement for restaurants, hotels, manufacturers, and distributors.',
}

export default function CommercialPage() {
  return <CommercialPageClient />
}
