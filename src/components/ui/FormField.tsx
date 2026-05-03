import * as React from 'react'
import { cn } from '@/lib/cn'
import { Label } from './Label'

export type FormFieldProps = {
  label?: React.ReactNode
  htmlFor?: string
  hint?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-forest-green ml-1">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-[12px] text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-stone/80 mt-1">{hint}</p>
      ) : null}
    </div>
  )
}
