import { VendorApplicationPageClient } from '@/components/sections/VendorApplicationPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendor Application — Delicious Planet',
  description:
    'Submit your vendor application to establish a structured supply relationship with Delicious Planet. Evaluation based on production capability, documentation readiness, and category alignment.',
}

export default function VendorApplicationPage() {
  return <VendorApplicationPageClient />
}
