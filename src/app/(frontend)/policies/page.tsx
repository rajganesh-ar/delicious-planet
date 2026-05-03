import type { Metadata } from 'next'
import { PoliciesPageClient } from '@/components/sections/PoliciesPageClient'

export const metadata: Metadata = {
  title: 'Policies — Delicious Planet',
  description:
    'Terms of service, privacy, shipping, returns, cancellation, and B2B terms for Delicious Planet.',
}

export default function PoliciesPage() {
  return <PoliciesPageClient />
}
