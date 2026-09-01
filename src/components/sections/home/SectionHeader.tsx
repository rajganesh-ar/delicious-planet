import type { ReactNode } from 'react'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'

interface SectionHeaderProps {
  title: string
  /** Optional right-aligned link, e.g. { label: 'View all', href: '/products' } */
  href?: string
  linkLabel?: string
  tone?: 'light' | 'dark'
  className?: string
  /** Right-aligned controls (e.g. carousel arrows). Replaces the link. */
  action?: ReactNode
}

/**
 * "Heading ............ View all" row used at the top of every homepage rail.
 */
export function SectionHeader({
  title,
  href,
  linkLabel = 'View all',
  tone = 'light',
  className = '',
  action,
}: SectionHeaderProps) {
  const titleColor = tone === 'dark' ? 'text-cream' : 'text-obsidian'
  const linkColor =
    tone === 'dark'
      ? 'text-cream/60 group-hover:text-cream'
      : 'text-stone group-hover:text-forest-green'

  return (
    <FadeIn>
      <div className={`flex items-baseline justify-between gap-4 ${className}`}>
        {/* styles.css sets unlayered h1–h6 typography that outranks Tailwind's
            layered utilities, so the visual styling lives on a child span and
            only the margin needs an important override. */}
        <h2 className="m-0!">
          <span
            className={`block font-luxury text-xl sm:text-2xl lg:text-[28px] font-semibold tracking-tight ${titleColor}`}
          >
            {title}
          </span>
        </h2>
        {action}

        {/* Colour sits on the span — `a { color: currentColor }` in styles.css is
            unlayered and outranks text utilities set on the anchor itself. */}
        {!action && href && (
          <Link href={href} className="group shrink-0 no-underline">
            <span className={`text-[11px] sm:text-xs font-sans transition-colors ${linkColor}`}>
              {linkLabel}
            </span>
          </Link>
        )}
      </div>
    </FadeIn>
  )
}
