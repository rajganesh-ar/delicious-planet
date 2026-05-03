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
  originCountries: string[]
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
  originCountries,
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

  useEffect(() => {
    setSearchValue(searchParams.get('search') ?? '')
  }, [searchParams])

  const activeCategory = searchParams.get('category') ?? ''
  const activeSupplier = searchParams.get('supplier') ?? ''
  const activeCollection = searchParams.get('collection') ?? ''
  const activeSort = searchParams.get('sort') ?? '-createdAt'
  const activeSearch = searchParams.get('search') ?? ''
  const activeFeatured = searchParams.get('featured') === 'true'
  const activeInStock = searchParams.get('inStock') === 'true'
  const activeOriginCountry = searchParams.get('originCountry') ?? ''

  const activeCategoryLabel = categories.find((c) => c.slug === activeCategory)?.title ?? null
  const activeSupplierLabel = suppliers.find((s) => s.slug === activeSupplier)?.name ?? null
  const activeCollectionLabel = collections.find((c) => c.slug === activeCollection)?.title ?? null

  const hasActiveFilters =
    activeCategory ||
    activeSupplier ||
    activeCollection ||
    activeSearch ||
    activeFeatured ||
    activeInStock

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('supplier')
    params.delete('collection')
    params.delete('search')
    params.delete('featured')
    params.delete('inStock')
    params.delete('originCountry')
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
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.4) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Decorative gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <div className="relative max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold/80 font-heading font-medium m-0 mb-4 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              Delicious Planet
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] xl:text-[56px] font-medium m-0 text-cream tracking-[-0.03em] leading-[1.08]">
              {activeCollectionLabel ?? activeCategoryLabel ?? 'The Collection'}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/60 text-[15px] sm:text-[16px] mt-4 mb-0 max-w-lg leading-relaxed">
              {activeSupplierLabel
                ? `Curated ingredients by ${activeSupplierLabel}`
                : "Exceptional ingredients sourced from the world's finest artisan producers."}
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
      <div className="sticky z-40 bg-obsidian backdrop-blur-md border-b border-cream/10" style={{ top: 'var(--header-h)' }}>
        <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          {/* Top row: Search + Sort */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Search */}
            <div className="flex items-center flex-1 max-w-sm">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                className="text-cream/40 mr-2.5 shrink-0"
              >
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
              {/* Filter toggle (mobile + tablet) */}
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="lg:hidden flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream/70 border border-cream/20 bg-transparent cursor-pointer hover:text-cream hover:border-cream/40 transition-colors px-3 py-2 min-h-[36px]"
              >
                <svg
                  width="12"
                  height="8"
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
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/30 mr-2 hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={activeSort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="text-[11px] uppercase tracking-[0.15em] bg-transparent border-0 text-cream/70 outline-none cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-obsidian text-cream">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bottom row: compact dropdown filters (desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-3 pb-3 items-end">
            <label className="col-span-3">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-cream/35 mb-1">
                Collection
              </span>
              <select
                value={activeCollection}
                onChange={(e) => setFilter('collection', e.target.value)}
                className="w-full h-9 px-2 text-[10px] uppercase tracking-[0.15em] bg-transparent border border-cream/20 text-cream/75 outline-none cursor-pointer"
              >
                <option value="" className="bg-obsidian text-cream">
                  All Collections
                </option>
                {collections.map((col) => (
                  <option key={col.id} value={col.slug} className="bg-obsidian text-cream">
                    {col.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-3">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-cream/35 mb-1">
                Category
              </span>
              <select
                value={activeCategory}
                onChange={(e) => setFilter('category', e.target.value)}
                className="w-full h-9 px-2 text-[10px] uppercase tracking-[0.15em] bg-transparent border border-cream/20 text-cream/75 outline-none cursor-pointer"
              >
                <option value="" className="bg-obsidian text-cream">
                  All Categories
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug} className="bg-obsidian text-cream">
                    {cat.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-3">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-cream/35 mb-1">
                Supplier
              </span>
              <select
                value={activeSupplier}
                onChange={(e) => setFilter('supplier', e.target.value)}
                className="w-full h-9 px-2 text-[10px] uppercase tracking-[0.15em] bg-transparent border border-cream/20 text-cream/75 outline-none cursor-pointer"
              >
                <option value="" className="bg-obsidian text-cream">
                  All Suppliers
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.slug} className="bg-obsidian text-cream">
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="col-span-3 flex items-center gap-2">
              <button
                onClick={() => setFilter('featured', activeFeatured ? '' : 'true')}
                className={`h-9 px-3 text-[10px] uppercase tracking-[0.2em] border cursor-pointer transition-all ${
                  activeFeatured
                    ? 'bg-gold text-obsidian border-gold'
                    : 'bg-transparent text-cream/60 border-cream/20 hover:border-cream/40 hover:text-cream'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setFilter('inStock', activeInStock ? '' : 'true')}
                className={`h-9 px-3 text-[10px] uppercase tracking-[0.2em] border cursor-pointer transition-all ${
                  activeInStock
                    ? 'bg-gold text-obsidian border-gold'
                    : 'bg-transparent text-cream/60 border-cream/20 hover:border-cream/40 hover:text-cream'
                }`}
              >
                In Stock
              </button>
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

                  <div className="grid grid-cols-1 gap-4">
                    <label>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold m-0 mb-2">Collection</p>
                      <select
                        value={activeCollection}
                        onChange={(e) => {
                          setFilter('collection', e.target.value)
                          setFilterOpen(false)
                        }}
                        className="w-full py-2.5 px-3 text-xs uppercase tracking-[0.12em] bg-transparent border border-cream/20 text-cream outline-none"
                      >
                        <option value="" className="bg-obsidian text-cream">All Collections</option>
                        {collections.map((col) => (
                          <option key={col.id} value={col.slug} className="bg-obsidian text-cream">
                            {col.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold m-0 mb-2">Category</p>
                      <select
                        value={activeCategory}
                        onChange={(e) => {
                          setFilter('category', e.target.value)
                          setFilterOpen(false)
                        }}
                        className="w-full py-2.5 px-3 text-xs uppercase tracking-[0.12em] bg-transparent border border-cream/20 text-cream outline-none"
                      >
                        <option value="" className="bg-obsidian text-cream">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug} className="bg-obsidian text-cream">
                            {cat.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold m-0 mb-2">Supplier</p>
                      <select
                        value={activeSupplier}
                        onChange={(e) => {
                          setFilter('supplier', e.target.value)
                          setFilterOpen(false)
                        }}
                        className="w-full py-2.5 px-3 text-xs uppercase tracking-[0.12em] bg-transparent border border-cream/20 text-cream outline-none"
                      >
                        <option value="" className="bg-obsidian text-cream">All Suppliers</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.slug} className="bg-obsidian text-cream">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold m-0 mb-2">
                        Origin Country
                      </p>
                      <select
                        value={activeOriginCountry}
                        onChange={(e) => {
                          setFilter('originCountry', e.target.value)
                          setFilterOpen(false)
                        }}
                        className="w-full py-2.5 px-3 text-xs uppercase tracking-[0.12em] bg-transparent border border-cream/20 text-cream outline-none"
                      >
                        <option value="" className="bg-obsidian text-cream">
                          All Countries
                        </option>
                        {originCountries.map((country) => (
                          <option key={country} value={country} className="bg-obsidian text-cream">
                            {country}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Active filter chips ───────────────────────────────── */}
      {hasActiveFilters && (
        <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pt-4 pb-3 flex flex-wrap items-center gap-2 border-b border-stone/10">
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
          {activeInStock && (
            <button
              onClick={() => setFilter('inStock', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-gold/40 text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream hover:border-obsidian transition-colors cursor-pointer bg-transparent"
            >
              In Stock
              <span className="text-base leading-none">&times;</span>
            </button>
          )}
                    {activeOriginCountry && (
            <button
              onClick={() => setFilter('originCountry', '')}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] border border-gold/40 text-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-cream hover:border-obsidian transition-colors cursor-pointer bg-transparent"
            >
              {activeOriginCountry}
              <span className="text-base leading-none">&times;</span>
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
      <div className="max-w-[1600px] mx-auto py-8 sm:py-10 md:py-12 lg:py-14">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6">
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
            <p className="text-obsidian text-base font-luxury m-0 mb-2">No products found</p>
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
            {/* Border-grid: top+left border on container, each card adds right+bottom */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-l border-t border-stone/15 items-stretch">
              {products.map((product, i) => (
                <FadeIn key={product.id} delay={i * 0.03} className="h-full">
                  <ProductCard product={product} index={i} />
                </FadeIn>
              ))}
            </div>

            {/* Persistent pagination footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-5 sm:px-6 md:px-8 lg:px-12 py-5 border-t border-stone/15">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone/40 m-0">
                {totalDocs <= 24
                  ? `${totalDocs} product${totalDocs !== 1 ? 's' : ''}`
                  : `Page ${currentPage} of ${totalPages} · ${totalDocs} products`}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('page', String(currentPage - 1))
                      router.push(`${pathname}?${params.toString()}`)
                    }}
                    disabled={currentPage <= 1}
                    className="w-9 h-9 flex items-center justify-center text-stone border border-stone/20 bg-transparent cursor-pointer hover:border-obsidian hover:text-obsidian transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    ←
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('page', String(page))
                    const isActive = page === currentPage
                    return (
                      <button
                        key={page}
                        onClick={() => router.push(`${pathname}?${params.toString()}`)}
                        className={`w-9 h-9 text-[10px] tracking-widest border cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-obsidian text-cream border-obsidian'
                            : 'bg-transparent text-stone border-stone/20 hover:border-obsidian hover:text-obsidian'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('page', String(currentPage + 1))
                      router.push(`${pathname}?${params.toString()}`)
                    }}
                    disabled={currentPage >= totalPages}
                    className="w-9 h-9 flex items-center justify-center text-stone border border-stone/20 bg-transparent cursor-pointer hover:border-obsidian hover:text-obsidian transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

