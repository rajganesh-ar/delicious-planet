import type { CollectionAfterChangeHook } from 'payload'
import type { B2BInquiry } from '../../payload-types'
import { adminRecipient } from '../../lib/email/recipients'
import { sendEmail } from '../../lib/email/send'
import {
  enquiryAcknowledgementEmail,
  enquiryAdminAlertEmail,
} from '../../lib/email/templates/enquiry'
import { newsletterWelcomeEmail } from '../../lib/email/templates/newsletter'

/**
 * Notifications for the two public forms.
 *
 * Both collections are written straight through the Payload REST API by the
 * storefront, so there is no route handler to hang this on — an afterChange
 * hook is the only interception point.
 *
 * Every hook swallows its own failures. These run inside the request's
 * transaction, so an uncaught throw would roll back the row and show the
 * visitor an error for a submission that was otherwise fine. Losing the
 * notification is bad; losing the enquiry is worse.
 */

export const notifyEnquiryReceived: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const inquiry = doc as B2BInquiry

  try {
    const staff = await adminRecipient(payload, req)
    const sends: Promise<boolean>[] = []

    if (staff) {
      sends.push(sendEmail(payload, { to: staff, ...enquiryAdminAlertEmail(inquiry) }))
    }
    if (inquiry.email) {
      sends.push(sendEmail(payload, { to: inquiry.email, ...enquiryAcknowledgementEmail(inquiry) }))
    }

    await Promise.allSettled(sends)
  } catch (err) {
    payload.logger.error({ err, id: inquiry.id }, 'Enquiry notification failed')
  }

  return doc
}

/**
 * The welcome message doubles as the abuse ceiling: `email` is unique on this
 * collection, so a resubmitted address fails validation before this hook is
 * reached and cannot be used to mail the same person repeatedly.
 */
export const notifyNewsletterSignup: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req
  const subscriber = doc as { id: number; email?: string | null }

  try {
    if (subscriber.email) {
      await sendEmail(payload, { to: subscriber.email, ...newsletterWelcomeEmail() })
    }
  } catch (err) {
    payload.logger.error({ err, id: subscriber.id }, 'Newsletter welcome failed')
  }

  return doc
}
