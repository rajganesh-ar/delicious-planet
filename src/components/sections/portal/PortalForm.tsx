'use client'

import { cn } from '@/lib/cn'
import type { SelectOption } from '@/lib/portal-options'

/**
 * Form primitives for the partner portal.
 *
 * The storefront already has a set of these in AuthShell, tuned for a column
 * of four fields on a split page. The portal asks sixty across seven steps, so
 * it needs things that set does not have: a two-column grid that collapses,
 * chip-style multi-select, a legible checkbox row, and repeatable groups.
 *
 * Same tokens as everywhere else — 12px caps labels in stone, `rounded-sm`,
 * forest as the focus and action colour. styles.css declares unlayered `a`,
 * `h1`–`h6` and `p` rules that outrank Tailwind's layered utilities, so colour
 * lives on child spans and margins carry `!`.
 */

/** Matches authInputClass; 16px on mobile so iOS does not zoom on focus. */
export const fieldClass =
  'w-full h-12 px-3.5 rounded-sm border border-stone/25 bg-white font-sans text-[16px] sm:text-[14px] text-obsidian placeholder:text-stone/45 outline-none focus:border-forest-green transition-colors'

export const areaClass = cn(fieldClass, 'h-auto min-h-28 py-3 leading-relaxed resize-y')

export function Field({
  label,
  htmlFor,
  hint,
  required,
  span,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  required?: boolean
  /** `full` breaks out of the two-column grid — long text, mostly. */
  span?: 'full'
  children: React.ReactNode
}) {
  return (
    <div className={cn('min-w-0', span === 'full' && 'sm:col-span-2')}>
      <label
        htmlFor={htmlFor}
        className="block font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone mb-1.5"
      >
        {label}
        {required ? (
          <span aria-hidden className="text-forest-green ml-1">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="m-0! mt-1.5! font-sans text-[11.5px] text-stone/75 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  )
}

/** The two-column body every step lays its fields out in. */
export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">{children}</div>
}

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly SelectOption[]
  placeholder?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(fieldClass, 'cursor-pointer appearance-none pr-9 bg-no-repeat')}
      style={{
        // A caret drawn here rather than pulled from an icon set: it is one
        // glyph on a control that appears forty times in this form.
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b6b6b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 14px center',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

/**
 * Multi-select as a chip field.
 *
 * A native multiple <select> is close to unusable on a phone and invisible on
 * a desktop — nobody discovers that ctrl-click is what the control wanted. A
 * grid of toggles shows every option and its state at once, which is what a
 * question like "which certifications do you hold" actually needs.
 */
export function ChipSelect({
  options,
  values,
  onChange,
  columns = 2,
}: {
  options: readonly SelectOption[]
  values: string[]
  onChange: (values: string[]) => void
  columns?: 1 | 2 | 3
}) {
  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }

  return (
    <div
      className={cn(
        'grid gap-2',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {options.map((option) => {
        const active = values.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              'text-left px-3.5 py-2.5 rounded-sm border transition-colors cursor-pointer min-h-11',
              active
                ? 'bg-forest-green border-forest-green'
                : 'bg-white border-stone/25 hover:border-forest-green/50',
            )}
          >
            <span
              className={cn(
                'font-sans text-[12.5px] leading-snug',
                active ? 'text-cream' : 'text-obsidian',
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function CheckboxRow({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-[18px] h-[18px] shrink-0 accent-[#1B512D] cursor-pointer"
      />
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-sans text-[13px] text-obsidian leading-relaxed">{label}</span>
        {hint ? (
          <span className="block font-sans text-[11.5px] text-stone/80 leading-relaxed mt-0.5">
            {hint}
          </span>
        ) : null}
      </label>
    </div>
  )
}

/** Heading above a group of fields inside a step. */
export function FieldsetHead({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <div className="border-t border-stone/15 pt-5 mt-1">
      <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
        {title}
      </span>
      {blurb ? (
        <p className="m-0! mt-1! font-sans text-[12.5px] text-stone leading-relaxed">{blurb}</p>
      ) : null}
    </div>
  )
}

/** A repeatable group — trade references, qualifications, ingredients. */
export function RepeatableRow({
  index,
  label,
  onRemove,
  removable = true,
  children,
}: {
  index: number
  label: string
  onRemove: () => void
  removable?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-sm border border-stone/20 bg-white p-3.5 md:p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
          {label} {String(index + 1).padStart(2, '0')}
        </span>
        {removable ? (
          <button
            type="button"
            onClick={onRemove}
            className="bg-transparent border-0 cursor-pointer p-1 -m-1"
          >
            <span className="font-sans text-[11.5px] text-stone hover:text-red-700 transition-colors">
              Remove
            </span>
          </button>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function AddRowButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-11 rounded-sm border border-dashed border-stone/35 bg-transparent hover:border-forest-green hover:bg-forest-green/5 transition-colors cursor-pointer"
    >
      <span className="font-sans text-[12px] uppercase tracking-[0.14em] font-medium text-forest-green">
        {children}
      </span>
    </button>
  )
}

export function Alert({
  children,
  tone = 'error',
}: {
  children: React.ReactNode
  tone?: 'error' | 'success' | 'info'
}) {
  const shell =
    tone === 'error'
      ? 'bg-red-50 border-red-200'
      : tone === 'success'
        ? 'bg-forest-green/8 border-forest-green/25'
        : 'bg-gold/10 border-gold/35'
  const text =
    tone === 'error' ? 'text-red-700' : tone === 'success' ? 'text-forest-green' : 'text-obsidian'

  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-sm px-4 py-3 border', shell)}>
      <p className={cn('m-0! font-sans text-[12.5px] leading-relaxed', text)}>{children}</p>
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-12 px-7 rounded-sm bg-forest-green hover:bg-bud-green border-0 cursor-pointer transition-colors disabled:opacity-55 disabled:cursor-not-allowed',
        className,
      )}
    >
      <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-cream">
        {children}
      </span>
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-12 px-7 rounded-sm bg-transparent border border-stone/30 hover:border-obsidian cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-obsidian">
        {children}
      </span>
    </button>
  )
}
