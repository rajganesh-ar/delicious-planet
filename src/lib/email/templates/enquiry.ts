import type { B2BInquiry } from '../../../payload-types'
import { absoluteUrl } from '../../site-url'
import { renderEmail, type Block } from '../layout'

/**
 * Enquiry email, both directions.
 *
 * Note the contact page posts here too, not only the trade form — see
 * ContactPageClient — so the wording has to read sensibly for someone asking a
 * general question, not just for a wholesale buyer. "Enquiry" throughout rather
 * than "trade enquiry" is deliberate.
 */

const CONTACT_LABEL: Record<string, string> = {
  new: 'New',
  in_review: 'In review',
  quoted: 'Quoted',
  won: 'Closed — won',
  lost: 'Closed — lost',
}

export function enquiryAdminAlertEmail(inquiry: B2BInquiry) {
  const rows = [
    { label: 'Company', value: inquiry.company },
    { label: 'Contact', value: inquiry.contactName },
    { label: 'Email', value: inquiry.email },
    ...(inquiry.phone?.trim() ? [{ label: 'Phone', value: inquiry.phone.trim() }] : []),
    { label: 'Status', value: CONTACT_LABEL[inquiry.status] ?? inquiry.status },
  ]

  const blocks: Block[] = [
    { type: 'facts', title: 'Enquiry', rows },
    { type: 'lines', title: 'Message', lines: inquiry.message.split(/\r?\n/) },
    {
      type: 'button',
      label: 'Open in admin',
      href: absoluteUrl(`/admin/collections/b2b-inquiries/${inquiry.id}`),
    },
  ]

  const { html, text } = renderEmail({
    preheader: `${inquiry.contactName} at ${inquiry.company}`,
    heading: 'New enquiry',
    intro: 'Someone has submitted the enquiry form on the site.',
    blocks,
    footerNote: 'Sent to the notification address in Site Settings.',
  })

  return { subject: `Enquiry from ${inquiry.company}`, html, text }
}

/**
 * Fixed wording, deliberately. The form is public and this goes to whatever
 * address was typed in, so echoing the submitted name and message let anyone
 * send their own text to any inbox from the company mailbox, DKIM-signed by
 * Google. The staff alert above still carries everything.
 */
export function enquiryAcknowledgementEmail(_inquiry: B2BInquiry) {
  const { html, text } = renderEmail({
    preheader: 'We have your enquiry and will come back to you shortly.',
    heading: 'Thank you for getting in touch',
    intro: 'We have received your enquiry and a member of the team will reply shortly.',
    blocks: [
      {
        type: 'paragraph',
        text: 'We typically reply within one business day. If your enquiry is urgent, call or message us on the number below.',
      },
    ],
    footerNote: 'You are receiving this because an enquiry was submitted at deliciousplanet.co.',
  })

  return { subject: 'We have received your enquiry', html, text }
}
