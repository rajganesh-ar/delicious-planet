'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { NavEntry } from '@/lib/nav'

interface MobileDrawerProps {
  nav: NavEntry[]
  onClose: () => void
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const SUPPORT_LINKS = [
  { label: 'My Account', href: '/account' },
  { label: 'Contact & Support', href: '/contact' },
  { label: 'Shipping & Returns', href: '/shipping' },
  { label: 'Policies', href: '/policies' },
]

/**
 * Colour note: the unlayered `a { color: currentColor }` rule in styles.css
 * beats Tailwind's text utilities, so link colour always lives on a child span.
 */
export function MobileDrawer({ nav, onClose }: MobileDrawerProps) {
  // Everything starts collapsed so the whole nav is scannable at a glance.
  const [openSection, setOpenSection] = useState<string | null>(null)

  return (
    <motion.div
      className="fixed inset-0 z-100 lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-obsidian/55 border-0 cursor-pointer"
      />

      <motion.aside
        className="absolute inset-y-0 left-0 w-[86%] max-w-88 bg-cream flex flex-col"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.36, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-mist shrink-0">
          <Link href="/" onClick={onClose} className="no-underline">
            {/* `h-8!` — see the logo note in Header.tsx */}
            <Image src="/images/logo/logo.svg" alt="Delicious Planet" width={236} height={80} className="h-8! w-auto" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center bg-transparent border-0 cursor-pointer text-obsidian"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" aria-label="Mobile">
          <ul className="list-none m-0 p-0">
            {nav.map((entry) => {
              const isOpen = openSection === entry.label
              const columns = entry.panel?.columns ?? []
              const cards = entry.panel?.cards ?? []

              if (!entry.panel) {
                return (
                  <li key={entry.label} className="border-b border-mist/80">
                    <Link href={entry.href} onClick={onClose} className="flex items-center py-3.5 no-underline">
                      <span
                        className={`font-heading text-[13px] font-semibold tracking-wide ${
                          entry.accent ? 'text-forest-green' : 'text-obsidian'
                        }`}
                      >
                        {entry.label}
                      </span>
                    </Link>
                  </li>
                )
              }

              return (
                <li key={entry.label} className="border-b border-mist/80">
                  <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : entry.label)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between py-3.5 bg-transparent border-0 cursor-pointer text-left"
                  >
                    <span
                      className={`font-heading text-[13px] font-semibold tracking-wide ${
                        entry.accent ? 'text-forest-green' : 'text-obsidian'
                      }`}
                    >
                      {entry.label}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className={`text-stone transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="pb-4">
                      {cards.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {cards.map((card) => (
                            <Link
                              key={card.href}
                              href={card.href}
                              onClick={onClose}
                              className="relative block overflow-hidden rounded-sm aspect-4/3 bg-charcoal no-underline"
                            >
                              {card.image && (
                                <Image src={card.image} alt="" fill sizes="160px" className="object-cover" />
                              )}
                              <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/45 to-transparent" />
                              <span className="absolute inset-x-0 bottom-0 z-10 p-2 font-luxury text-cream text-[12px] font-semibold leading-tight">
                                {card.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      <Link href={entry.href} onClick={onClose} className="block py-1.5 no-underline">
                        <span className="font-sans text-[12.5px] text-forest-green font-medium">View all</span>
                      </Link>

                      {columns.map((column) => (
                        <div key={column.heading} className="mt-3 first:mt-2">
                          <span className="block font-heading text-[9px] uppercase tracking-[0.18em] font-semibold text-stone/70 mb-1">
                            {column.heading}
                          </span>
                          <ul className="list-none m-0 p-0">
                            {column.links.map((link) => (
                              <li key={link.href + link.label}>
                                <Link href={link.href} onClick={onClose} className="block py-1.5 no-underline">
                                  <span className="font-sans text-[12.5px] text-stone">{link.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {entry.panel?.chips && (
                        <div className="mt-3">
                          <span className="block font-heading text-[9px] uppercase tracking-[0.18em] font-semibold text-stone/70 mb-1.5">
                            {entry.panel.chips.heading}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.panel.chips.links.map((chip) => (
                              <Link
                                key={chip.href}
                                href={chip.href}
                                onClick={onClose}
                                className="inline-flex items-center h-7 px-2.5 rounded-pill border border-mist bg-parchment no-underline"
                              >
                                <span className="font-sans text-[11px] text-stone">{chip.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-6">
            <span className="block font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-stone/70 mb-2">
              Help & Account
            </span>
            <ul className="list-none m-0 p-0">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={onClose} className="block py-1.5 no-underline">
                    <span className="font-sans text-[12.5px] text-stone">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="shrink-0 border-t border-mist px-5 py-4 bg-parchment">
          <span className="block font-sans text-[11px] text-stone">
            Ships worldwide from the UAE · Prices in AED
          </span>
          <Link href="/b2b" onClick={onClose} className="mt-2.5 inline-flex items-center h-9 px-4 bg-forest-green rounded-sm no-underline">
            <span className="font-heading text-[10px] uppercase tracking-[0.16em] font-semibold text-cream">
              Trade enquiries
            </span>
          </Link>
        </div>
      </motion.aside>
    </motion.div>
  )
}
