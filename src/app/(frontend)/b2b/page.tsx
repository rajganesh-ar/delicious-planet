import { B2BSolutionsPageClient } from '@/components/sections/B2BSolutionsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'B2B Solutions — Delicious Planet',
  description:
    'Ingredient sourcing partner for restaurants, hotels, retailers, and food manufacturers. Volume pricing, private label development, and multi-region supply.',
}

export default function B2BSolutionsPage() {
  return <B2BSolutionsPageClient />
}
