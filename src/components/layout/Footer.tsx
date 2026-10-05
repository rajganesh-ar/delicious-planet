'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import { CONTACT } from '@/lib/contact'
import type { Navigation as NavigationType, SiteSetting } from '@/payload-types'
import { siteImage } from '@/lib/site-image'
import { SUBSCRIBE_ERRORS, subscribeToNewsletter } from '@/lib/newsletter'

interface FooterProps {
  navigation: NavigationType
  socials: SiteSetting['socials']
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
      { label: 'Sustainability', href: '/sustainability' },
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

const SERVICE_ICONS = {
  truck: (
    <>
      <rect x="1" y="6" width="13" height="11" rx="1" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="17" cy="18.5" r="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 4.4 3.1 8.4 7.5 10 4.4-1.6 7.5-5.6 7.5-10v-6z" />
      <path d="m8.8 11.8 2.3 2.3 4.4-4.4" />
    </>
  ),
  tag: (
    <>
      <path d="M20.5 12.5 12 21 3 12V3h9z" />
      <circle cx="7.8" cy="7.8" r="1.4" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2" y="13" width="4.5" height="6" rx="1.6" />
      <rect x="17.5" y="13" width="4.5" height="6" rx="1.6" />
      <path d="M20 19v.6a2.4 2.4 0 0 1-2.4 2.4H13" />
    </>
  ),
}

const SERVICES = [
  {
    href: '/shipping',
    icon: SERVICE_ICONS.truck,
    title: 'Worldwide delivery',
    detail: 'Tracked & insured, 40+ countries',
  },
  {
    href: '/sourcing',
    icon: SERVICE_ICONS.shield,
    title: 'HACCP-aligned sourcing',
    detail: 'Lot-level traceability on every batch',
  },
  {
    href: '/b2b',
    icon: SERVICE_ICONS.tag,
    title: 'Wholesale & B2B',
    detail: 'Tiered pricing and volume contracts',
  },
  {
    href: '/contact',
    icon: SERVICE_ICONS.headset,
    title: 'Talk to a specialist',
    // From the one published source: this said GMT while contact.ts says GST,
    // and 9–6 GMT is 1pm–10pm in the UAE.
    detail: CONTACT.hours,
  },
]

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    fallback: 'https://instagram.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'X',
    fallback: 'https://x.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    fallback: 'https://linkedin.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
]

const PAYMENTS = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay']

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/policies' },
  { label: 'Terms of Service', href: '/policies' },
  { label: 'Shipping', href: '/shipping' },
]

/*
 * styles.css declares `a { color: currentColor }` and `img { height: auto }`
 * outside any cascade layer, so those rules beat Tailwind's layered utilities.
 * Link colours therefore live on a child <span>, and the parallax image sizes
 * itself through an inline style.
 */
export function Footer({ navigation, socials }: FooterProps) {
  const cmsColumns = navigation.footerColumns ?? []
  const columns = cmsColumns.length > 0 ? cmsColumns : FALLBACK_COLUMNS

  const bgRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Mobile-only disclosure state; the columns are always expanded from `lg` up.
  const [openColumn, setOpenColumn] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current) return
      const rect = bgRef.current.closest('footer')!.getBoundingClientRect()
      const progress = -rect.top / (window.innerHeight + rect.height)
      bgRef.current.style.transform = `translateY(${progress * 48}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
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
    const result = await subscribeToNewsletter(email, 'footer')
    if (result === 'subscribed') {
      setSubscribed(true)
      setEmail('')
    } else {
      setError(SUBSCRIBE_ERRORS[result])
    }
    setSubmitting(false)
  }

  return (
    <footer className="relative overflow-hidden bg-black text-cream/80">
      {/* Parallax texture band — only tall enough to sit behind the top two rows. */}
      <div
        ref={bgRef}
        className="absolute inset-x-0 -top-16 h-104 pointer-events-none"
        style={{ willChange: 'transform' }}
        aria-hidden
      >
        {/*
          Goes through next/image rather than a bare <img> because the footer is
          on every page: the source file is a 2.1 MB AVIF, and served raw that
          was the largest single download on the site, repeated site-wide. `fill`
          matches the previous 100%-height/object-cover behaviour, and there is
          deliberately no `priority` — the band is decorative and below the fold,
          so lazy loading is the point.
        */}
        <Image
          src={siteImage('/images/misc/footer.avif')}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Fade the band into solid black before the nav rows begin. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0.74) 110px, rgba(0,0,0,0.94) 220px, #000000 300px)',
        }}
      />

      <div className="relative z-10">
        {/* ── Brand + newsletter ──────────────────────────────── */}
        <div className="px-6 lg:px-16 pt-10 pb-7">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7">
            <div>
              <Link href="/" className="no-underline inline-block">
                <Image
                  src={siteImage('/images/logo/logo.svg')}
                  alt="Delicious Planet"
                  width={240}
                  height={60}
                  style={{ filter: 'brightness(0) invert(1)', height: '3rem', width: 'auto' }}
                />
              </Link>
              <div
                className="text-sm text-cream/50 mt-3 max-w-md leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                The world&apos;s finest ingredients, sourced from artisan producers and delivered to
                kitchens everywhere.
              </div>
            </div>

            <div className="w-full lg:w-auto">
              <div className="text-[11px] uppercase tracking-[0.16em] text-cream/60 mb-2.5">
                Stay in the know
              </div>
              {subscribed ?
                <div className="text-sm text-cream/60 py-3">Thank you — you&apos;re on the list.</div>
              : <>
                  <form
                    onSubmit={handleSubscribe}
                    className="flex w-full sm:min-w-85 border border-white/20 focus-within:border-white/45 transition-colors"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      disabled={submitting}
                      aria-label="Email address"
                      className="flex-1 min-w-0 bg-transparent border-0 text-cream text-base md:text-sm px-4 py-2.5 outline-none placeholder:text-cream/30 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-white text-black text-sm font-medium border-0 cursor-pointer hover:bg-cream/90 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 disabled:cursor-wait"
                    >
                      {submitting ? '…' : 'Subscribe'}
                    </button>
                  </form>
                  <div className="text-xs mt-2">
                    {error ?
                      <span className="text-red-400/80">{error}</span>
                    : <span className="text-cream/30">
                        Recipes, sourcing stories &amp; exclusive offers. Unsubscribe anytime.
                      </span>
                    }
                  </div>
                </>
              }
            </div>
          </div>
        </div>

        {/* ── Service strip ───────────────────────────────────── */}
        <div className="px-6 lg:px-16 py-5 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            {SERVICES.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group flex items-start gap-3 min-h-11 no-underline"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="shrink-0 mt-0.5 text-gold/70 group-hover:text-gold transition-colors"
                >
                  {s.icon}
                </svg>
                <span>
                  <span className="block text-[13px] font-medium text-cream/85 group-hover:text-cream transition-colors">
                    {s.title}
                  </span>
                  <span className="block text-xs text-cream/35 mt-0.5">{s.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Nav columns + contact ───────────────────────────── */}
        <div className="px-6 lg:px-16 py-7 border-t border-white/10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
            <nav
              aria-label="Footer"
              className="flex-1 flex flex-col lg:grid lg:grid-cols-5 lg:gap-x-8 divide-y divide-white/[0.07] lg:divide-y-0"
            >
              {columns.map((col, idx) => {
                const open = openColumn === idx
                return (
                  <div key={idx}>
                    {/* Collapsible below `lg`, a plain heading above it. */}
                    <button
                      type="button"
                      onClick={() => setOpenColumn(open ? null : idx)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-2 bg-transparent border-0 p-0 py-3 lg:py-0 lg:mb-3.5 text-left cursor-pointer lg:cursor-default lg:pointer-events-none"
                    >
                      <span className="text-[13px] font-semibold text-cream/75">{col.heading}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                        className={cn(
                          'lg:hidden text-cream/35 transition-transform duration-200',
                          open && 'rotate-180',
                        )}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    <ul
                      className={cn(
                        'list-none m-0 p-0 space-y-2 pb-3 lg:pb-0 lg:block',
                        open ? 'block' : 'hidden',
                      )}
                    >
                      {col.links?.map((link, li) => (
                        <li key={li}>
                          <Link href={link.href} className="no-underline group inline-block">
                            <span className="text-[13px] text-cream/40 group-hover:text-cream/85 transition-colors leading-snug">
                              {link.label}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </nav>

            {/* Contact + socials */}
            <div className="lg:w-56 shrink-0">
              <div className="text-[13px] font-semibold text-cream/75 mb-3.5">Get in touch</div>
              <ul className="list-none m-0 p-0 space-y-2.5">
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="no-underline group inline-flex items-center gap-2.5 min-h-11 lg:min-h-0 lg:py-1"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden
                      className="text-cream/30 shrink-0"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                    <span className="text-[13px] text-cream/45 group-hover:text-cream/85 transition-colors break-all">
                      {CONTACT.email}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="no-underline group inline-flex items-center gap-2.5 min-h-11 lg:min-h-0 lg:py-1"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden
                      className="text-cream/30 shrink-0"
                    >
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.1 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                    </svg>
                    <span className="text-[13px] text-cream/45 group-hover:text-cream/85 transition-colors">
                      {CONTACT.phoneLabel}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline group inline-flex items-center gap-2.5 min-h-11 lg:min-h-0 lg:py-1"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                      className="text-cream/30 shrink-0"
                    >
                      <path d="M12 0C5.4 0 0 5.4 0 12c0 2.6.8 5.1 2.3 7L.8 23.5a.5.5 0 0 0 .6.6l4.5-1.5A11.9 11.9 0 0 0 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0zm0 22c-2.3 0-4.4-.7-6.1-2l-.4-.3-2.6.9.9-2.6-.3-.4A9.9 9.9 0 0 1 2 12C2 6.5 6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
                      <path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.1s-.8 1-.9 1.2c-.2.2-.4.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4z" />
                    </svg>
                    <span className="text-[13px] text-cream/45 group-hover:text-cream/85 transition-colors">
                      WhatsApp
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5 pt-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden
                    className="text-cream/30 shrink-0 mt-0.5"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <address className="not-italic leading-snug">
                    {CONTACT.address.lines.map((line) => (
                      <span key={line} className="block text-[13px] text-cream/45">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              </ul>

              {/* -ml-2.5 pulls the first 44px hit area back so the row still
                  lines up with the text column above it. */}
              <div className="flex items-center mt-4 -ml-2.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-11 h-11 flex items-center justify-center text-cream/35 hover:text-cream transition-colors no-underline"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <div className="px-6 lg:px-16 py-3.5 border-t border-white/[0.07]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-0 lg:gap-y-2 text-[11px] text-cream/25">
              <span>&copy; {new Date().getFullYear()} Delicious Planet Ltd.</span>
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="no-underline group inline-flex items-center min-h-11 lg:min-h-0"
                >
                  <span className="text-cream/25 group-hover:text-cream/60 transition-colors">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="flex items-start lg:items-center justify-between lg:justify-end gap-4">
              <div
                className="flex flex-wrap items-center gap-1.5"
                aria-label="Accepted payment methods"
              >
                {PAYMENTS.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] uppercase tracking-wider text-cream/30 border border-white/10 rounded-sm px-1.5 py-0.5 whitespace-nowrap"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1.5 shrink-0 bg-transparent border border-white/10 hover:border-white/30 rounded-sm px-3.5 h-11 lg:h-7 text-[10px] uppercase tracking-wider text-cream/30 hover:text-cream/70 transition-colors cursor-pointer whitespace-nowrap"
              >
                Top
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden
                >
                  <path d="m6 15 6-6 6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
