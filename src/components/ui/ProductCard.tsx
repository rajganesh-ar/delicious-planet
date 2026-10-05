'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/components/layout/CartContext'
import {
  getImageUrl,
  getThumbUrl,
  getPrice,
  getCheapestVariant,
  hasMultipleSizes,
  getCategoryTitle,
  getBrandName,
  isOnSale,
  getDietaryTags,
  formatPrice as formatCurrency,
} from '@/lib/product'
import type { Product } from '@/payload-types'

interface ProductCardProps {
  product: Product
  index?: number
  /** Shows a "New" flag in the header row — used by the New Arrivals rail. */
  isNew?: boolean
}

export function ProductCard({ product, index, isNew = false }: ProductCardProps) {
  const imageUrl = getImageUrl(product)
  const price = getPrice(product)
  const { addItem, openCart } = useCart()
  const brandName = getBrandName(product)
  const label = getCategoryTitle(product)
  const num = index !== undefined ? String(index + 1).padStart(2, '0') : null
  const onSale = isOnSale(price)
  const percentOff =
    onSale && price?.compareAt ? Math.round((1 - price.amount / price.compareAt) * 100) : 0
  const dietaryTags = getDietaryTags(product)

  // The card shows a "from" price, so quick-add must add the variant that
  // price belongs to — never a different size at a different amount.
  const quickAddVariant = getCheapestVariant(product)
  const multipleSizes = hasMultipleSizes(product)
  // `product.inStock` is true when *any* size is. When the cheapest size — the
  // one the card prices — is the sold-out one, quick-add would put an
  // unbuyable line in the basket that only fails at checkout, so the button
  // sends the shopper to pick a size instead.
  const canQuickAdd = Boolean(
    price && product.inStock && quickAddVariant?.sku && quickAddVariant.inStock !== false,
  )
  const chooseSize = Boolean(price && product.inStock && !canQuickAdd)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!canQuickAdd || !price || !quickAddVariant?.sku) return
    addItem({
      productId: String(product.id),
      variantSku: quickAddVariant.sku,
      size: quickAddVariant.size ?? undefined,
      title: product.title,
      slug: product.slug,
      image: getThumbUrl(product),
      price: quickAddVariant.price ?? price.amount,
      currency: price.currency,
    })
    openCart()
  }

  const formatPrice = (amount: number) => formatCurrency(amount, price?.currency ?? 'AED')

  return (
    /* h-full so short cards still fill their cell — the container sets
       items-stretch and the borders are meant to read as a continuous table */
    <motion.div
      className="group relative flex flex-col h-full border-r border-b border-stone/15 bg-white"
      initial={false}
    >
      {/*
        Header — a flex row of "01 / Category" against a status flag.

        Two rules keep it one line tall, which matters because this row sits
        above the image: if it grows, that card's photo starts lower than its
        neighbours' and the whole grid row loses its baseline.

        `min-w-0` + `truncate` let the category label shrink and ellipsis. A
        flex item defaults to min-width:auto, so without it a long name like
        "Bespoke Tableware & Glassware" refuses to shrink and squeezes the flag.

        `whitespace-nowrap` + `shrink-0` on each flag stops it being the thing
        that gives. "Sold Out" was wrapping to two lines inside its border —
        and with `leading-none` those lines collided.

        The fixed height covers the last gap: a bordered flag is ~5px taller
        than the bare label, so flagged cards' photos sat lower.
      */}
      <div className="flex items-center justify-between gap-2 h-[26px] px-3 pt-2 pb-1 shrink-0">
        <p className="min-w-0 truncate text-[9px] uppercase tracking-[0.25em] text-stone/45 font-medium" style={{ margin: 0, lineHeight: 1 }}>
          {num && label ? `${num} / ${label}` : num ?? label ?? '—'}
        </p>
        {!product.inStock ? (
          <span className="shrink-0 whitespace-nowrap text-[8px] uppercase tracking-[0.18em] text-stone/55 border border-stone/25 px-1.5 py-0.5 font-medium leading-none">
            Sold Out
          </span>
        ) : onSale ? (
          <span className="shrink-0 whitespace-nowrap text-[8px] uppercase tracking-[0.18em] text-obsidian bg-gold px-1.5 py-0.5 font-semibold leading-none">
            {percentOff > 0 ? `-${percentOff}%` : 'Sale'}
          </span>
        ) : isNew ? (
          <span className="shrink-0 whitespace-nowrap text-[8px] uppercase tracking-[0.18em] text-cream bg-forest-green px-1.5 py-0.5 font-semibold leading-none">
            New
          </span>
        ) : null}
      </div>

      {/* Image */}
      {/* Out of the tab order: the title and "View" below go to the same page,
          and three stops per card made a 24-card grid 72 stops long. */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.title}
        tabIndex={-1}
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
      <div className="flex flex-col grow px-3 pt-1.5 pb-2">
        {brandName && (
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone/50 font-medium" style={{ margin: 0, lineHeight: 1 }}>
            {brandName}
          </p>
        )}

        {/* The size lives on the span, not the h3: the global unlayered `h3`
            rule in styles.css (22px, 16px margins) beats Tailwind utilities,
            which truncated titles to a word or two. Margin is inline for the
            same reason, as it is on every <p> here: the global `p` rule adds
            16px margins and 1.6 line-height over m-0 / leading-*. */}
        <Link href={`/products/${product.slug}`} className="no-underline">
          <h3 style={{ margin: '3px 0 0' }}>
            <span className="font-luxury italic text-[15px] sm:text-sm text-obsidian leading-tight line-clamp-1 transition-colors group-hover:text-forest-green">
              {product.title}
            </span>
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-[11px] sm:text-[10px] text-stone/70 line-clamp-2" style={{ margin: '2px 0 0', lineHeight: 1.25 }}>
            {product.shortDescription}
          </p>
        )}

        {dietaryTags.length > 0 && (
          <ul className="list-none flex flex-wrap gap-1 m-0 p-0" style={{ marginTop: '4px' }}>
            {dietaryTags.map((tag) => (
              <li
                key={tag}
                // nowrap for the same reason as the header flags above: the
                // row wraps between tags, so a tag splitting inside its own
                // border only ever looks broken.
                className="whitespace-nowrap text-[8px] uppercase tracking-[0.08em] text-forest-green bg-forest-green/10 border border-forest-green/20 px-1 py-0.5 leading-none rounded-sm"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {price && (
          <div className="flex items-baseline gap-1.5" style={{ marginTop: '3px' }}>
            <span className="text-[13px] sm:text-xs font-semibold text-obsidian tracking-tight">
              {multipleSizes && (
                <span className="font-normal text-stone">From </span>
              )}
              {formatPrice(price.amount)}
            </span>
            {onSale && price.compareAt && (
              <span className="text-[11px] sm:text-[10px] text-stone/40 line-through">
                {formatPrice(price.compareAt)}
              </span>
            )}
          </div>
        )}

        {/* mt-auto pins the CTAs to the bottom so they align across a row.
            Single column at the 2-up mobile grid: side by side the cells are
            ~70px and both labels wrap onto two lines inside a 36px button. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-auto pt-2">
          {chooseSize ? (
            <Link
              href={`/products/${product.slug}`}
              aria-label={`Choose a size of ${product.title}`}
              className="flex items-center justify-center gap-1 h-11 sm:h-8 bg-obsidian text-cream text-[9px] sm:text-[8px] uppercase tracking-[0.14em] font-semibold border border-obsidian no-underline transition-colors hover:bg-forest-green hover:border-forest-green rounded-sm"
            >
              <span className="whitespace-nowrap">Choose Size</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!canQuickAdd}
              aria-label={canQuickAdd ? `Add ${product.title} to cart` : `${product.title} is sold out`}
              className="flex items-center justify-center gap-1 h-11 sm:h-8 bg-obsidian text-cream text-[9px] sm:text-[8px] uppercase tracking-[0.14em] font-semibold border border-obsidian cursor-pointer transition-colors hover:bg-forest-green hover:border-forest-green disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-obsidian rounded-sm"
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="whitespace-nowrap">
                {product.inStock ? 'Add to Cart' : 'Sold Out'}
              </span>
            </button>
          )}

          <Link
            href={`/products/${product.slug}`}
            aria-label={`View ${product.title}`}
            className="flex items-center justify-center gap-1 h-11 sm:h-8 bg-transparent text-obsidian text-[9px] sm:text-[8px] uppercase tracking-[0.14em] font-semibold border border-forest-green/40 no-underline transition-colors hover:bg-forest-green hover:text-cream hover:border-forest-green rounded-sm"
          >
            <span className="whitespace-nowrap">View More</span>
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
