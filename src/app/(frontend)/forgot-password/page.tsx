'use client'

import { useState } from 'react'
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

const PANEL_IMAGE = { src: '/images/sourcing/sourcing-farmer.avif', label: 'Reset panel' }

const PANEL_POINTS = [
  'Reset links expire shortly after they are issued',
  'Your basket stays where it is while you reset',
  'Still stuck? The team can verify your account by email',
]

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // The same confirmation shows either way: telling a visitor whether an
      // address is registered would leak account existence.
      await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSubmitted(true)
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      panelTitle="Locked out? It happens."
      panelLede="Give us the address on the account and we'll send a link that lets you set a new password. Nothing else about the account changes."
      points={PANEL_POINTS}
      image={PANEL_IMAGE}
      title={submitted ? 'Check your email' : 'Reset password'}
      subtitle={
        submitted
          ? 'If that address has an account, a reset link is on its way.'
          : 'Enter the email you registered with.'
      }
      footer={<AuthFooterLink prefix="Remembered it?" href="/login" label="Back to sign in" />}
    >
      {submitted ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="border border-stone/15 bg-white rounded-sm p-5">
            <span className="w-10 h-10 rounded-sm bg-forest-green/10 flex items-center justify-center text-forest-green">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="m-0! mt-3! font-sans text-[13px] text-stone leading-relaxed">
              Sent to <span className="text-obsidian font-medium">{email}</span>. The link expires
              shortly, so use it soon — and check the spam folder if it hasn&apos;t arrived within a
              few minutes.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-3 bg-transparent border-0 p-0 cursor-pointer"
            >
              <span className="font-sans text-[12px] text-stone hover:text-obsidian transition-colors underline underline-offset-2">
                Use a different email
              </span>
            </button>
          </div>

          <div className="mt-4">
            <Link
              href="/contact#enquiry"
              className="no-underline inline-flex items-center gap-2 group"
            >
              <span className="font-sans text-[12.5px] text-stone group-hover:text-obsidian transition-colors">
                Still can&apos;t get in? Contact the team
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

          <AuthField label="Email" htmlFor="forgot-email">
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={authInputClass}
            />
          </AuthField>

          <AuthSubmit loading={loading} className="mt-1">
            {loading ? 'Sending…' : 'Send reset link'}
          </AuthSubmit>
        </form>
      )}
    </AuthShell>
  )
}
