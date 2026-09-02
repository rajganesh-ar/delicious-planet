'use client'

import { motion } from 'framer-motion'
import { RichText } from '@/components/ui/RichText'
import { cn } from '@/lib/cn'
import type { Product } from '@/payload-types'

/** Framed block with the parchment caption bar every storefront panel uses. */
export function Panel({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-sm border border-stone/15 bg-white overflow-hidden', className)}>
      <div className="px-4 py-2.5 bg-parchment border-b border-stone/15">
        <h2 className="m-0!">
          <span className="block font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-forest-green">
            {title}
          </span>
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

/** Label/value row used by the spec tables. */
export function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-stone/10 last:border-b-0">
      <span className="font-sans text-[11.5px] text-stone/60 shrink-0">{label}</span>
      <span className="font-sans text-[12.5px] text-obsidian text-right">{value}</span>
    </div>
  )
}

/* ── Nutrition ─────────────────────────────────────────────────────── */

const NUTRIENTS: { key: keyof NonNullable<Product['nutritionPer100g']>; label: string; unit: string; dailyMax: number }[] = [
  { key: 'energyKcal', label: 'Energy', unit: 'kcal', dailyMax: 2000 },
  { key: 'protein', label: 'Protein', unit: 'g', dailyMax: 50 },
  { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g', dailyMax: 260 },
  { key: 'sugars', label: 'of which sugars', unit: 'g', dailyMax: 90 },
  { key: 'fat', label: 'Fat', unit: 'g', dailyMax: 70 },
  { key: 'saturatedFat', label: 'of which saturates', unit: 'g', dailyMax: 20 },
  { key: 'fibre', label: 'Fibre', unit: 'g', dailyMax: 30 },
  { key: 'salt', label: 'Salt', unit: 'g', dailyMax: 6 },
]

/**
 * Per-100g table with a reference-intake bar behind each figure.
 *
 * The bar is a proportion of a typical adult daily intake, not a claim about
 * a serving — the caption says so, because the pack size varies by variant.
 */
export function NutritionPanel({ nutrition }: { nutrition: NonNullable<Product['nutritionPer100g']> }) {
  const rows = NUTRIENTS.filter((n) => typeof nutrition[n.key] === 'number')
  if (rows.length === 0) return null

  return (
    <Panel title="Nutrition">
      <p className="font-sans text-[11px] text-stone/55 m-0 mb-3">
        Typical values per 100g · bar shows share of a 2,000 kcal reference intake
      </p>
      <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
        {rows.map((row) => {
          const value = nutrition[row.key] as number
          const pct = Math.min(Math.round((value / row.dailyMax) * 100), 100)
          return (
            <li key={row.key} className="m-0">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-sans text-[12px] text-obsidian">{row.label}</span>
                <span className="font-mono text-[11px] text-stone tabular-nums">
                  {value} {row.unit}
                  <span className="text-stone/40"> · {pct}%</span>
                </span>
              </div>
              <div className="h-1 rounded-pill bg-mist overflow-hidden">
                <motion.div
                  className="h-full rounded-pill bg-olivine"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

/* ── Description ───────────────────────────────────────────────────── */

export function DescriptionPanel({ product }: { product: Product }) {
  const hasRichText = Boolean(product.description)
  if (!hasRichText && !product.shortDescription) return null

  return (
    <Panel title="About this product">
      {hasRichText ? (
        <RichText
          content={product.description}
          className="font-sans text-[13.5px] text-stone leading-relaxed [&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
        />
      ) : (
        <p className="font-sans text-[13.5px] text-stone leading-relaxed m-0">
          {product.shortDescription}
        </p>
      )}
    </Panel>
  )
}

/* ── Ingredients & allergens ───────────────────────────────────────── */

export function IngredientsPanel({ product }: { product: Product }) {
  if (!product.ingredients && !product.allergens) return null

  return (
    <Panel title="Ingredients & allergens">
      {product.ingredients && (
        <>
          <p className="font-heading text-[10px] uppercase tracking-[0.16em] font-semibold text-obsidian m-0 mb-1.5">
            Ingredients
          </p>
          <p className="font-sans text-[13px] text-stone leading-relaxed m-0">
            {product.ingredients}
          </p>
        </>
      )}
      {product.allergens && (
        <div className={cn('rounded-sm border border-gold/40 bg-gold/10 p-3', product.ingredients && 'mt-3')}>
          <p className="font-heading text-[10px] uppercase tracking-[0.16em] font-semibold text-obsidian m-0 mb-1">
            Allergen advice
          </p>
          <p className="font-sans text-[12.5px] text-obsidian leading-relaxed m-0">
            {product.allergens}
          </p>
        </div>
      )}
    </Panel>
  )
}
