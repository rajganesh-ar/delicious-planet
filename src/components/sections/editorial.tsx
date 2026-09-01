import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { cn } from '@/lib/cn'

/**
 * Shared primitives for the editorial content pages (About, Contact, Sourcing,
 * Sustainability, FAQ).
 *
 * Everything here is tuned to the homepage so the storefront and the content
 * pages read as one site: the same uncapped gutter as the navbar and footer,
 * the same section rhythm, the same type ramp, and `rounded-sm` throughout.
 *
 * styles.css sets unlayered h1–h6 / p typography that outranks Tailwind's
 * layered utilities, so visual styling lives on a child span and margins need
 * an important override — the same pattern as the homepage rails.
 */

/** Page gutter. Matches the homepage, navbar and footer. */
export const GUTTER = 'px-6 lg:px-16'
/** Homepage section rhythm. */
export const BAND = 'py-8 md:py-11'

export type Tone = 'dark' | 'light'

export function Eyebrow({
  children,
  tone = 'dark',
  className,
}: {
  children: React.ReactNode
  /** `dark` = forest on a light ground, `light` = gold on a dark ground. */
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'block font-sans text-[10px] md:text-[11px] uppercase tracking-[0.16em] font-medium',
        tone === 'dark' ? 'text-forest-green' : 'text-gold',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** "Eyebrow + heading ................ supporting line" row above a section. */
export function SectionHead({
  eyebrow,
  title,
  lede,
  tone = 'dark',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  lede?: string
  tone?: Tone
  className?: string
}) {
  return (
    <FadeIn>
      <div
        className={cn(
          'flex flex-col lg:flex-row lg:items-end justify-between gap-2.5 lg:gap-10 mb-5 md:mb-7',
          className,
        )}
      >
        <div className="min-w-0">
          {eyebrow ? <Eyebrow tone={tone} className="mb-2">{eyebrow}</Eyebrow> : null}
          <h2 className="m-0!">
            <span
              className={cn(
                'block font-luxury text-xl sm:text-2xl lg:text-[28px] font-semibold tracking-tight',
                tone === 'dark' ? 'text-obsidian' : 'text-cream',
              )}
            >
              {title}
            </span>
          </h2>
        </div>
        {lede ? (
          <p
            className={cn(
              'm-0! font-sans text-[13px] md:text-sm leading-relaxed lg:max-w-md lg:text-right',
              tone === 'dark' ? 'text-stone' : 'text-cream/60',
            )}
          >
            {lede}
          </p>
        ) : null}
      </div>
    </FadeIn>
  )
}

type CtaVariant =
  /** Forest fill — the default action on a light ground. */
  | 'solid'
  /** Cream outline — for dark or forest grounds. */
  | 'outline'
  /** Cream fill — the default action on a dark or forest ground. */
  | 'light'
  /** Obsidian outline — a secondary action on a light ground. */
  | 'dark-outline'

const CTA_SHELL: Record<CtaVariant, string> = {
  solid: 'bg-forest-green hover:bg-bud-green',
  outline: 'bg-transparent border border-cream/45 hover:bg-cream hover:border-cream',
  light: 'bg-cream border border-cream hover:bg-gold hover:border-gold',
  'dark-outline': 'bg-transparent border border-stone/35 hover:bg-obsidian hover:border-obsidian',
}

const CTA_LABEL: Record<CtaVariant, string> = {
  solid: 'text-cream',
  outline: 'text-cream group-hover:text-obsidian',
  light: 'text-obsidian',
  'dark-outline': 'text-obsidian group-hover:text-cream',
}

/** Homepage CTA button — h-11, 11px caps, rounded-sm. */
export function Cta({
  href,
  children,
  variant = 'solid',
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: CtaVariant
  className?: string
}) {
  const classes = cn(
    'group inline-flex items-center justify-center h-11 px-7 no-underline rounded-sm transition-colors',
    CTA_SHELL[variant],
    className,
  )
  const label = (
    <span
      className={cn(
        'text-[11px] uppercase tracking-[0.16em] font-heading font-semibold transition-colors',
        CTA_LABEL[variant],
      )}
    >
      {children}
    </span>
  )

  // Route-internal targets go through Link so navigation stays client-side;
  // mailto:, tel: and in-page anchors need a plain <a>.
  return href.startsWith('/') ? (
    <Link href={href} className={classes}>
      {label}
    </Link>
  ) : (
    <a href={href} className={classes}>
      {label}
    </a>
  )
}

/** Bulleted point with the house dash marker. */
export function Point({ children, tone = 'dark' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden
        className={cn('shrink-0 mt-2 w-1.5 h-1.5', tone === 'dark' ? 'bg-forest-green' : 'bg-gold')}
      />
      <span
        className={cn(
          'font-sans text-[12.5px] leading-relaxed',
          tone === 'dark' ? 'text-stone' : 'text-cream/70',
        )}
      >
        {children}
      </span>
    </li>
  )
}
