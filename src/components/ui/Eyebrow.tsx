import * as React from 'react'
import { cn } from '@/lib/cn'

export type EyebrowProps = {
  withLine?: boolean
  tone?: 'forest' | 'cream' | 'gold' | 'stone'
  align?: 'left' | 'center'
  className?: string
  children?: React.ReactNode
}

const toneClass: Record<NonNullable<EyebrowProps['tone']>, string> = {
  forest: 'text-forest-green',
  cream: 'text-cream',
  gold: 'text-gold',
  stone: 'text-stone',
}

export function Eyebrow({
  withLine = true,
  tone = 'forest',
  align = 'left',
  className,
  children,
}: EyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase font-heading',
        toneClass[tone],
        align === 'center' && 'justify-center',
        className,
      )}
    >
      {withLine ? <span aria-hidden className="block h-px w-8 bg-current opacity-70" /> : null}
      <span>{children}</span>
    </div>
  )
}
