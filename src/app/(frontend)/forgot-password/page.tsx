'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/animations/MagneticButton'

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
        // Still show success to prevent email enumeration
        setSubmitted(true)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6 py-20">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-luxury text-2xl font-semibold text-obsidian no-underline tracking-tight"
          >
            Delicious Planet
          </Link>
          <h1 className="font-luxury text-3xl font-light text-obsidian m-0 mt-6 mb-2">
            Reset Password
          </h1>
          <p className="text-stone text-sm m-0">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="text-forest"
              >
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-luxury text-xl font-medium text-obsidian m-0 mb-2">
              Check Your Email
            </h3>
            <p className="text-stone text-sm m-0 mb-6">
              If an account exists with that email, you&apos;ll receive a password reset link
              shortly.
            </p>
            <Link
              href="/login"
              className="text-sm text-gold no-underline hover:underline font-medium"
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

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
              />
            </div>

            <MagneticButton className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-8 py-4 rounded-sm border-0 cursor-pointer hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </MagneticButton>

            <p className="text-center text-sm text-stone m-0">
              <Link href="/login" className="text-gold no-underline hover:underline font-medium">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  )
}
