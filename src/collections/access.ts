import type { Access } from 'payload'

/**
 * Shared access rules for the catalogue.
 *
 * Payload's default access is `({ req: { user } }) => Boolean(user)`, which on a
 * storefront means *any logged-in customer can edit the catalogue*. Every
 * collection that is public to read and admin-only to write should use these
 * rather than relying on the default.
 */

export const isAdmin: Access = ({ req: { user } }) => Boolean(user?.roles?.includes('admin'))

/** Anyone may read; only admins may write. */
export const publicRead: Access = () => true

export const catalogueAccess = {
  read: publicRead,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
} as const

/**
 * For collections carrying drafts: the public may read published documents,
 * staff may read everything.
 */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  return { _status: { equals: 'published' } }
}
