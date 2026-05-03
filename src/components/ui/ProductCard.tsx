'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/components/layout/CartContext'
import type { Product, Media, Category, Brand, ProductCollection } from '@/payload-types'

interface ProductCardProps {
  product: Product
  index?: number
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

function getPrice(product: Product): { amount: number; currency: string; compareAt?: number } | null {
  const p = product.prices?.[0]
  if (!p) return null
  return { amount: p.amount, currency: p.currency, compareAt: p.compareAtAmount ?? undefined }
}

function getCategoryTitle(product: Product): string | null {
  if (typeof product.category === 'object' && product.category !== null) {
    return (product.category as Category).title ?? null
  }
  return null
}

function getCollectionTitle(product: Product): string | null {
  if (typeof product.collection === 'object' && product.collection !== null) {
    return (product.collection as ProductCollection).title ?? null
  }
  return null
}

function getBrandName(product: Product): string | null {
  if (typeof product.brand === 'object' && product.brand !== null) {
    return (product.brand as Brand).title ?? null
  }
  return null
}

export function ProductCard({ product, index }: ProductCardProps) {
  const imageUrl = getImageUrl(product)
  const price = getPrice(product)
  const { addItem, openCart } = useCart()
  const categoryTitle = getCategoryTitle(product)
  const collectionTitle = getCollectionTitle(product)
  const brandName = getBrandName(product)
  const label = categoryTitle ?? collectionTitle ?? null
  const num = index !== undefined ? String(index + 1).padStart(2, '0') : null
  const onSale = !!(price?.compareAt && price.compareAt > price.amount)

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

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: price?.currency ?? 'USD' }).format(amount)

  return (
    <motion.div
      className="group relative flex flex-col border-r border-b border-stone/15 bg-white"
      initial={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <p className="text-[9px] uppercase tracking-[0.25em] text-stone/45 m-0 leading-none font-medium">
          {num && label ? `${num} / ${label}` : num ?? label ?? '—'}
        </p>
        {!product.inStock ? (
          <span className="text-[8px] uppercase tracking-[0.18em] text-stone/55 border border-stone/25 px-1.5 py-0.5 font-medium leading-none">
            Sold Out
          </span>
        ) : onSale ? (
          <span className="text-[8px] uppercase tracking-[0.18em] text-obsidian bg-gold px-1.5 py-0.5 font-semibold leading-none">
            Sale
          </span>
        ) : null}
      </div>

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.title}
        className="block no-underline shrink-0"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-[#f5f4f1]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" className="text-stone/20">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Body — gap-1 keeps all elements 4px apart */}
      <div className="flex flex-col px-3 pt-1.5 pb-2">
        {brandName && (
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone/50 m-0 leading-none font-medium">
            {brandName}
          </p>
        )}

        <Link href={`/products/${product.slug}`} className="no-underline">
          <h3 className="font-luxury italic text-[15px] sm:text-sm text-obsidian m-0 leading-tight line-clamp-1 transition-colors group-hover:text-forest-green" style={{ marginTop: '3px' }}>
            {product.title}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-[11px] sm:text-[10px] text-stone/70 leading-tight m-0 line-clamp-2" style={{ marginTop: '2px' }}>
            {product.shortDescription}
          </p>
        )}

        {price && (
          <div className="flex items-baseline gap-1.5" style={{ marginTop: '3px' }}>
            <span className="text-[13px] sm:text-xs font-semibold text-obsidian tracking-tight">
              {formatPrice(price.amount)}
            </span>
            {onSale && price.compareAt && (
              <span className="text-[11px] sm:text-[10px] text-stone/40 line-through">
                {formatPrice(price.compareAt)}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-1.5" style={{ marginTop: '8px' }}>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!product.inStock || !price}
            className="flex items-center justify-center gap-1 h-9 sm:h-8 bg-obsidian text-cream text-[9px] sm:text-[8px] uppercase tracking-[0.14em] font-semibold border border-obsidian cursor-pointer transition-colors hover:bg-forest-green hover:border-forest-green disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-obsidian rounded-sm"
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>{product.inStock ? 'Add to Cart' : 'Sold Out'}</span>
          </button>

          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center gap-1 h-9 sm:h-8 bg-transparent text-obsidian text-[9px] sm:text-[8px] uppercase tracking-[0.14em] font-semibold border border-forest-green/40 no-underline transition-colors hover:bg-forest-green hover:text-cream hover:border-forest-green rounded-sm"
          >
            <span>View More</span>
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
