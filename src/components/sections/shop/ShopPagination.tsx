'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import { useShopFilters } from './useShopFilters'

interface ShopPaginationProps {
  currentPage: number
  totalPages: number
  totalDocs: number
}

/**
 * Page numbers around the current one, with ellipses standing in for the runs
 * that are skipped. A 40-page catalogue must not print 40 buttons.
 */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set<number>([1, total, current])
  if (current > 1) pages.add(current - 1)
  if (current < total) pages.add(current + 1)
  // Keep the row a stable width near the ends, where the window is clipped.
  if (current <= 3) pages.add(2).add(3).add(4)
  if (current >= total - 2) pages.add(total - 1).add(total - 2).add(total - 3)

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  for (const [i, page] of sorted.entries()) {
    if (i > 0 && page - sorted[i - 1] > 1) out.push('gap')
    out.push(page)
  }
  return out
}

export function ShopPagination({ currentPage, totalPages, totalDocs }: ShopPaginationProps) {
  const { pageHref } = useShopFilters()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-4 border-l border-r border-b border-stone/15 bg-white">
      <p className="font-sans text-[11.5px] text-stone/60 m-0 tabular-nums">
        {totalPages > 1
          ? `Page ${currentPage} of ${totalPages} · ${totalDocs} products`
          : `${totalDocs} product${totalDocs === 1 ? '' : 's'}`}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PageArrow
            href={pageHref(currentPage - 1)}
            disabled={currentPage <= 1}
            label="Previous page"
            path="M15 5l-7 7 7 7"
          />

          {pageWindow(currentPage, totalPages).map((page, i) =>
            page === 'gap' ? (
              <span
                key={`gap-${i}`}
                aria-hidden="true"
                className="w-5 text-center font-mono text-[11px] text-stone/35"
              >
                …
              </span>
            ) : (
              <Link
                key={page}
                href={pageHref(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-sm border no-underline transition-colors',
                  page === currentPage
                    ? 'bg-forest-green border-forest-green'
                    : 'border-stone/20 hover:border-forest-green',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[11px] tabular-nums',
                    page === currentPage ? 'text-cream' : 'text-stone',
                  )}
                >
                  {page}
                </span>
              </Link>
            ),
          )}

          <PageArrow
            href={pageHref(currentPage + 1)}
            disabled={currentPage >= totalPages}
            label="Next page"
            path="M9 5l7 7-7 7"
          />
        </nav>
      )}
    </div>
  )
}

function PageArrow({
  href,
  disabled,
  label,
  path,
}: {
  href: string
  disabled: boolean
  label: string
  path: string
}) {
  const icon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={path} />
    </svg>
  )

  // A disabled arrow is not a link — rendering a span keeps it out of the tab
  // order instead of offering a navigation that goes nowhere.
  if (disabled) {
    return (
      <span
        aria-hidden="true"
        className="w-8 h-8 flex items-center justify-center rounded-sm border border-stone/15 text-stone/25"
      >
        {icon}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-sm border border-stone/20 text-stone no-underline transition-colors hover:border-forest-green hover:text-forest-green"
    >
      {icon}
    </Link>
  )
}
