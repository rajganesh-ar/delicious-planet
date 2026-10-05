'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

/**
 * A basket line's photo. The URL was saved in localStorage when the item was
 * added, so it can outlive the file it points at (a replaced product photo, a
 * deleted product). CartProvider refreshes it from the server on load; if it
 * still fails, the line falls back to the title's initial instead of an empty
 * frame. Fills its positioned parent.
 */
export function CartThumb({
  src,
  title,
  sizes,
  letterClassName,
}: {
  src?: string
  title: string
  sizes: string
  letterClassName?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (src && failedSrc !== src) {
    return (
      <Image
        src={src}
        alt={title}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => setFailedSrc(src)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        'absolute inset-0 flex items-center justify-center font-luxury text-obsidian/25',
        letterClassName,
      )}
    >
      {title.charAt(0)}
    </span>
  )
}
