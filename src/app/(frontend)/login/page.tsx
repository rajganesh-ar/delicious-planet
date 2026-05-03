'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { Button, FormField, Heading, Input, ProseText } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
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
        router.push('/account')
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
            Welcome Back
          </Heading>
          <ProseText size="sm" tone="muted" className="m-0">
            Sign in to your account
          </ProseText>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-sm border border-red-200">
              {error}
            </div>
          )}

          <FormField label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormField>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-forest-green no-underline hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <MagneticButton className="w-full">
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </MagneticButton>
        </form>

        <p className="text-center text-sm text-stone mt-8 m-0">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-forest-green no-underline hover:underline font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
