'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './CartContext'
import { FullScreenMenu, type NavItem } from './MegaMenu'

interface HeaderProps {
  navItems: NavItem[]
}

export function Header({ navItems }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { toggleCart, totalItems } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <motion.header
        className={`header ${scrolled ? 'header--scrolled' : ''} ${menuOpen ? 'header--menu-open' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="header__inner">
          {/* Logo */}
          <Link href="/" className="header__logo">
            <Image
              src="/images/logo/logo.svg"
              alt="Delicious Planet"
              width={220}
              height={56}
              className={`header__logo-img ${scrolled && !menuOpen ? 'header__logo-img--dark' : ''}`}
              priority
            />
          </Link>

          {/* Right side: Cart + Hamburger */}
          <div className="header__actions">
            {/* Cart — hidden when menu is open */}
            {!menuOpen && (
              <button
                onClick={toggleCart}
                className={`header__action-btn ${scrolled ? 'header__action-btn--dark' : ''}`}
                aria-label="Cart"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="header__cart-badge"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
            )}

            {/* Hamburger menu toggle — transforms to X when open */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`header__hamburger ${scrolled && !menuOpen ? 'header__hamburger--dark' : ''} ${menuOpen ? 'header__hamburger--open' : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="header__hamburger-lines">
                <span
                  className={`header__hamburger-line ${menuOpen ? 'header__hamburger-line--open-1' : ''}`}
                />
                <span
                  className={`header__hamburger-line header__hamburger-line--short ${menuOpen ? 'header__hamburger-line--open-2' : ''}`}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full-screen mega menu overlay */}
      <AnimatePresence>
        {menuOpen && <FullScreenMenu navItems={navItems} onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
