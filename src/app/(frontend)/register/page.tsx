'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/animations/MagneticButton'

export default function RegisterPage() {
  const router = useRouter()
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
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          roles: ['customer'],
        }),
        credentials: 'include',
      })

      if (res.ok) {
        // Auto-login after registration
        const loginRes = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        })

        if (loginRes.ok) {
          router.push('/account')
          router.refresh()
        } else {
          router.push('/login')
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
            Create Account
          </h1>
          <p className="text-stone text-sm m-0">Join the Delicious Planet community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
            />
          </div>

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
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
            />
          </div>

          <MagneticButton className="w-full">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-8 py-4 rounded-sm border-0 cursor-pointer hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </MagneticButton>
        </form>

        <p className="text-center text-sm text-stone mt-8 m-0">
          Already have an account?{' '}
          <Link href="/login" className="text-gold no-underline hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
