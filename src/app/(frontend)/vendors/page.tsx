import { VendorsPageClient } from '@/components/sections/VendorsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendors & Partnerships — Delicious Planet',
  description:
    'We collaborate with producers capable of maintaining consistent production standards and reliable supply continuity. Export-capable specialty ingredient manufacturers welcome.',
}

export default function VendorsPage() {
  return <VendorsPageClient />
}
