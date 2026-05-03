import * as React from 'react'
import { cn } from '@/lib/cn'

type Tone = 'forest' | 'gold' | 'stone' | 'cream' | 'obsidian' | 'red'

const toneClass: Record<Tone, string> = {
  forest: 'border-forest-green/40 text-forest-green bg-forest-green/5',
  gold: 'border-gold/50 text-gold-dark bg-gold/10',
  stone: 'border-stone/30 text-stone bg-transparent',
  cream: 'border-cream/40 text-cream bg-cream/10',
  obsidian: 'border-obsidian/20 text-obsidian bg-transparent',
  red: 'border-red-500/40 text-red-600 bg-red-500/5',
}

export type BadgeProps = {
  tone?: Tone
  className?: string
  children?: React.ReactNode
}

export function Badge({ tone = 'forest', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-[10px] tracking-[0.18em] uppercase rounded-pill border font-heading',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
