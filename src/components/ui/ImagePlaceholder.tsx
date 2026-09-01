import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

type Tone = 'light' | 'dark' | 'forest'

const toneClass: Record<Tone, string> = {
  light: 'bg-mist text-obsidian/45',
  dark: 'bg-charcoal text-cream/40',
  forest: 'bg-forest-green/90 text-cream/50',
}

const hatch: Record<Tone, string> = {
  light: 'rgba(17,17,17,0.055)',
  dark: 'rgba(250,250,250,0.05)',
  forest: 'rgba(250,250,250,0.07)',
}

export type ImagePlaceholderProps = {
  /** Drop a real file in and the placeholder disappears — nothing else changes. */
  src?: string | null
  alt?: string
  /** Caption shown while the slot is empty, e.g. "Founder portrait". */
  label?: string
  /** CSS aspect-ratio, e.g. "4/5". Omit when the parent sets the height. */
  ratio?: string
  tone?: Tone
  /**
   * Draw the centred icon and label. Turn it off for backdrops that carry
   * their own copy — a glyph behind a headline reads as a rendering bug.
   */
  glyph?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  imageClassName?: string
  /** Overlays (gradients, captions) rendered above the image or placeholder. */
  children?: React.ReactNode
}

/**
 * One image slot for the editorial pages. It renders the real asset when a
 * `src` is supplied and a designed placeholder when it isn't, so a page can be
 * laid out and shipped before the photography exists.
 *
 * Always uses `fill` — `img { height: auto }` in styles.css is unlayered and
 * would otherwise beat any height utility on a sized <Image>.
 */
export function ImagePlaceholder({
  src,
  alt = '',
  label,
  ratio,
  tone = 'light',
  glyph = true,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority,
  className,
  imageClassName,
  children,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn('relative overflow-hidden isolate', toneClass[tone], className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {src ?
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', imageClassName)}
        />
      : <div
          aria-hidden
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, transparent 0 9px, ${hatch[tone]} 9px 10px)`,
          }}
        >
          {glyph ?
            <>
              <span className="absolute inset-2 rounded-[inherit] border border-dashed border-current opacity-25" />
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              >
                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                <circle cx="8.5" cy="10" r="1.6" />
                <path d="m3 17.5 5-4.5 4 3.5 3.5-3 5.5 5" />
              </svg>
              {label ?
                <span className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.16em] opacity-80 max-w-[85%]">
                  {label}
                </span>
              : null}
            </>
          : null}
        </div>
      }
      {children}
    </div>
  )
}
