import * as React from 'react'
import { cn } from '@/lib/cn'

type Tone = 'cream' | 'parchment' | 'obsidian' | 'forest' | 'transparent'
type Spacing = 'sm' | 'md' | 'lg' | 'none'

const toneClass: Record<Tone, string> = {
  cream: 'bg-cream text-obsidian',
  parchment: 'bg-parchment text-obsidian',
  obsidian: 'bg-obsidian text-cream',
  forest: 'bg-forest-green text-cream',
  transparent: '',
}

const spacingClass: Record<Spacing, string> = {
  sm: 'py-8 sm:py-10 md:py-12 lg:py-16',
  md: 'py-12 sm:py-16 md:py-20 lg:py-24',
  lg: 'py-16 sm:py-20 md:py-24 lg:py-32',
  none: '',
}

export type SectionProps = {
  tone?: Tone
  spacing?: Spacing
  as?: 'section' | 'div' | 'article' | 'header' | 'footer'
  className?: string
  children?: React.ReactNode
  id?: string
}

export function Section({
  tone = 'transparent',
  spacing = 'md',
  as = 'section',
  className,
  children,
  id,
}: SectionProps) {
  const Tag = as as keyof React.JSX.IntrinsicElements
  return React.createElement(
    Tag,
    {
      id,
      className: cn(toneClass[tone], spacingClass[spacing], className),
    },
    children,
  )
}
