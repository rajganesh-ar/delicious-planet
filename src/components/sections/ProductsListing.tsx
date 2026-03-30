'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from '@/components/ui/ProductCard'
import type { Product, Category, Supplier } from '@/payload-types'

interface ProductsListingProps {
  products: Product[]
  categories: Category[]
  suppliers: Supplier[]
  totalPages: number
  currentPage: number
}

const sortOptions = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
  { value: 'title', label: 'Name A–Z' },
  { value: '-title', label: 'Name Z–A' },
]

export function ProductsListing({
  products,
  categories,
  suppliers,
  totalPages,
  currentPage,
}: ProductsListingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const activeCategory = searchParams.get('category') ?? ''
  const activeSupplier = searchParams.get('supplier') ?? ''
  const activeSort = searchParams.get('sort') ?? '-createdAt'

  const activeCategoryLabel = categories.find((c) => c.slug === activeCategory)?.title ?? null
  const activeSupplierLabel = suppliers.find((s) => s.slug === activeSupplier)?.name ?? null
  const activeSortLabel = sortOptions.find((s) => s.value === activeSort)?.label ?? 'Newest'

  const hasActiveFilters = activeCategory || activeSupplier

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('supplier')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-cream min-h-screen">
      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div className="relative bg-obsidian overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        {/* Decorative gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />
        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold m-0 mb-3">
            Delicious Planet
          </p>
          <h1 className="font-luxury text-4xl lg:text-[56px] font-medium m-0 text-cream tracking-tight leading-[1.05]">
            {activeCategoryLabel ? activeCategoryLabel : 'Shop All'}
          </h1>
          {activeSupplierLabel && (
            <p className="text-stone mt-2 mb-0 text-sm tracking-wide">
              by {activeSupplierLabel}
            </p>
          )}
          <p className="text-stone/60 text-sm mt-3 mb-0">
            {products.length} product{products.length !== 1 ? 's' : ''}
            {currentPage > 1 ? ` — page ${currentPage} of ${totalPages}` : ''}
          </p>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-cream border-b border-mist">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="lg:hidden flex items-center gap-2 py-4 text-[11px] uppercase tracking-[0.2em] text-stone border-0 bg-transparent cursor-pointer hover:text-obsidian transition-colors mr-4 flex-shrink-0"
            >
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="0" y1="1" x2="14" y2="1" />
                <line x1="2" y1="5" x2="12" y2="5" />
                <line x1="4" y1="9" x2="10" y2="9" />
              </svg>
              Filters
            </button>

            {/* Desktop: Category pills */}
            <div className="hidden lg:flex items-center border-r border-mist pr-6 mr-6 gap-1 flex-shrink-0">
              <button
                onClick={() => setFilter('category', '')}
                className={`py-4 px-3 text-[11px] uppercase tracking-[0.2em] border-0 bg-transparent cursor-pointer transition-colors whitespace-nowrap ${
                  !activeCategory ? 'text-obsidian font-medium' : 'text-stone hover:text-obsidian'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter('category', cat.slug)}
                  className={`py-4 px-3 text-[11px] uppercase tracking-[0.2em] border-0 bg-transparent cursor-pointer transition-colors whitespace-nowrap ${
                    activeCategory === cat.slug
                      ? 'text-obsidian font-medium'
                      : 'text-stone hover:text-obsidian'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Supplier select */}
            <div className="hidden lg:flex items-center border-r border-mist pr-6 mr-6">
              <select
                value={activeSupplier}
                onChange={(e) => setFilter('supplier', e.target.value)}
                className="py-4 text-[11px] uppercase tracking-[0.2em] bg-transparent border-0 text-stone outline-none cursor-pointer hover:text-obsidian transition-colors"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Clear filters */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  onClick={clearFilters}
                  className="py-4 px-3 text-[11px] uppercase tracking-[0.2em] text-stone hover:text-obsidian border-0 bg-transparent cursor-pointer transition-colors border-r border-mist mr-0 pr-6 flex-shrink-0"
                >
                  Clear
                </motion.button>
              )}
            </AnimatePresence>

            {/* Sort */}
            <div className="flex items-center pl-4 lg:pl-6 flex-shrink-0">
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone mr-2 hidden sm:inline">
                Sort:
              </span>
              <select
                value={activeSort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="py-4 text-[11px] uppercase tracking-[0.2em] bg-transparent border-0 text-obsidian outline-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filter panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden lg:hidden border-t border-mist"
              >
                <div className="py-5 grid grid-cols-2 gap-6">
                  {/* Category list */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone m-0 mb-3">
                      Category
                    </p>
                    <ul className="list-none m-0 p-0 space-y-2">
                      <li>
                        <button
                          onClick={() => {
                            setFilter('category', '')
                            setFilterOpen(false)
                          }}
                          className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                            !activeCategory
                              ? 'text-obsidian font-medium'
                              : 'text-stone hover:text-obsidian'
                          }`}
                        >
                          All
                        </button>
                      </li>
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <button
                            onClick={() => {
                              setFilter('category', cat.slug)
                              setFilterOpen(false)
                            }}
                            className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                              activeCategory === cat.slug
                                ? 'text-obsidian font-medium'
                                : 'text-stone hover:text-obsidian'
                            }`}
                          >
                            {cat.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Supplier list */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone m-0 mb-3">
                      Supplier
                    </p>
                    <ul className="list-none m-0 p-0 space-y-2">
                      <li>
                        <button
                          onClick={() => {
                            setFilter('supplier', '')
                            setFilterOpen(false)
                          }}
                          className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                            !activeSupplier
                              ? 'text-obsidian font-medium'
                              : 'text-stone hover:text-obsidian'
                          }`}
                        >
                          All
                        </button>
                      </li>
                      {suppliers.map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => {
                              setFilter('supplier', s.slug)
                              setFilterOpen(false)
                            }}
                            className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                              activeSupplier === s.slug
                                ? 'text-obsidian font-medium'
                                : 'text-stone hover:text-obsidian'
                            }`}
                          >
                            {s.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Active filter chips ───────────────────────────────── */}
      {hasActiveFilters && (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-5 pb-0 flex flex-wrap gap-2">
          {activeCategoryLabel && (
            <button
              onClick={() => setFilter('category', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-obsidian text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream transition-colors cursor-pointer bg-transparent"
            >
              {activeCategoryLabel}
              <span className="text-base leading-none">×</span>
            </button>
          )}
          {activeSupplierLabel && (
            <button
              onClick={() => setFilter('supplier', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-obsidian text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream transition-colors cursor-pointer bg-transparent"
            >
              {activeSupplierLabel}
              <span className="text-base leading-none">×</span>
            </button>
          )}
        </div>
      )}

      {/* ── Product Grid ──────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-mist">
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
              className="text-mist mb-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-stone text-sm m-0 uppercase tracking-[0.2em]">
              No products found
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gold hover:text-obsidian border-0 bg-transparent cursor-pointer transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid: flush borders like Watchhouse */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-mist border border-mist">
              {products.map((product) => (
                <div key={product.id} className="bg-cream">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-16">
                {/* Prev */}
                {currentPage > 1 && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('page', String(currentPage - 1))
                      router.push(`${pathname}?${params.toString()}`)
                    }}
                    className="w-10 h-10 flex items-center justify-center text-stone hover:text-obsidian border border-mist hover:border-obsidian bg-transparent cursor-pointer transition-colors text-sm"
                  >
                    ←
                  </button>
                )}

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(page))
                  const isActive = page === currentPage
                  return (
                    <button
                      key={page}
                      onClick={() => router.push(`${pathname}?${params.toString()}`)}
                      className={`w-10 h-10 text-[11px] tracking-widest border cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-obsidian text-cream border-obsidian'
                          : 'bg-transparent text-stone border-mist hover:border-obsidian hover:text-obsidian'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                {/* Next */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('page', String(currentPage + 1))
                      router.push(`${pathname}?${params.toString()}`)
                    }}
                    className="w-10 h-10 flex items-center justify-center text-stone hover:text-obsidian border border-mist hover:border-obsidian bg-transparent cursor-pointer transition-colors text-sm"
                  >
                    →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
