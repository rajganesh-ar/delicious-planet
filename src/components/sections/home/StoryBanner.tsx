import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'

export function StoryBanner() {
  return (
    <section className="py-8 md:py-11">
      <FadeIn>
          <div className="relative overflow-hidden rounded-sm bg-obsidian min-h-65 md:min-h-80 lg:min-h-90 flex items-center">
            <Image
              src="/images/misc/philosophy.avif"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-obsidian/90 via-obsidian/65 to-obsidian/20" />

            <div className="relative z-10 max-w-lg px-6 md:px-10 lg:px-14 py-10">
              <h2 className="m-0!">
                <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-2xl md:text-3xl lg:text-[34px]">
                  A Journey Through Global Flavors
                </span>
              </h2>
              <p className="font-sans text-cream/75 text-[13px] md:text-sm leading-relaxed m-0 mt-3 md:mt-4">
                We bring authentic culinary traditions from around the world to your table,
                connecting cultures through food — one carefully sourced ingredient at a time.
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center justify-center h-10 px-6 mt-6 bg-transparent no-underline border border-cream/45 rounded-sm transition-colors hover:bg-cream hover:border-cream"
              >
                <span className="text-cream group-hover:text-obsidian text-[10px] uppercase tracking-[0.16em] font-heading font-semibold transition-colors">
                  Learn Our Story
                </span>
              </Link>
            </div>
        </div>
      </FadeIn>
    </section>
  )
}
