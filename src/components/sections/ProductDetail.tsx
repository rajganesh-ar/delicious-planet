'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from '@/components/ui/ProductCard'
import { FadeIn } from '@/components/animations/FadeIn'
import { useCart } from '@/components/layout/CartContext'
import type { Product, Media, Category, Brand, Supplier, ProductCollection } from '@/payload-types'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

function getImages(product: Product): { url: string; alt: string }[] {
  return (
    product.images
      ?.map((item) => {
        const img = item.image
        if (typeof img === 'object' && img !== null) {
          const m = img as Media
          return { url: m.sizes?.hero?.url ?? m.url ?? '', alt: m.alt ?? product.title }
        }
        return null
      })
      .filter((v): v is { url: string; alt: string } => v !== null && v.url !== '') ?? []
  )
}

function getThumbUrl(product: Product): string | undefined {
  const first = product.images?.[0]?.image
  if (typeof first === 'object' && first !== null) {
    return (first as Media).sizes?.thumbnail?.url ?? (first as Media).url ?? undefined
  }
  return undefined
}

const dietaryLabels: { key: keyof NonNullable<Product['dietary']>; label: string; icon: string }[] = [
  { key: 'isOrganic', label: 'Organic', icon: '🌿' },
  { key: 'isVegan', label: 'Vegan', icon: '🌱' },
  { key: 'isVegetarian', label: 'Vegetarian', icon: '🥬' },
  { key: 'isGlutenFree', label: 'Gluten-Free', icon: '🌾' },
  { key: 'isHalal', label: 'Halal', icon: '✦' },
  { key: 'isLactoseFree', label: 'Lactose-Free', icon: '🥛' },
]

function NutritionBar({
  label,
  value,
  unit,
  dailyMax,
}: {
  label: string
  value: number
  unit: string
  dailyMax: number
}) {
  const pct = Math.min(Math.round((value / dailyMax) * 100), 100)
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-obsidian font-medium">{label}</span>
        <span className="text-[11px] text-stone">
          {value} {unit}{' '}
          <span className="text-stone/50">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-parchment rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gold rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </div>
    </div>
  )
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const images = getImages(product)
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const { addItem, openCart } = useCart()

  const price = product.prices?.[0]
  const compareAt = price?.compareAtAmount
  const thumbUrl = getThumbUrl(product)

  const brandName =
    typeof product.brand === 'object' && product.brand !== null
      ? (product.brand as Brand).title
      : null

  const collectionTitle =
    typeof product.collection === 'object' && product.collection !== null
      ? (product.collection as ProductCollection).title
      : null

  const collectionSlug =
    typeof product.collection === 'object' && product.collection !== null
      ? (product.collection as ProductCollection).slug
      : null

  // Subcategory hierarchy: if category has a parent, the parent is the "category" and actual is "subcategory"
  const categoryObj = typeof product.category === 'object' && product.category !== null ? (product.category as Category) : null
  const parentCategoryObj = categoryObj && typeof categoryObj.parent === 'object' && categoryObj.parent !== null ? (categoryObj.parent as Category) : null

  const parentCategoryTitle = parentCategoryObj?.title ?? null
  const parentCategorySlug = parentCategoryObj?.slug ?? null
  const subcategoryTitle = parentCategoryObj ? categoryObj?.title ?? null : null
  const subcategorySlug = parentCategoryObj ? categoryObj?.slug ?? null : null
  const mainCategoryTitle = parentCategoryObj ? parentCategoryTitle : categoryObj?.title ?? null
  const mainCategorySlug = parentCategoryObj ? parentCategorySlug : categoryObj?.slug ?? null

  const activeDietary = dietaryLabels.filter((d) => product.dietary?.[d.key])

  const handleAddToCart = () => {
    if (!price) return
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: String(product.id),
        title: product.title,
        slug: product.slug,
        image: thumbUrl,
        price: price.amount,
        currency: price.currency,
      })
    }
    openCart()
  }

  const hasNutrition =
    product.nutritionPer100g &&
    Object.values(product.nutritionPer100g).some((v) => v !== null && v !== undefined)

  return (
    <div className="bg-white min-h-screen">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-parchment/40 border-b border-mist pt-20 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
        <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-stone">
            <Link href="/" className="hover:text-obsidian transition-colors no-underline text-stone">
              Home
            </Link>
            <span className="text-mist">/</span>
            <Link
              href="/products"
              className="hover:text-obsidian transition-colors no-underline text-stone"
            >
              Shop
            </Link>
            {collectionTitle && collectionSlug && (
              <>
                <span className="text-mist">/</span>
                <Link
                  href={`/products?collection=${collectionSlug}`}
                  className="hover:text-obsidian transition-colors no-underline text-stone"
                >
                  {collectionTitle}
                </Link>
              </>
            )}
            {mainCategoryTitle && mainCategorySlug && (
              <>
                <span className="text-mist">/</span>
                <Link
                  href={`/products?category=${mainCategorySlug}`}
                  className="hover:text-obsidian transition-colors no-underline text-stone"
                >
                  {mainCategoryTitle}
                </Link>
              </>
            )}
            {subcategoryTitle && subcategorySlug && (
              <>
                <span className="text-mist">/</span>
                <Link
                  href={`/products?category=${subcategorySlug}`}
                  className="hover:text-obsidian transition-colors no-underline text-stone"
                >
                  {subcategoryTitle}
                </Link>
              </>
            )}
            <span className="text-mist">/</span>
            <span className="text-obsidian font-medium">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Main two-column layout ─────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0 lg:gap-16 xl:gap-24">
          {/* ── LEFT: Sticky gallery ──────────────────────────── */}
          <FadeIn direction="left" duration={0.7}>
            <div className="lg:sticky lg:top-20 lg:self-start py-10 lg:py-16">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-parchment">
              <AnimatePresence mode="wait">
                {images[activeImage] ? (
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[activeImage].url}
                      alt={images[activeImage].alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      width="64"
                      height="64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.75"
                      viewBox="0 0 24 24"
                      className="text-mist"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="1" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFeatured && (
                  <span className="bg-obsidian text-cream text-[9px] uppercase tracking-[0.25em] px-3 py-1.5">
                    Featured
                  </span>
                )}
                {compareAt && compareAt > (price?.amount ?? 0) && (
                  <span className="bg-gold text-cream text-[9px] uppercase tracking-[0.25em] px-3 py-1.5">
                    Sale
                  </span>
                )}
              </div>

              {!product.inStock && (
                <span className="absolute top-4 right-4 bg-stone text-cream text-[9px] uppercase tracking-[0.25em] px-3 py-1.5">
                  Sold Out
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-[72px] h-[72px] overflow-hidden border transition-colors cursor-pointer p-0 ${
                      i === activeImage ? 'border-obsidian' : 'border-mist hover:border-stone'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          </FadeIn>

          {/* ── RIGHT: Scrollable product info ────────────────── */}
          <FadeIn direction="right" duration={0.7} delay={0.15}>
          <div className="py-10 lg:py-16 lg:border-l lg:border-mist lg:pl-16 xl:pl-24">
            {/* Collection / brand tag */}
            {(collectionTitle || mainCategoryTitle || brandName) && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-heading font-medium m-0 mb-4 flex items-center gap-3">
                <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
                {collectionTitle ?? mainCategoryTitle ?? brandName}
              </p>
            )}

            {/* Title */}
            <h1 className="font-luxury text-3xl md:text-4xl lg:text-[44px] xl:text-[48px] font-medium m-0 mb-1 text-obsidian tracking-tight leading-[1.1]">
              {product.title}
            </h1>

            {/* Brand sub-label */}
            {brandName && collectionTitle && (
              <p className="text-xs text-stone uppercase tracking-widest m-0 mb-6">{brandName}</p>
            )}

            {/* Price */}
            {price && (
              <div className="flex items-baseline gap-3 mt-5 mb-6">
                <span className="text-2xl font-medium text-obsidian">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: price.currency,
                  }).format(price.amount)}
                </span>
                {compareAt && compareAt > price.amount && (
                  <span className="text-base text-stone line-through">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: price.currency,
                    }).format(compareAt)}
                  </span>
                )}
              </div>
            )}

            <div className="w-8 border-t border-mist mb-6" />

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-stone leading-relaxed m-0 mb-6">
                {product.shortDescription}
              </p>
            )}

            {/* Dietary badges — larger visual cards */}
            {activeDietary.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {activeDietary.map((d) => (
                  <div
                    key={d.key}
                    className="flex flex-col items-center justify-center py-3 px-2 border border-mist bg-parchment/30 text-center"
                  >
                    <span className="text-lg mb-1">{d.icon}</span>
                    <span className="text-[9px] uppercase tracking-[0.15em] text-stone font-medium">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* At a Glance */}
            {(product.countryOfOrigin || product.weight || product.packaging || product.sku) && (
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-heading font-medium m-0 mb-3 flex items-center gap-3">
                  <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
                  At a Glance
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {product.countryOfOrigin && (
                    <div className="border border-mist p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1 flex items-center gap-1.5">
                        <span className="text-sm">🌍</span> Origin
                      </p>
                      <p className="text-xs font-medium text-obsidian m-0">
                        {product.countryOfOrigin}
                      </p>
                    </div>
                  )}
                  {product.weight && (
                    <div className="border border-mist p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1 flex items-center gap-1.5">
                        <span className="text-sm">⚖️</span> Weight
                      </p>
                      <p className="text-xs font-medium text-obsidian m-0">{product.weight}</p>
                    </div>
                  )}
                  {product.packaging && (
                    <div className="border border-mist p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1 flex items-center gap-1.5">
                        <span className="text-sm">📦</span> Packaging
                      </p>
                      <p className="text-xs font-medium text-obsidian m-0">{product.packaging}</p>
                    </div>
                  )}
                  {product.sku && (
                    <div className="border border-mist p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1 flex items-center gap-1.5">
                        <span className="text-sm">🏷️</span> SKU
                      </p>
                      <p className="text-xs font-medium text-obsidian m-0">{product.sku}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Size variants */}
            {product.sizeVariants && product.sizeVariants.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone m-0 mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizeVariants.map((v) => (
                    <button
                      key={v.id}
                      disabled={v.inStock === false}
                      className={`text-xs uppercase tracking-wide border px-4 py-2 cursor-pointer transition-colors ${
                        v.inStock === false
                          ? 'border-mist text-stone/40 cursor-not-allowed line-through'
                          : 'border-obsidian text-obsidian hover:bg-obsidian hover:text-cream'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex gap-3 mb-4">
              {/* Quantity selector */}
              <div className="flex items-center border border-mist">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-12 flex items-center justify-center text-obsidian hover:bg-parchment transition-colors border-0 bg-transparent cursor-pointer text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium text-obsidian select-none">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-11 h-12 flex items-center justify-center text-obsidian hover:bg-parchment transition-colors border-0 bg-transparent cursor-pointer text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 h-12 text-xs font-medium uppercase tracking-[0.2em] border-0 cursor-pointer transition-colors ${
                  product.inStock
                    ? 'bg-obsidian text-cream hover:bg-charcoal'
                    : 'bg-mist text-stone cursor-not-allowed'
                }`}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            {/* Inquire for bulk */}
            <Link
              href="/contact?type=b2b"
              className="flex items-center justify-center w-full h-12 text-xs font-medium uppercase tracking-[0.2em] border border-obsidian text-obsidian no-underline hover:bg-obsidian hover:text-cream transition-colors mb-6"
            >
              Inquire for Bulk
            </Link>

            {/* Shipping badge */}
            {product.shipping?.freeShippingEligible && (
              <p className="text-[11px] text-stone text-center m-0 mb-6">
                ✓ &nbsp;Free shipping eligible
              </p>
            )}

            {!product.inStock && (
              <p className="text-xs text-stone text-center m-0 mb-6">
                Currently out of stock — contact us for availability.
              </p>
            )}

            <div className="border-t border-mist" />
          </div>
          </FadeIn>
        </div>
      </div>

      {/* ── Product Details — Four-column section ──────────────── */}
      <div className="border-t border-mist">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-12 lg:py-16">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-heading font-medium m-0 mb-8 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              Product Details
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Column 1: Ingredients & Allergens */}
            <FadeIn delay={0}>
              <div className="border-t border-obsidian pt-5">
                <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-obsidian m-0 mb-4">
                  Ingredients & Allergens
                </h4>
                {product.ingredients ? (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1">Ingredients</p>
                    <p className="text-sm text-stone leading-relaxed m-0">{product.ingredients}</p>
                  </div>
                ) : null}
                {product.allergens ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1">Allergens</p>
                    <p className="text-sm font-medium text-obsidian leading-relaxed m-0">{product.allergens}</p>
                  </div>
                ) : null}
                {!product.ingredients && !product.allergens && (
                  <p className="text-sm text-stone/50 m-0">No information available.</p>
                )}
              </div>
            </FadeIn>

            {/* Column 2: Nutritional Info */}
            <FadeIn delay={0.06}>
              <div className="border-t border-obsidian pt-5">
                <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-obsidian m-0 mb-4">
                  Nutritional Info
                </h4>
                {hasNutrition ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-3">Per 100g</p>
                    <div className="space-y-3">
                      {product.nutritionPer100g?.energyKcal != null && (
                        <NutritionBar label="Energy" value={product.nutritionPer100g.energyKcal} unit="kcal" dailyMax={2000} />
                      )}
                      {product.nutritionPer100g?.protein != null && (
                        <NutritionBar label="Protein" value={product.nutritionPer100g.protein} unit="g" dailyMax={50} />
                      )}
                      {product.nutritionPer100g?.carbohydrates != null && (
                        <NutritionBar label="Carbs" value={product.nutritionPer100g.carbohydrates} unit="g" dailyMax={260} />
                      )}
                      {product.nutritionPer100g?.fat != null && (
                        <NutritionBar label="Fat" value={product.nutritionPer100g.fat} unit="g" dailyMax={70} />
                      )}
                      {product.nutritionPer100g?.salt != null && (
                        <NutritionBar label="Salt" value={product.nutritionPer100g.salt} unit="g" dailyMax={6} />
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-stone/50 m-0">No nutritional data available.</p>
                )}
              </div>
            </FadeIn>

            {/* Column 3: Storage & Packaging */}
            <FadeIn delay={0.12}>
              <div className="border-t border-obsidian pt-5">
                <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-obsidian m-0 mb-4">
                  Storage & Packaging
                </h4>
                {product.storageInstructions ? (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1">Storage</p>
                    <p className="text-sm text-stone leading-relaxed m-0">{product.storageInstructions}</p>
                  </div>
                ) : null}
                {product.packaging ? (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1">Packaging</p>
                    <p className="text-sm text-stone leading-relaxed m-0">{product.packaging}</p>
                  </div>
                ) : null}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="mt-4 border-t border-mist pt-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-2">Specs</p>
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between text-xs py-1">
                        <span className="text-obsidian font-medium">{spec.label}</span>
                        <span className="text-stone">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!product.storageInstructions && !product.packaging && (!product.specifications || product.specifications.length === 0) && (
                  <p className="text-sm text-stone/50 m-0">No information available.</p>
                )}
              </div>
            </FadeIn>

            {/* Column 4: Shipping */}
            <FadeIn delay={0.18}>
              <div className="border-t border-obsidian pt-5">
                <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-obsidian m-0 mb-4">
                  Shipping
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-obsidian m-0">Standard</p>
                      <p className="text-[11px] text-stone m-0">3–7 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-obsidian m-0">Express</p>
                      <p className="text-[11px] text-stone m-0">1–3 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-obsidian m-0">International</p>
                      <p className="text-[11px] text-stone m-0">Select countries</p>
                    </div>
                  </div>
                  <div className="border-t border-mist pt-3 mt-1 space-y-1.5">
                    <p className="m-0 text-[11px] text-stone">✓ Free shipping over $150</p>
                    {product.shipping?.handlingDays != null && (
                      <p className="m-0 text-[11px] text-stone">
                        Handling: {product.shipping.handlingDays} day{product.shipping.handlingDays !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* ── Related products ───────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-mist mt-12">
          <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-16 lg:py-20">
            <FadeIn>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-heading font-medium m-0 mb-3 flex items-center gap-3">
                <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
                Curated For You
              </p>
            </FadeIn>
            <div className="flex items-baseline justify-between mb-10">
              <FadeIn delay={0.05}>
                <h2 className="font-luxury text-2xl lg:text-3xl font-medium tracking-tight m-0 text-obsidian">
                  You May Also Like
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <Link
                  href="/products"
                  className="text-[11px] uppercase tracking-[0.2em] text-stone hover:text-obsidian transition-colors no-underline"
                >
                  View All →
                </Link>
              </FadeIn>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
              {relatedProducts.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.06}>
                  <ProductCard product={p} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="relative bg-obsidian overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-obsidian via-charcoal to-obsidian opacity-90" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-30" />
        <div className="relative max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-16 lg:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <FadeIn>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-heading font-medium m-0 mb-3 flex items-center gap-3">
                  <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
                  For Professionals
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h3 className="font-luxury text-2xl lg:text-3xl font-medium text-cream m-0">
                  Need Bulk Pricing?
                </h3>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="text-stone/60 text-sm mt-2 mb-0 max-w-md">
                  We supply restaurants, hotels, and specialty retailers worldwide. Get in touch for wholesale pricing and custom orders.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={0.2}>
              <div className="flex gap-3">
                <Link
                  href="/contact?type=b2b"
                  className="inline-flex items-center px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] bg-gold text-obsidian no-underline hover:bg-gold-light transition-colors"
                >
                  Get in Touch
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] border border-cream/20 text-cream no-underline hover:bg-cream/10 transition-colors"
                >
                  Browse All
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
