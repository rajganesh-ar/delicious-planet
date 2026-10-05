export type SubscribeResult = 'subscribed' | 'invalid' | 'busy' | 'error'

/**
 * Signs an address up from one of the storefront's newsletter forms.
 *
 * Payload answers both "already subscribed" and "not a valid address" with a
 * 400, and the forms used to treat every 400 as success — so a mistyped
 * address was told "you're on the list" and nothing was saved. A repeat
 * signup is still reported as success (it is one, from the visitor's side);
 * anything else Payload rejected is reported as an address problem.
 */
export async function subscribeToNewsletter(email: string, source: string): Promise<SubscribeResult> {
  let res: Response
  try {
    res = await fetch('/api/newsletter-subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), source }),
    })
  } catch {
    return 'error'
  }

  if (res.ok || res.status === 409) return 'subscribed'
  if (res.status === 429) return 'busy'
  if (res.status !== 400) return 'error'

  const body = (await res.json().catch(() => null)) as {
    errors?: Array<{ message?: string; data?: { errors?: Array<{ message?: string }> } }>
  } | null
  const messages = (body?.errors ?? []).flatMap((e) => [
    e.message ?? '',
    ...(e.data?.errors ?? []).map((d) => d.message ?? ''),
  ])
  return messages.some((m) => /unique/i.test(m)) ? 'subscribed' : 'invalid'
}

export const SUBSCRIBE_ERRORS: Record<Exclude<SubscribeResult, 'subscribed'>, string> = {
  invalid: 'Please check your email address and try again.',
  busy: 'Too many attempts. Please wait a minute and try again.',
  error: 'Something went wrong. Please try again.',
}
