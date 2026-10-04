import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'
import type { BrandMark } from '@/lib/brand-marks'

/** The row is five across at lg — more would wrap into a ragged second line. */
export const BRAND_STRIP_MARKS = 5

interface BrandStripProps {
  /** Resolved brand marks — logos first, then wordmarks. */
  marks: BrandMark[]
}

export function BrandStrip({ marks }: BrandStripProps) {
  const shown = marks.slice(0, BRAND_STRIP_MARKS)
  if (shown.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Brands We Carry" href="/brands" className="mb-5 md:mb-7" />

      {/* Border-grid with filler cells — see the note in TrustBadges. Five marks
          leave an orphan at two and three columns, which `last:border-r-0`
          cannot close. */}
      <FadeIn>
        <ul className="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-l border-t border-stone/15 bg-white">
          {shown.map((mark) => (
            <li
              key={mark.slug}
              className="border-b border-r border-stone/15"
            >
              <Link
                href={`/products?brand=${mark.slug}`}
                className="group flex items-center justify-center h-20 md:h-24 px-4 no-underline"
              >
                {mark.src ? (
                  <Image
                    src={mark.src}
                    alt={mark.name}
                    width={120}
                    height={48}
                    className="max-h-10 w-auto object-contain opacity-75 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="font-luxury text-base md:text-lg font-semibold text-obsidian/60 text-center leading-tight transition-colors duration-300 group-hover:text-obsidian">
                    {mark.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
          {/* 5 % 2 = 1 filler at base, 5 % 3 = 2 at sm, none at lg */}
          <li aria-hidden="true" className="border-b border-r border-stone/15 lg:hidden" />
          <li aria-hidden="true" className="hidden sm:block lg:hidden border-b border-r border-stone/15" />
        </ul>
      </FadeIn>
    </section>
  )
}
