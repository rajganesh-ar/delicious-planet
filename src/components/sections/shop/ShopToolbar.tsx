'use client'

import { useEffect, useRef, useState } from 'react'
import { useShopFilters } from './useShopFilters'

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'basePrice', label: 'Price: low to high' },
  { value: '-basePrice', label: 'Price: high to low' },
  { value: 'title', label: 'Name: A–Z' },
  { value: '-title', label: 'Name: Z–A' },
]

interface ShopToolbarProps {
  totalDocs: number
  currentPage: number
  perPage: number
  activeSort: string
  activeSearch: string
  /** Number of filters currently on — badges the mobile Filters button. */
  activeCount: number
  onOpenFilters: () => void
}

/**
 * Result count, in-results search and sort. Sticks to the bottom of the navbar
 * via `--header-h`, which Header.tsx republishes from its measured height.
 */
export function ShopToolbar({
  totalDocs,
  currentPage,
  perPage,
  activeSort,
  activeSearch,
  activeCount,
  onOpenFilters,
}: ShopToolbarProps) {
  const { apply } = useShopFilters()
  const [term, setTerm] = useState(activeSearch)
  const [syncedWith, setSyncedWith] = useState(activeSearch)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the field honest when the URL changes underneath it — a chip removal,
  // a back navigation or a reset all rewrite `?search=`. Adjusting during
  // render rather than in an effect avoids a second paint with a stale value.
  if (activeSearch !== syncedWith) {
    setSyncedWith(activeSearch)
    setTerm(activeSearch)
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const onSearch = (value: string) => {
    setTerm(value)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => apply({ search: value.trim() || null }), 400)
  }

  const first = totalDocs === 0 ? 0 : (currentPage - 1) * perPage + 1
  const last = Math.min(currentPage * perPage, totalDocs)

  return (
    <div
      className="sticky z-40 bg-cream/95 backdrop-blur-sm border-b border-stone/15"
      style={{ top: 'var(--header-h)' }}
    >
      {/* Wraps below md: the Filters button and the sort select both hold their
          intrinsic width, so on one row the search field is the only thing that
          can absorb the shortfall and it collapsed to ~40px. It takes its own
          full-width row instead. */}
      <div className="px-6 lg:px-16 py-2.5 flex flex-wrap items-center gap-2 md:gap-5">
        {/* Mobile: opens the filter sheet. Desktop has the panel in view. */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="lg:hidden inline-flex items-center gap-2 h-11 px-3 rounded-sm border border-stone/25 bg-white cursor-pointer text-obsidian transition-colors hover:border-forest-green"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="min-w-4 h-4 px-1 rounded-pill bg-forest-green text-cream font-mono text-[9px] leading-4 text-center">
              {activeCount}
            </span>
          )}
        </button>

        <p className="hidden sm:block font-sans text-[11.5px] text-stone m-0 shrink-0 tabular-nums">
          {totalDocs === 0 ? 'No products' : `${first}–${last} of ${totalDocs} products`}
        </p>

        {/* In-results search — narrows what is already on screen, unlike the
            navbar search which starts a fresh query. */}
        <label className="order-last md:order-0 basis-full md:basis-auto md:flex-1 min-w-0 flex items-center gap-2 h-11 md:h-9 px-2.5 rounded-sm border border-stone/20 bg-white focus-within:border-forest-green transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-stone/45 shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={term}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search in results…"
            aria-label="Search in results"
            className="w-full min-w-0 bg-transparent border-0 outline-none font-sans text-[12.5px] text-obsidian placeholder:text-stone/40"
          />
        </label>

        <label className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
          <span className="hidden md:inline font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-stone/60">
            Sort
          </span>
          <select
            value={activeSort}
            onChange={(e) => apply({ sort: e.target.value })}
            className="h-11 md:h-9 pl-2.5 pr-7 rounded-sm border border-stone/20 bg-white font-sans text-[12px] text-obsidian outline-none cursor-pointer transition-colors hover:border-forest-green focus:border-forest-green appearance-none bg-no-repeat"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2.4'><path d='M5 8l7 7 7-7'/></svg>\")",
              backgroundPosition: 'right 8px center',
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
