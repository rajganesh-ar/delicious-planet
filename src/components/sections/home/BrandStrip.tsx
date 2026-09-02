import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'
import type { BrandMark } from '@/lib/brand-marks'

/** The row is five across at lg — more would wrap into a ragged second line. */
const MAX_MARKS = 5

interface BrandStripProps {
  /** Resolved brand marks — CMS logos, falling back to bundled artwork. */
  marks: BrandMark[]
}

export function BrandStrip({ marks }: BrandStripProps) {
  const shown = marks.slice(0, MAX_MARKS)
  if (shown.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Brands We Carry" href="/brands" className="mb-5 md:mb-7" />

      <FadeIn>
        <ul className="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-stone/15 rounded-sm bg-white overflow-hidden">
          {shown.map((mark) => (
            <li
              key={mark.slug}
              className="border-b border-r border-stone/10 last:border-r-0 lg:border-b-0"
            >
              <Link
                href="/brands"
                className="group flex items-center justify-center h-20 md:h-24 px-4 no-underline"
              >
                <Image
                  src={mark.src}
                  alt={mark.name}
                  width={120}
                  height={48}
                  className="max-h-10 w-auto object-contain opacity-75 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  )
}
