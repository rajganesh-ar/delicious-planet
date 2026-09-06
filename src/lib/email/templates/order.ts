import type { Order } from '../../../payload-types'
import { formatPrice } from '../../product'
import { absoluteUrl } from '../../site-url'
import { renderEmail, type Block, type LineItemRow, type TotalRow } from '../layout'

/**
 * The two emails a paid order produces: the buyer's receipt and the shop's
 * alert. They live together because they render the same order — splitting them
 * would mean maintaining the line-item and totals mapping twice, and those are
 * the parts that must agree with each other and with what Stripe charged.
 */

/**
 * Dates are formatted in the shop's own timezone, not the server's. An order
 * placed at 01:00 Dubai time is a Tuesday order to the team packing it,
 * whichever region the function happened to run in.
 */
const DATE = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Dubai',
})

const orderDate = (order: Order): string =>
  DATE.format(order.createdAt ? new Date(order.createdAt) : new Date())

/** The address the confirmation goes to — a registered account, or a guest. */
export function customerEmail(order: Order): string | null {
  if (order.user && typeof order.user === 'object' && order.user.email) return order.user.email
  return order.guestEmail?.trim() || null
}

function customerName(order: Order): string | null {
  if (order.user && typeof order.user === 'object' && order.user.name) return order.user.name
  return order.shippingAddress?.name?.trim() || null
}

/**
 * Line items come from the order's own snapshot fields rather than from the
 * product relationship, which is deliberately nullable — a re-imported or
 * delisted catalogue must not turn a past receipt into blank rows.
 */
function lineItems(order: Order): LineItemRow[] {
  return (order.items ?? []).map((item) => ({
    title: item.titleSnapshot || item.variantSku || 'Item',
    meta: item.sizeSnapshot,
    quantity: item.quantity,
    amount: formatPrice(item.unitAmount * item.quantity, item.currency || order.currency),
  }))
}

function totals(order: Order): TotalRow[] {
  const currency = order.currency
  const rows: TotalRow[] = [
    { label: 'Subtotal', value: formatPrice(order.totals?.subtotal ?? 0, currency) },
  ]
  // Shipping and tax are stored as 0 today. Showing "Free" rather than hiding
  // the row answers the question the buyer is actually asking.
  rows.push({
    label: 'Shipping',
    value: order.totals?.shipping ? formatPrice(order.totals.shipping, currency) : 'Free',
  })
  if (order.totals?.tax) {
    rows.push({ label: 'Tax', value: formatPrice(order.totals.tax, currency) })
  }
  rows.push({
    label: 'Total paid',
    value: formatPrice(order.totals?.total ?? 0, currency),
    strong: true,
  })
  return rows
}

function addressLines(order: Order): string[] {
  const a = order.shippingAddress
  if (!a) return []
  return [a.name, a.line1, a.line2, [a.postalCode, a.city].filter(Boolean).join(' '), a.state, a.country]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))
}

/* ── Customer receipt ─────────────────────────────────────── */

export function orderConfirmationEmail(order: Order) {
  const name = customerName(order)
  const address = addressLines(order)
  const isGuest = !order.user

  const blocks: Block[] = [
    {
      type: 'facts',
      title: 'Order details',
      rows: [
        { label: 'Order reference', value: order.orderNumber },
        { label: 'Placed', value: orderDate(order) },
        { label: 'Payment', value: 'Paid' },
      ],
    },
    { type: 'items', title: 'What you ordered', rows: lineItems(order), totals: totals(order) },
  ]

  if (address.length) {
    blocks.push({ type: 'lines', title: 'Shipping to', lines: address })
  }

  blocks.push({
    type: 'paragraph',
    text: 'Our team is preparing your order now. We will email you again with tracking details as soon as it leaves the warehouse.',
  })

  // A guest has no account to log into — Orders denies read access to anonymous
  // users, so this email is the only record they will ever hold. Sending them to
  // a page they cannot use would be worse than sending them nowhere.
  if (isGuest) {
    blocks.push({
      type: 'note',
      text: 'You checked out as a guest, so this email is your receipt — keep it for your records. Quote your order reference in any correspondence with us.',
    })
  } else {
    blocks.push({ type: 'button', label: 'View your orders', href: absoluteUrl('/account') })
  }

  const { html, text } = renderEmail({
    preheader: `Order ${order.orderNumber} is confirmed and being prepared.`,
    heading: 'Thank you for your order',
    intro: name
      ? `${name}, your payment has gone through and your order is confirmed.`
      : 'Your payment has gone through and your order is confirmed.',
    blocks,
    footerNote: `You are receiving this because order ${order.orderNumber} was placed at deliciousplanet.co.`,
  })

  return { subject: `Order ${order.orderNumber} confirmed`, html, text }
}

/* ── Staff alert ──────────────────────────────────────────── */

export function orderAdminAlertEmail(order: Order) {
  const address = addressLines(order)
  const total = formatPrice(order.totals?.total ?? 0, order.currency)
  const buyer = customerEmail(order) ?? 'unknown'

  const blocks: Block[] = [
    {
      type: 'facts',
      title: 'Order',
      rows: [
        { label: 'Reference', value: order.orderNumber },
        { label: 'Placed', value: orderDate(order) },
        { label: 'Customer', value: buyer },
        { label: 'Account', value: order.user ? 'Registered' : 'Guest checkout' },
        { label: 'Type', value: order.type === 'b2b' ? 'B2B' : 'Retail' },
      ],
    },
    { type: 'items', title: 'Items to pick', rows: lineItems(order), totals: totals(order) },
  ]

  if (address.length) {
    blocks.push({ type: 'lines', title: 'Ship to', lines: address })
  }

  if (order.notes?.trim()) {
    blocks.push({ type: 'lines', title: 'Customer note', lines: [order.notes.trim()] })
  }

  blocks.push({
    type: 'button',
    label: 'Open in admin',
    href: absoluteUrl(`/admin/collections/orders/${order.id}`),
  })

  const { html, text } = renderEmail({
    preheader: `${buyer} — ${total}`,
    heading: 'New order received',
    // The subject carries the reference and the value so the alert can be
    // triaged from a phone lock screen without opening it.
    intro: 'A payment has settled and this order is ready to pick.',
    blocks,
    footerNote: 'Sent to the notification address in Site Settings.',
  })

  return { subject: `New order ${order.orderNumber} — ${total}`, html, text }
}
