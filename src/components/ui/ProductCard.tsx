'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/components/layout/CartContext'
import type { Product, Media } from '@/payload-types'

interface ProductCardProps {
  product: Product
}

function getImageUrl(product: Product): string | null {
  const first = product.images?.[0]
  if (!first) return null
  const img = first.image
  if (typeof img === 'object' && img !== null) {
    return (img as Media).sizes?.card?.url ?? (img as Media).url ?? null
  }
  return null
}

function getThumbUrl(product: Product): string | undefined {
  const first = product.images?.[0]?.image
  if (typeof first === 'object' && first !== null) {
    return (first as Media).sizes?.thumbnail?.url ?? (first as Media).url ?? undefined
  }
  return undefined
}

function getPrice(product: Product): { amount: number; currency: string } | null {
  const p = product.prices?.[0]
  if (!p) return null
  return { amount: p.amount, currency: p.currency }
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getImageUrl(product)
  const price = getPrice(product)
  const { addItem, openCart } = useCart()

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
      <Link href={`/products/${product.slug}`} className="block no-underline text-obsidian">
        {/* Image */}
        <div className="relative aspect-4/5 overflow-hidden bg-parchment mb-3 md:mb-5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
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

          {/* Featured badge */}
          {product.isFeatured && (
            <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-obsidian text-cream text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 md:px-3 md:py-1.5">
              Featured
            </span>
          )}

          {/* Out of stock badge */}
          {!product.inStock && (
            <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-stone text-cream text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 md:px-3 md:py-1.5">
              Sold Out
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="font-luxury text-sm md:text-base font-normal m-0 mb-1 md:mb-1.5 leading-snug tracking-tight">
            {product.title}
          </h3>

          {product.shortDescription && (
            <p className="text-[11px] md:text-xs text-stone leading-relaxed m-0 mb-1.5 md:mb-2 line-clamp-2 hidden md:block">
              {product.shortDescription}
            </p>
          )}

          {price && (
            <p className="text-xs md:text-sm font-medium m-0 text-obsidian">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currency,
              }).format(price.amount)}
            </p>
          )}
        </div>
      </Link>

      {/* Quick add overlay — outside <Link> to avoid invalid <button> inside <a> */}
      <motion.div
        className="absolute inset-x-0 bottom-[calc(theme(spacing.5)+theme(spacing.1))] flex gap-2 px-4 pb-4 pointer-events-none"
        variants={{
          rest: { y: 10, opacity: 0 },
          hover: { y: 0, opacity: 1, pointerEvents: 'auto' as const },
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {product.inStock && (
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-obsidian text-cream text-xs font-medium uppercase tracking-[0.2em] py-3 border-0 cursor-pointer hover:bg-charcoal transition-colors"
          >
            Add to Cart
          </button>
        )}
        <span className="flex-1 bg-cream/90 backdrop-blur-sm text-obsidian text-xs font-medium uppercase tracking-[0.2em] py-3 text-center">
          View Details
        </span>
      </motion.div>
    </motion.div>
  )
}
