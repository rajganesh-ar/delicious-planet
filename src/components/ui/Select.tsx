import * as React from 'react'
import { cn } from '@/lib/cn'
import { baseInputClass } from './Input'

const chevronBg = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%23111111' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round'/></svg>")`

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        baseInputClass,
        'appearance-none pr-10 cursor-pointer',
        invalid && 'border-red-500 focus:border-red-500',
        className,
      )}
      style={{
        backgroundImage: chevronBg,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
      }}
      {...rest}
    >
      {children}
    </select>
  )
})
