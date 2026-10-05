const DEFAULT_DESTINATION = '/account'

/** A placeholder origin to resolve against; only "did it stay here" matters. */
const HERE = 'https://same-origin.invalid'

/**
 * Resolves a `?redirect=` query param into a destination we're willing to send a
 * freshly-authenticated user to. Only same-origin absolute paths qualify —
 * anything else (`https://evil.example`, protocol-relative `//evil.example`) is
 * an open redirect, so it falls back to the account page.
 *
 * A prefix check is not enough: browsers read `/\evil.example` as
 * `//evil.example`, and strip tabs and newlines, so `/<tab>/evil.example` gets
 * there too. The value is therefore parsed the way the browser will parse it,
 * and what comes back is the parsed path rather than the raw string, so the
 * two can never disagree.
 */
export function safeRedirect(value: string | null | undefined): string {
  if (!value) return DEFAULT_DESTINATION
  if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_DESTINATION
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return DEFAULT_DESTINATION

  let url: URL
  try {
    url = new URL(value, HERE)
  } catch {
    return DEFAULT_DESTINATION
  }
  if (url.origin !== HERE) return DEFAULT_DESTINATION
  return `${url.pathname}${url.search}${url.hash}`
}

/** Carries the current `?redirect=` across the login ⇄ register links. */
export function withRedirect(href: string, redirectTo: string | null | undefined): string {
  if (!redirectTo) return href
  return `${href}?redirect=${encodeURIComponent(redirectTo)}`
}
