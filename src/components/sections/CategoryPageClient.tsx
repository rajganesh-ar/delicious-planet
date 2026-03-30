'use client'

import Image from 'next/image'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { ProductCard } from '@/components/ui/ProductCard'
import type { Product, Category, Media } from '@/payload-types'

interface CategoryPageClientProps {
  category: Category
  products: Product[]
  totalPages: number
  currentPage: number
}

export function CategoryPageClient({
  category,
  products,
  totalPages,
  currentPage,
}: CategoryPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const imgUrl = (() => {
    if (typeof category.image === 'object' && category.image !== null) {
      return (category.image as Media).sizes?.hero?.url ?? (category.image as Media).url ?? null
    }
    return null
  })()

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-obsidian">
          {imgUrl ? (
            <motion.img
              src={imgUrl}
              alt={category.title}
              className="w-full h-full object-cover opacity-50"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-forest to-obsidian" />
          )}
        </div>
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 lg:px-12 pb-12">
          <motion.h1
            className="font-serif text-3xl lg:text-[44px] font-medium m-0 text-cream tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {category.title}
          </motion.h1>
          {category.description && (
            <motion.p
              className="text-cream/60 text-lg m-0 mt-3 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {category.description}
            </motion.p>
          )}
        </div>
      </section>

      {/* Products grid */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone text-lg m-0">No products in this category yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product, i) => (
                  <FadeIn key={product.id} delay={i * 0.05}>
                    <ProductCard product={product} />
                  </FadeIn>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-16">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('page', String(page))
                    return (
                      <button
                        key={page}
                        onClick={() => router.push(`${pathname}?${params.toString()}`)}
                        className={`w-10 h-10 text-sm border rounded-sm cursor-pointer transition-colors ${
                          page === currentPage
                            ? 'bg-obsidian text-cream border-obsidian'
                            : 'bg-transparent text-obsidian border-mist hover:border-gold'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
