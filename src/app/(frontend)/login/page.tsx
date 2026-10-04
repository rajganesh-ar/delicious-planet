'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AuthAlert,
  AuthField,
  AuthFooterLink,
  AuthShell,
  AuthSubmit,
  authInputClass,
} from '@/components/sections/AuthShell'
import { safeRedirect, withRedirect } from '@/lib/redirect'
import { siteImage } from '@/lib/site-image'

const PANEL_IMAGE = { src: siteImage('/images/about/about-retail.avif'), label: 'Account panel — portrait' }

const PANEL_POINTS = [
  'Track every dispatch from the warehouse to your door',
  'Reorder past baskets without rebuilding them',
  'Keep delivery addresses and invoicing details on file',
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const destination = safeRedirect(redirectParam)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (res.ok) {
        router.push(destination)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.errors?.[0]?.message || 'Invalid email or password')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Your account"
      panelTitle="Everything you've ordered, in one place"
      panelLede="Signing in keeps your order history, saved addresses and dispatch tracking together — so the next order takes a minute rather than ten."
      points={PANEL_POINTS}
      image={PANEL_IMAGE}
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <AuthFooterLink
          prefix="Don't have an account yet?"
          href={withRedirect('/register', redirectParam)}
          label="Create one"
        />
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error ? <AuthAlert>{error}</AuthAlert> : null}

        <AuthField label="Email" htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          label="Password"
          htmlFor="login-password"
          action={
            <Link href="/forgot-password" className="no-underline inline-flex items-center min-h-11">
              <span className="font-sans text-[11.5px] text-stone hover:text-obsidian transition-colors">
                Forgot password?
              </span>
            </Link>
          }
        >
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={authInputClass}
          />
        </AuthField>

        <AuthSubmit loading={loading} className="mt-1">
          {loading ? 'Signing in…' : 'Sign in'}
        </AuthSubmit>
      </form>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <LoginForm />
    </Suspense>
  )
}
