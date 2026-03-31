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

const slides = [
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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const DURATION_ENTER = 0.4
const DURATION_EXIT = 0.3
const DURATION_CINEMATIC = 1.2

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION_ENTER,
      ease: EASE,
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATION_EXIT,
      ease: EASE,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

const linkVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION_ENTER,
      ease: EASE,
    },
  },
  exit: {
    opacity: 0,
    x: 15,
    transition: {
      duration: DURATION_EXIT,
      ease: EASE,
    },
  },
}

const defaultNavColumns: MegaMenuColumn[] = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'Brands', href: '/brands' },
      { label: 'Recipes', href: '/recipes' },
      { label: 'B2B Solutions', href: '/b2b' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { label: 'Experiences', href: '/experiences' },
      { label: 'Journal', href: '/journal' },
      { label: 'Sourcing', href: '/about#sourcing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Vendors & Partnerships', href: '/b2b' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/login' },
    ],
  },
]

/** Derive nav columns from CMS navItems, falling back to hardcoded defaults */
function buildNavColumns(navItems: NavItem[]): MegaMenuColumn[] {
  // If CMS provides mega-menu columns, flatten them
  const cmsColumns = navItems.flatMap((item) => item.megaMenuColumns ?? [])
  return cmsColumns.length > 0 ? cmsColumns : defaultNavColumns
}

export function FullScreenMenu({ navItems, onClose }: FullScreenMenuProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
  }, [])

  useEffect(() => {
    startAutoAdvance()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startAutoAdvance])

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleThumbClick = (index: number) => {
    setActiveSlide(index)
    startAutoAdvance() // Reset the timer so it doesn't jump immediately
  }

  const navColumns = buildNavColumns(navItems)

  return (
    <motion.div
      className="mega-overlay"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Background slideshow */}
      <div className="mega-overlay__bg">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlide}
            className="mega-overlay__bg-slide"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: DURATION_CINEMATIC, ease: EASE }}
          >
            {slides[activeSlide].type === 'image' && (
              <img
                src={slides[activeSlide].src}
                alt={slides[activeSlide].label}
                className="mega-overlay__bg-img"
              />
            )}
          </motion.div>
        </AnimatePresence>
        {/* Dark gradient for nav readability */}
        <div className="mega-overlay__bg-gradient" />
        {/* Mobile overlay */}
        <div className="mega-overlay__bg-mobile-overlay" />
      </div>

      {/* Top bar: tagline only (logo & close handled by header) */}
      <div className="mega-overlay__topbar">
        <span className="mega-overlay__tagline">Premium Food Ingredients, Worldwide</span>
      </div>

      {/* Slide caption — bottom-left on desktop */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeSlide}
          className="mega-overlay__slide-caption"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: DURATION_ENTER, ease: EASE }}
        >
          <span className="mega-overlay__slide-label">[{slides[activeSlide].label}]</span>
          <p className="mega-overlay__slide-desc">{slides[activeSlide].desc}</p>
        </motion.div>
      </AnimatePresence>

      {/* Thumbnails — bottom-left */}
      <div className="mega-overlay__thumbnails">
        {slides.map((slide, i) => (
          <button
            key={i}
            className={`mega-overlay__thumb ${i === activeSlide ? 'mega-overlay__thumb--active' : ''}`}
            onClick={() => handleThumbClick(i)}
            aria-label={`Slide ${i + 1}: ${slide.label}`}
          >
            <img src={slide.src} alt={slide.label} className="mega-overlay__thumb-media" />
          </button>
        ))}
      </div>

      {/* Nav columns — right side */}
      <nav className="mega-overlay__nav">
        <div className="mega-overlay__columns">
          {navColumns.map((col) => (
            <motion.div key={col.heading} variants={linkVariants} className="mega-overlay__col">
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
            </motion.div>
          ))}
        </div>

        {/* Bottom section: Socials + Support */}
        <motion.div className="mega-overlay__bottom" variants={linkVariants}>
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
        </motion.div>
      </nav>
    </motion.div>
  )
}

// Keep the old MegaMenu export for backward compatibility
interface MegaMenuProps {
  columns: MegaMenuColumn[]
}

export function MegaMenu({ columns }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: DURATION_EXIT, ease: EASE }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-cream/95 backdrop-blur-xl border border-mist/60 rounded-md shadow-xl min-w-160 p-8"
    >
      <div className="grid grid-cols-3 gap-8">
        {columns.map((col, idx) => (
          <div key={idx}>
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
