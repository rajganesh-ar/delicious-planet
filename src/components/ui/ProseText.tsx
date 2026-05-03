import * as React from 'react'
import { cn } from '@/lib/cn'

type Size = 'sm' | 'md' | 'lg'

const sizeClass: Record<Size, string> = {
  sm: 'text-[13px] sm:text-[14px] leading-[1.6]',
  md: 'text-[15px] sm:text-[16px] leading-[1.65]',
  lg: 'text-[16px] sm:text-[18px] leading-[1.7]',
}

export type ProseTextProps = {
  as?: 'p' | 'div' | 'span'
  size?: Size
  prose?: boolean
  tone?: 'default' | 'muted' | 'cream' | 'inverse'
  className?: string
  children?: React.ReactNode
}

const toneClass: Record<NonNullable<ProseTextProps['tone']>, string> = {
  default: 'text-obsidian/85',
  muted: 'text-stone',
  cream: 'text-cream/85',
  inverse: 'text-cream/90',
}

export function ProseText({
  as = 'p',
  size = 'md',
  prose,
  tone = 'default',
  className,
  children,
}: ProseTextProps) {
  const Tag = as as keyof React.JSX.IntrinsicElements
  return React.createElement(
    Tag,
    {
      className: cn(
        'font-sans',
        sizeClass[size],
        toneClass[tone],
        prose && 'max-w-prose',
        className,
      ),
    },
    children,
  )
}
