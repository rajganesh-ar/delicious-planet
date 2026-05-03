import * as React from 'react'
import { cn } from '@/lib/cn'

type Size = 'sm' | 'md' | 'lg' | 'full'

const sizeClass: Record<Size, string> = {
  sm: 'max-w-[720px]',
  md: 'max-w-[960px]',
  lg: 'max-w-[1280px]',
  full: 'max-w-none',
}

export type ContainerProps = {
  size?: Size
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer'
  className?: string
  children?: React.ReactNode
}

export function Container({
  size = 'lg',
  as = 'div',
  className,
  children,
}: ContainerProps) {
  const Tag = as as keyof React.JSX.IntrinsicElements
  return React.createElement(
    Tag,
    {
      className: cn(
        'mx-auto w-full px-5 sm:px-6 md:px-8 lg:px-12',
        sizeClass[size],
        className,
      ),
    },
    children,
  )
}
