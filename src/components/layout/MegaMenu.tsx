'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export interface MegaMenuColumn {
  heading?: string | null
  links?: { label: string; href: string; image?: string | null }[]
}

export interface NavItem {
  label: string
  href?: string | null
  type?: 'link' | 'mega-menu'
  megaMenuColumns?: MegaMenuColumn[]
}

interface FullScreenMenuProps {
  navItems: NavItem[]
  onClose: () => void
}

export const MENU_SLIDES = [
  {
    src: '/images/mega-menu/mega-menu-chef.avif',
    type: 'image' as const,
    label: 'Artisan Craftsmanship',
    desc: 'Expertly prepared by world-class chefs',
  },
  {
    src: '/images/mega-menu/mega-menu-dish.avif',
    type: 'image' as const,
    label: 'Curated Flavours',
    desc: 'Finest ingredients from around the world',
  },
  {
    src: '/images/mega-menu/mega-menu-resturant.avif',
    type: 'image' as const,
    label: 'Fine Dining Experience',
    desc: 'Premium ingredients for extraordinary meals',
  },
]

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1]
const OVERLAY_TRANSITION = { duration: 0.55, ease: EASE }
const PANEL_TRANSITION = { duration: 0.5, ease: EASE }
const CAPTION_TRANSITION = { duration: 0.48, ease: EASE }
const SLIDE_TRANSITION = { duration: 0.75, ease: EASE }

const defaultNavColumns: MegaMenuColumn[] = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'Brands', href: '/brands' },
      { label: 'Retail', href: '/retail' },
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
    ],
  },
]

function buildNavColumns(navItems: NavItem[]): MegaMenuColumn[] {
  const cmsColumns = navItems.flatMap((item) => item.megaMenuColumns ?? [])
  return cmsColumns.length > 0 ? cmsColumns : defaultNavColumns
}

export function FullScreenMenu({ navItems, onClose }: FullScreenMenuProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % MENU_SLIDES.length)
    }, 5000)
  }, [])

  useEffect(() => {
    startAutoAdvance()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startAutoAdvance])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleThumbClick = (index: number) => {
    setActiveSlide(index)
    startAutoAdvance()
  }

  const navColumns = buildNavColumns(navItems)

  return (
    <motion.div
      id="site-menu"
      className="mega-overlay"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={OVERLAY_TRANSITION}
    >
      <div className="mega-overlay__bg">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeSlide}
            className="mega-overlay__bg-slide"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={SLIDE_TRANSITION}
          >
            {MENU_SLIDES[activeSlide].type === 'image' && (
              <img
                src={MENU_SLIDES[activeSlide].src}
                alt={MENU_SLIDES[activeSlide].label}
                className="mega-overlay__bg-img"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mega-overlay__bg-gradient" />
        <div className="mega-overlay__bg-mobile-overlay" />
      </div>

      <motion.div
        className="mega-overlay__topbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ...PANEL_TRANSITION, delay: 0.06 }}
      >
        <span className="mega-overlay__tagline">Premium Food Ingredients, Worldwide</span>
      </motion.div>

      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={activeSlide}
          className="mega-overlay__slide-caption"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ...CAPTION_TRANSITION, delay: 0.14 }}
        >
          <span className="mega-overlay__slide-label">[{MENU_SLIDES[activeSlide].label}]</span>
          <p className="mega-overlay__slide-desc">{MENU_SLIDES[activeSlide].desc}</p>
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="mega-overlay__thumbnails"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ...PANEL_TRANSITION, delay: 0.1 }}
      >
        {MENU_SLIDES.map((slide, index) => (
          <button
            key={index}
            className={`mega-overlay__thumb ${index === activeSlide ? 'mega-overlay__thumb--active' : ''}`}
            onClick={() => handleThumbClick(index)}
            aria-label={`Slide ${index + 1}: ${slide.label}`}
          >
            <img src={slide.src} alt={slide.label} className="mega-overlay__thumb-media" />
          </button>
        ))}
      </motion.div>

      <motion.nav
        className="mega-overlay__nav"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ...PANEL_TRANSITION, delay: 0.1 }}
      >
        <div className="mega-overlay__columns">
          {navColumns.map((col, index) => (
            <div key={`${col.heading ?? 'nav-col'}-${index}`} className="mega-overlay__col">
              <span className="mega-overlay__col-heading">{col.heading}</span>
              <ul className="mega-overlay__nav-list">
                {col.links?.map((link) => (
                  <li key={link.href + link.label} className="mega-overlay__nav-item">
                    <Link href={link.href} onClick={onClose} className="mega-overlay__nav-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mega-overlay__bottom">
          <div className="mega-overlay__socials">
            <span className="mega-overlay__socials-label">Follow Delicious Planet on:</span>
            <div className="mega-overlay__socials-links">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mega-overlay__social-link"
              >
                / IG
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mega-overlay__social-link"
              >
                / FB
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mega-overlay__social-link"
              >
                / PT
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mega-overlay__social-link"
              >
                / X
              </a>
            </div>
          </div>

          <div className="mega-overlay__support">
            <div className="mega-overlay__support-avatar">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
              </svg>
            </div>
            <div className="mega-overlay__support-info">
              <span className="mega-overlay__support-title">24hr Customer Support</span>
              <span className="mega-overlay__support-status">
                <span className="mega-overlay__status-dot" />
                Online
              </span>
            </div>
          </div>
        </div>
      </motion.nav>
    </motion.div>
  )
}

interface MegaMenuProps {
  columns: MegaMenuColumn[]
}

export function MegaMenu({ columns }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-cream/95 backdrop-blur-xl border border-mist/60 rounded-md shadow-xl min-w-160 p-8"
    >
      <div className="grid grid-cols-3 gap-8">
        {columns.map((col, index) => (
          <div key={index}>
            {col.heading && (
              <p className="text-xs uppercase tracking-widest text-stone font-medium mb-4 mt-0">
                {col.heading}
              </p>
            )}
            <ul className="list-none m-0 p-0 space-y-3">
              {col.links?.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 text-obsidian no-underline hover:text-gold transition-colors text-sm"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
