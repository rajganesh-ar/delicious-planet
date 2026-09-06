import type { Metadata } from 'next'
import { PortalHome } from '@/components/sections/portal/PortalHome'

export const metadata: Metadata = {
  title: 'Partner portal',
  description:
    'Register as a vendor to supply Delicious Planet, or as a chef to publish recipes built from our catalogue.',
}

export default function PortalPage() {
  return <PortalHome />
}
