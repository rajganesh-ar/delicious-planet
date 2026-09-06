import type { Metadata } from 'next'
import { VendorApplicationForm } from '@/components/sections/portal/VendorApplicationForm'

/**
 * The form itself is a client component, so the metadata lives out here.
 * Indexable on purpose — unlike the chef portal below it, this page is a
 * public front door and a supplier searching for "become a supplier" should
 * be able to find it.
 */
export const metadata: Metadata = {
  title: 'Vendor registration',
  description:
    'Apply to supply Delicious Planet. A structured application covering your company, products, certifications, compliance and export readiness.',
}

export default function VendorRegistrationPage() {
  return <VendorApplicationForm />
}
