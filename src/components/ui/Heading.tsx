import * as React from 'react'
import { cn } from '@/lib/cn'

type Variant = 'display' | 'section' | 'card' | 'eyebrow-pair'
type As = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const variantClass: Record<Variant, string> = {
  display:
    'font-luxury text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] xl:text-[56px] leading-[1.08] tracking-[-0.03em]',
  section:
    'font-luxury text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] leading-[1.15] tracking-[-0.025em]',
  card: 'font-luxury text-[18px] sm:text-[20px] md:text-[22px] leading-[1.25] tracking-[-0.01em]',
  'eyebrow-pair':
    'font-luxury text-[20px] sm:text-[22px] md:text-[24px] leading-[1.2] tracking-[-0.01em]',
}

export type HeadingProps = {
  as?: As
  variant?: Variant
  align?: 'left' | 'center' | 'right'
  italic?: boolean
  className?: string
  children?: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLHeadingElement>, 'className' | 'children'>

export function Heading({
  as = 'h2',
  variant = 'section',
  align,
  italic,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = as as keyof React.JSX.IntrinsicElements
  return React.createElement(
    Tag,
    {
      className: cn(
        variantClass[variant],
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        italic && 'italic',
        className,
      ),
      ...rest,
    },
    children,
  )
}
