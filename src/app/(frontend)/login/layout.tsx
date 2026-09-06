import type { Metadata } from 'next'

/**
 * The page itself is a client component, and a client component cannot export
 * `metadata` — so the title and the noindex rule live on this layout instead.
 *
 * `index: false` matters here: this route is per-visitor or transactional, so
 * an indexed copy is at best a dead end in the results and at worst competes
 * with the pages that should rank. robots.txt disallows it too; the two are
 * complementary, since a disallowed URL can still be indexed from an inbound
 * link, and only this tag suppresses that.
 */
export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Delicious Planet account.',
  robots: { index: false, follow: false },
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
