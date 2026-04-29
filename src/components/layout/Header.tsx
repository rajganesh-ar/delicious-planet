'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './CartContext'
import { FullScreenMenu, MENU_SLIDES, type NavItem } from './MegaMenu'
import { MENU_LOCK_EVENT } from './menu-events'

interface HeaderProps {
  navItems: NavItem[]
}

export function Header({ navItems }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const { toggleCart, totalItems } = useCart()

  useEffect(() => {
    let frameId = 0

    const updateScrolled = () => {
      const nextScrolled = window.scrollY > 40
      setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))
      frameId = 0
    }

    const onScroll = () => {
      if (frameId !== 0) return
      frameId = window.requestAnimationFrame(updateScrolled)
    }

    updateScrolled()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameId !== 0) window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    MENU_SLIDES.forEach((slide) => {
      const img = new window.Image()
      img.src = slide.src
    })
  }, [])

  useEffect(() => {
    if (!menuVisible) return

    const { body, documentElement } = document
    const previousDocumentOverflow = documentElement.style.overflow
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth

    documentElement.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: true } }))

    return () => {
      documentElement.style.overflow = previousDocumentOverflow
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
      window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: false } }))
    }
  }, [menuVisible])

  const openMenu = () => {
    setMenuVisible(true)
    setMenuOpen(true)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu()
      return
    }

    openMenu()
  }

  return (
    <>
      <motion.header
        className={`header ${scrolled ? 'header--scrolled' : ''} ${menuVisible ? 'header--menu-open' : ''}`}
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
              className={`header__logo-img ${scrolled && !menuVisible ? 'header__logo-img--dark' : ''}`}
              priority
            />
          </Link>

          {/* Right side: cart + hamburger */}
          <div className="header__actions">
            <AnimatePresence initial={false}>
              {!menuVisible && (
                <motion.button
                  key="cart-button"
                  onClick={toggleCart}
                  className={`header__action-btn ${scrolled ? 'header__action-btn--dark' : ''}`}
                  aria-label="Cart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
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
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={toggleMenu}
              className={`header__hamburger ${scrolled && !menuVisible ? 'header__hamburger--dark' : ''} ${menuVisible ? 'header__hamburger--open' : ''}`}
              aria-label={menuVisible ? 'Close menu' : 'Open menu'}
              aria-expanded={menuVisible}
              aria-controls="site-menu"
            >
              <div className="header__hamburger-lines">
                <span
                  className={`header__hamburger-line ${menuVisible ? 'header__hamburger-line--open-1' : ''}`}
                />
                <span
                  className={`header__hamburger-line header__hamburger-line--short ${menuVisible ? 'header__hamburger-line--open-2' : ''}`}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence
        initial={false}
        mode="wait"
        onExitComplete={() => {
          if (!menuOpen) setMenuVisible(false)
        }}
      >
        {menuOpen && <FullScreenMenu navItems={navItems} onClose={closeMenu} />}
      </AnimatePresence>
    </>
  )
}
