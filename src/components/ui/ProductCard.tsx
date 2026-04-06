'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/components/layout/CartContext'
import {
  getImageUrl,
  getThumbUrl,
  getPrice,
  getCategoryTitle,
  getCollectionTitle,
  getBrandName,
} from '@/components/ui/product-helpers'
import type { Product } from '@/payload-types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getImageUrl(product)
  const price = getPrice(product)
  const { addItem, openCart } = useCart()
  const categoryTitle = getCategoryTitle(product)
  const collectionTitle = getCollectionTitle(product)
  const brandName = getBrandName(product)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!price || !product.inStock) return
    addItem({
      productId: String(product.id),
      title: product.title,
      slug: product.slug,
      image: getThumbUrl(product),
      price: price.amount,
      currency: price.currency,
    })
    openCart()
  }

  return (
    <motion.div className="group relative" whileHover="hover" initial="rest" animate="rest">
      <Link href={`/products/${product.slug}`} className="block no-underline">
        <div className="relative aspect-2/3 overflow-hidden bg-[#f7f6f3]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone/20">
              <svg
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-obsidian/80 via-obsidian/30 to-obsidian/5 pointer-events-none" />

          {/* Top badges */}
          {product.isFeatured && (
            <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-gold text-obsidian text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 md:px-3 md:py-1.5 z-10">
              Featured
            </span>
          )}
          {!product.inStock && (
            <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-stone text-cream text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 md:px-3 md:py-1.5 z-10">
              Sold Out
            </span>
          )}
          {price?.compareAt && price.compareAt > price.amount && product.inStock && (
            <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-gold text-obsidian text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 md:px-3 md:py-1.5 z-10">
              Sale
            </span>
          )}

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3 lg:p-5">
            {/* Category / Collection label */}
            {(collectionTitle || categoryTitle) && (
              <p className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-gold/90 m-0 mb-1">
                {collectionTitle ?? categoryTitle}
              </p>
            )}

            <h3 className="font-sans text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide text-cream m-0 leading-snug">
              {product.title}
            </h3>

            {brandName && (
              <p className="text-[9px] md:text-[10px] text-cream/50 uppercase tracking-[0.15em] m-0 mt-0.5">
                {brandName}
              </p>
            )}

            {price && (
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-xs md:text-sm font-medium text-cream">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: price.currency,
                  }).format(price.amount)}
                </span>
                {price.compareAt && price.compareAt > price.amount && (
                  <span className="text-[10px] md:text-[11px] text-cream/40 line-through">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: price.currency,
                    }).format(price.compareAt)}
                  </span>
                )}
              </div>
            )}

            {/* Quick add on hover */}
            <motion.div
              className="flex gap-2 mt-3 pointer-events-none"
              variants={{
                rest: { y: 8, opacity: 0 },
                hover: { y: 0, opacity: 1, pointerEvents: 'auto' as const },
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {product.inStock && (
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 bg-cream/95 backdrop-blur-sm text-obsidian text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] py-2 md:py-2.5 border-0 cursor-pointer hover:bg-white transition-colors"
                >
                  Add to Cart
                </button>
              )}
              <span className="flex-1 bg-white/10 backdrop-blur-sm text-cream text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] py-2 md:py-2.5 text-center border border-cream/20">
                View
              </span>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
