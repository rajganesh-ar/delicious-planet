/**
 * Single source of truth for the company's contact details.
 *
 * The footer, the contact page and the floating contact widget all read from
 * here, so a number, address or mailbox only ever changes in one place.
 */

export const CONTACT = {
  email: 'info@deliciousplanet.co',
  phone: '+971506035008',
  phoneLabel: '+971 50 603 5008',
  whatsapp: 'https://wa.me/971506035008',
  hours: 'Mon–Fri, 9am–6pm GST',
  address: {
    /** Rendered one line per entry; join with ', ' for a single-line form. */
    lines: ['CWS-1V-225628', '26th Floor, Amber Gem Tower', 'Ajman, United Arab Emirates'],
    city: 'Ajman',
    country: 'United Arab Emirates',
  },
} as const

export interface ContactPerson {
  name: string
  role: string
  email: string
  /** Dialable form for `tel:` — omitted when the person has no direct line. */
  phone?: string
  phoneLabel?: string
}

/** Named desks, in the order they should be offered to a visitor. */
export const PEOPLE: ContactPerson[] = [
  {
    name: 'Nabila Mellaz',
    role: 'Founder & CEO',
    email: 'nabila@deliciousplanet.co',
    phone: '+971506035008',
    phoneLabel: '+971 50 603 5008',
  },
  {
    name: 'Muzn Salih',
    role: 'Sales Director',
    email: 'sales@deliciousplanet.co',
    phone: '+971568508769',
    phoneLabel: '+971 56 850 8769',
  },
  {
    name: 'Raj Ganesh',
    role: 'Business Development',
    email: 'raj@deliciousplanet.co',
  },
]
