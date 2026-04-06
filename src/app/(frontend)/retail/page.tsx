import { RetailPageClient } from '@/components/sections/RetailPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Retail Partnership — Delicious Planet',
  description:
    'Structured retail supply for premium food environments. Delicious Planet collaborates with specialty food stores, gourmet retailers, and regional distributors across Middle East and Africa.',
}

export default function RetailPage() {
  return <RetailPageClient />
}
