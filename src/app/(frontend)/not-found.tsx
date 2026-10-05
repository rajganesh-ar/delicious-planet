import type { Metadata } from 'next'
import { Cta, Eyebrow, GUTTER } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

export const metadata: Metadata = {
  title: 'Page not found',
}

/**
 * Rendered by every `notFound()` call — the product, category and journal detail
 * routes all reach it. It sits inside the (frontend) layout, so the navbar and
 * footer come for free and a dead link stays inside the site rather than
 * dropping the visitor onto Next's unstyled default.
 *
 * styles.css declares unlayered h1/p typography that outranks Tailwind's
 * layered utilities, so the visuals live on a child span and the margins carry
 * an important override — the same pattern as the editorial pages.
 */
export default function NotFound() {
  return (
    <section className={cn(GUTTER, 'bg-cream py-20 md:py-28')}>
      <div className="max-w-xl">
        <Eyebrow>404</Eyebrow>

        <h1 className="m-0! mt-3!">
          <span className="block font-luxury text-obsidian font-semibold leading-[1.1] tracking-tight text-[clamp(1.9rem,4.5vw,3rem)]">
            We couldn&rsquo;t find that page
          </span>
        </h1>

        <p className="m-0! mt-4! font-sans text-stone text-sm md:text-[15px] leading-relaxed">
          The link may be out of date, or the product may no longer be part of the
          catalogue. The full shop or the category index are good places to pick the thread back up.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Cta href="/products">Browse all products</Cta>
          <Cta href="/categories" variant="dark-outline">
            Shop by category
          </Cta>
        </div>
      </div>
    </section>
  )
}
