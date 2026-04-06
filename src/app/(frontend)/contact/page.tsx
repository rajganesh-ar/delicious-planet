import { getPayload } from 'payload'
import config from '@/payload.config'
import { ContactPageClient } from '@/components/sections/ContactPageClient'

export const metadata = {
  title: 'Contact — Delicious Planet',
  description:
    'Get in touch with Delicious Planet. General inquiries, commercial partnerships, and wholesale orders.',
}

export default async function ContactPage() {
  const payload = await getPayload({ config: await config })

  const officesRes = await payload.find({
    collection: 'office-locations',
    limit: 10,
    depth: 1,
  })

  return <ContactPageClient offices={officesRes.docs} />
}
