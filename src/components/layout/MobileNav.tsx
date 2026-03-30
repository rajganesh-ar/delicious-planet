'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { NavItem } from './MegaMenu'

interface MobileNavProps {
  navItems: NavItem[]
  onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const menuVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring' as const, damping: 28, stiffness: 300 } },
  exit: { x: '100%', transition: { duration: 0.3 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
}

export function MobileNav({ navItems, onClose }: MobileNavProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="absolute top-0 right-0 h-full w-full max-w-sm bg-cream flex flex-col"
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Close */}
        <div className="flex justify-between items-center px-6 h-20">
          <span className="font-luxury text-2xl font-semibold tracking-tight text-obsidian">
            Delicious Planet
          </span>
          <button
            onClick={onClose}
            className="p-2 text-obsidian bg-transparent border-0 cursor-pointer"
            aria-label="Close menu"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18" strokeLinecap="round" />
              <path d="m6 6 12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="list-none m-0 p-0 space-y-1">
            {navItems.map((item, i) => (
              <motion.li
                key={item.label}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={item.href || '#'}
                  onClick={onClose}
                  className="block py-3 text-2xl font-luxury font-medium text-obsidian no-underline hover:text-gold transition-colors border-b border-mist/40"
                >
                  {item.label}
                </Link>

                {/* Sub-items for mega menu */}
                {item.type === 'mega-menu' && item.megaMenuColumns && (
                  <ul className="list-none m-0 p-0 pl-4 mt-2 space-y-2 mb-4">
                    {item.megaMenuColumns.flatMap(
                      (col) =>
                        col.links?.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="text-sm text-stone hover:text-gold transition-colors no-underline"
                            >
                              {link.label}
                            </Link>
                          </li>
                        )) ?? [],
                    )}
                  </ul>
                )}
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="px-6 py-6 border-t border-mist/40 space-y-3">
          <Link
            href="/account"
            onClick={onClose}
            className="block text-center py-3 text-sm font-medium uppercase tracking-wide text-obsidian border border-obsidian rounded-sm no-underline hover:bg-obsidian hover:text-cream transition-colors"
          >
            My Account
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
