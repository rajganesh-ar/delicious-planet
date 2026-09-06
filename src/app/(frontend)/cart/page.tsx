import type { Metadata } from 'next'
import { CartPageClient } from '@/components/sections/CartPageClient'

export const metadata: Metadata = {
  title: 'Your Basket',
  description: 'Review the items in your basket, adjust quantities, and continue to checkout.',
  // The basket is per-visitor and has nothing to index.
  robots: { index: false, follow: true },
}

export default function CartPage() {
  return <CartPageClient />
}
