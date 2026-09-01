import type { ReactNode } from 'react'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'

export interface DietaryCount {
  slug: string
  label: string
  count: number
}

interface DietaryStripProps {
  facets: DietaryCount[]
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

const ICONS: Record<string, ReactNode> = {
  halal: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.2 8.6a4.4 4.4 0 1 0 0 6.8" />
    </svg>
  ),
  vegetarian: (
    <svg {...ICON_PROPS}>
      <path d="M12 21c0-6 3-10 8-11 0 6-3 10-8 11z" />
      <path d="M12 21C12 15 9 11 4 10c0 6 3 10 8 11z" />
    </svg>
  ),
  vegan: (
    <svg {...ICON_PROPS}>
      <path d="M20 4C10 4 4 9 4 16c0 1.6.4 3 1 4C6 12 12 8 20 7z" />
      <path d="M5 20c3-6 8-9 14-10" />
    </svg>
  ),
  'gluten-free': (
    <svg {...ICON_PROPS}>
      <path d="M12 21V8" />
      <path d="M12 12c-2 0-4-1.6-4-4 2 0 4 1.6 4 4zM12 12c2 0 4-1.6 4-4-2 0-4 1.6-4 4z" />
      <path d="m4 4 16 16" />
    </svg>
  ),
  'lactose-free': (
    <svg {...ICON_PROPS}>
      <path d="M8 3h8l-1 4v13a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7z" />
      <path d="m4 4 16 16" />
    </svg>
  ),
  organic: (
    <svg {...ICON_PROPS}>
      <path d="M12 21c5-1 8-5 8-11V5l-8 2-8-2v5c0 6 3 10 8 11z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
}

export function DietaryStrip({ facets }: DietaryStripProps) {
  if (facets.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Shop by Preference" href="/products" className="mb-5 md:mb-7" />

      {/* auto-fit keeps the row even however many facets have matches */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 md:gap-4">
        {facets.map((facet, i) => (
          <FadeIn key={facet.slug} delay={i * 0.05}>
            <Link
              href={`/products?dietary=${facet.slug}`}
              className="group flex items-center gap-3 h-full px-3.5 py-3.5 bg-white border border-stone/15 rounded-sm no-underline transition-colors hover:border-forest-green"
            >
              <span className="shrink-0 text-forest-green">{ICONS[facet.slug]}</span>
              <span className="min-w-0">
                <span className="block font-sans text-[12.5px] font-medium text-obsidian leading-tight transition-colors group-hover:text-forest-green">
                  {facet.label}
                </span>
                <span className="block font-sans text-[11px] text-stone/60 leading-tight mt-0.5 tabular-nums">
                  {facet.count} {facet.count === 1 ? 'product' : 'products'}
                </span>
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
