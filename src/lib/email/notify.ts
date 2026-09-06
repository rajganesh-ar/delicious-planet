import type { Payload } from 'payload'
import { adminRecipient } from './recipients'
import { sendEmail } from './send'
import { customerEmail, orderAdminAlertEmail, orderConfirmationEmail } from './templates/order'

/**
 * Sends the two emails a newly paid order produces.
 *
 * Called from markOrderPaid's `'updated'` branch, which is the one place in the
 * system that runs exactly once per order: the Stripe webhook and the
 * post-checkout confirmation route race each other by design, and the existing
 * `paymentStatus` guard means only the winner gets there. That gives
 * exactly-once delivery without a lock, a flag or a new column.
 *
 * Nothing here is allowed to throw. The webhook returns 500 on an error so that
 * Stripe retries — but a retry would find the order already paid and skip the
 * send entirely, so a transient mail failure would cost the email *and* leave
 * Stripe retrying a delivery that can never succeed.
 */
export async function notifyOrderPaid(payload: Payload, orderId: number): Promise<void> {
  try {
    // markOrderPaid reads at depth 0, where `user` is still a bare id. The
    // templates need the populated relationship to find the account's email.
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
      overrideAccess: true,
    })
    if (!order) return

    const buyer = customerEmail(order)
    const staff = await adminRecipient(payload)

    const sends: Promise<boolean>[] = []

    if (buyer) {
      sends.push(sendEmail(payload, { to: buyer, ...orderConfirmationEmail(order) }))
    } else {
      payload.logger.warn(
        { orderNumber: order.orderNumber },
        'Paid order has no customer email address; confirmation not sent',
      )
    }

    // `null` means staff notifications are switched off in Site Settings.
    if (staff) {
      sends.push(sendEmail(payload, { to: staff, ...orderAdminAlertEmail(order) }))
    }

    // allSettled, not all: the shop still needs its alert if the buyer's address
    // bounces, and the buyer still needs the receipt if the shop's mailbox does.
    await Promise.allSettled(sends)
  } catch (err) {
    payload.logger.error({ err, orderId }, 'Order notification failed')
  }
}
