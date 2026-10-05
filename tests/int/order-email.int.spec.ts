// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { markOrderPaid } from '../../src/lib/orders'
import { orderAdminAlertEmail, orderConfirmationEmail } from '../../src/lib/email/templates/order'
import type { Order } from '../../src/payload-types'

/**
 * The order confirmation is sent from markOrderPaid's `'updated'` branch, which
 * is the one place that runs exactly once per order — the Stripe webhook and
 * the post-checkout confirmation route race each other by design. These tests
 * pin the two properties that makes safe: exactly one send per order, and a
 * mail failure that cannot break the payment.
 */

const ORDER = {
  id: 7,
  orderNumber: 'DP-TEST-7',
  currency: 'AED',
  status: 'pending',
  paymentStatus: 'unpaid',
  type: 'retail',
  guestEmail: 'buyer@example.com',
  user: null,
  createdAt: '2026-09-06T10:00:00.000Z',
  items: [
    {
      titleSnapshot: 'Garcia de la Cruz Organic',
      sizeSnapshot: '500ml',
      variantSku: 'GDLC-500',
      quantity: 2,
      unitAmount: 45,
      currency: 'AED',
    },
  ],
  totals: { subtotal: 90, shipping: 0, tax: 0, total: 90 },
  shippingAddress: {
    name: 'A Buyer',
    line1: '26th Floor, Amber Gem Tower',
    city: 'Ajman',
    postalCode: '00000',
    country: 'United Arab Emirates',
  },
} as unknown as Order

function fakePayload(overrides: Partial<Record<string, unknown>> = {}) {
  const state = { ...ORDER } as Record<string, unknown>
  const sendEmail = vi.fn(async () => undefined)

  const payload = {
    // No transaction support: markOrderPaid then runs unlocked, which is all
    // these tests need. The lock itself is covered in order-payment.int.spec.ts.
    db: { beginTransaction: vi.fn(async () => null) },
    findByID: vi.fn(async () => state),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      Object.assign(state, data)
      return state
    }),
    findGlobal: vi.fn(async () => ({ notifications: { orderEmail: 'shop@example.com' } })),
    sendEmail,
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    ...overrides,
  } as unknown as Payload

  return { payload, sendEmail, state }
}

const recipients = (sendEmail: ReturnType<typeof vi.fn>) =>
  sendEmail.mock.calls.map((call) => (call[0] as { to: string }).to).sort()

describe('order confirmation email', () => {
  it('emails the buyer and the shop when an order is first marked paid', async () => {
    const { payload, sendEmail } = fakePayload()

    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('updated')
    expect(recipients(sendEmail)).toEqual(['buyer@example.com', 'shop@example.com'])
  })

  it('sends nothing the second time, so the webhook/redirect race cannot double up', async () => {
    const { payload, sendEmail } = fakePayload()

    await markOrderPaid(payload, 7, 'pi_123')
    sendEmail.mockClear()

    // The state object was mutated to paid by the first call, exactly as the
    // real row would have been.
    expect(await markOrderPaid(payload, 7, 'pi_123')).toBe('already-paid')
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('still reports the payment as updated when sending fails', async () => {
    // A mail outage must not turn a captured payment into a 500, which would
    // make Stripe retry a delivery that can never succeed.
    const { payload } = fakePayload({
      sendEmail: vi.fn(async () => {
        throw new Error('provider down')
      }),
    })

    await expect(markOrderPaid(payload, 7, 'pi_123')).resolves.toBe('updated')
  })

  it('falls back to the environment address when staff alerts are switched off', async () => {
    const { payload, sendEmail } = fakePayload({
      findGlobal: vi.fn(async () => ({ notifications: { enabled: false } })),
    })

    await markOrderPaid(payload, 7, 'pi_123')

    // Only the buyer — an explicit "off" suppresses the staff copy.
    expect(recipients(sendEmail)).toEqual(['buyer@example.com'])
  })
})

describe('order email content', () => {
  const paid = { ...ORDER, paymentStatus: 'paid' } as Order

  it('carries the reference, the line items and the total', () => {
    const { subject, html, text } = orderConfirmationEmail(paid)

    expect(subject).toContain('DP-TEST-7')
    expect(html).toContain('DP-TEST-7')
    expect(html).toContain('Garcia de la Cruz Organic')
    expect(html).toContain('500ml')
    // 2 × 45, formatted through the same helper the storefront uses.
    expect(html).toContain('90.00')
    expect(text).toContain('DP-TEST-7')
    expect(text).toContain('Garcia de la Cruz Organic')
  })

  it('gives a guest their receipt rather than a link they cannot open', () => {
    // Orders denies read access to anonymous users, so /account would turn a
    // guest away — this email is the only record they get.
    const { html } = orderConfirmationEmail(paid)

    expect(html).not.toContain('/account')
    expect(html).toContain('checked out as a guest')
  })

  it('links a registered customer to their orders', () => {
    const withAccount = {
      ...paid,
      user: { id: 3, email: 'member@example.com', name: 'A Member' },
    } as unknown as Order

    const { html } = orderConfirmationEmail(withAccount)

    expect(html).toContain('/account')
    expect(html).toContain('A Member')
  })

  it('puts the reference and value in the staff subject line', () => {
    const { subject, html } = orderAdminAlertEmail(paid)

    expect(subject).toContain('DP-TEST-7')
    expect(subject).toContain('90.00')
    // Deep link straight to the record, so the alert is actionable.
    expect(html).toContain('/admin/collections/orders/7')
  })

  it('escapes customer-supplied text rather than interpolating it raw', () => {
    const hostile = {
      ...paid,
      notes: '<script>alert(1)</script>',
    } as unknown as Order

    const { html } = orderAdminAlertEmail(hostile)

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
