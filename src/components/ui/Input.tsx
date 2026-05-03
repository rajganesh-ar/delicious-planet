import * as React from 'react'
import { cn } from '@/lib/cn'

const baseInputClass =
  'w-full bg-cream border border-mist rounded-sm px-4 py-3 text-[16px] sm:text-[15px] text-obsidian placeholder:text-stone/60 focus:outline-none focus:border-forest-green transition-colors min-h-[48px]'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(baseInputClass, invalid && 'border-red-500 focus:border-red-500', className)}
      {...rest}
    />
  )
})

export { baseInputClass }
