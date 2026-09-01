import { FadeIn } from '@/components/animations/FadeIn'
import { ProductCard } from '@/components/ui/ProductCard'
import { SectionHeader } from './SectionHeader'
import type { Product } from '@/payload-types'

/** Widest grid step — every row holds this many tiles on xl and up. */
export const RAIL_COLUMNS = 5

interface ProductRailProps {
  title: string
  products: Product[]
  href?: string
  /** Flags every tile in the rail as new — used by "New Arrivals". */
  markNew?: boolean
  /** Rows of tiles to render at the xl breakpoint. */
  rows?: number
}

/**
 * Titled block of product tiles — shared by Best Sellers and New Arrivals.
 * Uses the same `ProductCard` and hairline border-grid as the shop listing so
 * the two surfaces stay identical.
 */
export function ProductRail({
  title,
  products,
  href = '/products',
  markNew = false,
  rows = 1,
}: ProductRailProps) {
  // Trim to whole rows so the xl grid never leaves a half-filled row. Narrower
  // breakpoints (2 and 3 columns) can still wrap, which is expected.
  const visible = products.slice(0, RAIL_COLUMNS * rows)
  if (visible.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title={title} href={href} className="mb-5 md:mb-7" />

      {/* Border-grid: top+left on the container, each card adds right+bottom. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 border-l border-t border-stone/15 items-stretch">
        {visible.map((product, i) => (
          <FadeIn key={product.id} delay={(i % RAIL_COLUMNS) * 0.03} className="h-full">
            <ProductCard product={product} index={i} isNew={markNew} />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
