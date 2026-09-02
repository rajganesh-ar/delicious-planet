'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/** Every query key the listing owns — the set "Clear all" resets. */
export const FILTER_KEYS = [
  'category',
  'collection',
  'brand',
  'supplier',
  'region',
  'originCountry',
  'dietary',
  'price',
  'search',
  'featured',
  'inStock',
] as const

/**
 * URL-as-state for the shop listing.
 *
 * Filters are links, not local state: every option renders a real href, so the
 * panel works before hydration, options are prefetchable, and back/forward walk
 * the refinement history. `apply` exists for the controls that can't be an
 * anchor — the sort select and the debounced search box.
 */
export function useShopFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /** Current URL with `patch` applied; a null or empty value drops the key. */
  const hrefWith = useCallback(
    (patch: Record<string, string | null>): string => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      // Any refinement invalidates the current page number.
      params.delete('page')
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    },
    [pathname, searchParams],
  )

  const apply = useCallback(
    (patch: Record<string, string | null>) => router.push(hrefWith(patch)),
    [router, hrefWith],
  )

  /** Same filters, different page — the one link that keeps `page`. */
  const pageHref = useCallback(
    (page: number): string => {
      const params = new URLSearchParams(searchParams.toString())
      if (page > 1) params.set('page', String(page))
      else params.delete('page')
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    },
    [pathname, searchParams],
  )

  /** Drops every filter but keeps sort, so the ordering survives a reset. */
  const clearedHref = useCallback((): string => {
    const params = new URLSearchParams(searchParams.toString())
    for (const key of FILTER_KEYS) params.delete(key)
    params.delete('page')
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  return { hrefWith, apply, pageHref, clearedHref, searchParams, router }
}
