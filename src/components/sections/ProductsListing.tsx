'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from '@/components/ui/ProductCard'
import { FadeIn } from '@/components/animations/FadeIn'
import type { Product, Category, Supplier, ProductCollection } from '@/payload-types'

interface ProductsListingProps {
  products: Product[]
  categories: Category[]
  suppliers: Supplier[]
  collections: ProductCollection[]
  totalPages: number
  totalDocs: number
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
  collections,
  totalPages,
  totalDocs,
  currentPage,
}: ProductsListingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => {
        setFilter('search', value.trim())
      }, 400)
    },
    [setFilter],
  )

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  const activeCategory = searchParams.get('category') ?? ''
  const activeSupplier = searchParams.get('supplier') ?? ''
  const activeCollection = searchParams.get('collection') ?? ''
  const activeSort = searchParams.get('sort') ?? '-createdAt'
  const activeSearch = searchParams.get('search') ?? ''
  const activeFeatured = searchParams.get('featured') === 'true'

  const activeCategoryLabel = categories.find((c) => c.slug === activeCategory)?.title ?? null
  const activeSupplierLabel = suppliers.find((s) => s.slug === activeSupplier)?.name ?? null
  const activeCollectionLabel = collections.find((c) => c.slug === activeCollection)?.title ?? null

  const hasActiveFilters = activeCategory || activeSupplier || activeCollection || activeSearch || activeFeatured

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('supplier')
    params.delete('collection')
    params.delete('search')
    params.delete('featured')
    params.delete('page')
    setSearchValue('')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div className="relative bg-obsidian overflow-hidden pt-20">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        {/* Decorative gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80 font-heading font-medium m-0 mb-4 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              Delicious Planet
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-4xl md:text-5xl lg:text-[60px] font-medium m-0 text-cream tracking-tight leading-[1.05]">
              {activeCollectionLabel ?? activeCategoryLabel ?? 'The Collection'}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/40 text-sm md:text-base mt-4 mb-0 max-w-lg leading-relaxed">
              {activeSupplierLabel
                ? `Curated ingredients by ${activeSupplierLabel}`
                : 'Exceptional ingredients sourced from the world\'s finest artisan producers.'}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-stone/50 text-xs mt-6 mb-0 uppercase tracking-[0.2em]">
              {totalDocs} product{totalDocs !== 1 ? 's' : ''}
              {currentPage > 1 ? ` · page ${currentPage} of ${totalPages}` : ''}
            </p>
          </FadeIn>
        </div>
      </div>

      {/* ── Filter / Search Bar ───────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-obsidian backdrop-blur-md border-b border-cream/10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Top row: Search + Sort */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Search */}
            <div className="flex items-center flex-1 max-w-sm">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-cream/40 mr-2.5 shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full text-[12px] tracking-wide bg-transparent border-0 text-cream outline-none placeholder:text-cream/30"
              />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-4">
              {/* Filter toggle (mobile) */}
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="lg:hidden flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream/70 border border-cream/20 bg-transparent cursor-pointer hover:text-cream hover:border-cream/40 transition-colors px-3 py-1.5"
              >
                <svg width="12" height="8" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="0" y1="1" x2="14" y2="1" />
                  <line x1="2" y1="5" x2="12" y2="5" />
                  <line x1="4" y1="9" x2="10" y2="9" />
                </svg>
                Filters
              </button>

              {/* Clear filters */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={clearFilters}
                    className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-cream border-0 bg-transparent cursor-pointer transition-colors"
                  >
                    Clear All
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Sort */}
              <div className="flex items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/30 mr-2 hidden sm:inline">Sort:</span>
                <select
                  value={activeSort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="text-[11px] uppercase tracking-[0.15em] bg-transparent border-0 text-cream/70 outline-none cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-obsidian text-cream">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bottom row: Collection + Category + Supplier filters (desktop) */}
          <div className="hidden lg:flex items-center gap-1 pb-3 flex-wrap">
            {/* Quick filter pills */}
            <button
              onClick={() => setFilter('featured', activeFeatured ? '' : 'true')}
              className={`py-1.5 px-3.5 text-[10px] uppercase tracking-[0.2em] border cursor-pointer transition-all ${
                activeFeatured
                  ? 'bg-gold text-obsidian border-gold'
                  : 'bg-transparent text-cream/60 border-cream/20 hover:border-cream/40 hover:text-cream'
              }`}
            >
              ★ Featured
            </button>
            <button
              onClick={() => setFilter('sort', '-createdAt')}
              className={`py-1.5 px-3.5 text-[10px] uppercase tracking-[0.2em] border cursor-pointer transition-all ${
                activeSort === '-createdAt' && !activeCategory && !activeSupplier && !activeCollection && !activeSearch && !activeFeatured
                  ? 'bg-gold text-obsidian border-gold'
                  : 'bg-transparent text-cream/60 border-cream/20 hover:border-cream/40 hover:text-cream'
              }`}
            >
              New Arrivals
            </button>

            {/* Divider */}
            <span className="w-px h-4 bg-cream/15 mx-2" />

            {/* Collection tabs */}
            {collections.length > 0 && (
              <>
                <button
                  onClick={() => setFilter('collection', '')}
                  className={`py-1.5 px-3 text-[10px] uppercase tracking-[0.2em] border-0 bg-transparent cursor-pointer transition-colors ${
                    !activeCollection ? 'text-gold font-semibold' : 'text-cream/50 hover:text-cream'
                  }`}
                >
                  All Collections
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setFilter('collection', col.slug)}
                    className={`py-1.5 px-3 text-[10px] uppercase tracking-[0.2em] border-0 bg-transparent cursor-pointer transition-colors ${
                      activeCollection === col.slug
                        ? 'text-gold font-semibold'
                        : 'text-cream/50 hover:text-cream'
                    }`}
                  >
                    {col.title}
                  </button>
                ))}
                <span className="w-px h-4 bg-cream/15 mx-2" />
              </>
            )}

            {/* Category tabs */}
            <button
              onClick={() => setFilter('category', '')}
              className={`py-1.5 px-3 text-[10px] uppercase tracking-[0.2em] border-0 bg-transparent cursor-pointer transition-colors ${
                !activeCategory ? 'text-cream font-semibold' : 'text-cream/50 hover:text-cream'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter('category', cat.slug)}
                className={`py-1.5 px-3 text-[10px] uppercase tracking-[0.2em] border-0 bg-transparent cursor-pointer transition-colors ${
                  activeCategory === cat.slug
                    ? 'text-cream font-semibold'
                    : 'text-cream/50 hover:text-cream'
                }`}
              >
                {cat.title}
              </button>
            ))}

            {/* Divider */}
            <span className="w-px h-4 bg-cream/15 mx-2" />

            {/* Supplier select */}
            <select
              value={activeSupplier}
              onChange={(e) => setFilter('supplier', e.target.value)}
              className="py-1.5 text-[10px] uppercase tracking-[0.2em] bg-transparent border-0 text-cream/50 outline-none cursor-pointer hover:text-cream transition-colors"
            >
              <option value="" className="bg-obsidian text-cream">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.slug} className="bg-obsidian text-cream">{s.name}</option>
              ))}
            </select>
          </div>

          {/* Mobile filter panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden lg:hidden border-t border-cream/10"
              >
                <div className="py-5 space-y-5">
                  {/* Quick filters */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setFilter('featured', activeFeatured ? '' : 'true')
                        setFilterOpen(false)
                      }}
                      className={`py-2 px-3 text-[10px] uppercase tracking-[0.2em] border cursor-pointer transition-all ${
                        activeFeatured
                          ? 'bg-gold text-obsidian border-gold'
                          : 'bg-transparent text-cream/60 border-cream/20'
                      }`}
                    >
                      ★ Featured
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Collection list */}
                    {collections.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold m-0 mb-3">Collection</p>
                        <ul className="list-none m-0 p-0 space-y-2">
                          <li>
                            <button
                              onClick={() => { setFilter('collection', ''); setFilterOpen(false) }}
                              className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                                !activeCollection ? 'text-cream font-medium' : 'text-cream/50 hover:text-cream'
                              }`}
                            >All</button>
                          </li>
                          {collections.map((col) => (
                            <li key={col.id}>
                              <button
                                onClick={() => { setFilter('collection', col.slug); setFilterOpen(false) }}
                                className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                                  activeCollection === col.slug ? 'text-cream font-medium' : 'text-cream/50 hover:text-cream'
                                }`}
                              >{col.title}</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Category list */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold m-0 mb-3">Category</p>
                      <ul className="list-none m-0 p-0 space-y-2">
                        <li>
                          <button
                            onClick={() => { setFilter('category', ''); setFilterOpen(false) }}
                            className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                              !activeCategory ? 'text-cream font-medium' : 'text-cream/50 hover:text-cream'
                            }`}
                          >All</button>
                        </li>
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <button
                              onClick={() => { setFilter('category', cat.slug); setFilterOpen(false) }}
                              className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                                activeCategory === cat.slug ? 'text-cream font-medium' : 'text-cream/50 hover:text-cream'
                              }`}
                            >{cat.title}</button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Supplier list */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold m-0 mb-3">Supplier</p>
                      <ul className="list-none m-0 p-0 space-y-2">
                        <li>
                          <button
                            onClick={() => { setFilter('supplier', ''); setFilterOpen(false) }}
                            className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                              !activeSupplier ? 'text-cream font-medium' : 'text-cream/50 hover:text-cream'
                            }`}
                          >All</button>
                        </li>
                        {suppliers.map((s) => (
                          <li key={s.id}>
                            <button
                              onClick={() => { setFilter('supplier', s.slug); setFilterOpen(false) }}
                              className={`text-xs bg-transparent border-0 cursor-pointer transition-colors p-0 uppercase tracking-wide ${
                                activeSupplier === s.slug ? 'text-cream font-medium' : 'text-cream/50 hover:text-cream'
                              }`}
                            >{s.name}</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Active filter chips ───────────────────────────────── */}
      {hasActiveFilters && (
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-4 pb-0 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone/50 mr-1">Active:</span>
          {activeSearch && (
            <button
              onClick={() => {
                setSearchValue('')
                setFilter('search', '')
              }}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-gold/40 text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream hover:border-obsidian transition-colors cursor-pointer bg-transparent"
            >
              &ldquo;{activeSearch}&rdquo;
              <span className="text-base leading-none">×</span>
            </button>
          )}
          {activeFeatured && (
            <button
              onClick={() => setFilter('featured', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-gold/40 text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream hover:border-obsidian transition-colors cursor-pointer bg-transparent"
            >
              Featured
              <span className="text-base leading-none">×</span>
            </button>
          )}
          {activeCollectionLabel && (
            <button
              onClick={() => setFilter('collection', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-gold/40 text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream hover:border-obsidian transition-colors cursor-pointer bg-transparent"
            >
              {activeCollectionLabel}
              <span className="text-base leading-none">×</span>
            </button>
          )}
          {activeCategoryLabel && (
            <button
              onClick={() => setFilter('category', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-gold/40 text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream hover:border-obsidian transition-colors cursor-pointer bg-transparent"
            >
              {activeCategoryLabel}
              <span className="text-base leading-none">×</span>
            </button>
          )}
          {activeSupplierLabel && (
            <button
              onClick={() => setFilter('supplier', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-gold/40 text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream hover:border-obsidian transition-colors cursor-pointer bg-transparent"
            >
              {activeSupplierLabel}
              <span className="text-base leading-none">×</span>
            </button>
          )}
        </div>
      )}

      {/* ── Product Grid ──────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 lg:py-14">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              viewBox="0 0 24 24"
              className="text-mist mb-5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-obsidian text-base font-luxury m-0 mb-2">
              No products found
            </p>
            <p className="text-stone text-sm m-0 mb-6">
              Try adjusting your filters or search terms.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] uppercase tracking-[0.2em] text-cream bg-obsidian hover:bg-charcoal border-0 cursor-pointer transition-colors px-6 py-3"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
              {products.map((product, i) => (
                <FadeIn key={product.id} delay={i * 0.04}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-16 lg:mt-20">
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
