import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, hasRole, isTrustedRoleAssignment, type Role } from './access'
import { passwordResetEmail } from '../lib/email/templates/password-reset'
import { SITE_URL } from '../lib/site-url'

type MaybeUser = { roles?: Role[] | null } | null

const isAdmin = (user: MaybeUser): boolean => hasRole(user, 'admin')

/**
 * Who may open the admin panel at all.
 *
 * Wider than `isAdmin` on purpose: the fulfilment role needs to get through this
 * door to reach the orders queue. It gets no further — every collection other
 * than Orders is hidden from its nav and admin-only to write, and the fields on
 * an order that involve money or identity are locked to admins field by field.
 */
const isStaff = (user: MaybeUser): boolean => isAdmin(user) || hasRole(user, 'fulfilment')

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Customers',
    hidden: adminOnlyInNav,
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
  },
  auth: {
    forgotPassword: {
      /**
       * Payload's default reset link points into /admin, which every customer
       * is refused by `access.admin` below — so out of the box a locked-out
       * shopper is sent to a page that turns them away. Pointing it at the
       * storefront's own /reset-password is what makes the flow usable.
       *
       * Only HTML and a subject can be supplied here; the shared template's
       * plain-text half is unused on this one message.
       */
      generateEmailSubject: () => passwordResetEmail('').subject,
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? ''
        const user = (args as { user?: { name?: string | null } } | undefined)?.user
        const url = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`
        return passwordResetEmail(url, user?.name).html
      },
    },
  },
  access: {
    // Storefront sign-up posts straight to /api/users, so create has to be public.
    // The beforeValidate hook below is what stops it from being an admin factory.
    create: () => true,
    admin: ({ req: { user } }) => isStaff(user),
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
        //
        // The exception is our own server code — /api/portal/chef creates an
        // account that has to carry the `chef` role — which says so through
        // req.context. Nothing outside the process can set that; see the note
        // on TRUSTED_ROLE_ASSIGNMENT.
        if (
          operation === 'create' &&
          !isAdmin(req.user) &&
          !isTrustedRoleAssignment(req.context)
        ) {
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
        { label: 'Order fulfilment', value: 'fulfilment' },
        { label: 'Customer', value: 'customer' },
        { label: 'Chef', value: 'chef' },
        { label: 'Vendor', value: 'vendor' },
      ],
      admin: {
        description:
          'Admin sees and edits everything. Order fulfilment can sign in and move orders along — status, carrier, tracking, internal notes — and nothing else. Customer is storefront-only and cannot open this panel. Chef and Vendor are partner-portal roles: also storefront-only, but they unlock /portal — a chef authors recipes, a vendor follows its own application.',
      },
      // Only an admin may hand out roles. Without this a fulfilment user could
      // promote themselves on their own account page, since `update` above lets
      // anyone edit their own record.
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
