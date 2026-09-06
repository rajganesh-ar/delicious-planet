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
  title: 'Create an account',
  description: 'Create a Delicious Planet account for faster checkout and order history.',
  robots: { index: false, follow: false },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
