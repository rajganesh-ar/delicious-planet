import type { Metadata } from 'next'
import { VendorStatusLookup } from '@/components/sections/portal/VendorStatusLookup'

/**
 * Per-applicant and useless to a crawler — there is nothing here without a
 * reference — so it is kept out of the index, the same as the account pages.
 */
export const metadata: Metadata = {
  title: 'Application status',
  description: 'Check the progress of a vendor application to Delicious Planet.',
  robots: { index: false, follow: false },
}

export default function VendorStatusPage() {
  return <VendorStatusLookup />
}
