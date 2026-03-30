import { SourcingPageClient } from '@/components/sections/SourcingPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sourcing & Sustainability — Delicious Planet',
  description:
    'Ingredient quality begins at origin. Our sourcing model prioritises long-term relationships and consistent product integrity across Mediterranean, European, and international markets.',
}

export default function SourcingPage() {
  return <SourcingPageClient />
}
