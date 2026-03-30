import type { CollectionConfig } from 'payload'

export const B2BInquiries: CollectionConfig = {
  slug: 'b2b-inquiries',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'contactName', 'status', 'assignedOffice', 'createdAt'],
  },
  access: {
    create: () => true, // Public form submissions
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      name: 'contactName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Review', value: 'in_review' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Closed — Won', value: 'won' },
        { label: 'Closed — Lost', value: 'lost' },
      ],
    },
    {
      name: 'assignedOffice',
      type: 'relationship',
      relationTo: 'office-locations',
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to the customer).',
      },
    },
  ],
  timestamps: true,
}
