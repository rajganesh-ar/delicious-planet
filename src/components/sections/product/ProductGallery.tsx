'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface GalleryImage {
  url: string
  alt: string
}

interface ProductGalleryProps {
  images: GalleryImage[]
  active: number
  onSelect: (index: number) => void
  /** Corner flags — sale, new, sold out. Rendered over the main frame. */
  flags?: { label: string; tone: 'sale' | 'featured' | 'muted' }[]
}

const FLAG_TONE: Record<string, string> = {
  sale: 'bg-gold text-obsidian',
  featured: 'bg-forest-green text-cream',
  muted: 'bg-white/90 text-stone border border-stone/20',
}

/**
 * Main frame plus a thumbnail rail, framed like every other panel on the
 * storefront (white ground, hairline border, `rounded-sm`).
 *
 * The rail sits underneath at every breakpoint rather than switching to a
 * vertical strip on desktop — the sticky column is only ~half the viewport
 * wide, and a side rail would eat the image at exactly the size it matters.
 */
export function ProductGallery({ images, active, onSelect, flags = [] }: ProductGalleryProps) {
  const current = images[active]

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-stone/15 bg-white">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                priority
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-parchment">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                className="text-stone/20"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </AnimatePresence>

        {flags.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
            {flags.map((flag) => (
              <span
                key={flag.label}
                className={cn(
                  // nowrap: these sit over the image in a column with no width
                  // of its own, so on a narrow phone "Sold out" would break in
                  // two — and `leading-none` collapses the two lines together.
                  'whitespace-nowrap font-heading text-[9px] uppercase tracking-[0.16em] font-semibold px-2 py-1 rounded-sm leading-none',
                  FLAG_TONE[flag.tone],
                )}
              >
                {flag.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="list-none m-0 p-0 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {images.map((image, i) => (
            <li key={image.url} className="m-0 shrink-0">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'relative block w-16 h-16 overflow-hidden rounded-sm border cursor-pointer p-0 bg-parchment transition-colors',
                  i === active ? 'border-forest-green' : 'border-stone/15 hover:border-stone/40',
                )}
              >
                <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
