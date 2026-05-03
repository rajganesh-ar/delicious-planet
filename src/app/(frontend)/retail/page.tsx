import { RetailPageClient } from '@/components/sections/RetailPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Retail — Delicious Planet',
  description:
    'Premium specialty foods for the home kitchen. Shop fresh produce, artisan breads, dairy, organic, cold & chilled, grocery, and beverages — curated to the same standard as our professional supply.',
}

export default function RetailPage() {
  return <RetailPageClient />
}
