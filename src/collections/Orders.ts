import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'user', 'status', 'currency', 'createdAt'],
  },
  access: {
    create: () => true, // Created via checkout API
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { user: { equals: user.id } }
    },
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
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
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
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
      name: 'stripePaymentIntentId',
      type: 'text',
      index: true,
      admin: {
        description: 'Stripe payment intent ID for this order.',
      },
    },
  ],
  timestamps: true,
}
