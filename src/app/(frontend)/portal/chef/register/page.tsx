import type { Metadata } from 'next'
import { ChefRegistrationForm } from '@/components/sections/portal/ChefRegistrationForm'

/** Re-opens indexing that the branch layout closes — see the note there. */
export const metadata: Metadata = {
  title: 'Chef registration',
  description:
    'Register as a chef with Delicious Planet and publish recipes built from our catalogue — every ingredient a product a reader can order.',
  robots: { index: true, follow: true },
}

export default function ChefRegistrationPage() {
  return <ChefRegistrationForm />
}
