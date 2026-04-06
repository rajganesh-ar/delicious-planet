import type React from 'react'

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={[
        'relative overflow-hidden bg-cream/10 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-cream/[0.06] before:to-transparent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    />
  )
}

/** Product card skeleton — matches ProductCard dimensions */
export function ProductCardSkeleton() {
  return (
    <div className="group flex flex-col bg-obsidian border border-cream/[0.06] overflow-hidden">
      {/* Image area */}
      <Shimmer className="aspect-[4/5] w-full" />
      {/* Text area */}
      <div className="p-5 space-y-3">
        <Shimmer className="h-3 w-1/3 rounded-sm" />
        <Shimmer className="h-5 w-4/5 rounded-sm" />
        <Shimmer className="h-4 w-2/5 rounded-sm" />
      </div>
    </div>
  )
}

/** Shop-style product card skeleton (light theme) */
export function ShopProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-parchment border border-mist overflow-hidden">
      {/* Text header */}
      <div className="px-4 pt-4 pb-3 space-y-2">
        <Shimmer className="h-3 w-1/4 rounded-sm bg-stone/10" />
        <Shimmer className="h-4 w-3/4 rounded-sm bg-stone/10" />
      </div>
      {/* Image */}
      <Shimmer className="aspect-square mx-4 mb-3 bg-stone/10" />
      {/* CTA bar */}
      <Shimmer className="h-11 w-full bg-stone/10" />
    </div>
  )
}

/** Products grid skeleton — renders N cards */
export function ProductGridSkeleton({
  count = 6,
  shop = false,
}: {
  count?: number
  shop?: boolean
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) =>
        shop ? <ShopProductCardSkeleton key={i} /> : <ProductCardSkeleton key={i} />,
      )}
    </div>
  )
}

/** Full-page skeleton for the products listing page */
export function ProductsPageSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-32">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          {[80, 60, 70, 65].map((w, i) => (
            <Shimmer key={i} className={`h-4 rounded-sm`} style={{ width: `${w}%` }} />
          ))}
        </aside>
        {/* Grid */}
        <div className="flex-1">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  )
}

/** Single product page skeleton */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <Shimmer className="aspect-square w-full rounded-sm" />
        {/* Info */}
        <div className="space-y-6">
          <Shimmer className="h-3 w-1/4 rounded-sm" />
          <Shimmer className="h-10 w-3/4 rounded-sm" />
          <Shimmer className="h-8 w-1/3 rounded-sm" />
          <div className="space-y-2">
            {[95, 85, 80, 60].map((w, i) => (
              <Shimmer key={i} className={`h-4 rounded-sm`} style={{ width: `${w}%` }} />
            ))}
          </div>
          <Shimmer className="h-14 w-full rounded-sm" />
        </div>
      </div>
    </div>
  )
}
