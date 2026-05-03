import * as React from 'react'
import { cn } from '@/lib/cn'
import { baseInputClass } from './Input'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        baseInputClass,
        'min-h-[120px] resize-y',
        invalid && 'border-red-500 focus:border-red-500',
        className,
      )}
      {...rest}
    />
  )
})
