'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { ProductCard } from '@/components/ui/ProductCard'
import type { Product } from '@/payload-types'

interface FeaturedGridProps {
  products: Product[]
}

export function FeaturedGrid({ products }: FeaturedGridProps) {
  if (products.length === 0) return null

  return (
    <section className="py-(--spacing-section-lg) bg-cream">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-16">
        <FadeIn>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-[44px] font-medium m-0 text-obsidian tracking-tight mb-8 md:mb-12 lg:mb-16">
            Featured Products
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-12">
          {products.map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.1}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
