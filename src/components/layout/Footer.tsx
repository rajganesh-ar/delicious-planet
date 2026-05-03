'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Media, Navigation as NavigationType, SiteSetting } from '@/payload-types'

interface FooterProps {
  navigation: NavigationType
  siteSettings: SiteSetting
}

const FALLBACK_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'Brands', href: '/brands' },
      { label: 'Recipes', href: '/recipes' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { label: 'Experiences', href: '/experiences' },
      { label: 'Journal', href: '/journal' },
      { label: 'Sourcing', href: '/sourcing' },
      { label: 'Sustainability', href: '/sourcing#sustainability' },
    ],
  },
  {
    heading: 'Commercial',
    links: [
      { label: 'B2B Solutions', href: '/b2b' },
      { label: 'Vendors & Partnerships', href: '/vendors' },
      { label: 'Commercial Terms', href: '/policies#b2b-terms' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Legal Policies', href: '/policies' },
      { label: 'Shipping Policy', href: '/shipping' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'My Account', href: '/account' },
    ],
  },
]

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    fallback: 'https://instagram.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    fallback: 'https://facebook.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'X',
    fallback: 'https://x.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    fallback: 'https://linkedin.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    fallback: 'https://pinterest.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
]

export function Footer({ navigation, siteSettings }: FooterProps) {
  const socials = siteSettings.socials
  const cmsColumns = navigation.footerColumns ?? []
  const columns = cmsColumns.length > 0 ? cmsColumns : FALLBACK_COLUMNS

  const bgRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current) return
      const rect = bgRef.current.closest('footer')!.getBoundingClientRect()
      const progress = -rect.top / (window.innerHeight + rect.height)
      bgRef.current.style.transform = `translateY(${progress * 80}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const socialLinks = SOCIAL_LINKS.map((s) => ({
    ...s,
    href:
      s.label === 'Instagram' ? (socials?.instagram ?? s.fallback)
      : s.label === 'Facebook' ? (socials?.facebook ?? s.fallback)
      : s.label === 'X' ? (socials?.twitter ?? s.fallback)
      : s.label === 'LinkedIn' ? (socials?.linkedin ?? s.fallback)
      : s.fallback,
  }))

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      // Treat duplicate-email errors (Payload returns 400 on unique violation) as success — idempotent UX
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
    <footer className="relative overflow-hidden bg-black text-cream/80">
      {/* Parallax background image */}
      <div ref={bgRef} className="absolute -inset-20" style={{ willChange: 'transform' }}>
        <img src="/images/misc/footer.avif" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Gradient: transparent at top → solid black towards bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 20%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.95) 60%, #000000 75%)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col"
        style={{ minHeight: 'clamp(520px, 46vw, 780px)' }}
      >
        <div className="flex-1" />

        {/* Subscribe strip */}
        <div className="w-full px-6 lg:px-16 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b border-white/10">
            <div>
              <p className="text-base font-medium text-cream/90 m-0" style={{ fontFamily: 'var(--font-serif)' }}>
                Stay in the know
              </p>
              <p className="text-sm text-cream/45 m-0 mt-1">
                Recipes, sourcing stories &amp; exclusive offers.
              </p>
            </div>

            {subscribed ? (
              <p className="text-sm text-cream/60 m-0">Thank you — you&apos;re on the list.</p>
            ) : (
              <div className="flex flex-col items-end w-full sm:w-auto">
                <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto sm:min-w-85 border border-white/20 focus-within:border-white/45 transition-colors">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    disabled={submitting}
                    className="flex-1 bg-transparent border-0 text-cream text-sm px-4 py-3 outline-none placeholder:text-cream/30 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-white text-black text-sm font-medium border-0 cursor-pointer hover:bg-cream/90 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {submitting ? '...' : 'Subscribe'}
                  </button>
                </form>
                {error && <p className="text-xs text-red-400/80 m-0 mt-2">{error}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Logo + Nav */}
        <div className="w-full px-6 lg:px-16 pb-14">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

            {/* Left: Logo + socials */}
            <div className="shrink-0 lg:w-52">
              <Link href="/" className="no-underline inline-block">
                <Image
                  src="/images/logo/logo.svg"
                  alt="Delicious Planet"
                  width={240}
                  height={60}
                  style={{ filter: 'brightness(0) invert(1)', height: '4rem', width: 'auto' }}
                />
              </Link>

              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-cream/35 hover:text-cream/80 transition-colors no-underline"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10">
              {columns.map((col, idx) => (
                <div key={idx}>
                  <h4 className="text-[13px] text-cream/60 font-semibold mb-4 mt-0">
                    {col.heading}
                  </h4>
                  <ul className="list-none m-0 p-0 space-y-2.5">
                    {col.links?.map((link, li) => (
                      <li key={li}>
                        <Link
                          href={link.href}
                          className="text-[13px] text-cream/40 hover:text-cream/80 transition-colors no-underline leading-snug"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="relative z-10 bg-black border-t border-white/[0.07] px-6 lg:px-16 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-cream/25">
          <span>&copy; {new Date().getFullYear()} Delicious Planet Ltd. All rights reserved.</span>
          <div className="flex items-center gap-5">
            {[
              { label: 'Privacy Policy', href: '/policies' },
              { label: 'Terms of Service', href: '/policies' },
              { label: 'Shipping', href: '/shipping' },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-cream/25 hover:text-cream/55 transition-colors no-underline"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
