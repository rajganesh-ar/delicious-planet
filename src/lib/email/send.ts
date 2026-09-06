import type { Payload } from 'payload'

export interface OutgoingEmail {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Sends one message and resolves whether it went out. It never rejects.
 *
 * That matters most in the Stripe webhook. The handler deliberately returns 500
 * on a thrown error so Stripe retries — but a retry re-runs markOrderPaid, which
 * would now find the order already paid and skip the send entirely. A transient
 * mail failure would therefore cost the confirmation email *and* leave Stripe
 * retrying a delivery that can never succeed. Swallowing here keeps the payment
 * path and the notification path independent: the order is paid either way, and
 * a failure is a log line rather than a stuck webhook.
 *
 * With no adapter configured Payload's stub logs the message instead of sending
 * it, which is the intended local development behaviour — see payload.config.ts.
 */
export async function sendEmail(payload: Payload, email: OutgoingEmail): Promise<boolean> {
  if (!email.to) {
    payload.logger.warn({ subject: email.subject }, 'Email skipped: no recipient address')
    return false
  }

  try {
    await payload.sendEmail(email)
    return true
  } catch (err) {
    payload.logger.error({ err, to: email.to, subject: email.subject }, 'Email failed to send')
    return false
  }
}
