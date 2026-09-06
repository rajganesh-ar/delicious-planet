'use client'

import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { Eyebrow, GUTTER } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

/**
 * The frame every portal page sits in.
 *
 * An obsidian masthead over a cream body — the same relationship the account
 * console uses, so a partner signing in does not feel like they have left the
 * site. The masthead is deliberately shallow: these are pages people come to
 * do something on, and a full-height hero would push the first field below the
 * fold on a laptop.
 *
 * styles.css declares unlayered `a`, `h1`–`h6` and `p` rules that outrank
 * Tailwind's layered utilities — colour on child spans, margins with `!`.
 */

export function PortalMasthead({
  eyebrow,
  title,
  lede,
  back,
  aside,
}: {
  eyebrow: string
  title: React.ReactNode
  lede?: string
  /** Breadcrumb out of the current page. */
  back?: { href: string; label: string }
  /** Right-hand slot — a status chip, or a secondary action. */
  aside?: React.ReactNode
}) {
  return (
    <header className="bg-obsidian">
      <div className={cn(GUTTER, 'pt-8 pb-7 md:pt-11 md:pb-9')}>
        {back ? (
          <Link href={back.href} className="no-underline inline-flex items-center gap-2 min-h-11">
            <span aria-hidden className="font-sans text-[13px] text-cream/45">
              ←
            </span>
            <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-cream/55 hover:text-cream transition-colors">
              {back.label}
            </span>
          </Link>
        ) : null}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-10">
          <div className="min-w-0">
            <FadeIn>
              <Eyebrow tone="light" className={back ? 'mt-3' : undefined}>
                {eyebrow}
              </Eyebrow>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h1 className="m-0! mt-2.5!">
                <span className="block font-luxury text-cream font-semibold leading-[1.14] tracking-tight text-[clamp(1.6rem,4vw,2.5rem)]">
                  {title}
                </span>
              </h1>
            </FadeIn>
            {lede ? (
              <FadeIn delay={0.1}>
                <p className="m-0! mt-3! font-sans text-cream/70 text-[13px] md:text-sm leading-relaxed max-w-2xl">
                  {lede}
                </p>
              </FadeIn>
            ) : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </div>
    </header>
  )
}

export interface PortalStep {
  key: string
  label: string
  blurb?: string
}

/**
 * The step rail.
 *
 * Horizontal and scrollable below `lg`, a column beside the form above it.
 * Completed steps stay clickable — an applicant who realises on step six that
 * they mistyped an email should not have to walk back through five screens to
 * fix it.
 */
export function StepRail({
  steps,
  current,
  furthest,
  onSelect,
}: {
  steps: PortalStep[]
  current: number
  /** Highest step reached, so no unseen step is clickable. */
  furthest: number
  onSelect: (index: number) => void
}) {
  return (
    <nav aria-label="Application steps" className="lg:sticky lg:top-24">
      <ol className="list-none m-0 p-0 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {steps.map((step, index) => {
          const active = index === current
          const reachable = index <= furthest
          const done = index < furthest

          return (
            <li key={step.key} className="shrink-0 lg:shrink">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onSelect(index)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 rounded-sm border transition-colors min-h-11',
                  reachable ? 'cursor-pointer' : 'cursor-not-allowed',
                  active
                    ? 'bg-obsidian border-obsidian'
                    : reachable
                      ? 'bg-white border-stone/20 hover:border-forest-green/45'
                      : 'bg-transparent border-stone/12',
                )}
              >
                <span className="flex items-baseline gap-2.5">
                  <span
                    className={cn(
                      'font-luxury text-[13px] leading-none',
                      active ? 'text-gold' : done ? 'text-forest-green' : 'text-stone/50',
                    )}
                  >
                    {done ? '✓' : String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'font-sans text-[12.5px] font-medium whitespace-nowrap lg:whitespace-normal',
                      active ? 'text-cream' : reachable ? 'text-obsidian' : 'text-stone/45',
                    )}
                  >
                    {step.label}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** The card a step's fields sit on. */
export function PortalPanel({
  title,
  blurb,
  children,
  footer,
}: {
  title: string
  blurb?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="bg-white border border-stone/15 rounded-sm">
      <div className="px-4 md:px-6 py-4 md:py-5 border-b border-stone/12">
        <h2 className="m-0!">
          <span className="block font-luxury text-lg md:text-xl font-semibold text-obsidian leading-tight">
            {title}
          </span>
        </h2>
        {blurb ? (
          <p className="m-0! mt-1.5! font-sans text-[12.5px] text-stone leading-relaxed max-w-2xl">
            {blurb}
          </p>
        ) : null}
      </div>
      <div className="px-4 md:px-6 py-5 md:py-6 flex flex-col gap-5">{children}</div>
      {footer ? (
        <div className="px-4 md:px-6 py-4 border-t border-stone/12 bg-parchment/60">{footer}</div>
      ) : null}
    </section>
  )
}

/** Small status pill — used for a recipe's state and an application's stage. */
export function StatusChip({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'neutral' | 'progress' | 'good' | 'warn'
}) {
  const shell = {
    neutral: 'bg-stone/12 text-stone',
    progress: 'bg-gold/20 text-obsidian',
    good: 'bg-forest-green text-cream',
    warn: 'bg-red-50 text-red-700 border border-red-200',
  }[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center h-6 px-2.5 rounded-sm font-sans text-[10px] uppercase tracking-[0.14em] font-medium',
        shell,
      )}
    >
      {label}
    </span>
  )
}
