import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'
import type { Testimonial } from '@/payload-types'

interface TestimonialStripProps {
  testimonials: Testimonial[]
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={i < rating ? 'text-gold' : 'text-stone/25'}
          fill="currentColor"
        >
          <path d="m12 2 3 6.6 7 .9-5.1 4.8 1.3 7L12 18l-6.2 3.3 1.3-7L2 9.5l7-.9z" />
        </svg>
      ))}
    </div>
  )
}

export function TestimonialStrip({ testimonials }: TestimonialStripProps) {
  if (testimonials.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="What Our Customers Say" className="mb-5 md:mb-7" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {testimonials.slice(0, 3).map((t, i) => (
          <FadeIn key={t.id} delay={i * 0.06}>
            <figure className="flex flex-col h-full m-0 p-4 md:p-5 bg-white border border-stone/15 rounded-sm">
              <Stars rating={t.rating ?? 5} />
              <blockquote className="grow m-0 mt-3 font-sans text-[12.5px] text-stone leading-relaxed line-clamp-4">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-3.5 pt-3 border-t border-stone/10">
                <span className="block font-sans text-[12px] font-medium text-obsidian leading-tight">
                  {t.name}
                </span>
                {(t.role || t.company) && (
                  <span className="block font-sans text-[11px] text-stone/60 leading-tight mt-0.5">
                    {[t.role, t.company].filter(Boolean).join(', ')}
                  </span>
                )}
              </figcaption>
            </figure>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
