'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { ImagePlaceholder } from '@/components/ui'
import { Cta, Eyebrow, GUTTER } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import type { BrandMark } from '@/lib/brand-marks'
import { siteImage } from '@/lib/site-image'

/**
 * Brands — the register archetype.
 *
 * Where About reads as an essay and the basket as a ledger, this page is an
 * index: a masthead marque board, a filter bar, then one hairline row per
 * producer under alphabetical rules. No cards, no bento — a list you scan.
 *
 * Tokens are the storefront's (uncapped gutter, type ramp, `rounded-sm`, forest
 * actions). styles.css declares unlayered `a`, `h1`–`h6` and `p` rules that
 * outrank Tailwind's layered utilities, so colour lives on child spans and
 * margins carry `!`.
 */

/** One stocked brand, flattened for the client. */
export interface BrandEntry {
  slug: string
  name: string
  description: string | null
  website: string | null
  logo: string | null
  /** The origin most of its products state. */
  country: string | null
  /** Published products carrying the brand. */
  count: number
}

interface BrandsPageClientProps {
  brands: BrandEntry[]
  /** Marque board marks — logos first, then wordmarks. */
  brandMarks: BrandMark[]
}

const MEDIA = {
  masthead: { src: siteImage('/images/sourcing/sourcing-agriculture.avif'), label: 'Producer network — 3:2' },
}

/**
 * The marque board is a 3-column grid whose last cell is the masthead image, so
 * five marks fill it exactly. More would push the masthead onto a third row and
 * leave a hole beside it.
 */
const MARQUE_CELLS = 5

const CRITERIA = [
  {
    title: 'Specialisation',
    body: 'A producer earns a place by doing one category exceptionally, not by covering many adequately. Depth of craft is the first filter.',
  },
  {
    title: 'Reliability',
    body: 'Output has to hold its characteristics across production runs and seasons. We test consistency before we list, and again on every cycle.',
  },
  {
    title: 'Kitchen relevance',
    body: 'Every line is judged the way a working kitchen judges it — behaviour under heat, yield, shelf life, and how it handles at volume.',
  },
]

function websiteUrl(website: string): string {
  return website.startsWith('http') ? website : `https://${website}`
}

export function BrandsPageClient({ brands, brandMarks }: BrandsPageClientProps) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')

  const sorted = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name)), [brands])

  const countries = useMemo(
    () =>
      Array.from(
        new Set(sorted.map((s) => s.country).filter((c): c is string => Boolean(c))),
      ).sort(),
    [sorted],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sorted.filter((s) => {
      if (country && s.country !== country) return false
      if (!q) return true
      return (
        s.name.toLowerCase().includes(q) ||
        (s.country ?? '').toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q)
      )
    })
  }, [sorted, query, country])

  const filtering = Boolean(query.trim() || country)

  return (
    <div className="bg-cream">
      {/* ═══ MASTHEAD — type left, marque board right ═══════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-6">
              <FadeIn>
                <Eyebrow tone="light">The register</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.08] tracking-tight text-[clamp(2rem,5.5vw,4rem)]">
                    Every producer
                    <br />
                    we <span className="text-gold">stand behind</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-5! font-sans text-cream/70 text-sm md:text-base leading-relaxed max-w-lg">
                  A short list, kept deliberately short. Each house here is listed for one thing it
                  does better than anyone else we could find — and stays listed only while that
                  holds.
                </p>
              </FadeIn>
            </div>

            {/* Marque board — the logos we hold, set as a tile grid. */}
            <div className="lg:col-span-6">
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-3 border-t border-l border-cream/12">
                  {brandMarks.slice(0, MARQUE_CELLS).map((mark) => (
                    <div
                      key={mark.slug}
                      className="relative aspect-3/2 border-r border-b border-cream/12 flex items-center justify-center p-4 md:p-5"
                    >
                      {mark.src ? (
                        // `fill` + a sized parent: unlayered `img { height: auto }`
                        // in styles.css beats height utilities on a sized <Image>.
                        <span className="relative block w-full h-full">
                          <Image
                            src={mark.src}
                            alt={mark.name}
                            fill
                            sizes="(max-width: 1024px) 30vw, 15vw"
                            className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                          />
                        </span>
                      ) : (
                        <span className="font-luxury text-sm md:text-base font-semibold text-cream/70 text-center leading-tight">
                          {mark.name}
                        </span>
                      )}
                    </div>
                  ))}
                  <ImagePlaceholder
                    {...MEDIA.masthead}
                    ratio="3/2"
                    tone="dark"
                    glyph={false}
                    priority
                    sizes="(max-width: 1024px) 30vw, 15vw"
                    className="border-r border-b border-cream/12"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Register summary line — a rule, not a stat bar. */}
        <div className={cn(GUTTER, 'border-t border-cream/10')}>
          <p className="m-0! py-4 font-sans text-[11px] md:text-[12px] uppercase tracking-[0.16em] text-cream/45">
            {brands.length} {brands.length === 1 ? 'brand' : 'brands'}
            <span className="text-cream/20"> · </span>
            {countries.length} {countries.length === 1 ? 'country' : 'countries'}
            <span className="text-cream/20"> · </span>
            reviewed each harvest cycle
          </p>
        </div>
      </section>

      {/* ═══ FILTER BAR ═════════════════════════════════════════ */}
      {brands.length > 0 ? (
        <div className="sticky top-(--header-h) z-30 bg-cream/95 backdrop-blur-sm border-b border-stone/15">
          <div className={cn(GUTTER, 'py-3 flex flex-wrap items-center gap-3')}>
            <label htmlFor="brand-search" className="sr-only">
              Search producers
            </label>
            <input
              id="brand-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search producers"
              className="h-10 w-full sm:w-64 px-3 rounded-sm border border-stone/25 bg-white font-sans text-[13px] text-obsidian placeholder:text-stone/60 outline-none focus:border-forest-green transition-colors"
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setCountry('')}
                aria-pressed={country === ''}
                className={cn(
                  'h-8 px-3 rounded-sm border cursor-pointer transition-colors',
                  country === ''
                    ? 'bg-obsidian border-obsidian'
                    : 'bg-transparent border-stone/25 hover:border-obsidian',
                )}
              >
                <span
                  className={cn(
                    'font-sans text-[11px] uppercase tracking-[0.12em] font-medium',
                    country === '' ? 'text-cream' : 'text-stone',
                  )}
                >
                  All
                </span>
              </button>
              {countries.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountry(country === c ? '' : c)}
                  aria-pressed={country === c}
                  className={cn(
                    'h-8 px-3 rounded-sm border cursor-pointer transition-colors',
                    country === c
                      ? 'bg-obsidian border-obsidian'
                      : 'bg-transparent border-stone/25 hover:border-obsidian',
                  )}
                >
                  <span
                    className={cn(
                      'font-sans text-[11px] uppercase tracking-[0.12em] font-medium',
                      country === c ? 'text-cream' : 'text-stone',
                    )}
                  >
                    {c}
                  </span>
                </button>
              ))}
            </div>

            <span
              aria-live="polite"
              className="ml-auto font-sans text-[11px] uppercase tracking-[0.16em] text-stone"
            >
              {filtered.length} shown
            </span>
          </div>
        </div>
      ) : null}

      {/* ═══ THE REGISTER ═══════════════════════════════════════ */}
      <section className={cn(GUTTER, 'py-8 md:py-11')}>
        {filtered.length === 0 ? (
          <EmptyRegister
            filtering={filtering}
            onReset={() => {
              setQuery('')
              setCountry('')
            }}
          />
        ) : (
          <ul className="list-none m-0 p-0">
            {filtered.map((brand, i) => {
              const initial = brand.name.charAt(0).toUpperCase()
              const newLetter = i === 0 || filtered[i - 1].name.charAt(0).toUpperCase() !== initial

              return (
                <li key={brand.slug}>
                  {/* Index rule — the letter sits inline on the rule, the way a
                      printed register breaks between initials. */}
                  {newLetter ? (
                    <div className={cn('flex items-center gap-4 pb-2', i === 0 ? 'pt-0' : 'pt-6')}>
                      <span className="font-luxury text-sm font-semibold text-forest-green leading-none">
                        {initial}
                      </span>
                      <span aria-hidden className="flex-1 h-px bg-stone/20" />
                    </div>
                  ) : null}

                  <RegisterRow brand={brand} index={i + 1} />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ═══ SELECTION CRITERIA ═════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <div className="border-t border-stone/15 pt-6 md:pt-8">
          <FadeIn>
            <h2 className="m-0!">
              <span className="block font-luxury text-xl sm:text-2xl lg:text-[28px] font-semibold text-obsidian tracking-tight">
                What earns a place on this list
              </span>
            </h2>
          </FadeIn>

          <ol className="list-none m-0 p-0 mt-5 md:mt-7 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {CRITERIA.map((c, i) => (
              // FadeIn renders a <div>, so it sits inside the <li>, not around it.
              <li key={c.title} className="border-t border-obsidian/20 pt-3.5">
                <FadeIn delay={i * 0.06}>
                  <span className="block font-luxury text-[11px] font-semibold text-forest-green tracking-[0.16em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="m-0! mt-2!">
                    <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                      {c.title}
                    </span>
                  </h3>
                  <p className="m-0! mt-2! font-sans text-[12.5px] md:text-[13px] text-stone leading-relaxed">
                    {c.body}
                  </p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ FOR PRODUCERS ══════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pb-8 md:pb-11')}>
        <FadeIn>
          <div className="bg-obsidian rounded-sm px-6 md:px-10 lg:px-14 py-8 md:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="max-w-xl">
              <Eyebrow tone="light">For producers</Eyebrow>
              <h2 className="m-0! mt-2!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl">
                  Think your house belongs on this register?
                </span>
              </h2>
              <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed">
                Send specifications, capacity and certification. We review submissions against the
                three criteria above and respond either way.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Cta href="/vendors" variant="light">
                Partner with us
              </Cta>
              <Cta href="/sourcing" variant="outline">
                How we source
              </Cta>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}

/* ── One register entry ────────────────────────────────────── */

function RegisterRow({ brand, index }: { brand: BrandEntry; index: number }) {
  const { logo } = brand

  return (
    <FadeIn>
      <article className="group grid grid-cols-12 gap-4 md:gap-6 items-start py-5 md:py-6 border-b border-stone/12 transition-colors hover:bg-parchment/60">
        {/* Index + logo */}
        <div className="col-span-12 md:col-span-3 flex items-center gap-4">
          <span className="font-luxury text-[11px] font-semibold text-stone/40 leading-none w-6 shrink-0">
            {String(index).padStart(2, '0')}
          </span>
          {/* flex-1, never `w-full`: the index digit shares this column, so a
              full-width tile would overflow into the name column. */}
          <div className="relative flex-1 min-w-0 h-16 md:h-18 bg-white border border-stone/15 rounded-sm flex items-center justify-center p-3">
            {logo ? (
              <span className="relative block w-full h-full">
                <Image
                  src={logo}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 40vw, 16vw"
                  className="object-contain"
                />
              </span>
            ) : (
              <span
                aria-hidden
                className="font-luxury text-sm font-semibold text-obsidian/30 text-center leading-tight px-2"
              >
                {brand.name}
              </span>
            )}
          </div>
        </div>

        {/* Name + description */}
        <div className="col-span-12 md:col-span-6 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="m-0!">
              <span className="block font-luxury text-lg md:text-xl font-semibold text-obsidian leading-tight">
                {brand.name}
              </span>
            </h2>
            {brand.country ? (
              <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-stone">
                {brand.country}
              </span>
            ) : null}
          </div>

          {brand.description ? (
            <p className="m-0! mt-2! font-sans text-[12.5px] md:text-[13px] text-stone leading-relaxed max-w-2xl">
              {brand.description}
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="col-span-12 md:col-span-3 flex flex-row md:flex-col md:items-end gap-4 md:gap-2">
          <Link
            href={`/products?brand=${brand.slug}`}
            className="group/link no-underline inline-flex items-center gap-2"
          >
            <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-forest-green">
              View {brand.count} {brand.count === 1 ? 'product' : 'products'}
            </span>
            <span
              aria-hidden
              className="font-sans text-[12px] text-forest-green transition-transform group-hover/link:translate-x-0.5"
            >
              →
            </span>
          </Link>

          {brand.website ? (
            <a
              href={websiteUrl(brand.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <span className="font-sans text-[11.5px] text-stone hover:text-obsidian transition-colors">
                Website ↗
              </span>
            </a>
          ) : null}
        </div>
      </article>
    </FadeIn>
  )
}

/* ── Empty states ──────────────────────────────────────────── */

function EmptyRegister({ filtering, onReset }: { filtering: boolean; onReset: () => void }) {
  return (
    <div className="border border-stone/15 rounded-sm bg-white px-6 py-12 md:py-16 text-center">
      {/* max-w + mx-auto sit on a wrapper — `m-0!` below would cancel auto margins. */}
      <div className="max-w-md mx-auto">
        <Eyebrow className="text-center">{filtering ? 'No matches' : 'Coming soon'}</Eyebrow>
        <h2 className="m-0! mt-3!">
          <span className="block font-luxury text-xl md:text-2xl font-semibold text-obsidian leading-tight">
            {filtering ? 'Nothing matches that search' : 'The register is being compiled'}
          </span>
        </h2>
        <p className="m-0! mt-3! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
          {filtering
            ? 'Try a different producer name or clear the country filter to see the full register.'
            : 'Producer profiles are published as each partnership is confirmed. In the meantime, the catalogue is open.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {filtering ? (
            <button
              type="button"
              onClick={onReset}
              className="group inline-flex items-center justify-center h-11 px-7 rounded-sm bg-forest-green hover:bg-bud-green transition-colors border-0 cursor-pointer"
            >
              <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-cream">
                Clear filters
              </span>
            </button>
          ) : (
            <Cta href="/products">Browse the catalogue</Cta>
          )}
          <Cta href="/sourcing" variant="dark-outline">
            How we source
          </Cta>
        </div>
      </div>
    </div>
  )
}
