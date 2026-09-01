'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ImagePlaceholder } from '@/components/ui'
import { Eyebrow } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

/**
 * Split panel used by sign-in, registration and password reset.
 *
 * The archetype for the account gateway: an obsidian editorial panel on the
 * left carrying the reason to have an account, the form on the right on cream.
 * Below `lg` the panel collapses to a band above the form so the field set is
 * the first thing on screen.
 *
 * styles.css declares unlayered `a`, `h1`–`h6` and `p` rules that outrank
 * Tailwind's layered utilities — colour on child spans, margins with `!`.
 */

export type AuthShellProps = {
  /** Small caps line above the panel headline. */
  eyebrow: string
  /** Panel headline — the argument for the account, not the form's title. */
  panelTitle: React.ReactNode
  panelLede: string
  /** Hairline reasons listed under the panel copy. */
  points?: string[]
  /** Backdrop image for the panel; falls back to a designed placeholder. */
  image?: { src: string | null; label: string }
  /** Form column heading. */
  title: string
  subtitle: string
  children: React.ReactNode
  /** Footer line under the form — usually the link to the other auth page. */
  footer?: React.ReactNode
}

export function AuthShell({
  eyebrow,
  panelTitle,
  panelLede,
  points,
  image,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="bg-cream grid grid-cols-1 lg:grid-cols-12 items-stretch">
      {/* ── Editorial panel ───────────────────────────────── */}
      <aside className="lg:col-span-5 relative bg-obsidian isolate">
        {/* The positioning lives on a wrapper: <ImagePlaceholder> sets its own
            `relative`, and cn() is a plain join, so `absolute` would lose. */}
        {image ? (
          <div className="absolute inset-0 -z-10">
            <ImagePlaceholder
              {...image}
              tone="dark"
              glyph={false}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="w-full h-full"
              imageClassName="opacity-35"
            />
          </div>
        ) : null}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-obsidian/85 via-obsidian/75 to-obsidian"
        />

        <div className="relative px-6 lg:px-12 py-8 lg:py-14 h-full flex flex-col justify-between gap-8">
          <Link href="/" className="no-underline inline-flex items-center gap-2 w-fit">
            <span aria-hidden className="font-sans text-[13px] text-cream/50">
              ←
            </span>
            <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-cream/60 hover:text-cream transition-colors">
              Delicious Planet
            </span>
          </Link>

          <div>
            <Eyebrow tone="light">{eyebrow}</Eyebrow>
            <h2 className="m-0! mt-3!">
              <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-2xl lg:text-[32px]">
                {panelTitle}
              </span>
            </h2>
            <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] lg:text-sm leading-relaxed max-w-md">
              {panelLede}
            </p>

            {points?.length ? (
              <ul className="list-none m-0 p-0 mt-6 max-w-md">
                {points.map((point) => (
                  <li key={point} className="border-t border-cream/12 py-2.5">
                    <span className="font-sans text-[12.5px] text-cream/65 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <p className="m-0! font-sans text-[11px] text-cream/35 leading-relaxed max-w-md hidden lg:block">
            Trade buyers ordering at volume should use the trade desk rather than a retail account —
            terms and pricing are agreed separately.
          </p>
        </div>
      </aside>

      {/* ── Form column ───────────────────────────────────── */}
      <div className="lg:col-span-7 px-6 lg:px-16 py-10 lg:py-16 flex justify-center">
        <motion.div
          className="w-full max-w-[26rem]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="m-0!">
            <span className="block font-luxury text-obsidian font-semibold leading-[1.15] tracking-tight text-[clamp(1.6rem,4vw,2.25rem)]">
              {title}
            </span>
          </h1>
          <p className="m-0! mt-2! font-sans text-[13px] md:text-sm text-stone leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-7">{children}</div>

          {footer ? <div className="mt-7 pt-5 border-t border-stone/15">{footer}</div> : null}
        </motion.div>
      </div>
    </div>
  )
}

/* ── Form primitives, tuned to the storefront ─────────────── */

export function AuthField({
  label,
  htmlFor,
  hint,
  action,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  /** Right-aligned link on the label row, e.g. "Forgot password?". */
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label
          htmlFor={htmlFor}
          className="block font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone"
        >
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint ? <p className="m-0! mt-1.5! font-sans text-[11.5px] text-stone/80">{hint}</p> : null}
    </div>
  )
}

/** 16px on mobile so iOS doesn't zoom the viewport on focus. */
export const authInputClass =
  'w-full h-12 px-3.5 rounded-sm border border-stone/25 bg-white font-sans text-[16px] sm:text-[14px] text-obsidian placeholder:text-stone/50 outline-none focus:border-forest-green transition-colors'

export function AuthSubmit({
  loading,
  children,
  className,
}: {
  loading?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        'w-full h-12 rounded-sm bg-forest-green hover:bg-bud-green transition-colors border-0 cursor-pointer flex items-center justify-center disabled:opacity-60 disabled:cursor-wait',
        className,
      )}
    >
      <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-cream">
        {children}
      </span>
    </button>
  )
}

export function AuthAlert({
  children,
  tone = 'error',
}: {
  children: React.ReactNode
  tone?: 'error' | 'success'
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-sm px-3.5 py-3 border',
        tone === 'error' ? 'bg-red-50 border-red-200' : 'bg-forest-green/8 border-forest-green/25',
      )}
    >
      <p
        className={cn(
          'm-0! font-sans text-[12.5px] leading-relaxed',
          tone === 'error' ? 'text-red-700' : 'text-forest-green',
        )}
      >
        {children}
      </p>
    </div>
  )
}

/** Muted line under the form, with the link colour on a child span. */
export function AuthFooterLink({
  prefix,
  href,
  label,
}: {
  prefix: string
  href: string
  label: string
}) {
  return (
    <p className="m-0! font-sans text-[12.5px] text-stone">
      {prefix}{' '}
      <Link href={href} className="no-underline">
        <span className="text-forest-green font-medium hover:underline underline-offset-2">
          {label}
        </span>
      </Link>
    </p>
  )
}
