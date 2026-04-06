'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/layout/CartContext'
import {
  getImageUrl,
  getThumbUrl,
  getPrice,
  getCollectionTitle,
  getBrandName,
  formatCurrency,
} from '@/components/ui/product-helpers'
import type { Product } from '@/payload-types'

interface ShopProductCardProps {
  product: Product
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const imageUrl = getImageUrl(product)
  const price = getPrice(product)
  const collectionTitle = getCollectionTitle(product)
  const brandName = getBrandName(product)
  const { addItem, openCart } = useCart()

  const hasSale = price?.compareAt && price.compareAt > price.amount && product.inStock

  const handleAddToCart = (e: React.MouseEvent) => {
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
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-parchment border border-mist no-underline h-full"
    >
      {/* ── Text area ─────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3">
        {collectionTitle && (
          <span className="inline-block bg-forest text-cream text-[9px] font-medium uppercase tracking-[0.2em] px-2.5 py-1 mb-2.5">
            {collectionTitle}
          </span>
        )}

        <h3 className="font-heading text-[13px] md:text-sm font-bold uppercase tracking-wide text-obsidian m-0 leading-snug">
          {product.title}
        </h3>

        {brandName && <p className="text-[11px] text-stone m-0 mt-1 leading-snug">{brandName}</p>}
      </div>

      {/* ── Image area ────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-[#f7f6f3] mx-4 mb-3">
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

        {/* Badges */}
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-gold text-obsidian text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 z-10">
            Featured
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-2 right-2 bg-stone text-cream text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 z-10">
            Sold Out
          </span>
        )}
        {hasSale && (
          <span className="absolute top-2 right-2 bg-gold text-obsidian text-[8px] md:text-[9px] font-medium uppercase tracking-[0.25em] px-2 py-1 z-10">
            Sale
          </span>
        )}
      </div>

      {/* ── Footer bar ────────────────────────────────── */}
      <div className="mt-auto">
        {product.inStock ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-obsidian text-cream text-[10px] md:text-[11px] font-medium uppercase tracking-[0.25em] py-3.5 border-0 cursor-pointer hover:bg-charcoal transition-colors flex items-center justify-center gap-2"
          >
            <span>Add to Cart</span>
            {price && (
              <>
                <span className="text-cream/40">&mdash;</span>
                {hasSale && (
                  <span className="line-through text-cream/40">
                    {formatCurrency(price.compareAt!, price.currency)}
                  </span>
                )}
                <span>{formatCurrency(price.amount, price.currency)}</span>
              </>
            )}
          </button>
        ) : (
          <div className="w-full bg-stone/80 text-cream/60 text-[10px] md:text-[11px] font-medium uppercase tracking-[0.25em] py-3.5 text-center">
            Sold Out
          </div>
        )}
      </div>
    </Link>
  )
}
