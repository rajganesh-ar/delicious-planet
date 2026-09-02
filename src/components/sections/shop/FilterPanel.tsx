'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useShopFilters } from './useShopFilters'
import type { FacetOption, ShopFacets, ShopSelection } from '@/lib/shop-facets'

interface FilterPanelProps {
  facets: ShopFacets
  selection: ShopSelection
  /** Country facets carry ISO codes; the URL param takes a code or a name. */
  className?: string
  /** Fired after any option is chosen — closes the mobile sheet. */
  onNavigate?: () => void
}

/**
 * The refinement panel, shared by the desktop sidebar and the mobile sheet.
 *
 * Each dimension is single-select: an option's href sets its key, and the
 * option that is already on links back to the unfiltered URL, so a second
 * click removes it. That keeps the whole panel navigable without JS.
 *
 * styles.css declares unlayered `a { color: currentColor }` and h1–h6 rules
 * that outrank Tailwind's layered utilities, so link colour lives on a child
 * span and heading margins carry `!`.
 */
export function FilterPanel({ facets, selection, className, onNavigate }: FilterPanelProps) {
  const { hrefWith } = useShopFilters()

  const groups: {
    key: string
    title: string
    param: string
    active: string
    options: FacetOption[]
    /** Collapsed to this many rows until "Show all" is clicked. */
    max?: number
  }[] = [
    {
      key: 'region',
      title: 'Shop by Region',
      param: 'region',
      active: selection.region,
      options: facets.regions,
    },
    {
      key: 'country',
      title: 'Country of Origin',
      param: 'originCountry',
      active: selection.country,
      options: facets.countries,
      max: 6,
    },
    {
      key: 'price',
      title: 'Price',
      param: 'price',
      active: selection.price,
      options: facets.price,
    },
    {
      key: 'dietary',
      title: 'Dietary',
      param: 'dietary',
      active: selection.dietary,
      options: facets.dietary,
    },
    {
      key: 'brand',
      title: 'Brand',
      param: 'brand',
      active: selection.brand,
      options: facets.brands,
      max: 6,
    },
    {
      key: 'supplier',
      title: 'Supplier',
      param: 'supplier',
      active: selection.supplier,
      options: facets.suppliers,
      max: 6,
    },
  ]

  return (
    <div
      className={cn(
        'rounded-sm border border-stone/15 bg-white overflow-hidden',
        className,
      )}
    >
      <div className="px-3.5 py-2.5 bg-parchment border-b border-stone/15">
        <span className="block font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-forest-green">
          Refine
        </span>
      </div>

      <div className="divide-y divide-stone/15">
        {/* Availability sits first — it is the toggle shoppers reach for most. */}
        <Group title="Availability">
          <ul className="list-none m-0 p-0">
            <OptionRow
              href={hrefWith({ inStock: selection.inStock ? null : 'true' })}
              label="In stock only"
              count={facets.inStock}
              active={selection.inStock}
              onNavigate={onNavigate}
            />
            <OptionRow
              href={hrefWith({ featured: selection.featured ? null : 'true' })}
              label="Featured"
              count={facets.featured}
              active={selection.featured}
              onNavigate={onNavigate}
            />
          </ul>
        </Group>

        {facets.categories.length > 0 && (
          <Group title="Category">
            <ul className="list-none m-0 p-0">
              {facets.categories.map((dept) => {
                const isActive = selection.category === dept.slug
                // A department's children unfold only while that branch is in
                // play, so the panel stays scannable on a deep taxonomy.
                const childActive = dept.children.some((c) => c.slug === selection.category)
                return (
                  <li key={dept.slug} className="m-0">
                    <OptionRow
                      href={hrefWith({ category: isActive ? null : dept.slug, collection: null })}
                      label={dept.label}
                      count={dept.count}
                      active={isActive}
                      onNavigate={onNavigate}
                      bare
                    />
                    {(isActive || childActive) && dept.children.length > 0 && (
                      <ul className="list-none m-0 p-0 pl-4 border-l border-stone/15 ml-1.5 mb-1">
                        {dept.children.map((child) => (
                          <OptionRow
                            key={child.slug}
                            href={hrefWith({
                              category: selection.category === child.slug ? dept.slug : child.slug,
                              collection: null,
                            })}
                            label={child.label}
                            count={child.count}
                            active={selection.category === child.slug}
                            onNavigate={onNavigate}
                          />
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </Group>
        )}

        {groups.map((group) =>
          group.options.length === 0 ? null : (
            <Group key={group.key} title={group.title}>
              <OptionList
                options={group.options}
                param={group.param}
                active={group.active}
                max={group.max}
                onNavigate={onNavigate}
              />
            </Group>
          ),
        )}
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-3.5">
      <h3 className="m-0! mb-2!">
        <span className="block font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-obsidian">
          {title}
        </span>
      </h3>
      {children}
    </div>
  )
}

/** A facet list that collapses past `max` rows behind a "Show all" toggle. */
function OptionList({
  options,
  param,
  active,
  max,
  onNavigate,
}: {
  options: FacetOption[]
  param: string
  active: string
  max?: number
  onNavigate?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { hrefWith } = useShopFilters()

  // The chosen option must stay visible even when it sorts below the cut.
  const collapsed = max && !expanded ? options.slice(0, max) : options
  const visible =
    active && !collapsed.some((o) => o.slug === active)
      ? [...collapsed, ...options.filter((o) => o.slug === active)]
      : collapsed

  return (
    <>
      <ul className="list-none m-0 p-0">
        {visible.map((option) => (
          <OptionRow
            key={option.slug}
            href={hrefWith({ [param]: option.slug === active ? null : option.slug })}
            label={option.label}
            count={option.count}
            active={option.slug === active}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
      {max && options.length > max && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 bg-transparent border-0 p-0 cursor-pointer font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-forest-green hover:text-bud-green transition-colors"
        >
          {expanded ? 'Show less' : `Show all ${options.length}`}
        </button>
      )}
    </>
  )
}

/**
 * One refinement. The marker doubles as the state readout — filled square when
 * on, hairline outline when off — so the row needs no separate checkbox.
 */
function OptionRow({
  href,
  label,
  count,
  active,
  onNavigate,
  bare = false,
}: {
  href: string
  label: string
  count?: number
  active: boolean
  onNavigate?: () => void
  bare?: boolean
}) {
  const row = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-pressed={active}
      /* Roomier rows below lg, where this panel is the mobile filter sheet and
         these anchors are the only tap targets in it. */
      className="group flex items-center gap-2 py-2.5 lg:py-1 no-underline"
    >
      <span
        className={cn(
          'w-3 h-3 shrink-0 rounded-[2px] border flex items-center justify-center transition-colors',
          active
            ? 'bg-forest-green border-forest-green'
            : 'border-stone/35 group-hover:border-forest-green',
        )}
      >
        {active && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-cream"
            aria-hidden="true"
          >
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
        )}
      </span>
      <span
        className={cn(
          'font-sans text-[12.5px] leading-snug transition-colors flex-1 min-w-0',
          active ? 'text-forest-green font-medium' : 'text-stone group-hover:text-forest-green',
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="font-mono text-[10px] text-stone/45 shrink-0 tabular-nums">{count}</span>
      )}
    </Link>
  )

  // `bare` is for rows that are already inside an <li> (the category tree).
  return bare ? row : <li className="m-0">{row}</li>
}
