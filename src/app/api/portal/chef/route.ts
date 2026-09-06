import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { TRUSTED_ROLE_ASSIGNMENT } from '@/collections/access'
import { COUNTRY_OPTIONS } from '@/lib/countries'
import {
  CHEF_ROLES,
  CUISINES,
  EXPERIENCE_BANDS,
  KITCHEN_TYPES,
} from '@/lib/portal-options'
import {
  bool,
  compact,
  email as parseEmail,
  num,
  pick,
  pickMany,
  relationIds,
  rows,
  str,
} from '@/lib/portal-input'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

const CHEF_RATE_LIMIT = { limit: 5, windowMs: 60 * 60_000 }

const MIN_PASSWORD_LENGTH = 8

/**
 * Chef registration — one request, two records.
 *
 * A chef needs a login (to come back to their drafts) and a profile (to carry
 * the byline), and neither is any use without the other. Doing it here rather
 * than from the browser is what lets the account be created with the `chef`
 * role at all: /api/users is public to create, but the Users collection pins
 * every unauthenticated sign-up to `customer`, and rightly so — a public
 * endpoint that accepts a role is an admin factory.
 *
 * If the profile write fails, the account is deleted again. A user row with
 * the chef role and no profile is the one state the portal cannot recover
 * from on its own: `pinRecipeOwnership` refuses to author without a profile,
 * and the registration form would refuse to make a second account for an
 * address that already exists. Better to leave nothing behind and let them
 * try again.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`portal-chef:${clientKey(req)}`, CHEF_RATE_LIMIT)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many registrations from this connection. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return bad('Malformed request.')
  }

  const links = (body.links ?? {}) as Record<string, unknown>

  const email = parseEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''
  const displayName = str(body.displayName, 120)

  const profile = compact({
    displayName,
    email,
    phone: str(body.phone, 60),
    chefRole: pick(CHEF_ROLES, body.chefRole),
    establishment: str(body.establishment, 200),
    kitchenType: pick(KITCHEN_TYPES, body.kitchenType),
    experience: pick(EXPERIENCE_BANDS, body.experience),
    cuisines: pickMany(CUISINES, body.cuisines, 12),
    specialities: str(body.specialities, 2000),
    bio: str(body.bio, 3000),
    city: str(body.city, 120),
    country: pick(COUNTRY_OPTIONS, body.country),
    links: compact({
      website: str(links.website, 300),
      instagram: str(links.instagram, 300),
      youtube: str(links.youtube, 300),
      linkedin: str(links.linkedin, 300),
    }),
    awards: str(body.awards, 2000),
    qualifications: rows(body.qualifications, 8, (entry) => {
      const name = str(entry.name, 200)
      if (!name) return undefined
      return compact({
        name,
        institution: str(entry.institution, 200),
        year: num(entry.year, 1900, new Date().getFullYear()),
      })
    }),
    familiarProducts: relationIds(body.familiarProducts, 20),
    motivation: str(body.motivation, 3000),
    consentPublish: bool(body.consentPublish),
    consentTerms: bool(body.consentTerms),
  })

  const missing: string[] = []
  if (!displayName) missing.push('your name')
  if (!email) missing.push('a valid email address')
  if (!profile.chefRole) missing.push('your role')
  if (!profile.experience) missing.push('years of experience')
  if (!profile.cuisines?.length) missing.push('at least one cuisine')
  if (!profile.bio) missing.push('a short biography')
  if (!profile.country) missing.push('your country')

  if (missing.length > 0) return bad(`Please complete: ${missing.join(', ')}.`)
  if (password.length < MIN_PASSWORD_LENGTH) {
    return bad(`Please choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`)
  }
  if (!profile.consentTerms || !profile.consentPublish) {
    return bad('Please accept the contributor terms and the permission to publish.')
  }

  const payload = await getPayload({ config: await config })

  // Checked up front so the common case — someone who already shops with us —
  // gets an answer that tells them what to do, rather than a duplicate-key
  // error from the database.
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    return bad(
      'An account already exists for that email address. Sign in first, and we will add the chef profile to it.',
      409,
    )
  }

  let accountId: number | string | undefined

  try {
    const account = await payload.create({
      collection: 'users',
      data: {
        name: displayName,
        email: email as string,
        password,
        // `customer` stays alongside `chef` so a chef can also shop — the role
        // list is additive, and dropping it would take the storefront account
        // away from someone who signs up to write.
        roles: ['customer', 'chef'],
        phone: profile.phone,
      },
      overrideAccess: true,
      // `overrideAccess` lifts access control, not hooks — and the guard that
      // pins a public sign-up to `customer` is a hook. This is what tells it
      // the write is ours. See TRUSTED_ROLE_ASSIGNMENT in collections/access.
      context: { [TRUSTED_ROLE_ASSIGNMENT]: true },
    })
    accountId = account.id

    await payload.create({
      collection: 'chef-profiles',
      data: { ...profile, account: account.id, status: 'pending' } as never,
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    payload.logger.error({ err }, 'Chef registration failed')

    if (accountId != null) {
      try {
        await payload.delete({ collection: 'users', id: accountId, overrideAccess: true })
      } catch (cleanupErr) {
        // Now there is an account with the chef role and no profile. Logged
        // loudly because it needs a human: either finish the profile in the
        // admin panel, or delete the user.
        payload.logger.error(
          { err: cleanupErr, accountId },
          'Orphaned chef account could not be removed — finish or delete it by hand',
        )
      }
    }

    return bad('We could not complete your registration. Please try again.', 500)
  }
}
