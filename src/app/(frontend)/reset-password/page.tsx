'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AuthAlert,
  AuthField,
  AuthFooterLink,
  AuthShell,
  AuthSubmit,
  authInputClass,
} from '@/components/sections/AuthShell'
import { siteImage } from '@/lib/site-image'

/**
 * Where the emailed reset link lands.
 *
 * This route is the other half of the forgot-password flow: Payload's default
 * reset URL points into /admin, which every customer is refused, so the email
 * template sends people here instead. Without this page the link is a dead end.
 *
 * A successful reset also logs the user in — Payload returns a session with the
 * new password — so the page goes straight to the account rather than bouncing
 * through the sign-in form.
 */

const PANEL_IMAGE = { src: siteImage('/images/auth/reset-password.avif'), label: 'New password panel' }

const PANEL_POINTS = [
  'Choose something you have not used on this account before',
  'At least 8 characters — longer is better than more symbols',
  'You will be signed in automatically once it is saved',
]

const MIN_LENGTH = 8

function ResetInner() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < MIN_LENGTH) {
      setError(`Please use at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Those two passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        // Payload returns 4xx for an expired, used or forged token. They are
        // indistinguishable from here, and saying so is the honest answer.
        setError('That reset link is no longer valid. Please request a new one.')
        return
      }

      setDone(true)
      router.push('/account')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const missingToken = !token

  return (
    <AuthShell
      eyebrow="Account recovery"
      panelTitle="Set a new password."
      panelLede="Choose a new password for your account. The link that brought you here works once and expires shortly after it was issued."
      points={PANEL_POINTS}
      image={PANEL_IMAGE}
      title={missingToken ? 'Link incomplete' : 'New password'}
      subtitle={
        missingToken
          ? 'This link is missing its reset token.'
          : 'Enter the password you would like to use from now on.'
      }
      footer={<AuthFooterLink prefix="Remembered it?" href="/login" label="Back to sign in" />}
    >
      {missingToken ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AuthAlert>
            This link is missing its reset token. It may have been broken across two lines by your
            email client — try copying the whole link into the address bar, or request a new one.
          </AuthAlert>
          <div className="mt-4">
            <Link href="/forgot-password" className="no-underline inline-flex items-center gap-2 group">
              <span className="font-sans text-[12.5px] text-stone group-hover:text-obsidian transition-colors">
                Request a new reset link
              </span>
              <span
                aria-hidden
                className="font-sans text-[12px] text-forest-green transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error ? <AuthAlert>{error}</AuthAlert> : null}

          <AuthField
            label="New password"
            htmlFor="reset-password"
            hint={`At least ${MIN_LENGTH} characters.`}
          >
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={MIN_LENGTH}
              autoComplete="new-password"
              className={authInputClass}
            />
          </AuthField>

          <AuthField label="Confirm password" htmlFor="reset-confirm">
            <input
              id="reset-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className={authInputClass}
            />
          </AuthField>

          <AuthSubmit loading={loading || done} className="mt-1">
            {loading ? 'Saving…' : done ? 'Signing you in…' : 'Save new password'}
          </AuthSubmit>
        </form>
      )}
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <ResetInner />
    </Suspense>
  )
}
