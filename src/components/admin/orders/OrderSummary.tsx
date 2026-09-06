import React from 'react'
import type { Payload, TypedUser } from 'payload'
import { Badge } from '../Badge'
import {
  CARRIER_META,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  formatDateTime,
  formatMoney,
  timeAgo,
  trackingUrl,
} from '../shared'
import { stripePaymentUrl } from '../stripe-link'
import '../admin.css'

/**
 * The whole order on one screen, above the fields.
 *
 * Answering "what did they buy, did they pay, where is it going" used to mean
 * opening three collapsed arrays and doing arithmetic on unit amounts. Everything
 * here is read-only and derived — the editable truth is still on the Record tab —
 * because the common case by far is reading an order, not correcting one.
 *
 * Line items render from the snapshot fields, never from the product
 * relationship, for the same reason the collection stores them: the product may
 * have been re-imported or delisted since, and a historic order must still say
 * what was actually sold.
 */

interface Line {
  titleSnapshot?: string | null
  sizeSnapshot?: string | null
  variantSku?: string | null
  quantity?: number | null
  unitAmount?: number | null
  product?: number | { id?: number; slug?: string | null } | null
}

interface OrderData {
  id?: number
  orderNumber?: string | null
  currency?: string | null
  status?: string | null
  paymentStatus?: string | null
  type?: string | null
  createdAt?: string | null
  guestEmail?: string | null
  user?: number | { id?: number; email?: string | null; name?: string | null } | null
  items?: Line[] | null
  totals?: {
    subtotal?: number | null
    shipping?: number | null
    tax?: number | null
    total?: number | null
  } | null
  shippingAddress?: {
    name?: string | null
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  } | null
  fulfillment?: {
    carrier?: string | null
    trackingNumber?: string | null
    shippedAt?: string | null
    deliveredAt?: string | null
  } | null
  stripePaymentIntentId?: string | null
}

export default async function OrderSummary({
  data,
  payload,
  user,
}: {
  data?: OrderData
  payload: Payload
  user?: TypedUser
}) {
  const order = data ?? {}

  // A brand-new document has nothing to summarise, and orders are never created
  // by hand anyway — checkout writes them.
  if (!order.id) return null

  const isAdmin = Boolean((user as { roles?: string[] } | undefined)?.roles?.includes('admin'))

  const currency = order.currency ?? 'AED'
  const items = Array.isArray(order.items) ? order.items : []
  const totals = order.totals ?? {}
  const address = order.shippingAddress
  const fulfillment = order.fulfillment

  const status = ORDER_STATUS_META[order.status ?? ''] ?? { label: order.status ?? '—', tone: 'neutral' as const }
  const payment = PAYMENT_STATUS_META[order.paymentStatus ?? ''] ?? {
    label: order.paymentStatus ?? '—',
    tone: 'neutral' as const,
  }

  const adminRoute = payload.config.routes.admin

  // The customer may arrive populated, as a bare id, or — for a fulfilment user,
  // who has no read access to `users` — not at all. Resolving it here with
  // access overridden is deliberate and narrow: knowing whose parcel this is
  // comes with the order, and does not imply the run of the customer list.
  let account = typeof order.user === 'object' && order.user !== null ? order.user : null
  const accountId = account?.id ?? (typeof order.user === 'number' ? order.user : null)

  if (accountId && !account?.email) {
    const { docs } = await payload.find({
      collection: 'users',
      where: { id: { equals: accountId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      select: { name: true, email: true },
    })
    if (docs[0]) account = { id: docs[0].id, name: docs[0].name, email: docs[0].email }
  }

  const customerName = account?.name?.trim() || null
  const customerEmail = account?.email?.trim() || order.guestEmail?.trim() || null

  const carrier = fulfillment?.carrier ? CARRIER_META[fulfillment.carrier]?.label : null
  const tracking = fulfillment?.trackingNumber ?? null
  const trackHref = trackingUrl(fulfillment?.carrier, tracking)
  const stripeHref = stripePaymentUrl(order.stripePaymentIntentId)

  const addressLines = address
    ? [
        address.name,
        address.line1,
        address.line2,
        [address.postalCode, address.city].filter(Boolean).join(' '),
        [address.state, address.country].filter(Boolean).join(', '),
      ].filter((line) => Boolean(line && String(line).trim()))
    : []

  return (
    <div className="dp-order">
      <div className="dp-order__facts">
        <div className="dp-fact">
          <div className="dp-fact__label">Placed</div>
          <div className="dp-fact__value">{timeAgo(order.createdAt)}</div>
          <div className="dp-table__muted">{formatDateTime(order.createdAt)}</div>
        </div>

        <div className="dp-fact">
          <div className="dp-fact__label">Customer</div>
          <div className="dp-fact__value dp-fact__value--small">
            {customerName ? <div>{customerName}</div> : null}
            {customerEmail ? (
              <a href={`mailto:${customerEmail}`}>{customerEmail}</a>
            ) : (
              <span className="dp-table__muted">No email on file</span>
            )}
            <div className="dp-table__muted">
              {/* Only an admin can open a user record, so only an admin is
                  offered the link — a fulfilment user clicking it would be
                  refused at the collection. */}
              {accountId ? (
                isAdmin ? (
                  <a href={`${adminRoute}/collections/users/${accountId}`}>Account</a>
                ) : (
                  'Registered customer'
                )
              ) : (
                'Guest checkout'
              )}
              {order.type === 'b2b' ? ' · B2B' : ''}
            </div>
          </div>
        </div>

        <div className="dp-fact">
          <div className="dp-fact__label">Payment</div>
          <div className="dp-fact__value dp-fact__value--small">
            <Badge tone={payment.tone}>{payment.label}</Badge>
            <div className="dp-table__muted" style={{ marginTop: '0.35rem' }}>
              {stripeHref ? (
                <a href={stripeHref} target="_blank" rel="noreferrer">
                  Open in Stripe
                </a>
              ) : (
                'Not charged through Stripe'
              )}
            </div>
          </div>
        </div>

        <div className="dp-fact">
          <div className="dp-fact__label">Shipment</div>
          <div className="dp-fact__value dp-fact__value--small">
            <Badge tone={status.tone}>{status.label}</Badge>
            <div className="dp-table__muted" style={{ marginTop: '0.35rem' }}>
              {tracking ? (
                <>
                  {carrier ? `${carrier} · ` : ''}
                  {trackHref ? (
                    <a href={trackHref} target="_blank" rel="noreferrer">
                      {tracking}
                    </a>
                  ) : (
                    tracking
                  )}
                </>
              ) : (
                'No tracking number yet'
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dp-panel">
        <div className="dp-panel__head">
          <h3 className="dp-panel__title">
            {items.length} {items.length === 1 ? 'line' : 'lines'}
          </h3>
          <span className="dp-table__muted">Order {order.orderNumber}</span>
        </div>

        <div className="dp-panel__body dp-panel__body--flush">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th className="dp-table__num">Qty</th>
                <th className="dp-table__num">Unit</th>
                <th className="dp-table__num">Line</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const quantity = Number(item.quantity) || 0
                const unit = Number(item.unitAmount) || 0
                const productId =
                  typeof item.product === 'object' && item.product !== null
                    ? item.product.id
                    : item.product
                return (
                  <tr key={item.variantSku ?? i}>
                    <td>
                      {productId ? (
                        <a href={`${adminRoute}/collections/products/${productId}`}>
                          {item.titleSnapshot ?? 'Untitled item'}
                        </a>
                      ) : (
                        <span>{item.titleSnapshot ?? 'Untitled item'}</span>
                      )}
                      {item.sizeSnapshot ? (
                        <div className="dp-table__muted">{item.sizeSnapshot}</div>
                      ) : null}
                      {!productId ? (
                        <div className="dp-table__muted">No longer in the catalogue</div>
                      ) : null}
                    </td>
                    <td className="dp-table__mono">{item.variantSku ?? '—'}</td>
                    <td className="dp-table__num">{quantity}</td>
                    <td className="dp-table__num">{formatMoney(unit, currency)}</td>
                    <td className="dp-table__num">{formatMoney(unit * quantity, currency)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="dp-order__totals">
            <div className="dp-order__total-row">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotal, currency)}</span>
            </div>
            <div className="dp-order__total-row">
              <span>Shipping</span>
              <span>{formatMoney(totals.shipping ?? 0, currency)}</span>
            </div>
            <div className="dp-order__total-row">
              <span>Tax</span>
              <span>{formatMoney(totals.tax ?? 0, currency)}</span>
            </div>
            <div className="dp-order__total-row dp-order__total-row--grand">
              <span>Total</span>
              <span>{formatMoney(totals.total, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dp-panel">
        <div className="dp-panel__head">
          <h3 className="dp-panel__title">Ship to</h3>
        </div>
        <div className="dp-panel__body">
          {addressLines.length > 0 ? (
            <address className="dp-address">
              {addressLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </address>
          ) : (
            <span className="dp-table__muted">
              No shipping address captured — check the Fulfilment tab before dispatching.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
