import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { getRegionForCategoryTitle } from '@/lib/regions'
import { PRICE_BANDS } from '@/lib/facets'
import { getImageUrl, getPrice, formatPrice } from '@/lib/product'
import type { DietaryCount } from './DietaryStrip'
import type { Category, Product, ProductCollection } from '@/payload-types'

interface HomeSidebarProps {
  /** Top-level CMS categories — this store models regions as categories. */
  regionCategories: Category[]
  /** Product-type taxonomy lives in collections, not categories. */
  collections: ProductCollection[]
  dietaryFacets: DietaryCount[]
  /** Compact product tiles shown under the nav — picks the rails don't carry. */
  picks: Product[]
}

const QUICK_LINKS = [
  { label: 'Best Sellers', href: '/products?featured=true' },
  { label: 'New Arrivals', href: '/products?sort=-createdAt' },
  { label: 'All Products', href: '/products' },
  { label: 'Our Brands', href: '/brands' },
]

/** "Bite Into the Middle East" → "Middle East" */
function shortTitle(title: string): string {
  const clean = title.trim()
  const match = clean.match(/^bite\s+into\s+(?:the\s+)?(.+)$/i)
  return match ? match[1].trim() : clean
}

/**
 * styles.css declares unlayered h1–h6 typography that outranks Tailwind's
 * layered utilities, so heading visuals live on a child span throughout.
 */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0! mb-2.5!">
      <span className="block font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-obsidian">
        {children}
      </span>
    </h3>
  )
}

/** One row of the boxed panel — the hairline divider is drawn by the parent. */
function Group({ children }: { children: React.ReactNode }) {
  return <div className="px-3.5 py-3.5">{children}</div>
}

/**
 * Nav links use a child <span> for colour: the unlayered `a { color: currentColor }`
 * rule in styles.css outranks text utilities set on the anchor itself.
 */
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <li className="m-0">
      <Link href={href} className="group flex items-center gap-1.5 py-1 no-underline">
        <span className="w-0 group-hover:w-2 h-px bg-forest-green transition-all duration-300" />
        <span className="font-sans text-[12.5px] text-stone group-hover:text-forest-green transition-colors leading-snug">
          {label}
        </span>
      </Link>
    </li>
  )
}

/**
 * Compact product row: thumbnail, title and price. Deliberately lighter than
 * ProductCard — the sidebar is 15rem wide and sits beside the full tiles.
 */
function PickRow({ product }: { product: Product }) {
  const image = getImageUrl(product)
  const price = getPrice(product)

  return (
    <li className="m-0">
      <Link
        href={`/products/${product.slug}`}
        className="group flex items-center gap-2.5 py-2 no-underline border-b border-mist/70 last:border-b-0"
      >
        <span className="relative w-12 h-12 shrink-0 overflow-hidden rounded-sm bg-parchment flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="48px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            /* Same placeholder glyph the listing tiles use for imageless products */
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
              className="text-stone/25"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          )}
        </span>
        <span className="min-w-0 flex flex-col gap-0.5">
          <span className="font-sans text-[12px] leading-snug text-obsidian group-hover:text-forest-green transition-colors line-clamp-2">
            {product.title}
          </span>
          {price && (
            <span className="font-heading text-[11px] font-semibold text-forest-green">
              {formatPrice(price.amount, price.currency)}
            </span>
          )}
        </span>
      </Link>
    </li>
  )
}

export function HomeSidebar({
  regionCategories,
  collections,
  dietaryFacets,
  picks,
}: HomeSidebarProps) {
  const regions = regionCategories.filter((c) => getRegionForCategoryTitle(c.title))

  return (
    <aside className="hidden lg:block w-56 xl:w-60 shrink-0">
      <div className="sticky top-[calc(var(--header-h)+1.5rem)] flex flex-col gap-4">
        <FadeIn>
          {/* A panel, not a bare column: the white card, hairline frame and
              dividers hold the browse nav apart from the cream storefront beside
              it. Border weight matches the product grid so both read as one system. */}
          <nav
            aria-label="Storefront"
            className="rounded-sm border border-stone/15 bg-white overflow-hidden"
          >
            <div className="px-3.5 py-2.5 bg-parchment border-b border-stone/15">
              <span className="block font-heading text-[10px] uppercase tracking-[0.18em] font-semibold text-forest-green">
                Browse the store
              </span>
            </div>

            <div className="divide-y divide-stone/15">
              {regions.length > 0 && (
                <Group>
                  <GroupHeading>Shop by Region</GroupHeading>
                  <ul className="list-none m-0 p-0">
                    {regions.map((cat) => {
                      const region = getRegionForCategoryTitle(cat.title)!
                      return (
                        <NavLink
                          key={cat.id}
                          href={`/products?region=${region.slug}`}
                          label={shortTitle(cat.title)}
                        />
                      )
                    })}
                  </ul>
                </Group>
              )}

              {collections.length > 0 && (
                <Group>
                  <GroupHeading>Shop by Category</GroupHeading>
                  <ul className="list-none m-0 p-0">
                    {collections.slice(0, 8).map((col) => (
                      <NavLink
                        key={col.id}
                        href={`/products?collection=${col.slug}`}
                        label={col.title}
                      />
                    ))}
                  </ul>
                </Group>
              )}

              <Group>
                <GroupHeading>Shop by Price</GroupHeading>
                <ul className="list-none m-0 p-0">
                  {PRICE_BANDS.map((band) => (
                    <NavLink key={band.slug} href={`/products?price=${band.slug}`} label={band.label} />
                  ))}
                </ul>
              </Group>

              {dietaryFacets.length > 0 && (
                <Group>
                  <GroupHeading>Dietary</GroupHeading>
                  <ul className="list-none m-0 p-0">
                    {dietaryFacets.map((f) => (
                      <NavLink
                        key={f.slug}
                        href={`/products?dietary=${f.slug}`}
                        label={`${f.label} (${f.count})`}
                      />
                    ))}
                  </ul>
                </Group>
              )}

              {picks.length > 0 && (
                <Group>
                  <GroupHeading>Top Picks</GroupHeading>
                  <ul className="list-none m-0 p-0">
                    {picks.map((product) => (
                      <PickRow key={product.id} product={product} />
                    ))}
                  </ul>
                  <Link href="/products" className="group inline-flex items-center gap-1.5 mt-2.5 no-underline">
                    <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-forest-green">
                      Shop all
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      aria-hidden="true"
                      className="text-forest-green transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </Group>
              )}

              <Group>
                <GroupHeading>Quick Links</GroupHeading>
                <ul className="list-none m-0 p-0">
                  {QUICK_LINKS.map((l) => (
                    <NavLink key={l.href} href={l.href} label={l.label} />
                  ))}
                </ul>
              </Group>
            </div>
          </nav>
        </FadeIn>

        {/* Promo panel — framed like the browse box so the column reads as one unit */}
        <FadeIn delay={0.1}>
          <Link
            href="/b2b"
            className="group relative block no-underline overflow-hidden rounded-sm border border-stone/15 aspect-3/4 bg-charcoal"
          >
            <Image
              src="/images/b2b/commercial-resturant.avif"
              alt=""
              fill
              sizes="240px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/55 to-obsidian/15" />

            <div className="absolute inset-0 z-10 flex flex-col justify-end p-4">
              <p className="font-heading text-[9px] uppercase tracking-[0.18em] text-gold m-0">
                Trade &amp; Wholesale
              </p>
              <p className="font-luxury text-cream text-base font-semibold m-0 mt-1 leading-tight">
                Partner with&nbsp;us
              </p>
              <p className="font-sans text-[11px] text-cream/70 m-0 mt-1.5 leading-snug">
                Wholesale pricing and dedicated support for restaurants and retailers.
              </p>
              <span className="mt-3 inline-flex w-fit items-center h-8 px-3.5 bg-cream/95 rounded-sm transition-colors group-hover:bg-forest-green">
                <span className="font-heading text-[9px] uppercase tracking-[0.14em] font-semibold text-obsidian group-hover:text-cream transition-colors">
                  Enquire
                </span>
              </span>
            </div>
          </Link>
        </FadeIn>
      </div>
    </aside>
  )
}
