import type { Metadata } from 'next'

/**
 * Same reason as forgot-password/layout.tsx: the page is a client component,
 * so its title and noindex live here. Reset links carry a one-time token in
 * the URL, which is one more reason none of them should ever be indexed.
 */
export const metadata: Metadata = {
  title: 'Choose a new password',
  robots: { index: false, follow: false },
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
