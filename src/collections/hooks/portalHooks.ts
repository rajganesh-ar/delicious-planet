import { APIError } from 'payload'
import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionSlug,
  Payload,
  PayloadRequest,
} from 'payload'
import { hasRole } from '../access'
import { slugify } from './productHooks'
import { CHEF_ROLES, CHEF_SETTABLE_RECIPE_STATUSES, labelFor } from '../../lib/portal-options'

/**
 * Hooks behind the partner portal.
 *
 * Everything here exists because the two collections take writes from people
 * who are not staff. Field-level access already strips values a chef or a form
 * may not set — Payload runs that in the *field* beforeValidate phase, before
 * any of the collection hooks below — so by the time these run, the data has
 * been cleaned and their job is to fill the gap authoritatively.
 */

/** Appends -2, -3 … until the slug is free. */
async function uniqueSlug(
  payload: Payload,
  collection: Extract<CollectionSlug, 'chef-profiles' | 'recipes'>,
  base: string,
  currentId: unknown,
  req: PayloadRequest,
): Promise<string> {
  let candidate = base || 'untitled'
  for (let attempt = 2; attempt < 60; attempt += 1) {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const clash = existing.docs[0]
    if (!clash || (currentId != null && clash.id === currentId)) return candidate
    candidate = `${base}-${attempt}`
  }
  // 58 people called the same thing is not a case worth a nicer failure than
  // a random suffix that is certainly free.
  return `${base}-${Date.now().toString(36)}`
}

/* ═══ Vendor applications ════════════════════════════════════════════ */

/**
 * Stamps the reference an applicant quotes back at us.
 *
 * Format is DP-V-<year>-<six base36 characters>. Deliberately not sequential:
 * a sequential reference tells every applicant how many others there are, and
 * makes another application's status guessable at /portal/vendor/status.
 */
export const stampVendorReference: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (!data || operation !== 'create') return data

  if (!data.reference) {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase()
    data.reference = `DP-V-${new Date().getFullYear()}-${random}`
  }
  if (!data.submittedAt) data.submittedAt = new Date().toISOString()

  return data
}

/* ═══ Chef profiles ══════════════════════════════════════════════════ */

export const ensureChefSlug: CollectionBeforeValidateHook = async ({ data, req, originalDoc }) => {
  if (!data) return data

  const source =
    typeof data.displayName === 'string' && data.displayName.trim()
      ? data.displayName
      : typeof originalDoc?.displayName === 'string'
        ? originalDoc.displayName
        : ''

  if (!source.trim()) return data

  const base = slugify(source)
  // Renaming a chef would change the slug, and the slug is in the URL of every
  // recipe byline that links to them. Once set, it stays set.
  if (originalDoc?.slug) {
    data.slug = originalDoc.slug
    return data
  }

  data.slug = await uniqueSlug(req.payload, 'chef-profiles', base, originalDoc?.id ?? data.id, req)
  return data
}

/* ═══ Recipes ════════════════════════════════════════════════════════ */

/**
 * Binds a recipe to whoever is writing it, and keeps publication out of their
 * hands.
 *
 * This is the load-bearing hook of the chef portal. A chef posts to
 * /api/recipes with their own session cookie, so without this they could send
 * `author` pointing at another chef, or `status: "published"`, and Payload
 * would take both — the collection's access rules only decide *which rows*
 * they may write, never what they may put in them.
 *
 * Admins are exempt: an editor legitimately reassigns a byline and publishes.
 */
export const pinRecipeOwnership: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return data
  const { user, payload } = req

  if (hasRole(user, 'admin')) return data
  if (!user) throw new APIError('You must be signed in to write a recipe.', 401)

  data.author = user.id

  // The byline follows the account, so a chef who has not registered a profile
  // cannot author at all — which is the intent: /portal/chef/register is the
  // door, and it always creates both records together.
  const profiles = await payload.find({
    collection: 'chef-profiles',
    where: { account: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  const profile = profiles.docs[0]
  if (!profile) {
    throw new APIError('Register a chef profile before submitting a recipe.', 403)
  }
  data.chef = profile.id

  // A chef moves a recipe between draft and submitted. Published, changes
  // requested and archived are ours to set; anything else falls back to what
  // the row already is, or to draft on a new one.
  const requested = typeof data.status === 'string' ? data.status : undefined
  const settable = CHEF_SETTABLE_RECIPE_STATUSES as readonly string[]
  if (!requested || !settable.includes(requested)) {
    data.status = operation === 'create' ? 'draft' : (originalDoc?.status ?? 'draft')
  }

  return data
}

export const ensureRecipeSlug: CollectionBeforeValidateHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (!data) return data

  const source =
    typeof data.title === 'string' && data.title.trim()
      ? data.title
      : typeof originalDoc?.title === 'string'
        ? originalDoc.title
        : ''

  if (!source.trim()) return data

  // A published recipe's URL is fixed — retitling it must not 404 the link
  // somebody shared. Before publication the slug tracks the title.
  if (originalDoc?.slug && originalDoc?.status === 'published') {
    data.slug = originalDoc.slug
    return data
  }

  data.slug = await uniqueSlug(req.payload, 'recipes', slugify(source), originalDoc?.id, req)
  return data
}

/**
 * Derives everything the recipe page reads but nobody types: the total time,
 * the byline snapshot, and the two workflow timestamps.
 */
export const deriveRecipeRollups: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (!data) return data

  const prep = Number(data.prepMinutes)
  const cook = Number(data.cookMinutes)
  const total = (Number.isFinite(prep) ? prep : 0) + (Number.isFinite(cook) ? cook : 0)
  data.totalMinutes = total > 0 ? total : null

  // Byline, copied rather than joined. The chef profile is private — it holds
  // an email and an employer — and a public recipe page must not have to read
  // it. Same reasoning as the title snapshot on an order line.
  const chefId =
    typeof data.chef === 'object' && data.chef !== null
      ? (data.chef as { id?: unknown }).id
      : (data.chef ?? originalDoc?.chef)

  if (chefId != null) {
    try {
      const profile = await req.payload.findByID({
        collection: 'chef-profiles',
        id: chefId as string | number,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (profile) {
        data.chefName = profile.displayName
        // The label, not the stored value — this string is printed under the
        // byline, and "head_chef" is not a job title.
        data.chefTitle = [labelFor(CHEF_ROLES, profile.chefRole), profile.establishment]
          .filter(Boolean)
          .join(' · ')
      }
    } catch {
      // A missing profile must not block the save — the recipe still has an
      // author, and the byline can be filled in by hand.
    }
  }

  const previousStatus = originalDoc?.status
  if (data.status === 'submitted' && previousStatus !== 'submitted') {
    data.submittedAt = new Date().toISOString()
  }
  if (data.status === 'published' && !originalDoc?.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }

  return data
}

/* ═══ Media ══════════════════════════════════════════════════════════ */

/**
 * SVG is an image the way a web page is an image: it can carry script, and it
 * is served from the media domain rather than sandboxed. Staff uploading a
 * logo is a considered act; a contributor uploading a dish photo has no reason
 * to send one, so the format is simply not available to them.
 *
 * `mimeTypes` on the collection is the first gate and refuses everything that
 * is not an image at all. This is the second, and the only one that knows who
 * is asking.
 */
export const restrictContributorUploads: CollectionBeforeValidateHook = ({ data, req }) => {
  const mimetype = req.file?.mimetype ?? ''
  if (mimetype === 'image/svg+xml' && !hasRole(req.user, 'admin')) {
    throw new APIError('SVG files cannot be uploaded here. Please send a JPEG, PNG or WebP.', 400)
  }
  return data
}
