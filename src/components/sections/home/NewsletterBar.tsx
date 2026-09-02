'use client'

import { useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'

export function NewsletterBar() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage' }),
      })
      // Payload returns 400 on the unique-email violation — treat re-signup as success
      if (res.ok || res.status === 400 || res.status === 409) {
        setSubscribed(true)
        setEmail('')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-parchment border-t border-stone/10 py-9 md:py-12">
      <div className="px-6 lg:px-16">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h2 className="m-0!">
                <span className="block font-luxury text-obsidian font-semibold leading-tight tracking-tight text-lg md:text-xl">
                  Get Exclusive Offers &amp; New Products
                </span>
              </h2>
              <p className="font-sans text-[12px] md:text-[13px] text-stone m-0 mt-1.5">
                Sign up and get 10% off your first order.
              </p>
            </div>

            {subscribed ? (
              <p className="font-sans text-[13px] text-forest-green m-0">
                Thank you — you&apos;re on the list.
              </p>
            ) : (
              <div className="w-full md:w-auto">
                <form
                  onSubmit={handleSubscribe}
                  className="flex w-full md:w-auto md:min-w-96 bg-white border border-stone/20 rounded-sm overflow-hidden focus-within:border-forest-green transition-colors"
                >
                  <label htmlFor="home-newsletter-email" className="sr-only">
                    Your email address
                  </label>
                  <input
                    id="home-newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    disabled={submitting}
                    /* min-w-0: without it the field keeps its placeholder's
                       intrinsic width and the shrink-0 Subscribe button pushes
                       the form past a 320px viewport. */
                    className="flex-1 min-w-0 bg-transparent border-0 font-sans text-obsidian text-[13px] px-4 h-11 outline-none placeholder:text-stone/45 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="shrink-0 h-11 px-6 bg-forest-green text-cream font-heading text-[10px] uppercase tracking-[0.16em] font-semibold border-0 cursor-pointer transition-colors hover:bg-bud-green disabled:opacity-60 disabled:cursor-wait"
                  >
                    {submitting ? '…' : 'Subscribe'}
                  </button>
                </form>
                {error && <p className="font-sans text-[11px] text-red-600 m-0 mt-2">{error}</p>}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
