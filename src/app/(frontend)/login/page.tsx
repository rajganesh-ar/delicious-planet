'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/animations/MagneticButton'

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
            Welcome Back
          </h1>
          <p className="text-stone text-sm m-0">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-gold no-underline hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <MagneticButton className="w-full">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-8 py-4 rounded-sm border-0 cursor-pointer hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </MagneticButton>
        </form>

        <p className="text-center text-sm text-stone mt-8 m-0">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-gold no-underline hover:underline font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
