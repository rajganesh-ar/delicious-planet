import type { ReactNode } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'

interface Badge {
  label: string
  icon: ReactNode
}

const ICON_PROPS = {
  width: 22,
  height: 22,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

const BADGES: Badge[] = [
  {
    label: 'Authentic Products from Origin',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
        <path d="M12 3a15 15 0 0 0 0 18 15 15 0 0 0 0-18z" />
      </svg>
    ),
  },
  {
    label: 'Fast International Delivery',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M1 7h12v10H1zM13 10h4.5l3.5 3.5V17h-8z" />
        <circle cx="5.5" cy="19" r="1.8" />
        <circle cx="17.5" cy="19" r="1.8" />
      </svg>
    ),
  },
  {
    label: 'Premium Quality Guaranteed',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 2.5 4.5 5.8v5.4c0 4.6 3.2 8.7 7.5 10.3 4.3-1.6 7.5-5.7 7.5-10.3V5.8z" />
        <path d="m9 12 2.2 2.2L15.4 10" />
      </svg>
    ),
  },
  {
    label: 'Carefully Selected Suppliers',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M20 8c0 4.5-4 8.5-8 12-4-3.5-8-7.5-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="8" r="2.6" />
      </svg>
    ),
  },
  {
    label: 'Secure Payments',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="10" width="18" height="11" rx="2" />
        <path d="M7.5 10V6.8a4.5 4.5 0 0 1 9 0V10" />
        <circle cx="12" cy="15.5" r="1.2" />
      </svg>
    ),
  },
]

export function TrustBadges() {
  return (
    <section className="pb-2 md:pb-3">
      <FadeIn>
        <ul className="list-none m-0 p-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 border border-stone/15 rounded-sm bg-white overflow-hidden">
          {BADGES.map((badge) => (
            <li
              key={badge.label}
              className="flex items-center gap-2.5 px-4 py-4 md:py-5 border-b border-r border-stone/10 last:border-r-0 xl:border-b-0"
            >
              <span className="shrink-0 text-forest-green">{badge.icon}</span>
              <span className="font-sans text-[11px] md:text-[11.5px] text-stone leading-snug">
                {badge.label}
              </span>
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  )
}
