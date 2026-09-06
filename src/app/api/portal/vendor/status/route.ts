import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { email as parseEmail, str } from '@/lib/portal-input'
import { labelFor, VENDOR_STATUSES } from '@/lib/portal-options'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Tighter than the submission endpoint, because this one is the guessable
 * half: a reference plus an email is a two-part secret, and a rate limit is
 * what stops it being brute-forced one character at a time.
 */
const STATUS_RATE_LIMIT = { limit: 10, windowMs: 15 * 60_000 }

/** What an applicant is told, per stored status. */
const NARRATIVE: Record<string, string> = {
  new: 'Received. It is in the queue for initial assessment.',
  in_review:
    'Under evaluation — we are reviewing your compliance documentation, quality systems and supply capacity against our standards.',
  verification:
    'In verification. This stage can involve documentation checks, third-party audit records or a site visit, and we will contact you directly if we need anything.',
  approved:
    'Approved. Someone from the sourcing team will be in touch about specifications and onboarding.',
  on_hold:
    'On hold. This usually means we are waiting on information from you — check your email for our last message.',
  rejected:
    'Not proceeding at this time. This is not permanent; operations change, and you are welcome to apply again.',
}

/**
 * Progress lookup for an applicant with no account.
 *
 * Reference *and* email, both required, and a single generic failure for every
 * way of getting it wrong — a wrong reference, a right reference with the
 * wrong email, and a reference that never existed are indistinguishable from
 * out here. Confirming that DP-V-2026-K3M9XQ exists would be enough to tell a
 * competitor that somebody applied.
 *
 * The response is deliberately thin: a stage and a sentence. None of the
 * questionnaire comes back, and neither do the reviewer's notes.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`portal-vendor-status:${clientKey(req)}`, STATUS_RATE_LIMIT)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many lookups. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  const reference = str(body.reference, 40)?.toUpperCase()
  const email = parseEmail(body.email)

  if (!reference || !email) {
    return NextResponse.json(
      { error: 'Please enter both your reference and the email address you applied with.' },
      { status: 400 },
    )
  }

  const notFound = NextResponse.json(
    {
      error:
        'We could not find an application with that reference and email address. Check both against the confirmation we sent you.',
    },
    { status: 404 },
  )

  const payload = await getPayload({ config: await config })

  const found = await payload.find({
    collection: 'vendor-applications',
    where: { and: [{ reference: { equals: reference } }, { email: { equals: email } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const application = found.docs[0]
  if (!application) return notFound

  return NextResponse.json({
    ok: true,
    reference: application.reference,
    company: application.companyName,
    status: application.status,
    statusLabel: labelFor(VENDOR_STATUSES, application.status),
    detail: NARRATIVE[application.status] ?? '',
    submittedAt: application.submittedAt ?? application.createdAt,
    updatedAt: application.updatedAt,
  })
}
