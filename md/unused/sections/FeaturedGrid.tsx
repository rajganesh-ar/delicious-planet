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
    <section className="py-10 md:py-14 lg:py-20 bg-cream">
      <div className="max-w-360 mx-auto px-5 md:px-8 lg:px-16">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-heading font-medium m-0 mb-2">
            Handpicked for You
          </p>
          <h2 className="font-luxury text-2xl md:text-3xl lg:text-4xl font-medium m-0 text-obsidian tracking-tight mb-6 md:mb-8 lg:mb-12">
            Featured Products
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {products.map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.06}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
