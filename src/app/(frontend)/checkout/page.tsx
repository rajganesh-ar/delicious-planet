import { Suspense } from 'react'
import { CheckoutClient } from '@/components/sections/CheckoutClient'

export const metadata = {
  title: 'Checkout — Delicious Planet',
  description: 'Place your order with Delicious Planet.',
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
