import { RecipesPageClient } from '@/components/sections/RecipesPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recipes — Delicious Planet',
  description:
    'Recipes developed to demonstrate ingredient functionality and culinary versatility. Italian, Mediterranean, bakery, and professional kitchen preparations.',
}

export default function RecipesPage() {
  return <RecipesPageClient />
}
