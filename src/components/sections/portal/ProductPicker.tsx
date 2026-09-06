'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { fieldClass } from './PortalForm'
import { cn } from '@/lib/cn'

/**
 * The catalogue search behind an ingredient line.
 *
 * This component is what makes "recipes use only our products" a fact rather
 * than a request: there is no free-text path to an ingredient, so the only way
 * to fill a line is to find something we actually stock. The Recipes
 * collection enforces the same rule server-side with a relationship field —
 * this is the half that makes obeying it pleasant.
 *
 * It reads /api/products directly. That endpoint is public and already scoped
 * to published rows by the collection's own access rules, so no bespoke search
 * route is needed and none is added: one less endpoint to keep honest.
 */

export interface PickedProduct {
  id: number
  title: string
  slug: string
  sku?: string | null
  image?: string | null
  /** Variant sizes, so the chef can name the pack the recipe assumes. */
  variants?: { sku: string; size: string }[]
}

interface ProductDoc {
  id: number
  title: string
  slug: string
  sku?: string | null
  images?: { image?: { url?: string | null; sizes?: { thumbnail?: { url?: string | null } } } | null }[]
  variants?: { sku?: string | null; size?: string | null }[]
}

/**
 * `unoptimized` on the thumbnails below is deliberate: Payload already writes
 * a 400×400 webp derivative for every upload, which is what this reads, and
 * putting a 40px avatar in a search dropdown through the image optimiser as
 * well would cache a second rendition per product for no visible gain.
 */
function toPicked(doc: ProductDoc): PickedProduct {
  const first = doc.images?.[0]?.image
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    sku: doc.sku ?? null,
    image: first?.sizes?.thumbnail?.url ?? first?.url ?? null,
    variants: (doc.variants ?? [])
      .filter((variant) => variant?.sku && variant?.size)
      .map((variant) => ({ sku: variant.sku as string, size: variant.size as string })),
  }
}

const DEBOUNCE_MS = 250
const MIN_QUERY_LENGTH = 2

export function ProductPicker({
  onPick,
  placeholder = 'Search the catalogue…',
  autoFocus,
}: {
  onPick: (product: PickedProduct) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PickedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [searched, setSearched] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  // A combobox has to name the element it controls, and there may be several
  // pickers on one page — one per ingredient — so the id cannot be a constant.
  const listboxId = useId()

  useEffect(() => {
    const term = query.trim()
    if (term.length < MIN_QUERY_LENGTH) {
      setResults([])
      setSearched(false)
      return
    }

    // Debounced, and every in-flight request is abandoned when the next
    // keystroke arrives — otherwise a slow response for "oli" can land after
    // the one for "olive oil" and replace it.
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          'where[or][0][title][like]': term,
          'where[or][1][sku][like]': term,
          limit: '8',
          depth: '1',
          sort: 'title',
        })
        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        setResults(((data?.docs ?? []) as ProductDoc[]).map(toPicked))
        setSearched(true)
      } catch {
        // An aborted request is the normal case here, not an error worth
        // showing anybody.
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // Clicking away closes the list. Without this the results sit over the next
  // ingredient row and swallow its first click.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const choose = (product: PickedProduct) => {
    onPick(product)
    setQuery('')
    setResults([])
    setOpen(false)
    setSearched(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-autocomplete="list"
        aria-controls={listboxId}
        className={fieldClass}
        value={query}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
          // A bare Enter inside a form would submit it; here it should do
          // nothing but pick the single obvious result, if there is one.
          if (e.key === 'Enter') {
            e.preventDefault()
            if (results.length === 1) choose(results[0]!)
          }
        }}
      />

      {open && query.trim().length >= MIN_QUERY_LENGTH ? (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-sm border border-stone/25 bg-white shadow-lg max-h-80 overflow-y-auto">
          {loading && results.length === 0 ? (
            <p className="m-0! px-3.5 py-3 font-sans text-[12.5px] text-stone">Searching…</p>
          ) : null}

          {!loading && searched && results.length === 0 ? (
            <p className="m-0! px-3.5 py-3 font-sans text-[12.5px] text-stone leading-relaxed">
              Nothing in the catalogue matches that. Recipes here are built only from products we
              stock — if something you need is missing, tell us and we will look at sourcing it.
            </p>
          ) : null}

          <ul id={listboxId} role="listbox" className="list-none m-0 p-0">
            {results.map((product) => (
              // A listbox's children have to be options, so the <li> is
              // presentational and the role sits on the thing being chosen.
              <li key={product.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => choose(product)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 bg-transparent border-0 border-b border-stone/10 last:border-b-0 hover:bg-parchment cursor-pointer transition-colors"
                >
                  <span className="shrink-0 w-10 h-10 rounded-sm bg-parchment overflow-hidden relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sans text-[13px] text-obsidian leading-snug truncate">
                      {product.title}
                    </span>
                    <span className="block font-sans text-[11px] text-stone mt-0.5 truncate">
                      {[product.sku, product.variants?.map((v) => v.size).join(' · ')]
                        .filter(Boolean)
                        .join(' — ')}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/** The chosen product, rendered as a removable row on an ingredient line. */
export function PickedProductChip({
  product,
  onClear,
}: {
  product: PickedProduct
  onClear?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-sm border border-forest-green/25 bg-forest-green/6 px-3 py-2',
      )}
    >
      <span className="shrink-0 w-9 h-9 rounded-sm bg-white overflow-hidden relative">
        {product.image ? (
          <Image
            src={product.image}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
            unoptimized
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-[13px] font-medium text-obsidian leading-snug truncate">
          {product.title}
        </span>
        {product.sku ? (
          <span className="block font-sans text-[11px] text-stone mt-0.5 truncate">
            {product.sku}
          </span>
        ) : null}
      </span>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 bg-transparent border-0 cursor-pointer p-1 -m-1"
          aria-label={`Change ${product.title}`}
        >
          <span className="font-sans text-[11.5px] text-stone hover:text-red-700 transition-colors">
            Change
          </span>
        </button>
      ) : null}
    </div>
  )
}
