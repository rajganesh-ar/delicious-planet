'use client'

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './CartContext'
import { MegaPanel, ListPanel } from './MegaPanel'
import { MobileDrawer } from './MobileDrawer'
import { MENU_LOCK_EVENT } from './menu-events'
import { BASE_CURRENCY, formatPrice } from '@/lib/product'
import type { NavEntry } from '@/lib/nav'

export interface SearchScope {
  label: string
  slug: string
}

export interface AnnouncementItem {
  message: string
  linkLabel?: string | null
  linkHref?: string | null
}

interface HeaderProps {
  nav: NavEntry[]
  /** Category scopes for the search bar's scope selector. */
  searchScopes: SearchScope[]
  /** CMS announcement bar; falls back to the rotating defaults below. */
  announcements?: AnnouncementItem[]
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  { message: 'Complimentary UAE delivery on orders over AED 250' },
  { message: 'Direct from artisan producers — every origin traceable', linkLabel: 'Our sourcing', linkHref: '/sourcing' },
  { message: 'Wholesale pricing for restaurants, hotels and retailers', linkLabel: 'Trade enquiries', linkHref: '/b2b' },
]

const ANNOUNCEMENT_MS = 5000
const OPEN_DELAY_MS = 90
const CLOSE_DELAY_MS = 160

const UTILITY_LINKS = [
  { label: 'Track Order', href: '/account' },
  { label: 'Help', href: '/contact' },
  { label: 'Trade Enquiries', href: '/b2b' },
]

/**
 * Three-tier storefront navbar: utility strip, brand + search bar, then the
 * category row with its mega menus.
 *
 * The utility strip scrolls away while the lower two tiers stick, and the stuck
 * height is published as `--header-h` so page-level sticky bars (filters,
 * sidebars) can offset themselves against it.
 *
 * Colour note: styles.css declares unlayered `a { color: currentColor }` and
 * `h1`–`h6` rules that outrank Tailwind's layered utilities, so link colour and
 * heading type always live on a child <span>.
 */
export function Header({ nav, searchScopes, announcements }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toggleCart, totalItems, subtotal, items } = useCart()

  const headerRef = useRef<HTMLElement>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [scrolled, setScrolled] = useState(false)
  const [openLabel, setOpenLabel] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [scope, setScope] = useState('')
  const [tick, setTick] = useState(0)

  const messages = announcements?.length ? announcements : DEFAULT_ANNOUNCEMENTS
  const announcement = messages[tick % messages.length]
  const currency = items[0]?.currency ?? BASE_CURRENCY

  // ── Publish the stuck header height for page-level sticky offsets ──────
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const apply = () => {
      const height = Math.round(el.getBoundingClientRect().height)
      document.documentElement.style.setProperty('--header-h', `${height}px`)
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let frameId = 0
    const update = () => {
      const next = window.scrollY > 8
      setScrolled((prev) => (prev === next ? prev : next))
      frameId = 0
    }
    const onScroll = () => {
      if (frameId !== 0) return
      frameId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameId !== 0) window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    if (messages.length < 2) return
    const id = setInterval(() => setTick((t) => t + 1), ANNOUNCEMENT_MS)
    return () => clearInterval(id)
  }, [messages.length])

  // Any navigation dismisses whatever is open. Done during render rather than in
  // an effect (React's "adjusting state when a prop changes" pattern) so the
  // menus are already closed in the same commit the new route paints in — an
  // effect would show the old menu over the new page for a frame.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpenLabel(null)
    setDrawerOpen(false)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenLabel(null)
      setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Lock the page (and Lenis) behind the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return

    const { style } = document.documentElement
    const previous = style.overflow
    style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: true } }))

    return () => {
      style.overflow = previous
      window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: false } }))
    }
  }, [drawerOpen])

  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    [],
  )

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  const scheduleOpen = useCallback((label: string) => {
    clearTimers()
    openTimer.current = setTimeout(() => setOpenLabel(label), OPEN_DELAY_MS)
  }, [])

  const scheduleClose = useCallback(() => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpenLabel(null), CLOSE_DELAY_MS)
  }, [])

  const closeNow = useCallback(() => {
    clearTimers()
    setOpenLabel(null)
  }, [])

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (term.trim()) params.set('search', term.trim())
    if (scope) params.set('category', scope)
    router.push(params.toString() ? `/products?${params}` : '/products')
    setOpenLabel(null)
  }

  const searchForm = (compact = false) => (
    <form
      onSubmit={onSearch}
      role="search"
      /* 44px in both forms — the compact variant is the mobile search row, so
         it is exactly the one that must not go under the tap-target floor. */
      className="flex items-stretch w-full h-11 bg-parchment border border-mist rounded-sm overflow-hidden transition-colors focus-within:border-forest-green"
    >
      {!compact && searchScopes.length > 0 && (
        <label className="hidden xl:flex items-center border-r border-mist pl-3 pr-1 shrink-0">
          <span className="sr-only">Search within</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="h-full bg-transparent border-0 outline-none cursor-pointer font-sans text-[12px] text-stone pr-1 max-w-40"
          >
            <option value="">All Collections</option>
            {searchScopes.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search caviar, truffles, olive oil…"
        aria-label="Search products"
        className="flex-1 min-w-0 h-full px-3.5 bg-transparent border-0 outline-none font-sans text-[13px] text-obsidian placeholder:text-stone/60"
      />

      <button
        type="submit"
        aria-label="Search"
        className="shrink-0 w-11 flex items-center justify-center bg-forest-green border-0 cursor-pointer text-cream transition-colors hover:bg-bud-green"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  )

  return (
    <>
      {/* ── Tier 1 · utility strip ─────────────────────────────── */}
      <div className="bg-forest-green">
        {/* Tighter gutter than the rest of the site on purpose: the rotating
            message is `truncate`, and 24px each side cost it ~9px of copy at
            320px. */}
        <div className="px-4 sm:px-6 lg:px-16">
          <div className="h-9 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={announcement.message}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2 min-w-0"
                >
                  <span className="font-sans text-[11px] text-cream/85 truncate">{announcement.message}</span>
                  {announcement.linkHref && announcement.linkLabel && (
                    <Link href={announcement.linkHref} className="hidden sm:inline-block no-underline shrink-0">
                      <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-gold underline underline-offset-2">
                        {announcement.linkLabel}
                      </span>
                    </Link>
                  )}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="hidden lg:flex items-center gap-5 shrink-0">
              <span className="font-sans text-[11px] text-cream/60">Ships worldwide from the UAE · AED</span>
              {UTILITY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="no-underline">
                  <span className="font-sans text-[11px] text-cream/85 hover:text-gold transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <header
        ref={headerRef}
        className={`sticky top-0 z-50 bg-cream transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)]' : ''
        }`}
      >
        {/* ── Tier 2 · brand, search, actions ──────────────────── */}
        <div className="border-b border-mist">
          <div className="px-6 lg:px-16">
            <div className="h-16 lg:h-18 flex items-center gap-3 md:gap-6 lg:gap-10">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                className="lg:hidden -ml-2 w-10 h-10 shrink-0 flex flex-col items-center justify-center gap-1.5 bg-transparent border-0 cursor-pointer text-obsidian"
              >
                <span className="block w-5.5 h-px bg-current" />
                <span className="block w-5.5 h-px bg-current" />
                <span className="block w-3.5 h-px bg-current self-start ml-2.25" />
              </button>

              <Link
                href="/"
                className="shrink-0 flex items-center min-h-11 no-underline"
                aria-label="Delicious Planet — home"
              >
                {/* The logo SVG carries only a viewBox, and styles.css declares an
                    unlayered `img { height: auto }` that outranks Tailwind's layered
                    `h-*` — without `!` the image resolves to 0×0. */}
                <Image
                  src="/images/logo/logo.svg"
                  alt="Delicious Planet"
                  width={295}
                  height={100}
                  priority
                  className="h-9! lg:h-11! w-auto"
                />
              </Link>

              <div className="hidden lg:block flex-1 max-w-2xl">{searchForm()}</div>

              <div className="ml-auto flex items-center gap-1 md:gap-2 shrink-0">
                {/* Shown at every width. Search and basket are both surfaced on
                    a phone; hiding this left sign-in, orders and addresses
                    reachable only from inside the nav drawer. */}
                <Link
                  href="/account"
                  aria-label="Account"
                  className="flex items-center justify-center gap-2.5 h-11 min-w-11 px-2.5 rounded-sm no-underline transition-colors hover:bg-mist/70"
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-obsidian"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
                  </svg>
                  <span className="hidden xl:flex flex-col leading-tight">
                    <span className="font-sans text-[10px] text-stone">Sign in</span>
                    <span className="font-heading text-[11px] font-semibold text-obsidian">Account</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={toggleCart}
                  aria-label={`Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`}
                  className="flex items-center justify-center gap-2.5 h-11 min-w-11 px-2.5 rounded-sm bg-transparent border-0 cursor-pointer transition-colors hover:bg-mist/70"
                >
                  <span className="relative flex items-center text-obsidian">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute -top-1.5 -right-2 min-w-4.5 h-4.5 px-1 rounded-pill bg-forest-green flex items-center justify-center font-sans text-[10px] font-bold text-cream"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </span>
                  <span className="hidden xl:flex flex-col leading-tight text-left">
                    <span className="font-sans text-[10px] text-stone">Basket</span>
                    <span className="font-heading text-[11px] font-semibold text-obsidian">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tier 3 · categories + mega menus ─────────────────── */}
        <nav
          aria-label="Primary"
          className="hidden lg:block relative border-b border-mist bg-cream"
          onMouseLeave={scheduleClose}
        >
          <div className="px-6 lg:px-16">
            <ul className="list-none m-0 p-0 h-12 flex items-stretch gap-0.5">
              {nav.map((entry) => {
                const isOpen = openLabel === entry.label
                const panelId = `nav-panel-${entry.label.toLowerCase().replace(/[^a-z]+/g, '-')}`

                return (
                  <li
                    key={entry.label}
                    className="relative flex items-stretch"
                    onMouseEnter={() => (entry.panel ? scheduleOpen(entry.label) : scheduleClose())}
                  >
                    <Link
                      href={entry.href}
                      onFocus={() => (entry.panel ? setOpenLabel(entry.label) : setOpenLabel(null))}
                      onClick={closeNow}
                      aria-expanded={entry.panel ? isOpen : undefined}
                      aria-controls={entry.panel ? panelId : undefined}
                      className={`group flex items-center gap-1.5 px-3.5 no-underline border-b-2 transition-colors ${
                        isOpen ? 'border-forest-green' : 'border-transparent'
                      }`}
                    >
                      <span
                        className={`font-heading text-[12.5px] font-semibold tracking-[0.01em] whitespace-nowrap transition-colors ${
                          entry.accent
                            ? 'text-forest-green'
                            : isOpen
                              ? 'text-forest-green'
                              : 'text-obsidian group-hover:text-forest-green'
                        }`}
                      >
                        {entry.label}
                      </span>
                      {entry.panel && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          aria-hidden="true"
                          className={`shrink-0 text-stone/70 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      )}
                    </Link>

                    <AnimatePresence>
                      {isOpen && entry.panel?.kind === 'list' && (
                        <ListPanel panel={entry.panel} onNavigate={closeNow} id={panelId} />
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}

              <li className="ml-auto flex items-center">
                <Link href="/contact" className="group flex items-center gap-2 no-underline">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="text-forest-green"
                  >
                    <path d="M4 11a8 8 0 0 1 16 0v5a3 3 0 0 1-3 3h-2" />
                    <rect x="2" y="11" width="4" height="6" rx="1.5" />
                    <rect x="18" y="11" width="4" height="6" rx="1.5" />
                  </svg>
                  <span className="font-sans text-[11.5px] text-stone group-hover:text-forest-green transition-colors whitespace-nowrap">
                    Need help? Talk to our team
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Full-bleed panels drop from the whole row */}
          <AnimatePresence>
            {nav.map((entry) =>
              openLabel === entry.label && entry.panel && entry.panel.kind !== 'list' ? (
                <MegaPanel
                  key={entry.label}
                  panel={entry.panel}
                  onNavigate={closeNow}
                  id={`nav-panel-${entry.label.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                />
              ) : null,
            )}
          </AnimatePresence>

          {/* Page dimmer — pointer-events off so leaving the row still closes */}
          <AnimatePresence>
            {openLabel && nav.find((e) => e.label === openLabel)?.panel?.kind !== 'list' && (
              <motion.div
                key="nav-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                aria-hidden="true"
                className="absolute left-0 right-0 top-full h-screen bg-obsidian/25 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </nav>

        {/* Mobile search — the third tier on small screens */}
        <div className="lg:hidden border-b border-mist px-5 py-2.5 bg-cream">{searchForm(true)}</div>
      </header>

      <AnimatePresence>
        {drawerOpen && <MobileDrawer nav={nav} onClose={() => setDrawerOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
