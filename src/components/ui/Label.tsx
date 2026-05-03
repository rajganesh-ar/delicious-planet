import * as React from 'react'
import { cn } from '@/lib/cn'

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, children, ...rest }: LabelProps) {
  return (
    <label
      className={cn(
        'block text-[11px] tracking-[0.18em] uppercase font-heading text-stone mb-2',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  )
}
