'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { useCart, lineKey, type CartItem } from '@/components/layout/CartContext'
import { QuantityStepper } from '@/components/layout/CartDrawer'
import { Cta, Eyebrow, GUTTER } from '@/components/sections/editorial'
import { BASE_CURRENCY, formatPrice } from '@/lib/product'
import { cn } from '@/lib/cn'

/**
 * The full basket — a ledger, not a set of cards.
 *
 * Deliberately the plainest page on the site: a compact obsidian masthead
 * carrying the checkout step rail, hairline line-item rows on the left, and a
 * sticky summary on the right. Tokens are the storefront's (gutter, type ramp,
 * `rounded-sm`, forest actions); the structure is its own.
 *
 * styles.css declares unlayered `a`, `h1`–`h6` and `p` rules that outrank
 * Tailwind's layered utilities — hence colour on child spans and `m-0!`.
 */

/** Kept in step with the drawer's meter. */
const FREE_DELIVERY: Record<string, number> = { AED: 250, USD: 70, EUR: 65, GBP: 55 }

const STEPS = ['Basket', 'Details', 'Payment']

const ASSURANCES = [
  {
    title: 'Temperature-controlled',
    body: 'Chilled and frozen lines ship on cold-chain carriers only, never as ambient freight.',
  },
  {
    title: 'Traceable to origin',
    body: 'Every line carries producer and origin documentation, available on request with your order.',
  },
  {
    title: 'Trade accounts',
    body: 'Ordering for a kitchen or a shelf? Volume pricing and terms are agreed before first delivery.',
  },
]

export function CartPageClient() {
  const { items, hydrated, subtotal, totalItems, removeItem, updateQuantity, clearCart } = useCart()
  const currency = items[0]?.currency ?? BASE_CURRENCY

  const threshold = FREE_DELIVERY[currency]
  const qualifies = threshold !== undefined && subtotal >= threshold
  const remaining = threshold !== undefined ? Math.max(0, threshold - subtotal) : 0

  return (
    <div className="bg-cream">
      {/* ═══ MASTHEAD — compact, transactional ══════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-8 pb-6 md:pt-10 md:pb-7')}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <Eyebrow tone="light">Step 1 of 3</Eyebrow>
              <h1 className="m-0! mt-2.5!">
                <span className="block font-luxury text-cream font-semibold leading-[1.1] tracking-tight text-[clamp(1.7rem,4vw,2.75rem)]">
                  Your basket
                </span>
              </h1>
              <p className="m-0! mt-2! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed">
                {hydrated
                  ? totalItems > 0
                    ? `${totalItems} ${totalItems === 1 ? 'item' : 'items'} · review quantities before checkout`
                    : 'Nothing here yet.'
                  : 'Loading your basket…'}
              </p>
            </div>

            {/* Step rail. It used to be `shrink-0` in a column that is only
                ~342px wide on a phone, so its 348px of content had nowhere to
                go and the connector rules ran straight through the labels. It
                wraps now, and the connectors only appear once there is room
                for them. */}
            <ol className="list-none m-0 p-0 flex flex-wrap items-center gap-x-3 gap-y-2 lg:shrink-0">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  {i > 0 ? (
                    <span aria-hidden className="hidden sm:block w-6 md:w-10 h-px bg-cream/20" />
                  ) : null}
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-sm flex items-center justify-center font-sans text-[11px] font-semibold',
                        i === 0 ? 'bg-gold text-obsidian' : 'border border-cream/20 text-cream/45',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        'font-sans text-[10px] md:text-[11px] uppercase tracking-[0.16em]',
                        i === 0 ? 'text-cream' : 'text-cream/40',
                      )}
                    >
                      {step}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ═══ BODY ═══════════════════════════════════════════════ */}
      <section className={cn(GUTTER, 'py-8 md:py-11')}>
        {!hydrated ? (
          <BasketSkeleton />
        ) : items.length === 0 ? (
          <EmptyBasket />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* ── Ledger ────────────────────────────────────── */}
            <div className="lg:col-span-8">
              {/* Column headings — the row layout carries them below lg. */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-2.5 border-b border-obsidian/25">
                <span className="col-span-6 font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                  Item
                </span>
                <span className="col-span-3 font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                  Quantity
                </span>
                <span className="col-span-3 text-right font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                  Line total
                </span>
              </div>

              <ul className="list-none m-0 p-0">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <LedgerRow
                      key={lineKey(item)}
                      item={item}
                      onRemove={() => removeItem(lineKey(item))}
                      onQuantity={(q) => updateQuantity(lineKey(item), q)}
                    />
                  ))}
                </AnimatePresence>
              </ul>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/products"
                  className="group no-underline inline-flex items-center gap-2"
                >
                  <span
                    aria-hidden
                    className="font-sans text-[13px] text-stone/50 group-hover:text-forest-green transition-colors"
                  >
                    ←
                  </span>
                  <span className="font-sans text-[12.5px] text-stone group-hover:text-obsidian transition-colors">
                    Continue shopping
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="bg-transparent border-0 p-0 cursor-pointer"
                >
                  <span className="font-sans text-[12.5px] text-stone hover:text-obsidian transition-colors underline underline-offset-2">
                    Clear basket
                  </span>
                </button>
              </div>
            </div>

            {/* ── Summary ───────────────────────────────────── */}
            <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <div className="bg-white border border-stone/15 rounded-sm p-5 md:p-6">
                <Eyebrow>Summary</Eyebrow>

                <dl className="m-0 mt-4">
                  <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-stone/12">
                    <dt className="font-sans text-[12.5px] text-stone">
                      Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                    </dt>
                    <dd className="m-0 font-sans text-[13px] font-medium text-obsidian">
                      {formatPrice(subtotal, currency)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-stone/12">
                    <dt className="font-sans text-[12.5px] text-stone">Delivery</dt>
                    <dd
                      className={cn(
                        'm-0 font-sans text-[13px] font-medium',
                        qualifies ? 'text-forest-green' : 'text-obsidian',
                      )}
                    >
                      {qualifies ? 'Complimentary' : 'At checkout'}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-stone/12">
                    <dt className="font-sans text-[12.5px] text-stone">Duties &amp; taxes</dt>
                    <dd className="m-0 font-sans text-[13px] text-stone">By destination</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 pt-4">
                    <dt className="font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                      Estimated total
                    </dt>
                    <dd className="m-0 font-luxury text-2xl font-semibold text-obsidian leading-none">
                      {formatPrice(subtotal, currency)}
                    </dd>
                  </div>
                </dl>

                {threshold !== undefined && !qualifies ? (
                  <p className="m-0! mt-3! font-sans text-[11.5px] text-stone leading-snug bg-parchment px-3 py-2 rounded-sm">
                    Add{' '}
                    <span className="text-obsidian font-medium">
                      {formatPrice(remaining, currency)}
                    </span>{' '}
                    to qualify for complimentary delivery.
                  </p>
                ) : null}

                <Link
                  href="/checkout"
                  className="mt-4 flex items-center justify-center h-12 rounded-sm bg-forest-green hover:bg-bud-green transition-colors no-underline"
                >
                  <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-cream">
                    Proceed to checkout
                  </span>
                </Link>

                <p className="m-0! mt-3! font-sans text-[11.5px] text-stone leading-relaxed">
                  Final delivery and duty figures are confirmed against your address at the next
                  step. Nothing is charged until you confirm.
                </p>
              </div>

              <div className="mt-3 bg-obsidian rounded-sm p-5">
                <Eyebrow tone="light">Ordering for a business?</Eyebrow>
                <p className="m-0! mt-2! font-sans text-[12.5px] text-cream/70 leading-relaxed">
                  Volume pricing, standing orders and account terms are handled by the trade desk
                  rather than through this basket.
                </p>
                <div className="mt-4">
                  <Cta href="/b2b" variant="outline">
                    Trade enquiries
                  </Cta>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* ═══ ASSURANCES ═════════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <div className="border-t border-stone/15 pt-6 md:pt-7 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {ASSURANCES.map((a, i) => (
            <FadeIn key={a.title} delay={i * 0.05}>
              <h2 className="m-0!">
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                  {a.title}
                </span>
              </h2>
              <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                {a.body}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ── Line item row ─────────────────────────────────────────── */

function LedgerRow({
  item,
  onRemove,
  onQuantity,
}: {
  item: CartItem
  onRemove: () => void
  onQuantity: (quantity: number) => void
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-b border-stone/12"
    >
      <div className="grid grid-cols-12 gap-4 items-start py-4 md:py-5">
        {/* Item */}
        <div className="col-span-12 md:col-span-6 flex gap-4 min-w-0">
          {/* Fixed-size wrapper + `fill`: unlayered `img { height: auto }` in
              styles.css beats any height utility on a sized <Image>. */}
          <Link
            href={`/products/${item.slug}`}
            className="shrink-0 relative w-[74px] h-[92px] md:w-[88px] md:h-[110px] bg-mist rounded-sm overflow-hidden no-underline"
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 74px, 88px"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center font-luxury text-2xl text-obsidian/25"
              >
                {item.title.charAt(0)}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={`/products/${item.slug}`} className="group no-underline">
              <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-snug group-hover:text-forest-green transition-colors">
                {item.title}
              </span>
            </Link>
            <p className="m-0! mt-1.5! font-sans text-[12px] text-stone">
              {formatPrice(item.price, item.currency)} each
            </p>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${item.title} from basket`}
              className="mt-2 bg-transparent border-0 p-0 cursor-pointer"
            >
              <span className="font-sans text-[11.5px] text-stone hover:text-obsidian transition-colors underline underline-offset-2">
                Remove
              </span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-7 md:col-span-3">
          <span className="md:hidden block font-sans text-[10px] uppercase tracking-[0.16em] text-stone mb-1.5">
            Quantity
          </span>
          <QuantityStepper quantity={item.quantity} title={item.title} onChange={onQuantity} />
        </div>

        {/* Line total */}
        <div className="col-span-5 md:col-span-3 text-right">
          <span className="md:hidden block font-sans text-[10px] uppercase tracking-[0.16em] text-stone mb-1.5">
            Line total
          </span>
          <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-none">
            {formatPrice(item.price * item.quantity, item.currency)}
          </span>
        </div>
      </div>
    </motion.li>
  )
}

/* ── States ────────────────────────────────────────────────── */

function BasketSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10" aria-hidden>
      <div className="lg:col-span-8">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4 py-5 border-b border-stone/12">
            <span className="w-[88px] h-[110px] bg-mist rounded-sm" />
            <span className="flex-1 flex flex-col gap-2 pt-1">
              <span className="h-4 w-2/3 bg-mist rounded-sm" />
              <span className="h-3 w-1/4 bg-mist rounded-sm" />
            </span>
          </div>
        ))}
      </div>
      <div className="lg:col-span-4 h-56 bg-mist rounded-sm" />
    </div>
  )
}

function EmptyBasket() {
  return (
    <FadeIn>
      <div className="border border-stone/15 rounded-sm bg-white px-6 py-12 md:py-16 text-center">
        {/* max-w + mx-auto live on a wrapper: the `m-0!` on the paragraph below
            would otherwise cancel the auto margins. */}
        <div className="max-w-md mx-auto">
          <Eyebrow className="text-center">Nothing here yet</Eyebrow>
          <h2 className="m-0! mt-3!">
            <span className="block font-luxury text-xl md:text-2xl font-semibold text-obsidian leading-tight">
              Your basket is empty
            </span>
          </h2>
          <p className="m-0! mt-3! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
            Start from the full catalogue, narrow by origin, or read about the producers we work
            with before you choose.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Cta href="/products">Shop all products</Cta>
            <Cta href="/categories" variant="dark-outline">
              Browse by origin
            </Cta>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
