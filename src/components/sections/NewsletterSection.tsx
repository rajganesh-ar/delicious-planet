'use client'

import { FadeIn } from '@/components/animations/FadeIn'

export function NewsletterSection() {
  return (
    <section className="py-6 md:py-8 lg:py-10 bg-forest">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-16">
        <FadeIn>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 lg:gap-12">
            {/* Text */}
            <div className="flex items-start lg:items-center gap-4 lg:gap-6 shrink-0">
              <div className="hidden lg:block w-px h-10 bg-cream/20" />
              <div>
                <h2 className="font-serif text-lg md:text-xl lg:text-2xl font-medium text-cream tracking-tight m-0 leading-tight">
                  Join the Journey
                </h2>
                <p className="text-cream/50 text-xs md:text-sm m-0 mt-1">
                  Exclusive offers, new arrivals &amp; producer stories.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              className="flex gap-0 w-full lg:w-auto lg:min-w-[400px]"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-cream/10 border border-cream/20 text-cream text-sm px-5 py-3 rounded-none outline-none placeholder:text-cream/30 focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-cream text-forest text-sm font-medium uppercase tracking-wider px-7 py-3 rounded-none border-0 cursor-pointer hover:bg-gold hover:text-white transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
