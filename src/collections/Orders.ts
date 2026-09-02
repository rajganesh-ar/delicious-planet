import type { CollectionConfig } from 'payload'

/** Exported so server-side checkout can stamp the number it will show the buyer. */
export const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DP-${ts}-${rand}`
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'user', 'status', 'currency', 'createdAt'],
  },
  access: {
    // Orders are only ever created server-side by /api/checkout/session, which
    // prices the cart itself. A public create would let anyone name their price.
    create: () => false,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { user: { equals: user.id } }
    },
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
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
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'guestEmail',
      type: 'email',
      admin: {
        description: 'Populated for guest checkouts.',
        condition: (data) => !data.user,
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
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
          admin: { description: 'The exact variant bought. This is the durable identifier.' },
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
      fields: [
        { name: 'subtotal', type: 'number', required: true },
        { name: 'shipping', type: 'number', defaultValue: 0 },
        { name: 'tax', type: 'number', defaultValue: 0 },
        { name: 'total', type: 'number', required: true },
      ],
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      options: ['USD', 'AED', 'GBP', 'EUR', 'INR'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'retail',
      options: [
        { label: 'Retail', value: 'retail' },
        { label: 'B2B', value: 'b2b' },
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
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Invoiced (B2B)', value: 'invoice' },
      ],
      admin: {
        description: 'Set by the Stripe webhook — not by the checkout redirect.',
      },
    },
    {
      name: 'stripeCheckoutSessionId',
      type: 'text',
      index: true,
      admin: {
        description: 'Stripe Checkout session that was opened for this order.',
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      index: true,
      admin: {
        description: 'Stripe payment intent ID for this order.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional notes left by the customer at checkout.',
      },
    },
  ],
  timestamps: true,
}
