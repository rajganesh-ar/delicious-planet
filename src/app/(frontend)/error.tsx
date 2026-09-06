'use client'

import { useEffect } from 'react'
import { Cta, Eyebrow, GUTTER } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

/**
 * Catches a render or data-fetch throw anywhere under the (frontend) layout.
 *
 * Without this file Next falls back to its own unstyled error screen, which on
 * a production build says only "Application error: a client-side exception has
 * occurred" — no navbar, no way back into the site. This keeps the visitor
 * inside the storefront and gives them something to do.
 *
 * `reset()` re-renders the failed segment. It is worth offering because most of
 * what throws here is a transient database or R2 read rather than a bad route,
 * and those succeed on a second attempt.
 *
 * Note this is a client component and cannot be an async server one — that is a
 * framework requirement for error boundaries, not a stylistic choice.
 */
export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // The digest is the only handle on the server-side stack, which Next
    // deliberately withholds from the browser in production. Logging it here is
    // what makes a report from a visitor traceable to a server log line.
    console.error('Storefront error', { digest: error.digest, message: error.message })
  }, [error])

  return (
    <section className={cn(GUTTER, 'bg-cream py-20 md:py-28')}>
      <div className="max-w-xl">
        <Eyebrow>Something went wrong</Eyebrow>

        <h1 className="m-0! mt-3!">
          <span className="block font-luxury text-obsidian font-semibold leading-[1.1] tracking-tight text-[clamp(1.9rem,4.5vw,3rem)]">
            This page didn&rsquo;t load
          </span>
        </h1>

        <p className="m-0! mt-4! font-sans text-stone text-sm md:text-[15px] leading-relaxed">
          Something on our side failed while putting this page together. Your basket is
          untouched — trying again usually clears it.
        </p>

        {error.digest && (
          <p className="m-0! mt-3! font-mono text-xs text-stone/60">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-sm bg-obsidian text-cream font-sans text-[13px] uppercase tracking-[0.14em] border-0 cursor-pointer transition-colors hover:bg-charcoal"
          >
            Try again
          </button>
          <Cta href="/products" variant="dark-outline">
            Browse all products
          </Cta>
        </div>
      </div>
    </section>
  )
}
