import { getPayload } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import config from '@/payload.config'
import { FadeIn } from '@/components/animations/FadeIn'
import type { Category, Media } from '@/payload-types'

function getCatImage(cat: Category): string | null {
  if (typeof cat.image === 'object' && cat.image !== null) {
    return (cat.image as Media).sizes?.card?.url ?? (cat.image as Media).url ?? null
  }
  return null
}

export default async function CategoriesIndexPage() {
  const payload = await getPayload({ config: await config })

  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 1,
    sort: 'title',
  })

  const categories = categoriesRes.docs
  const totalDocs = categoriesRes.totalDocs

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div className="relative bg-obsidian overflow-hidden pt-20">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.4) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <div className="relative max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold/80 font-heading font-medium m-0 mb-4 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              Delicious Planet
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] xl:text-[56px] font-medium m-0 text-cream tracking-[-0.03em] leading-[1.08]">
              Explore by Category
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/60 text-[15px] sm:text-[16px] mt-4 mb-0 max-w-lg leading-relaxed">
              Curated selections sourced from the world&rsquo;s finest artisan producers.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-stone/50 text-xs mt-6 mb-0 uppercase tracking-[0.2em]">
              {totalDocs} categor{totalDocs !== 1 ? 'ies' : 'y'}
            </p>
          </FadeIn>
        </div>
      </div>

      {/* ── Category Grid ─────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto py-8 sm:py-10 md:py-12 lg:py-14">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6">
            <p className="text-obsidian text-base font-luxury m-0 mb-2">No categories yet</p>
            <p className="text-stone text-sm m-0">Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-t border-stone/15 items-stretch">
            {categories.map((cat, i) => {
              const imgUrl = getCatImage(cat)
              return (
                <FadeIn key={cat.id} delay={i * 0.03} className="h-full">
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group relative block h-full border-r border-b border-stone/15 no-underline overflow-hidden"
                  >
                    <div className="relative aspect-[4/5] bg-charcoal overflow-hidden">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={cat.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-charcoal to-obsidian" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-obsidian/85 via-obsidian/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <h2 className="font-luxury text-lg sm:text-xl md:text-2xl text-cream m-0 tracking-tight group-hover:text-gold transition-colors duration-300">
                          {cat.title}
                        </h2>
                        {cat.description && (
                          <p className="text-cream/60 text-[12px] sm:text-[13px] m-0 mt-1.5 line-clamp-2 leading-relaxed">
                            {cat.description}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-2 mt-3 text-[10px] uppercase tracking-[0.2em] text-gold/80 group-hover:text-gold transition-colors">
                          Shop Category
                          <span className="inline-block w-4 h-px bg-gold/60 group-hover:w-6 transition-all duration-300" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
