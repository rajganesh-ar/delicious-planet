'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { Button, FormField, Heading, Input, ProseText } from '@/components/ui'

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
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-5 sm:px-6 py-16 sm:py-20">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-8 sm:mb-10">
          <Link
            href="/"
            className="font-luxury text-2xl font-semibold text-obsidian no-underline tracking-tight"
          >
            Delicious Planet
          </Link>
          <Heading as="h1" variant="section" align="center" className="m-0 mt-6 mb-2">
            Reset Password
          </Heading>
          <ProseText size="sm" tone="muted" className="m-0">
            Enter your email and we&apos;ll send you a reset link
          </ProseText>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-forest-green/10 flex items-center justify-center mx-auto mb-6">
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="text-forest-green"
              >
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <Heading as="h3" variant="card" align="center" className="m-0 mb-2">
              Check Your Email
            </Heading>
            <ProseText size="sm" tone="muted" className="m-0 mb-6">
              If an account exists with that email, you&apos;ll receive a password reset link
              shortly.
            </ProseText>
            <Link
              href="/login"
              className="text-sm text-forest-green no-underline hover:underline font-medium"
            >
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-sm border border-red-200">
                {error}
              </div>
            )}

            <FormField label="Email" htmlFor="forgot-email">
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormField>

            <MagneticButton className="w-full">
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </MagneticButton>

            <p className="text-center text-sm text-stone m-0">
              <Link href="/login" className="text-forest-green no-underline hover:underline font-medium">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  )
}
