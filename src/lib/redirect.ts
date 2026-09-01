const DEFAULT_DESTINATION = '/account'

/**
 * Resolves a `?redirect=` query param into a destination we're willing to send a
 * freshly-authenticated user to. Only same-origin absolute paths qualify —
 * anything else (`https://evil.example`, protocol-relative `//evil.example`) is
 * an open redirect, so it falls back to the account page.
 */
export function safeRedirect(value: string | null | undefined): string {
  if (!value) return DEFAULT_DESTINATION
  if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_DESTINATION
  return value
}

/** Carries the current `?redirect=` across the login ⇄ register links. */
export function withRedirect(href: string, redirectTo: string | null | undefined): string {
  if (!redirectTo) return href
  return `${href}?redirect=${encodeURIComponent(redirectTo)}`
}
