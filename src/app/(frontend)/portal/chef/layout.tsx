import type { Metadata } from 'next'

/**
 * Everything under /portal/chef is behind a login and specific to one
 * contributor, so the whole branch is kept out of the index in one place
 * rather than page by page. robots.txt disallows it too; the two are
 * complementary, since a disallowed URL can still be indexed from an inbound
 * link and only this tag suppresses that.
 *
 * Registration is the exception and re-opens itself — it is a public front
 * door, and a chef searching for somewhere to publish should find it.
 */
export const metadata: Metadata = {
  title: 'Chef portal',
  description: 'Write and submit recipes built from the Delicious Planet catalogue.',
  robots: { index: false, follow: false },
}

export default function ChefPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
