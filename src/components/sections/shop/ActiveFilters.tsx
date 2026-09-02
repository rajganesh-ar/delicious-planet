'use client'

import Link from 'next/link'
import { useShopFilters } from './useShopFilters'
import type { ShopFacets, ShopSelection } from '@/lib/shop-facets'

export interface ActiveFilter {
  /** Query key to drop when the chip is dismissed. */
  param: string
  label: string
}

/**
 * Resolves the raw selection into display labels.
 *
 * The labels come from the facet lists rather than a second lookup: an option
 * that is currently chosen is always kept in its facet group (see
 * buildShopFacets), so its label is guaranteed to be there.
 */
export function resolveActiveFilters(
  selection: ShopSelection,
  facets: ShopFacets,
): ActiveFilter[] {
  const chips: ActiveFilter[] = []
  const find = (options: { slug: string; label: string }[], slug: string) =>
    options.find((o) => o.slug === slug)?.label ?? slug

  if (selection.search) chips.push({ param: 'search', label: `“${selection.search}”` })

  if (selection.category) {
    const flat = facets.categories.flatMap((dept) => [dept, ...dept.children])
    chips.push({ param: 'category', label: find(flat, selection.category) })
  }
  if (selection.region)
    chips.push({ param: 'region', label: find(facets.regions, selection.region) })
  if (selection.country)
    chips.push({ param: 'originCountry', label: find(facets.countries, selection.country) })
  if (selection.brand) chips.push({ param: 'brand', label: find(facets.brands, selection.brand) })
  if (selection.supplier)
    chips.push({ param: 'supplier', label: find(facets.suppliers, selection.supplier) })
  if (selection.dietary)
    chips.push({ param: 'dietary', label: find(facets.dietary, selection.dietary) })
  if (selection.price) chips.push({ param: 'price', label: find(facets.price, selection.price) })
  if (selection.featured) chips.push({ param: 'featured', label: 'Featured' })
  if (selection.inStock) chips.push({ param: 'inStock', label: 'In stock' })

  return chips
}

/** Dismissible summary of what is currently narrowing the grid. */
export function ActiveFilters({ filters }: { filters: ActiveFilter[] }) {
  const { hrefWith, clearedHref } = useShopFilters()
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-4">
      <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-stone/55 mr-1">
        Filtered by
      </span>

      {filters.map((filter) => (
        <Link
          key={`${filter.param}:${filter.label}`}
          // `collection` is the legacy alias for `category`; drop both or the
          // old param would silently re-apply the filter just removed.
          href={hrefWith(
            filter.param === 'category'
              ? { category: null, collection: null }
              : { [filter.param]: null },
          )}
          className="group inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-sm border border-forest-green/30 bg-forest-green/[0.06] no-underline transition-colors hover:bg-forest-green hover:border-forest-green"
        >
          <span className="font-sans text-[11.5px] text-forest-green group-hover:text-cream transition-colors">
            {filter.label}
          </span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            aria-hidden="true"
            className="text-forest-green/60 group-hover:text-cream transition-colors"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}

      {filters.length > 1 && (
        <Link href={clearedHref()} className="ml-1 no-underline">
          <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-stone/60 hover:text-forest-green transition-colors">
            Clear all
          </span>
        </Link>
      )}
    </div>
  )
}
