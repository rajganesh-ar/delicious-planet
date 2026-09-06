import { Suspense } from 'react'
import { ChefDashboard } from '@/components/sections/portal/ChefDashboard'

/**
 * Wrapped in Suspense because the dashboard reads `?submitted=1` through
 * useSearchParams, which opts the tree into client-side rendering and needs a
 * boundary above it.
 */
export default function ChefPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <ChefDashboard />
    </Suspense>
  )
}
