'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShopProductCard } from '@/components/ui/ShopProductCard'
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

/* ── Custom dropdown with scrollable list ──────────────────── */
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const activeLabel = options.find((o) => o.value === value)?.label ?? label

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onToggle])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 border px-3.5 py-2.5 text-[10px] uppercase tracking-[0.2em] cursor-pointer transition-all font-heading min-w-[130px] justify-between ${
          value
            ? 'bg-gold/10 text-gold border-gold/30'
            : 'bg-charcoal/60 text-cream/70 border-cream/10 hover:border-cream/25 hover:text-cream'
        }`}
      >
        <span className="truncate">{value ? activeLabel : label}</span>
        <svg
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 z-50 min-w-[180px] bg-charcoal border border-cream/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[240px] overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,168,76,0.3) transparent' }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  onToggle()
                }}
                className={`w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] border-0 cursor-pointer transition-colors block ${
                  value === opt.value
                    ? 'bg-gold/15 text-gold font-medium'
                    : 'bg-transparent text-cream/70 hover:bg-cream/5 hover:text-cream'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

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

  const hasActiveFilters =
    activeCategory || activeSupplier || activeCollection || activeSearch || activeFeatured

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
        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80 font-heading font-medium m-0 mb-4 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              Delicious Planet
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[60px] font-semibold m-0 text-cream tracking-tight leading-[1.05]">
              {activeCollectionLabel ?? activeCategoryLabel ?? 'The Collection'}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/40 text-sm md:text-base mt-4 mb-0 max-w-lg leading-relaxed">
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

      {/* ── Filter Bar (detached luxury box) ──────────────────── */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 -mt-7 relative z-30">
        <div className="bg-obsidian border border-cream/8 shadow-[0_8px_40px_rgba(0,0,0,0.35)] px-5 md:px-7 py-4 md:py-5">
          {/* Row 1: Search + dropdowns + sort */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            {/* Search input */}
            <div className="relative flex items-center flex-1 min-w-0 lg:max-w-xs border border-cream/10 bg-charcoal/50 px-3 py-2.5">
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                className="text-cream/30 mr-2.5 shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full text-[12px] tracking-wide bg-transparent border-0 text-cream outline-none placeholder:text-cream/30 font-sans"
              />
              {searchValue && (
                <button
                  onClick={() => {
                    setSearchValue('')
                    setFilter('search', '')
                  }}
                  className="ml-1 text-cream/40 hover:text-cream bg-transparent border-0 cursor-pointer text-sm leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Dropdown filters */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1">
              {/* Collection dropdown */}
              {collections.length > 0 && (
                <FilterDropdown
                  label="All Collections"
                  value={activeCollection}
                  options={[
                    { value: '', label: 'All Collections' },
                    ...collections.map((c) => ({ value: c.slug, label: c.title })),
                  ]}
                  onChange={(v) => setFilter('collection', v)}
                  isOpen={openDropdown === 'collection'}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === 'collection' ? null : 'collection')
                  }
                />
              )}

              {/* Category dropdown */}
              <FilterDropdown
                label="All Categories"
                value={activeCategory}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c) => ({ value: c.slug, label: c.title })),
                ]}
                onChange={(v) => setFilter('category', v)}
                isOpen={openDropdown === 'category'}
                onToggle={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              />

              {/* Supplier dropdown */}
              {suppliers.length > 0 && (
                <FilterDropdown
                  label="All Suppliers"
                  value={activeSupplier}
                  options={[
                    { value: '', label: 'All Suppliers' },
                    ...suppliers.map((s) => ({ value: s.slug, label: s.name })),
                  ]}
                  onChange={(v) => setFilter('supplier', v)}
                  isOpen={openDropdown === 'supplier'}
                  onToggle={() => setOpenDropdown(openDropdown === 'supplier' ? null : 'supplier')}
                />
              )}

              {/* Featured toggle */}
              <button
                onClick={() => setFilter('featured', activeFeatured ? '' : 'true')}
                className={`text-[10px] uppercase tracking-[0.2em] border px-3.5 py-2.5 cursor-pointer transition-all font-heading font-medium ${
                  activeFeatured
                    ? 'bg-gold text-obsidian border-gold'
                    : 'bg-charcoal/60 text-cream/60 border-cream/10 hover:border-cream/25 hover:text-cream'
                }`}
              >
                ★ Featured
              </button>

              {/* Separator */}
              <span className="hidden lg:block w-px h-6 bg-cream/10 mx-1" />

              {/* Sort dropdown */}
              <div className="ml-auto">
                <FilterDropdown
                  label="Sort by"
                  value={activeSort}
                  options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
                  onChange={(v) => setFilter('sort', v)}
                  isOpen={openDropdown === 'sort'}
                  onToggle={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Active filter chips + clear + count */}
          {(hasActiveFilters || totalDocs > 0) && (
            <div className="flex items-center flex-wrap gap-2 mt-3.5 pt-3.5 border-t border-cream/8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cream/30 mr-1 font-heading">
                {totalDocs} result{totalDocs !== 1 ? 's' : ''}
              </span>

              {activeSearch && (
                <button
                  onClick={() => {
                    setSearchValue('')
                    setFilter('search', '')
                  }}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] border border-cream/15 text-cream/70 pl-2.5 pr-2 py-1 hover:bg-gold/15 hover:text-gold hover:border-gold/30 transition-colors cursor-pointer bg-transparent font-sans"
                >
                  &ldquo;{activeSearch}&rdquo;
                  <span className="text-xs leading-none opacity-50">×</span>
                </button>
              )}
              {activeFeatured && (
                <button
                  onClick={() => setFilter('featured', '')}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] border border-cream/15 text-cream/70 pl-2.5 pr-2 py-1 hover:bg-gold/15 hover:text-gold hover:border-gold/30 transition-colors cursor-pointer bg-transparent font-sans"
                >
                  Featured
                  <span className="text-xs leading-none opacity-50">×</span>
                </button>
              )}
              {activeCollectionLabel && (
                <button
                  onClick={() => setFilter('collection', '')}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] border border-cream/15 text-cream/70 pl-2.5 pr-2 py-1 hover:bg-gold/15 hover:text-gold hover:border-gold/30 transition-colors cursor-pointer bg-transparent font-sans"
                >
                  {activeCollectionLabel}
                  <span className="text-xs leading-none opacity-50">×</span>
                </button>
              )}
              {activeCategoryLabel && (
                <button
                  onClick={() => setFilter('category', '')}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] border border-cream/15 text-cream/70 pl-2.5 pr-2 py-1 hover:bg-gold/15 hover:text-gold hover:border-gold/30 transition-colors cursor-pointer bg-transparent font-sans"
                >
                  {activeCategoryLabel}
                  <span className="text-xs leading-none opacity-50">×</span>
                </button>
              )}
              {activeSupplierLabel && (
                <button
                  onClick={() => setFilter('supplier', '')}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] border border-cream/15 text-cream/70 pl-2.5 pr-2 py-1 hover:bg-gold/15 hover:text-gold hover:border-gold/30 transition-colors cursor-pointer bg-transparent font-sans"
                >
                  {activeSupplierLabel}
                  <span className="text-xs leading-none opacity-50">×</span>
                </button>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-cream border-0 bg-transparent cursor-pointer transition-colors font-heading font-medium ml-auto"
                >
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
            <p className="text-obsidian text-base font-heading font-semibold m-0 mb-2">
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
                  <ShopProductCard product={product} />
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
