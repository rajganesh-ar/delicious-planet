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

const PANEL_IMAGE = { src: siteImage('/images/auth/register.avif'), label: 'Registration panel' }

const PANEL_POINTS = [
  'Order from the full catalogue, including limited seasonal lots',
  'Save addresses once and reuse them at every checkout',
  'Get dispatch notifications the moment an order leaves the warehouse',
]

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const destination = safeRedirect(redirectParam)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // `roles` is deliberately not sent — the Users collection pins sign-ups to
      // 'customer' regardless, so passing it here would only imply otherwise.
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      })

      if (res.ok) {
        const loginRes = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        })

        if (loginRes.ok) {
          router.push(destination)
          router.refresh()
        } else {
          router.push(withRedirect('/login', redirectParam))
        }
      } else {
        const data = await res.json()
        setError(data.errors?.[0]?.message || 'Registration failed. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Join us"
      panelTitle="An account takes a minute. It saves one on every order after."
      panelLede="Registration is for individual customers. Restaurants, hotels and retailers buying at volume are set up through the trade desk instead."
      points={PANEL_POINTS}
      image={PANEL_IMAGE}
      title="Create account"
      subtitle="Four fields, and you're in."
      footer={
        <AuthFooterLink
          prefix="Already registered?"
          href={withRedirect('/login', redirectParam)}
          label="Sign in"
        />
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error ? <AuthAlert>{error}</AuthAlert> : null}

        <AuthField label="Full name" htmlFor="reg-name">
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="Email" htmlFor="reg-email">
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="Password" htmlFor="reg-password" hint="Minimum 8 characters.">
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="Confirm password" htmlFor="reg-confirm">
          <input
            id="reg-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className={authInputClass}
          />
        </AuthField>

        <AuthSubmit loading={loading} className="mt-1">
          {loading ? 'Creating account…' : 'Create account'}
        </AuthSubmit>

        <p className="m-0! font-sans text-[11.5px] text-stone/80 leading-relaxed">
          Creating an account means you accept our{' '}
          <Link href="/policies#terms" className="no-underline">
            <span className="text-forest-green hover:underline underline-offset-2">terms</span>
          </Link>{' '}
          and{' '}
          <Link href="/policies#privacy" className="no-underline">
            <span className="text-forest-green hover:underline underline-offset-2">
              privacy policy
            </span>
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <RegisterForm />
    </Suspense>
  )
}
