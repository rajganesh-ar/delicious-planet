'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/ui/ProductCard'
import { FadeIn } from '@/components/animations/FadeIn'
import { ActiveFilters, resolveActiveFilters } from './shop/ActiveFilters'
import { FilterPanel } from './shop/FilterPanel'
import { MobileFilterSheet } from './shop/MobileFilterSheet'
import { ShopPagination } from './shop/ShopPagination'
import { ShopToolbar } from './shop/ShopToolbar'
import { useShopFilters } from './shop/useShopFilters'
import type { ShopFacets, ShopSelection } from '@/lib/shop-facets'
import type { Product } from '@/payload-types'

interface ProductsListingProps {
  products: Product[]
  facets: ShopFacets
  selection: ShopSelection
  totalPages: number
  totalDocs: number
  currentPage: number
  perPage: number
}

/**
 * The column counts the product grid steps through, with the utilities that
 * show or hide a cell at that step. Must stay in sync with the grid classes.
 */
const COLUMN_STEPS = [
  { cols: 2, on: 'block', off: 'hidden' },
  { cols: 3, on: 'sm:block', off: 'sm:hidden' },
  { cols: 5, on: 'xl:block', off: 'xl:hidden' },
] as const

/**
 * Visibility classes for the empty cells that fill out the final row.
 *
 * How many are needed differs per breakpoint, and the count is known on the
 * server, so each cell is rendered once and simply hidden at the breakpoints
 * where that row is already full.
 */
function trailingCells(count: number): string[] {
  const needed = COLUMN_STEPS.map((step) => (step.cols - (count % step.cols)) % step.cols)
  return Array.from({ length: Math.max(...needed) }, (_, i) =>
    COLUMN_STEPS.map((step, s) => (i < needed[s] ? step.on : step.off)).join(' '),
  )
}

/**
 * The shop.
 *
 * Built on the storefront grammar the homepage established: the cream page
 * ground, the `px-6 lg:px-16` gutters shared with the navbar and footer, a
 * sticky white panel in the left rail, and the hairline border-grid of
 * `ProductCard` tiles — so /products reads as the same surface as the rails on
 * the home page rather than a separate catalogue app.
 *
 * All refinement state lives in the URL (see useShopFilters); this component
 * only decides what is on screen.
 */
export function ProductsListing({
  products,
  facets,
  selection,
  totalPages,
  totalDocs,
  currentPage,
  perPage,
}: ProductsListingProps) {
  const { searchParams } = useShopFilters()
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeFilters = useMemo(
    () => resolveActiveFilters(selection, facets),
    [selection, facets],
  )

  // The page title follows the narrowest thing chosen, so a filtered listing
  // announces itself ("Truffles", "Middle East") instead of always saying "Shop".
  const heading = activeFilters[0]?.label ?? 'All Products'
  const isFiltered = activeFilters.length > 0

  return (
    <>
      {/* ── Page head ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone/15">
        <div className="px-6 lg:px-16 py-5 md:py-7">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-2">
            <Link href="/" className="no-underline">
              <span className="font-sans text-[11px] text-stone/60 hover:text-forest-green transition-colors">
                Home
              </span>
            </Link>
            <span className="text-stone/30 text-[11px]">/</span>
            {isFiltered ? (
              <>
                <Link href="/products" className="no-underline">
                  <span className="font-sans text-[11px] text-stone/60 hover:text-forest-green transition-colors">
                    Shop
                  </span>
                </Link>
                <span className="text-stone/30 text-[11px]">/</span>
                <span className="font-sans text-[11px] text-obsidian">{heading}</span>
              </>
            ) : (
              <span className="font-sans text-[11px] text-obsidian">Shop</span>
            )}
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <h1 className="m-0!">
                <span className="block font-luxury text-2xl md:text-[32px] font-semibold tracking-tight text-obsidian leading-tight">
                  {heading}
                </span>
              </h1>
              <p className="font-sans text-[12.5px] text-stone m-0 mt-1.5 max-w-xl leading-snug">
                Exceptional ingredients sourced from artisan producers worldwide — filter by
                origin, diet or price to find exactly what your kitchen needs.
              </p>
            </div>
            <p className="font-mono text-[11px] text-stone/50 m-0 tabular-nums shrink-0">
              {totalDocs} result{totalDocs === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>

      <ShopToolbar
        totalDocs={totalDocs}
        currentPage={currentPage}
        perPage={perPage}
        activeSort={searchParams.get('sort') ?? '-createdAt'}
        activeSearch={selection.search}
        activeCount={activeFilters.length}
        onOpenFilters={() => setSheetOpen(true)}
      />

      {/* ── Sidebar + grid ────────────────────────────────────── */}
      <div className="bg-cream">
        <div className="px-6 lg:px-16 flex gap-5 xl:gap-7 py-5 md:py-7">
          <aside className="hidden lg:block w-56 xl:w-60 shrink-0">
            <div className="sticky top-[calc(var(--header-h)+3.75rem)]">
              <FadeIn>
                <FilterPanel facets={facets} selection={selection} />
              </FadeIn>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <ActiveFilters filters={activeFilters} />

            {products.length === 0 ? (
              <EmptyState isFiltered={isFiltered} />
            ) : (
              <>
                {/* Border-grid: top+left on the container, each tile adds
                    right+bottom — identical to the homepage rails. */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 border-l border-t border-stone/15 items-stretch">
                  {products.map((product, i) => (
                    <FadeIn key={product.id} delay={(i % 5) * 0.03} className="h-full">
                      <ProductCard product={product} index={(currentPage - 1) * perPage + i} />
                    </FadeIn>
                  ))}

                  {/* The rails upstream trim to whole rows; a result set can't.
                      These empty cells close the last one so the grid reads as a
                      finished table instead of a rule running off into space. */}
                  {trailingCells(products.length).map((visibility, i) => (
                    <div
                      key={`filler-${i}`}
                      aria-hidden="true"
                      className={`${visibility} border-r border-b border-stone/15`}
                    />
                  ))}
                </div>

                <ShopPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalDocs={totalDocs}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        facets={facets}
        selection={selection}
        activeCount={activeFilters.length}
        totalDocs={totalDocs}
      />
    </>
  )
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  const { clearedHref } = useShopFilters()

  return (
    <div className="rounded-sm border border-stone/15 bg-white px-6 py-16 flex flex-col items-center text-center">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-stone/25"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <h2 className="m-0! mt-4!">
        <span className="block font-luxury text-lg font-semibold text-obsidian">
          Nothing matches those filters
        </span>
      </h2>
      <p className="font-sans text-[12.5px] text-stone m-0 mt-1.5 max-w-sm">
        {isFiltered
          ? 'Try widening the search — removing the origin or price band usually helps.'
          : 'The catalogue is being restocked. Please check back shortly.'}
      </p>
      {isFiltered && (
        <Link
          href={clearedHref()}
          className="mt-5 h-10 px-5 inline-flex items-center rounded-sm bg-forest-green no-underline transition-colors hover:bg-bud-green"
        >
          <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-cream">
            Clear all filters
          </span>
        </Link>
      )}
    </div>
  )
}
