import { SourcingPageClient } from '@/components/sections/SourcingPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sourcing — Delicious Planet',
  description:
    'Structured procurement for professional supply environments. Our sourcing network aligns agricultural producers, specialized processors, and export-capable partners for reliability and continuity.',
}

export default function SourcingPage() {
  return <SourcingPageClient />
}
