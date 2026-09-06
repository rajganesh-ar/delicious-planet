import { CheckoutSuccessClient } from '@/components/sections/CheckoutSuccessClient'

export const metadata = {
  title: 'Order received',
  description: 'Thank you for your order.',
  // A confirmation page is per-order; indexing it would be meaningless.
  robots: { index: false, follow: false },
}

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessClient />
}
