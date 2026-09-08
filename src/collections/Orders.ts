import type { CollectionConfig } from 'payload'
import { hasRole, isAdminField } from './access'
import { recordOrderTimeline, stampFulfilmentDates } from './hooks/orderHooks'

/** Exported so server-side checkout can stamp the number it will show the buyer. */
export const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DP-${ts}-${rand}`
}

export const ORDER_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
] as const

export const PAYMENT_STATUSES = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Invoiced (B2B)', value: 'invoice' },
] as const

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    group: 'Sales',
    useAsTitle: 'orderNumber',
    // The list is a work queue before it is a record, so it leads with what
    // decides whether a row needs attention — who, how much, paid, shipped —
    // rather than with the internal ids.
    defaultColumns: [
      'orderNumber',
      'customer',
      'itemCount',
      'totals',
      'paymentStatus',
      'status',
      'createdAt',
    ],
    listSearchableFields: ['orderNumber', 'guestEmail'],
    components: {
      beforeList: ['/components/admin/orders/OrderQueues'],
    },
    pagination: { defaultLimit: 25, limits: [25, 50, 100] },
  },
  defaultSort: '-createdAt',
  access: {
    // Orders are only ever created server-side by /api/checkout/session, which
    // prices the cart itself. A public create would let anyone name their price.
    create: () => false,
    read: ({ req: { user } }) => {
      if (!user) return false
      // Staff see the whole book; a customer sees only their own orders. This is
      // the one collection the fulfilment role can read in full, which is the
      // entire point of the role.
      if (hasRole(user, 'admin') || hasRole(user, 'fulfilment')) return true
      return { user: { equals: user.id } }
    },
    // Fulfilment may edit an order, but only the parts of it that are theirs —
    // the field-level `isAdminField` guards below are what draw that line.
    update: ({ req: { user } }) => hasRole(user, 'admin') || hasRole(user, 'fulfilment'),
    // Deleting an order destroys a financial record. Admins only.
    delete: ({ req: { user } }) => hasRole(user, 'admin'),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.orderNumber) {
          data.orderNumber = generateOrderNumber()
        }
        return data
      },
    ],
    // Order matters: the stamp merges the stored fulfilment values into the
    // incoming data, which is what lets the timeline tell a real tracking change
    // from a partial update that simply omitted the field.
    beforeChange: [stampFulfilmentDates, recordOrderTimeline],
  },
  fields: [
    // ─── Sidebar: the state, and the buttons that change it ───────────────
    {
      name: 'quickActions',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '/components/admin/orders/FulfilmentActions' },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [...ORDER_STATUSES],
      admin: {
        position: 'sidebar',
        components: { Cell: '/components/admin/cells/StatusCell' },
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'unpaid',
      index: true,
      options: [...PAYMENT_STATUSES],
      // Declaring an order paid is a finance decision, not a dispatch one — a
      // fulfilment user who could set this could mark an unpaid order paid and
      // then ship it. Stripe writes it through the webhook, which runs with
      // access overridden and is unaffected.
      access: { update: isAdminField },
      admin: {
        position: 'sidebar',
        description: 'Set by the Stripe webhook — not by the checkout redirect.',
        components: { Cell: '/components/admin/cells/PaymentCell' },
      },
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'retail',
      options: [
        { label: 'Retail', value: 'retail' },
        { label: 'B2B', value: 'b2b' },
      ],
      access: { update: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      options: ['USD', 'AED', 'GBP', 'EUR', 'INR'],
      access: { update: isAdminField },
      admin: { position: 'sidebar' },
    },

    // ─── Main: four tabs, daily work first ────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Order',
          description: 'Everything needed to pick, pack and answer the phone.',
          fields: [
            {
              name: 'orderSummary',
              type: 'ui',
              admin: { components: { Field: '/components/admin/orders/OrderSummary' } },
            },
            {
              name: 'notes',
              type: 'textarea',
              admin: {
                readOnly: true,
                description:
                  'The note the customer left at checkout. Read-only — these are their words.',
              },
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              admin: {
                description: 'Staff-only. Never shown to the customer.',
              },
            },
          ],
        },
        {
          label: 'Fulfilment',
          description: 'A tracking number entered here is what the customer chases.',
          fields: [
            {
              name: 'fulfillment',
              type: 'group',
              label: 'Shipment',
              fields: [
                {
                  name: 'carrier',
                  type: 'select',
                  options: [
                    { label: 'DHL', value: 'dhl' },
                    { label: 'FedEx', value: 'fedex' },
                    { label: 'UPS', value: 'ups' },
                    { label: 'Aramex', value: 'aramex' },
                    { label: 'Emirates Post', value: 'emirates-post' },
                    { label: 'Local courier', value: 'local-courier' },
                    { label: 'Customer pickup', value: 'pickup' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                {
                  name: 'trackingNumber',
                  type: 'text',
                  admin: { description: 'Adding one is recorded on the Activity tab.' },
                },
                {
                  name: 'shippedAt',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Stamped automatically when the status becomes Shipped.',
                  },
                },
                {
                  name: 'deliveredAt',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Stamped automatically when the status becomes Delivered.',
                  },
                },
              ],
            },
            {
              name: 'shippingAddress',
              type: 'group',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'line1', type: 'text' },
                { name: 'line2', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'state', type: 'text' },
                { name: 'postalCode', type: 'text' },
                { name: 'country', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Activity',
          description: 'Append-only, written by the system rather than by hand.',
          fields: [
            {
              name: 'orderActivity',
              type: 'ui',
              admin: { components: { Field: '/components/admin/orders/OrderActivity' } },
            },
            {
              name: 'timeline',
              type: 'array',
              admin: {
                hidden: true,
                description: 'Raw audit rows. Rendered above.',
              },
              fields: [
                { name: 'event', type: 'text' },
                { name: 'note', type: 'text' },
                { name: 'at', type: 'date' },
                { name: 'by', type: 'relationship', relationTo: 'users' },
              ],
            },
          ],
        },
        {
          label: 'Record',
          description:
            'The numbers the order is made of. Editing these edits what was charged — change them only to correct a genuine error. Admins only; the fulfilment role sees this tab read-only.',
          fields: [
            {
              name: 'orderNumber',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              access: { update: isAdminField },
              admin: { readOnly: true },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'user',
                  type: 'relationship',
                  relationTo: 'users',
                  access: { update: isAdminField },
                  admin: { width: '50%' },
                },
                {
                  name: 'guestEmail',
                  type: 'email',
                  access: { update: isAdminField },
                  admin: {
                    width: '50%',
                    description: 'Populated for guest checkouts.',
                    condition: (data) => !data.user,
                  },
                },
              ],
            },
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 1,
              // What was bought and what it cost. Reassigning a line to a
              // cheaper product after the fact is the obvious abuse; locking the
              // whole array is simpler and tighter than guarding each amount.
              access: { update: isAdminField },
              admin: {
                description:
                  'Line items snapshot what was bought. They must stay readable after the catalogue is re-imported, so the product relationship is a convenience — the snapshot fields are the record.',
              },
              fields: [
                {
                  name: 'product',
                  type: 'relationship',
                  relationTo: 'products',
                  // Deliberately not required: a catalogue wipe or a delisted product
                  // must not make historic orders unreadable.
                  admin: { description: 'Null once the product is removed from the catalogue.' },
                },
                {
                  name: 'variantSku',
                  type: 'text',
                  index: true,
                  admin: {
                    description: 'The exact variant bought. This is the durable identifier.',
                  },
                },
                {
                  name: 'titleSnapshot',
                  type: 'text',
                  admin: { description: 'Product title as it was at purchase.' },
                },
                {
                  name: 'sizeSnapshot',
                  type: 'text',
                  admin: { description: 'Variant size as it was at purchase, e.g. "125g".' },
                },
                { name: 'quantity', type: 'number', required: true, min: 1 },
                { name: 'unitAmount', type: 'number', required: true, min: 0 },
                { name: 'currency', type: 'text', required: true },
              ],
            },
            {
              name: 'totals',
              type: 'group',
              access: { update: isAdminField },
              admin: { components: { Cell: '/components/admin/cells/TotalCell' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'subtotal', type: 'number', required: true, admin: { width: '25%' } },
                    {
                      name: 'shipping',
                      type: 'number',
                      defaultValue: 0,
                      admin: { width: '25%' },
                    },
                    { name: 'tax', type: 'number', defaultValue: 0, admin: { width: '25%' } },
                    { name: 'total', type: 'number', required: true, admin: { width: '25%' } },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'stripeCheckoutSessionId',
                  type: 'text',
                  index: true,
                  access: { update: isAdminField },
                  admin: {
                    width: '50%',
                    readOnly: true,
                    description: 'Stripe Checkout session that was opened for this order.',
                  },
                },
                {
                  name: 'stripePaymentIntentId',
                  type: 'text',
                  index: true,
                  access: { update: isAdminField },
                  admin: {
                    width: '50%',
                    readOnly: true,
                    description: 'Stripe payment intent ID for this order.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ─── List-only columns ────────────────────────────────────────────────
    // Virtual, so they cost no schema. They exist because the list needs "who"
    // and "how many" at a glance and neither is a single stored field:
    // `customer` is a user relationship *or* a guest email, and the item count
    // lives inside an array.
    {
      name: 'customer',
      type: 'ui',
      admin: {
        components: { Cell: '/components/admin/cells/CustomerCell' },
      },
    },
    {
      name: 'itemCount',
      type: 'ui',
      label: 'Items',
      admin: {
        components: { Cell: '/components/admin/cells/ItemCountCell' },
      },
    },
  ],
  timestamps: true,
}
