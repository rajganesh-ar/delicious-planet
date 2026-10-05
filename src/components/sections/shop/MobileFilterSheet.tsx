'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { MENU_LOCK_EVENT } from '@/components/layout/menu-events'
import { FilterPanel } from './FilterPanel'
import { useShopFilters } from './useShopFilters'
import type { ShopFacets, ShopSelection } from '@/lib/shop-facets'
import { useDialogFocus } from '@/components/layout/useDialogFocus'

interface MobileFilterSheetProps {
  open: boolean
  onClose: () => void
  facets: ShopFacets
  selection: ShopSelection
  activeCount: number
  totalDocs: number
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * The refinement panel as a slide-over, below lg.
 *
 * Same panel as the sidebar, same locking contract as the cart drawer and the
 * mobile nav — Escape closes, the page behind is frozen and Lenis is told to
 * stand down via MENU_LOCK_EVENT.
 */
export function MobileFilterSheet({
  open,
  onClose,
  facets,
  selection,
  activeCount,
  totalDocs,
}: MobileFilterSheetProps) {
  const { clearedHref } = useShopFilters()
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  useDialogFocus(open, panelRef)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const { style } = document.documentElement
    const previous = style.overflow
    style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: true } }))
    closeRef.current?.focus()

    return () => {
      style.overflow = previous
      window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: false } }))
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          <motion.div
            className="fixed inset-0 z-200 bg-obsidian/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="fixed inset-y-0 left-0 z-200 w-[88%] max-w-90 bg-cream flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.36, ease: EASE }}
          >
            <div className="flex items-center justify-between h-14 px-4 bg-obsidian shrink-0">
              <span className="font-heading text-[11px] uppercase tracking-[0.18em] font-semibold text-cream">
                Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="w-9 h-9 flex items-center justify-center bg-transparent border-0 cursor-pointer text-cream"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Choosing an option navigates; closing on click means the sheet
                  is gone by the time the new results paint. */}
              <FilterPanel facets={facets} selection={selection} onNavigate={onClose} />
            </div>

            <div className="shrink-0 border-t border-stone/15 bg-white p-4 flex items-center gap-2">
              {activeCount > 0 && (
                <Link
                  href={clearedHref()}
                  onClick={onClose}
                  className="h-11 px-4 flex items-center justify-center rounded-sm border border-stone/25 no-underline shrink-0"
                >
                  <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-stone">
                    Reset
                  </span>
                </Link>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-sm bg-forest-green border-0 cursor-pointer font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-cream transition-colors hover:bg-bud-green"
              >
                Show {totalDocs} product{totalDocs === 1 ? '' : 's'}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
