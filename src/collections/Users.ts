import type { CollectionConfig } from 'payload'

const isAdmin = (user: { roles?: ('admin' | 'customer')[] | null } | null): boolean =>
  Boolean(user?.roles?.includes('admin'))

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
  },
  auth: true,
  access: {
    // Storefront sign-up posts straight to /api/users, so create has to be public.
    // The beforeValidate hook below is what stops it from being an admin factory.
    create: () => true,
    admin: ({ req: { user } }) => isAdmin(user),
    unlock: ({ req: { user } }) => isAdmin(user),
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true
      return { id: { equals: user.id } }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        // `roles` arrives from an unauthenticated request body on sign-up. Only an
        // admin gets to pick roles; everyone else is pinned to 'customer'.
        if (operation === 'create' && !isAdmin(req.user)) {
          return { ...data, roles: ['customer'] }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['customer'],
      required: true,
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Customer', value: 'customer' },
      ],
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', admin: { description: 'e.g. "Home", "Office"' } },
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'state', type: 'text' },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'country', type: 'text', required: true },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'preferredCurrency',
      type: 'select',
      defaultValue: 'USD',
      options: ['USD', 'AED', 'GBP', 'EUR', 'INR'],
    },
    {
      name: 'preferredLanguage',
      type: 'select',
      defaultValue: 'en',
      options: ['en', 'ar', 'es', 'fr'],
    },
  ],
  timestamps: true,
}
