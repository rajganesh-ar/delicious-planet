'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart, lineKey, type CartItem } from './CartContext'
import { MENU_LOCK_EVENT } from './menu-events'
import { formatPrice } from '@/lib/product'
import { cn } from '@/lib/cn'

/**
 * Slide-over basket.
 *
 * Uses the storefront's own tokens — obsidian header band, forest actions,
 * `rounded-sm`, 11px tracked caps — so it reads as part of the site rather than
 * a generic drawer. The full basket lives at /cart; this panel is the quick
 * review step between "add to basket" and checkout.
 *
 * styles.css declares unlayered `a { color: currentColor }`, `h1`–`h6` and `p`
 * rules that outrank Tailwind's layered utilities, so link/heading colour lives
 * on a child <span> and margins carry `!`.
 */

/**
 * Order value that unlocks complimentary delivery, by currency. A currency
 * that isn't listed simply hides the meter rather than quoting a threshold we
 * haven't set.
 */
const FREE_DELIVERY: Record<string, number> = { AED: 250, USD: 70, EUR: 65, GBP: 55 }

const EMPTY_LINKS = [
  { href: '/products', label: 'Shop all products' },
  { href: '/categories', label: 'Browse by origin' },
  { href: '/brands', label: 'Our producers' },
]

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } = useCart()
  const currency = items[0]?.currency ?? 'AED'
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape closes, matching the mega menu and mobile drawer.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeCart])

  // Lock the page (and Lenis) behind the panel — same contract the header uses.
  useEffect(() => {
    if (!isOpen) return

    const { style } = document.documentElement
    const previous = style.overflow
    style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: true } }))
    closeRef.current?.focus()

    return () => {
      style.overflow = previous
      window.dispatchEvent(new CustomEvent(MENU_LOCK_EVENT, { detail: { locked: false } }))
    }
  }, [isOpen])

  const threshold = FREE_DELIVERY[currency]
  const remaining = threshold ? Math.max(0, threshold - subtotal) : 0
  const progress = threshold ? Math.min(100, (subtotal / threshold) * 100) : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-200 bg-obsidian/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your basket"
            className="fixed top-0 right-0 h-full w-full max-w-[27rem] bg-cream z-201 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div className="shrink-0 bg-obsidian px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="block font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-gold">
                  Your basket
                </span>
                <h2 className="m-0! mt-1!">
                  <span className="block font-luxury text-lg font-semibold text-cream leading-tight">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                aria-label="Close basket"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-sm bg-transparent border border-cream/20 text-cream cursor-pointer transition-colors hover:bg-cream hover:text-obsidian hover:border-cream"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18" strokeLinecap="round" />
                  <path d="m6 6 12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* ── Delivery meter ─────────────────────────────── */}
            {items.length > 0 && threshold ? (
              <div className="shrink-0 bg-parchment border-b border-stone/12 px-5 sm:px-6 py-3">
                <p className="m-0! font-sans text-[11.5px] text-stone leading-snug">
                  {remaining > 0 ? (
                    <>
                      <span className="text-obsidian font-medium">
                        {formatPrice(remaining, currency)}
                      </span>{' '}
                      away from complimentary delivery
                    </>
                  ) : (
                    <span className="text-forest-green font-medium">
                      Complimentary delivery unlocked
                    </span>
                  )}
                </p>
                <div
                  className="mt-2 h-1 w-full bg-stone/15 rounded-pill overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  aria-label="Progress to complimentary delivery"
                >
                  <div
                    className="h-full bg-forest-green transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {/* ── Items ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6">
              {items.length === 0 ? (
                <EmptyBasket onNavigate={closeCart} />
              ) : (
                <ul className="list-none m-0 p-0">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <LineItem
                        key={lineKey(item)}
                        item={item}
                        onNavigate={closeCart}
                        onRemove={() => removeItem(lineKey(item))}
                        onQuantity={(q) => updateQuantity(lineKey(item), q)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* ── Footer ─────────────────────────────────────── */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-stone/15 bg-white px-5 sm:px-6 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                    Subtotal
                  </span>
                  <span className="font-luxury text-xl font-semibold text-obsidian leading-none">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <p className="m-0! mt-1.5! font-sans text-[11.5px] text-stone leading-snug">
                  Delivery and duties calculated at checkout.
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-3.5 flex items-center justify-center h-12 rounded-sm bg-forest-green hover:bg-bud-green transition-colors no-underline"
                >
                  <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-cream">
                    Checkout
                  </span>
                </Link>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex items-center justify-center h-10 rounded-sm border border-stone/25 hover:border-obsidian transition-colors no-underline"
                  >
                    <span className="font-heading text-[10.5px] uppercase tracking-[0.14em] font-semibold text-obsidian">
                      View basket
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="flex items-center justify-center h-10 rounded-sm border border-transparent bg-transparent cursor-pointer transition-colors hover:border-stone/25"
                  >
                    <span className="font-heading text-[10.5px] uppercase tracking-[0.14em] font-semibold text-stone">
                      Keep shopping
                    </span>
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Line item ─────────────────────────────────────────────── */

function LineItem({
  item,
  onNavigate,
  onRemove,
  onQuantity,
}: {
  item: CartItem
  onNavigate: () => void
  onRemove: () => void
  onQuantity: (quantity: number) => void
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      className="flex gap-4 py-4 border-b border-stone/12 last:border-b-0"
    >
      {/* Fixed-size wrapper + `fill`: styles.css sets unlayered `img { height: auto }`,
          so a width/height <Image> would ignore the square crop we want here. */}
      <Link
        href={`/products/${item.slug}`}
        onClick={onNavigate}
        className="shrink-0 relative w-[68px] h-[68px] bg-mist rounded-sm overflow-hidden no-underline"
      >
        {item.image ? (
          <Image src={item.image} alt={item.title} fill sizes="68px" className="object-cover" />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center font-luxury text-lg text-obsidian/25"
          >
            {item.title.charAt(0)}
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/products/${item.slug}`}
            onClick={onNavigate}
            className="no-underline min-w-0 group"
          >
            <span className="block font-sans text-[13px] font-medium text-obsidian leading-snug group-hover:text-forest-green transition-colors line-clamp-2">
              {item.title}
            </span>
          </Link>
          <span className="shrink-0 font-luxury text-sm font-semibold text-obsidian leading-tight">
            {formatPrice(item.price * item.quantity, item.currency)}
          </span>
        </div>

        <p className="m-0! mt-1! font-sans text-[11.5px] text-stone">
          {formatPrice(item.price, item.currency)} each
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <QuantityStepper quantity={item.quantity} title={item.title} onChange={onQuantity} />
          <button
            type="button"
            onClick={onRemove}
            className="bg-transparent border-0 cursor-pointer p-0"
            aria-label={`Remove ${item.title} from basket`}
          >
            <span className="font-sans text-[11px] text-stone hover:text-obsidian transition-colors underline underline-offset-2">
              Remove
            </span>
          </button>
        </div>
      </div>
    </motion.li>
  )
}

export function QuantityStepper({
  quantity,
  title,
  onChange,
  className,
}: {
  quantity: number
  /** Used to disambiguate the control labels when several are on one page. */
  title: string
  onChange: (quantity: number) => void
  className?: string
}) {
  return (
    /* 44px controls below lg, matching the tap-target floor styles.css already
       sets for the .btn-* classes; back to the compact 32px rail on pointer
       devices, where the basket sits beside a full summary column. */
    <div
      className={cn(
        'inline-flex items-center border border-stone/25 rounded-sm h-11 lg:h-8',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={`Decrease quantity of ${title}`}
        className="w-11 lg:w-8 h-full flex items-center justify-center bg-transparent border-0 cursor-pointer text-obsidian hover:bg-mist transition-colors"
      >
        <span className="font-sans text-sm leading-none">−</span>
      </button>
      <span
        aria-live="polite"
        className="w-10 lg:w-9 h-full flex items-center justify-center font-sans text-[13px] lg:text-[12px] font-medium text-obsidian border-x border-stone/20 tabular-nums"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label={`Increase quantity of ${title}`}
        className="w-11 lg:w-8 h-full flex items-center justify-center bg-transparent border-0 cursor-pointer text-obsidian hover:bg-mist transition-colors"
      >
        <span className="font-sans text-sm leading-none">+</span>
      </button>
    </div>
  )
}

/* ── Empty state ───────────────────────────────────────────── */

function EmptyBasket({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-12">
      <span className="w-14 h-14 rounded-sm border border-stone/20 flex items-center justify-center text-stone/50">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          viewBox="0 0 24 24"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </span>
      <h3 className="m-0! mt-4!">
        <span className="block font-luxury text-lg font-semibold text-obsidian leading-tight">
          Your basket is empty
        </span>
      </h3>
      <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed max-w-[16rem]">
        Nothing added yet. Start with the shelves below, or search for a specific ingredient.
      </p>

      <ul className="list-none m-0 p-0 mt-5 w-full max-w-[16rem]">
        {EMPTY_LINKS.map((link) => (
          <li key={link.href} className="border-t border-stone/12 first:border-t-0">
            <Link
              href={link.href}
              onClick={onNavigate}
              className="group flex items-center justify-between gap-3 py-2.5 no-underline"
            >
              <span className="font-sans text-[12.5px] text-stone group-hover:text-obsidian transition-colors">
                {link.label}
              </span>
              <span className="font-sans text-[12px] text-stone/50 group-hover:text-forest-green transition-colors">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
