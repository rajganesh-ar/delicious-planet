import type { Access, FieldAccess } from 'payload'

/**
 * Shared access rules for the catalogue.
 *
 * Payload's default access is `({ req: { user } }) => Boolean(user)`, which on a
 * storefront means *any logged-in customer can edit the catalogue*. Every
 * collection that is public to read and admin-only to write should use these
 * rather than relying on the default.
 */

export type Role = 'admin' | 'customer' | 'fulfilment' | 'chef' | 'vendor'

type MaybeUser = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, role: Role): boolean =>
  Boolean(user?.roles?.includes(role))

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

/**
 * The same check, typed for a field.
 *
 * Field access must return a plain boolean — a `Where` is meaningless when the
 * question is "may this person write this one field" — so `isAdmin` above cannot
 * be reused directly.
 *
 * This is what keeps the fulfilment role honest inside an order it is otherwise
 * allowed to edit: it can move the status and add a tracking number, but the
 * amounts, the line items and the customer identity are locked. Payload drops a
 * field the requester cannot update rather than failing the whole save, so a
 * tampered request quietly changes nothing.
 */
export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')

/**
 * Anyone who works here: an admin, or someone with the fulfilment role.
 *
 * `fulfilment` exists so the person who packs and dispatches can have their own
 * login instead of borrowing an admin's. It grants exactly two things — the
 * ability to open the admin panel, and the ability to move an order along. It
 * is never a substitute for `isAdmin` on anything involving money, the
 * catalogue, or other people's accounts.
 */
export const isStaff: Access = ({ req: { user } }) =>
  hasRole(user, 'admin') || hasRole(user, 'fulfilment')

/** `isStaff`, typed for a field — for what a customer may never read on their own order. */
export const isStaffField: FieldAccess = ({ req: { user } }) =>
  hasRole(user, 'admin') || hasRole(user, 'fulfilment')

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
  if (hasRole(user, 'admin')) return true
  return { _status: { equals: 'published' } }
}

/**
 * For collections that are pure back-office: nothing on the storefront reads
 * them, so there is no reason to expose the rows publicly. Distinct from
 * `catalogueAccess`, whose `read` is deliberately open.
 */
export const adminOnlyAccess = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
} as const

/**
 * Writes reserved for admins, on a collection whose `read` is its own business.
 *
 * Spread this over an `access` block that only declares `read`. Leaving the
 * other three unset does not mean "nobody" — it falls through to Payload's
 * default of "any authenticated user", which on this site is every shopper who
 * has ever created an account.
 */
export const adminOnlyWrites = {
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
} as const

/**
 * Keep a collection out of the nav for anyone who is not a full admin.
 *
 * Used on everything the fulfilment role has no business in. Note what this is
 * and is not: it hides the entry, it does not restrict data. The rules above are
 * what actually stop a write; this only keeps the sidebar honest about the job
 * the person signed in to do.
 */
export const adminOnlyInNav = ({ user }: { user: unknown }): boolean =>
  !hasRole(user as MaybeUser, 'admin')

/**
 * Partner-portal roles.
 *
 * Neither one opens the admin panel — `access.admin` on Users still only lets
 * an admin or the fulfilment role through that door. What they buy is a
 * storefront identity: a chef account can author recipes at /portal/chef, and
 * a vendor account can follow its own application. Everything either role can
 * reach is scoped to rows it owns, by the `Where` filters on those collections.
 */
export const isChef: Access = ({ req: { user } }) => hasRole(user, 'chef')

export const isChefOrAdmin: Access = ({ req: { user } }) =>
  hasRole(user, 'admin') || hasRole(user, 'chef')

/**
 * The one way server code may hand out a role on a `users` create.
 *
 * Sign-up at /api/users is public, so the Users collection pins every
 * unauthenticated create to `customer` — otherwise the endpoint is an admin
 * factory. That guard is a hook, not an access rule, so `overrideAccess: true`
 * does not lift it, and /api/portal/chef needs it lifted: the account it
 * creates has to carry the `chef` role or the portal it just registered
 * somebody for refuses to let them author anything.
 *
 * `req.context` is the right lever because it cannot be reached from outside.
 * createPayloadRequest initialises it to `{}` for every REST and GraphQL
 * request, so the only writer is a Local API call — which is to say, our own
 * server code passing `context` explicitly.
 */
export const TRUSTED_ROLE_ASSIGNMENT = 'portalRoleAssignment'

export const isTrustedRoleAssignment = (context: unknown): boolean =>
  (context as Record<string, unknown> | null | undefined)?.[TRUSTED_ROLE_ASSIGNMENT] === true
