import { Suspense } from 'react'
import { CheckoutClient } from '@/components/sections/CheckoutClient'

export const metadata = {
  title: 'Checkout',
  description: 'Place your order with Delicious Planet.',
  // Transactional and per-visitor — nothing here belongs in an index.
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-stone text-sm">Loading…</p>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  )
}
