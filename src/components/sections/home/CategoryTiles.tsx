import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'
import { getCollectionImage } from '@/lib/images'
import type { ProductCollection } from '@/payload-types'

interface CategoryTilesProps {
  /**
   * Product collections — in this store `categories` model regions, so the
   * product-type taxonomy the mock calls "categories" lives in collections.
   */
  collections: ProductCollection[]
}

export function CategoryTiles({ collections }: CategoryTilesProps) {
  if (collections.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Shop by Category" href="/products" className="mb-5 md:mb-7" />

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {collections.map((col, i) => {
            const imgUrl = getCollectionImage(col)
            return (
              <FadeIn key={col.id} delay={i * 0.05}>
                <Link
                  href={`/products?collection=${col.slug}`}
                  className="group block no-underline text-center"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-[#f5f4f1]">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-mist to-parchment" />
                    )}
                  </div>
                  <p className="font-sans text-[11px] md:text-xs text-obsidian m-0 mt-2 leading-snug line-clamp-2 transition-colors group-hover:text-forest-green">
                    {col.title}
                  </p>
                </Link>
              </FadeIn>
            )
        })}
      </div>
    </section>
  )
}
