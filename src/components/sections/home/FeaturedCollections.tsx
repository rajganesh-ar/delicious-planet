import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'
import { getCollectionImage } from '@/lib/images'
import type { ProductCollection } from '@/payload-types'

interface FeaturedCollectionsProps {
  collections: ProductCollection[]
}

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  if (collections.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Featured Collections" href="/products" className="mb-5 md:mb-7" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {collections.map((col, i) => {
            const imgUrl = getCollectionImage(col)
            return (
              <FadeIn key={col.id} delay={i * 0.06}>
                <Link
                  href={`/products?collection=${col.slug}`}
                  className="group relative block no-underline overflow-hidden rounded-sm aspect-4/3 bg-charcoal"
                >
                  {imgUrl && (
                    <Image
                      src={imgUrl}
                      alt={col.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 24vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian/90 via-obsidian/45 to-obsidian/15 transition-colors duration-500 group-hover:from-obsidian/95" />

                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-3 md:p-5">
                    <h3 className="m-0!">
                      <span className="block font-luxury text-cream font-semibold leading-tight tracking-tight text-base md:text-lg lg:text-xl line-clamp-2">
                        {col.title}
                      </span>
                    </h3>
                    <span className="mt-3 inline-flex w-fit items-center h-8 px-3.5 bg-cream/95 text-obsidian text-[9px] md:text-[10px] uppercase tracking-[0.14em] font-heading font-semibold rounded-sm transition-colors group-hover:bg-forest-green group-hover:text-cream">
                      Shop Collection
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
