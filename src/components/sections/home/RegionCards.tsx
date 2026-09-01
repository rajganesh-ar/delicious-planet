import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'
import { getCategoryImage } from '@/lib/images'
import { getRegionForCategoryTitle } from '@/lib/regions'
import type { Category } from '@/payload-types'

interface RegionCardsProps {
  /** Top-level CMS categories — this store models regions as categories. */
  categories: Category[]
}

/** "Bite Into Europe" → { eyebrow: 'Bite into', label: 'Europe' } */
function splitTitle(title: string): { eyebrow: string; label: string } {
  const clean = title.trim()
  const match = clean.match(/^bite\s+into\s+(?:the\s+)?(.+)$/i)
  if (match) return { eyebrow: 'Bite into', label: match[1].trim() }
  return { eyebrow: 'Explore', label: clean }
}

export function RegionCards({ categories }: RegionCardsProps) {
  // Only categories that name a region belong here — the collection also holds
  // one-off categories like "Authentic Algerian Products".
  const regionCategories = categories.filter((c) => getRegionForCategoryTitle(c.title))
  if (regionCategories.length === 0) return null

  const columns = regionCategories.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Shop by Region" href="/categories" className="mb-5 md:mb-7" />

      <div className={`grid grid-cols-2 lg:grid-cols-3 ${columns} gap-3 md:gap-4`}>
          {regionCategories.map((cat, i) => {
            const { eyebrow, label } = splitTitle(cat.title)
            const imgUrl = getCategoryImage(cat)
            // Barely any product is assigned to a category yet, so link to the
            // country-filtered listing rather than the near-empty category page.
            const region = getRegionForCategoryTitle(cat.title)!

            return (
              <FadeIn key={cat.id} delay={i * 0.06}>
                <Link
                  href={`/products?region=${region.slug}`}
                  className="group relative block no-underline overflow-hidden rounded-sm aspect-4/3 bg-charcoal"
                >
                  {imgUrl && (
                    <Image
                      src={imgUrl}
                      alt={label}
                      fill
                      sizes="(max-width: 1024px) 50vw, 24vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  {/* Strong bottom scrim — the region artwork is busy and bright */}
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/55 to-obsidian/10 transition-opacity duration-500 opacity-90 group-hover:opacity-100" />

                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-3 md:p-5">
                    <p className="font-sans text-[10px] md:text-[11px] text-cream/70 m-0 leading-none">
                      {eyebrow}
                    </p>
                    <h3 className="m-0! mt-1!">
                      <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-lg md:text-xl lg:text-2xl">
                        {label}
                      </span>
                    </h3>

                    <span className="mt-3 w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-pill border border-cream/50 text-cream flex items-center justify-center transition-colors group-hover:bg-cream group-hover:text-obsidian">
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </FadeIn>
            )
          })}
      </div>
    </section>
  )
}
