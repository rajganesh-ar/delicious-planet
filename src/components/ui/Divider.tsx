import * as React from 'react'
import { cn } from '@/lib/cn'
import { WaveDivider } from './WaveDivider'

type Variant = 'hairline' | 'accent' | 'wave' | 'dotted'
type Tone = 'mist' | 'obsidian' | 'gold' | 'forest' | 'cream'
type Orientation = 'horizontal' | 'vertical'

const toneClass: Record<Tone, { border: string; bg: string }> = {
  mist: { border: 'border-mist/60', bg: 'bg-mist' },
  obsidian: { border: 'border-obsidian/20', bg: 'bg-obsidian' },
  gold: { border: 'border-gold/60', bg: 'bg-gold' },
  forest: { border: 'border-forest-green/40', bg: 'bg-forest-green' },
  cream: { border: 'border-cream/30', bg: 'bg-cream' },
}

export type DividerProps = {
  variant?: Variant
  tone?: Tone
  orientation?: Orientation
  className?: string
  /** width of accent/dotted in tailwind size class, e.g. 'w-12' */
  length?: string
  /** for wave variant: pass through to WaveDivider */
  waveProps?: React.ComponentProps<typeof WaveDivider>
}

export function Divider({
  variant = 'hairline',
  tone = 'mist',
  orientation = 'horizontal',
  className,
  length,
  waveProps,
}: DividerProps) {
  if (variant === 'wave') {
    return <WaveDivider {...waveProps} />
  }

  if (variant === 'accent') {
    return (
      <span
        aria-hidden
        className={cn('block h-px', length ?? 'w-12', toneClass[tone].bg, className)}
      />
    )
  }

  if (variant === 'dotted') {
    return (
      <hr
        className={cn(
          'border-0 border-t border-dotted',
          toneClass[tone].border,
          orientation === 'vertical' && 'border-t-0 border-l h-full w-0',
          className,
        )}
      />
    )
  }

  return (
    <hr
      className={cn(
        'border-0 border-t',
        toneClass[tone].border,
        orientation === 'vertical' && 'border-t-0 border-l h-full w-0',
        className,
      )}
    />
  )
}
