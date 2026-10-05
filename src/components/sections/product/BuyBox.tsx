'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { useCart } from '@/components/layout/CartContext'
import { formatPrice, getThumbUrl, variantPrice, type ProductVariant } from '@/lib/product'
import type { Product } from '@/payload-types'

interface BuyBoxProps {
  product: Product
  variants: ProductVariant[]
  activeVariant: ProductVariant | null
  onSelectVariant: (sku: string) => void
}

/**
 * Price, size, quantity and the add-to-basket action.
 *
 * Kept in one bordered card so the whole purchase decision sits inside a single
 * frame — the panel treatment the sidebar, trust row and filter panel all use.
 */
export function BuyBox({ product, variants, activeVariant, onSelectVariant }: BuyBoxProps) {
  const { addItem, openCart } = useCart()
  const [qty, setQty] = useState(1)

  const price = variantPrice(activeVariant)
  const compareAt = price?.compareAt
  const percentOff = compareAt ? Math.round((1 - price!.amount / compareAt) * 100) : 0
  // Variant stock overrides the product flag: a product can be listed while one
  // of its sizes is out.
  const inStock = product.inStock !== false && activeVariant?.inStock !== false
  const canAdd = inStock && !!price && !!activeVariant?.sku

  const handleAdd = () => {
    if (!canAdd || !activeVariant?.sku || !price) return
    addItem(
      {
        productId: String(product.id),
        variantSku: activeVariant.sku,
        size: activeVariant.size ?? undefined,
        title: product.title,
        slug: product.slug,
        image: getThumbUrl(product),
        price: price.amount,
        currency: price.currency,
      },
      qty,
    )
    openCart()
  }

  return (
    <div className="rounded-sm border border-stone/15 bg-white overflow-hidden">
      <div className="p-4">
        {/* ── Price ─────────────────────────────────────────── */}
        {price ? (
          <>
            <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-1">
              <span className="font-luxury text-2xl font-semibold text-obsidian tracking-tight">
                {formatPrice(price.amount, price.currency)}
              </span>
              {compareAt && (
                <>
                  <span className="font-sans text-[13px] text-stone/45 line-through">
                    {formatPrice(compareAt, price.currency)}
                  </span>
                  {/* nowrap: `leading-none` gives a wrapped badge zero leading,
                      so "Save" and "25%" would collide inside the gold chip. */}
                  <span className="whitespace-nowrap font-heading text-[9px] uppercase tracking-[0.14em] font-semibold text-obsidian bg-gold px-1.5 py-0.5 rounded-sm leading-none">
                    Save {percentOff}%
                  </span>
                </>
              )}
            </div>
            <p className="font-sans text-[11px] text-stone/55 m-0 mt-1">
              Incl. VAT{activeVariant?.size ? ` · per ${activeVariant.size}` : ''}
            </p>
          </>
        ) : (
          <p className="font-sans text-[13px] text-stone m-0">Price on request</p>
        )}

        {/* ── Stock ─────────────────────────────────────────── */}
        <p
          className={cn(
            'flex items-center gap-1.5 font-sans text-[12px] m-0 mt-3',
            inStock ? 'text-forest-green' : 'text-stone/60',
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-pill shrink-0',
              inStock ? 'bg-bud-green' : 'bg-stone/40',
            )}
          />
          {inStock ? 'In stock — ships within 48 hours' : 'Currently unavailable'}
        </p>

        {/* ── Size ──────────────────────────────────────────── */}
        {variants.length > 1 && (
          <div className="mt-4">
            <p className="font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-obsidian m-0 mb-2">
              Size
            </p>
            <ul className="list-none m-0 p-0 flex flex-wrap gap-1.5">
              {variants.map((variant) => {
                const isActive = variant.sku === activeVariant?.sku
                const soldOut = variant.inStock === false
                const each = variantPrice(variant)
                return (
                  <li key={variant.id ?? variant.sku} className="m-0">
                    <button
                      type="button"
                      onClick={() => variant.sku && onSelectVariant(variant.sku)}
                      aria-pressed={isActive}
                      disabled={soldOut}
                      className={cn(
                        'flex flex-col items-start gap-0.5 px-2.5 py-1.5 rounded-sm border cursor-pointer transition-colors bg-white',
                        soldOut
                          ? 'border-stone/15 text-stone/35 cursor-not-allowed'
                          : isActive
                            ? 'border-forest-green bg-forest-green/[0.06]'
                            : 'border-stone/20 hover:border-forest-green',
                      )}
                    >
                      <span
                        className={cn(
                          'font-sans text-[12px] leading-none',
                          soldOut
                            ? 'line-through'
                            : isActive
                              ? 'text-forest-green font-medium'
                              : 'text-obsidian',
                        )}
                      >
                        {variant.size ?? variant.sku}
                      </span>
                      {each && (
                        <span className="font-mono text-[10px] text-stone/50 leading-none">
                          {formatPrice(each.amount, each.currency)}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* ── Quantity + add ────────────────────────────────── */}
        <div className="flex gap-2 mt-4">
          <div className="flex items-center rounded-sm border border-stone/20 shrink-0">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="w-9 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer text-obsidian transition-colors hover:text-forest-green disabled:text-stone/30 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span
              aria-live="polite"
              className="w-8 text-center font-mono text-[13px] text-obsidian tabular-nums select-none"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Increase quantity"
              className="w-9 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer text-obsidian transition-colors hover:text-forest-green"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={cn(
              'flex-1 h-11 flex items-center justify-center gap-2 rounded-sm border-0 font-heading text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors',
              canAdd
                ? 'bg-forest-green text-cream cursor-pointer hover:bg-bud-green'
                : 'bg-mist text-stone/60 cursor-not-allowed',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {inStock ? 'Add to basket' : 'Sold out'}
          </button>
        </div>

        <Link
          href="/contact?type=b2b#enquiry"
          className="group mt-2 h-11 flex items-center justify-center rounded-sm border border-forest-green/40 no-underline transition-colors hover:bg-forest-green"
        >
          {/* Colour lives on the span — the unlayered `a { color: currentColor }`
              rule in styles.css outranks text utilities on the anchor. */}
          <span className="font-heading text-[11px] uppercase tracking-[0.14em] font-semibold text-forest-green transition-colors group-hover:text-cream">
            Enquire for wholesale
          </span>
        </Link>
      </div>

      {/* ── Reassurance ───────────────────────────────────── */}
      <ul className="list-none m-0 p-0 border-t border-stone/15 bg-parchment/60 divide-y divide-stone/10">
        {[
          {
            label: product.shipping?.freeShippingEligible
              ? 'Free delivery on this item'
              : 'Free delivery over AED 250',
            path: 'M1 7h12v10H1zM13 10h4.5l3.5 3.5V17h-8z',
          },
          { label: 'Temperature-controlled packing', path: 'M12 2.5 4.5 5.8v5.4c0 4.6 3.2 8.7 7.5 10.3 4.3-1.6 7.5-5.7 7.5-10.3V5.8z' },
          { label: 'Secure checkout · Stripe', path: 'M3 10h18v11H3zM7.5 10V6.8a4.5 4.5 0 0 1 9 0V10' },
        ].map((row) => (
          <li key={row.label} className="flex items-center gap-2.5 px-4 py-2.5">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-forest-green shrink-0"
              aria-hidden="true"
            >
              <path d={row.path} />
            </svg>
            <span className="font-sans text-[11.5px] text-stone leading-snug">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
