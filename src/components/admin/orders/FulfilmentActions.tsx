'use client'

import React from 'react'
import { toast, useAuth, useDocumentInfo, useForm, useFormFields } from '@payloadcms/ui'
import '../admin.css'

/**
 * One-click transitions in the order sidebar.
 *
 * Moving an order along used to be: open the status select, find the right
 * value, scroll to Save. Three interactions, several times a day, with the
 * always-present chance of picking the row above the one you meant. These
 * buttons do the whole transition, and only offer the transitions that make
 * sense from where the order currently is — you cannot mark an unpaid order
 * delivered by mis-clicking.
 *
 * Each button both dispatches into form state (so the select next to it updates
 * at once) and passes the same value as a submit override, because the form's
 * submit reads a ref that has not yet caught up with the dispatch.
 */

type Action = {
  key: string
  label: string
  primary?: boolean
  patch: Record<string, unknown>
  toast: string
}

export default function FulfilmentActions() {
  const { id, docPermissions } = useDocumentInfo()
  const { dispatchFields, submit } = useForm()
  const { user } = useAuth()
  const [busy, setBusy] = React.useState<string | null>(null)

  // `paymentStatus` is admin-only at the field level, so for a fulfilment user
  // "Mark paid" would submit and silently do nothing — Payload drops fields the
  // requester cannot write rather than erroring. A button that appears to work
  // and doesn't is worse than no button.
  const canSetPayment = Boolean(
    (user as { roles?: string[] } | null | undefined)?.roles?.includes('admin'),
  )

  const status = useFormFields(([fields]) => fields?.status?.value as string | undefined)
  const paymentStatus = useFormFields(
    ([fields]) => fields?.paymentStatus?.value as string | undefined,
  )
  const trackingNumber = useFormFields(
    ([fields]) => fields?.['fulfillment.trackingNumber']?.value as string | undefined,
  )

  // Nothing to advance on an unsaved document, and nothing to offer someone who
  // cannot write to it. Payload only ever sets `update` to `true`; absent means
  // denied, so the check has to be for truthiness rather than for `false`.
  if (!id || !docPermissions?.update) return null

  const settled = status === 'cancelled' || status === 'refunded'
  // Which button is green matters: it is the one a busy person clicks without
  // reading. While the money is outstanding that has to be "Mark paid" —
  // highlighting "Mark shipped" on an unpaid order would be nudging staff to
  // give the goods away. Shipping unpaid is still *offered*, because B2B orders
  // on invoice terms legitimately go out before payment lands.
  const awaitingMoney = paymentStatus === 'unpaid' || paymentStatus === 'failed'
  const actions: Action[] = []

  if (awaitingMoney && !settled && canSetPayment) {
    actions.push({
      key: 'paid',
      label: 'Mark paid',
      primary: true,
      patch: { paymentStatus: 'paid', ...(status === 'pending' ? { status: 'processing' } : {}) },
      toast: 'Marked paid.',
    })
  }

  if (status === 'pending' && !settled) {
    actions.push({
      key: 'processing',
      label: 'Start processing',
      patch: { status: 'processing' },
      toast: 'Moved to processing.',
    })
  }

  if ((status === 'pending' || status === 'processing') && !settled) {
    actions.push({
      key: 'shipped',
      label: 'Mark shipped',
      primary: !awaitingMoney,
      patch: { status: 'shipped' },
      toast: 'Marked shipped — dispatch time stamped.',
    })
  }

  if (status === 'shipped') {
    actions.push({
      key: 'delivered',
      label: 'Mark delivered',
      primary: !awaitingMoney,
      patch: { status: 'delivered' },
      toast: 'Marked delivered.',
    })
  }

  if (!settled && status !== 'delivered') {
    actions.push({
      key: 'cancelled',
      label: 'Cancel order',
      patch: { status: 'cancelled' },
      toast: 'Order cancelled.',
    })
  }

  if (actions.length === 0) return null

  const run = async (action: Action) => {
    setBusy(action.key)
    try {
      Object.entries(action.patch).forEach(([path, value]) => {
        dispatchFields({ type: 'UPDATE', path, value })
      })
      const result = await submit({ overrides: action.patch, disableSuccessStatus: true })
      // A failed save does not throw: Payload shows its own error toast and
      // returns nothing, or a 4xx/5xx response. Claiming success on top of that
      // told staff "Marked shipped" for an order that was not.
      if (result?.res?.ok) toast.success(action.toast)
    } catch {
      toast.error('Could not save the change. Nothing was altered.')
    } finally {
      setBusy(null)
    }
  }

  const shippingWithoutTracking =
    actions.some((action) => action.key === 'shipped') && !trackingNumber

  // Deliberately leaves this order with no highlighted action. Nothing here is
  // the obvious next step for someone who cannot take the payment, and inventing
  // a green button would only push them to ship goods that are not paid for.
  const blockedOnPayment = awaitingMoney && !canSetPayment && !settled

  return (
    <div className="dp-actions">
      <div className="dp-actions__label">Quick actions</div>
      <div className="dp-actions__row">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={`dp-actions__btn${action.primary ? ' dp-actions__btn--primary' : ''}`}
            disabled={busy !== null}
            onClick={() => run(action)}
          >
            {busy === action.key ? 'Saving…' : action.label}
          </button>
        ))}
      </div>
      {blockedOnPayment ? (
        <p className="dp-actions__note">
          This order has not been paid for. Only an admin can record a payment — check before you
          dispatch it.
        </p>
      ) : null}
      {shippingWithoutTracking ? (
        <p className="dp-actions__note">
          No tracking number yet — add one on the Fulfilment tab before shipping and the customer
          has something to chase.
        </p>
      ) : null}
    </div>
  )
}
