'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { ProductCard } from '@/components/ui/ProductCard'
import { BuyBox } from './product/BuyBox'
import { ProductGallery, type GalleryImage } from './product/ProductGallery'
import {
  DescriptionPanel,
  IngredientsPanel,
  NutritionPanel,
  Panel,
  SpecRow,
} from './product/ProductPanels'
import {
  getDefaultVariant,
  getOriginCountryName,
  getVariants,
  variantPrice,
  type ProductVariant,
} from '@/lib/product'
import { getRegionBySlug } from '@/lib/regions'
import type { Brand, Category, Media, Product, Supplier } from '@/payload-types'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

const DIETARY_MARKS: { key: keyof NonNullable<Product['dietary']>; label: string }[] = [
  { key: 'isOrganic', label: 'Organic' },
  { key: 'isVegan', label: 'Vegan' },
  { key: 'isVegetarian', label: 'Vegetarian' },
  { key: 'isGlutenFree', label: 'Gluten free' },
  { key: 'isHalal', label: 'Halal' },
  { key: 'isLactoseFree', label: 'Lactose free' },
]

function mediaUrl(value: unknown, fallbackAlt: string): GalleryImage | null {
  if (typeof value !== 'object' || value === null) return null
  const media = value as Media
  const url = media.sizes?.hero?.url ?? media.url
  return url ? { url, alt: media.alt ?? fallbackAlt } : null
}

/**
 * Product page.
 *
 * Same storefront grammar as the shop listing: cream ground, `px-6 lg:px-16`
 * gutters, white hairline panels, `rounded-sm`. The buy decision lives in one
 * sticky card beside the gallery; everything a shopper reads *after* deciding
 * (description, ingredients, nutrition, logistics) sits in the panel grid
 * below, so the fold stays about the product rather than its data sheet.
 */
export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const variants = getVariants(product)
  const [activeSku, setActiveSku] = useState<string | null>(
    () => getDefaultVariant(product)?.sku ?? null,
  )
  const activeVariant: ProductVariant | null =
    variants.find((v) => v.sku === activeSku) ?? getDefaultVariant(product)

  // Variant artwork joins the gallery, so choosing a size can show that size.
  // A variant often reuses the product shot, so each file appears once.
  const images: GalleryImage[] = []
  const seenImages = new Set<string>()
  for (const candidate of [
    ...(product.images ?? []).map((row) => mediaUrl(row.image, product.title)),
    ...variants.map((variant) => mediaUrl(variant.image, product.title)),
  ]) {
    if (!candidate || seenImages.has(candidate.url)) continue
    seenImages.add(candidate.url)
    images.push(candidate)
  }

  const [activeImage, setActiveImage] = useState(0)

  const price = variantPrice(activeVariant)
  const onSale = Boolean(price?.compareAt)
  const soldOut = product.inStock === false

  const brand = typeof product.brand === 'object' ? (product.brand as Brand) : null
  const supplier = typeof product.supplier === 'object' ? (product.supplier as Supplier) : null
  const category = typeof product.category === 'object' ? (product.category as Category) : null
  const parent =
    category && typeof category.parent === 'object' ? (category.parent as Category) : null

  const originName = getOriginCountryName(product)
  const region = product.origin?.region ? getRegionBySlug(product.origin.region) : undefined
  const marks = DIETARY_MARKS.filter((mark) => product.dietary?.[mark.key])

  const hasNutrition =
    product.nutritionPer100g &&
    Object.values(product.nutritionPer100g).some((v) => typeof v === 'number')

  const hasLogistics =
    product.packaging ||
    product.storageInstructions ||
    product.shipping?.handlingDays != null ||
    (product.specifications?.length ?? 0) > 0

  return (
    <>
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone/15">
        <nav
          aria-label="Breadcrumb"
          className="px-6 lg:px-16 py-3 flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {[
            { href: '/', label: 'Home' },
            { href: '/products', label: 'Shop' },
            ...(parent ? [{ href: `/products?category=${parent.slug}`, label: parent.title }] : []),
            ...(category
              ? [{ href: `/products?category=${category.slug}`, label: category.title }]
              : []),
          ].map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5 shrink-0">
              <Link href={crumb.href} className="no-underline">
                <span className="font-sans text-[11px] text-stone/60 hover:text-forest-green transition-colors whitespace-nowrap">
                  {crumb.label}
                </span>
              </Link>
              <span className="text-stone/30 text-[11px]">/</span>
            </span>
          ))}
          <span className="font-sans text-[11px] text-obsidian whitespace-nowrap">
            {product.title}
          </span>
        </nav>
      </div>

      <div className="bg-cream">
        <div className="px-6 lg:px-16 py-5 md:py-7">
          {/* ── Buy row ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-7 items-start">
            {/* The gallery narrows as the viewport grows: a full-width square
                image is right on a phone, but at 1440 an unconstrained one
                towers over the buy box and opens a hole beside it. */}
            <div className="mx-auto w-full max-w-sm lg:max-w-none lg:mx-0 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <FadeIn>
                <ProductGallery
                  images={images}
                  active={Math.min(activeImage, Math.max(images.length - 1, 0))}
                  onSelect={setActiveImage}
                  flags={[
                    ...(soldOut ? [{ label: 'Sold out', tone: 'muted' as const }] : []),
                    ...(onSale ? [{ label: 'On offer', tone: 'sale' as const }] : []),
                    ...(product.isFeatured ? [{ label: 'Featured', tone: 'featured' as const }] : []),
                  ]}
                />
              </FadeIn>
            </div>

            <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-7 items-start">
              {/* Identity — the reading half of the fold */}
              <FadeIn className="xl:col-span-7">
                <div>
                  {(brand || category) && (
                    <p className="font-heading text-[10px] uppercase tracking-[0.2em] font-semibold text-forest-green m-0 mb-2">
                      {brand ? (
                        <Link href={`/products?brand=${brand.slug}`} className="no-underline">
                          <span className="text-forest-green hover:text-bud-green transition-colors">
                            {brand.title}
                          </span>
                        </Link>
                      ) : (
                        category?.title
                      )}
                    </p>
                  )}

                  <h1 className="m-0!">
                    <span className="block font-luxury text-2xl md:text-[32px] font-semibold tracking-tight text-obsidian leading-[1.15]">
                      {product.title}
                    </span>
                  </h1>

                  {product.shortDescription && (
                    <p className="font-sans text-[13.5px] text-stone leading-relaxed m-0 mt-3 max-w-prose">
                      {product.shortDescription}
                    </p>
                  )}

                  {marks.length > 0 && (
                    <ul className="list-none flex flex-wrap gap-1.5 m-0 mt-4 p-0">
                      {marks.map((mark) => (
                        <li
                          key={mark.key}
                          className="font-heading text-[9px] uppercase tracking-[0.12em] font-semibold text-forest-green bg-forest-green/10 border border-forest-green/20 px-2 py-1 rounded-sm leading-none"
                        >
                          {mark.label}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* At a glance — the facts that decide a purchase, above the
                      fold; the full data sheet is in the panels below. */}
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-5 bg-stone/15 border border-stone/15 rounded-sm overflow-hidden">
                    {[
                      { label: 'Origin', value: originName ?? region?.label ?? '—' },
                      { label: 'Size', value: activeVariant?.size ?? '—' },
                      { label: 'Packaging', value: product.packaging ?? '—' },
                      { label: 'SKU', value: activeVariant?.sku ?? product.sku ?? '—' },
                    ].map((fact) => (
                      <div key={fact.label} className="bg-white px-3 py-2.5 min-w-0">
                        <dt className="font-heading text-[9px] uppercase tracking-[0.16em] font-semibold text-stone/50 m-0">
                          {fact.label}
                        </dt>
                        <dd className="font-sans text-[12.5px] text-obsidian m-0 mt-1 truncate">
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {(region || supplier) && (
                    <p className="font-sans text-[11.5px] text-stone/60 m-0 mt-3">
                      {region && (
                        <>
                          Part of{' '}
                          <Link href={`/products?region=${region.slug}`} className="no-underline">
                            <span className="text-forest-green hover:text-bud-green transition-colors">
                              {region.label}
                            </span>
                          </Link>
                        </>
                      )}
                      {region && supplier && ' · '}
                      {supplier && (
                        <>
                          Supplied by{' '}
                          <Link
                            href={`/products?supplier=${supplier.slug}`}
                            className="no-underline"
                          >
                            <span className="text-forest-green hover:text-bud-green transition-colors">
                              {supplier.name}
                            </span>
                          </Link>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </FadeIn>

              {/* Buy box — sticky on its own at xl, where it has a column */}
              <FadeIn delay={0.08} className="xl:col-span-5 xl:sticky xl:top-[calc(var(--header-h)+1.5rem)]">
                <BuyBox
                  product={product}
                  variants={variants}
                  activeVariant={activeVariant}
                  onSelectVariant={(sku) => {
                    setActiveSku(sku)
                    const variant = variants.find((v) => v.sku === sku)
                    const image = mediaUrl(variant?.image, product.title)
                    const index = image ? images.findIndex((i) => i.url === image.url) : -1
                    if (index >= 0) setActiveImage(index)
                  }}
                />
              </FadeIn>
            </div>
          </div>

          {/* ── Detail panels ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xl:gap-7 mt-5 md:mt-6 items-start">
            <div className="flex flex-col gap-5 xl:gap-7">
              <FadeIn>
                <DescriptionPanel product={product} />
              </FadeIn>
              <FadeIn>
                <IngredientsPanel product={product} />
              </FadeIn>
            </div>

            <div className="flex flex-col gap-5 xl:gap-7">
              {hasNutrition && (
                <FadeIn>
                  <NutritionPanel nutrition={product.nutritionPer100g!} />
                </FadeIn>
              )}

              {hasLogistics && (
                <FadeIn>
                  <Panel title="Storage, packing & specification">
                    {product.storageInstructions && (
                      <p className="font-sans text-[13px] text-stone leading-relaxed m-0 mb-3">
                        {product.storageInstructions}
                      </p>
                    )}
                    <div>
                      {product.packaging && <SpecRow label="Packaging" value={product.packaging} />}
                      {activeVariant?.weightGrams != null && (
                        <SpecRow label="Net weight" value={`${activeVariant.weightGrams} g`} />
                      )}
                      {activeVariant?.barcode && (
                        <SpecRow label="Barcode" value={activeVariant.barcode} />
                      )}
                      {product.shipping?.handlingDays != null && (
                        <SpecRow
                          label="Handling"
                          value={`${product.shipping.handlingDays} day${product.shipping.handlingDays === 1 ? '' : 's'}`}
                        />
                      )}
                      {product.specifications?.map((spec, i) => (
                        <SpecRow key={i} label={spec.label} value={spec.value} />
                      ))}
                    </div>
                  </Panel>
                </FadeIn>
              )}

              <FadeIn>
                <Panel title="Delivery & returns">
                  <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                    {[
                      { label: 'Standard delivery', value: '3–7 business days' },
                      { label: 'Express delivery', value: '1–3 business days' },
                      { label: 'International', value: 'Selected countries' },
                    ].map((row) => (
                      <li key={row.label} className="flex items-start gap-2.5 m-0">
                        <span className="w-1.5 h-1.5 rounded-pill bg-olivine mt-1.5 shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-sans text-[12.5px] text-obsidian leading-snug">
                            {row.label}
                          </span>
                          <span className="block font-sans text-[11.5px] text-stone/60 leading-snug">
                            {row.value}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-sans text-[11.5px] text-stone/60 m-0 mt-3 pt-3 border-t border-stone/10">
                    Chilled and perishable goods are excluded from returns once dispatched. See{' '}
                    <Link href="/shipping" className="no-underline">
                      <span className="text-forest-green hover:text-bud-green transition-colors">
                        shipping &amp; returns
                      </span>
                    </Link>{' '}
                    for the full policy.
                  </p>
                </Panel>
              </FadeIn>
            </div>
          </div>

          {/* ── Related ─────────────────────────────────────── */}
          {relatedProducts.length > 0 && (
            <section className="mt-6 md:mt-8">
              <div className="flex items-baseline justify-between gap-4 mb-4 md:mb-5">
                <h2 className="m-0!">
                  <span className="block font-luxury text-xl sm:text-2xl font-semibold tracking-tight text-obsidian">
                    You may also like
                  </span>
                </h2>
                <Link
                  href={category ? `/products?category=${category.slug}` : '/products'}
                  className="group shrink-0 no-underline"
                >
                  <span className="font-sans text-[11px] sm:text-xs text-stone group-hover:text-forest-green transition-colors">
                    View all
                  </span>
                </Link>
              </div>

              {/* Same border-grid as the shop listing and the homepage rails. */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 border-l border-t border-stone/15 items-stretch">
                {relatedProducts.slice(0, 5).map((related, i) => (
                  <FadeIn key={related.id} delay={i * 0.03} className="h-full">
                    <ProductCard product={related} index={i} />
                  </FadeIn>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Trade strip ───────────────────────────────────────── */}
      <section className="bg-forest-green">
        <div className="px-6 lg:px-16 py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="font-heading text-[10px] uppercase tracking-[0.2em] font-semibold text-olivine m-0">
              Trade &amp; wholesale
            </p>
            <h2 className="m-0! mt-1.5!">
              <span className="block font-luxury text-xl md:text-2xl font-semibold text-cream tracking-tight">
                Buying {product.title} by the case?
              </span>
            </h2>
            <p className="font-sans text-[12.5px] text-cream/70 m-0 mt-1.5 max-w-lg leading-snug">
              We supply restaurants, hotels and specialty retailers across the region. Tell us your
              volumes and we will quote wholesale pricing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/contact?type=b2b"
              className="h-11 px-5 inline-flex items-center rounded-sm bg-cream no-underline transition-colors hover:bg-olivine"
            >
              <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-obsidian">
                Request a quote
              </span>
            </Link>
            <Link
              href="/b2b"
              className="group h-11 px-5 inline-flex items-center rounded-sm border border-cream/35 no-underline transition-colors hover:bg-cream/10"
            >
              <span className="font-heading text-[10px] uppercase tracking-[0.14em] font-semibold text-cream">
                B2B solutions
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
