'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from '@/components/ui/ProductCard'
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

const dietaryLabels: { key: keyof NonNullable<Product['dietary']>; label: string }[] = [
  { key: 'isOrganic', label: 'Organic' },
  { key: 'isVegan', label: 'Vegan' },
  { key: 'isVegetarian', label: 'Vegetarian' },
  { key: 'isGlutenFree', label: 'Gluten-Free' },
  { key: 'isHalal', label: 'Halal' },
  { key: 'isLactoseFree', label: 'Lactose-Free' },
]

function AccordionItem({
  label,
  children,
  isOpen,
  onToggle,
}: {
  label: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-t border-mist">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left bg-transparent border-0 cursor-pointer group"
      >
        <span className="text-xs uppercase tracking-[0.2em] font-medium text-obsidian group-hover:text-gold transition-colors">
          {label}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-stone text-lg leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm text-stone leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const images = getImages(product)
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')
  const { addItem, openCart } = useCart()

  const price = product.prices?.[0]
  const compareAt = price?.compareAtAmount
  const thumbUrl = getThumbUrl(product)

  const categoryTitle =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as Category).title
      : null

  const categorySlug =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as Category).slug
      : null

  const brandName =
    typeof product.brand === 'object' && product.brand !== null
      ? (product.brand as Brand).title
      : null

  const collectionTitle =
    typeof product.collection === 'object' && product.collection !== null
      ? (product.collection as ProductCollection).title
      : null

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

  const toggleAccordion = (key: string) =>
    setOpenAccordion((prev) => (prev === key ? null : key))

  const hasNutrition =
    product.nutritionPer100g &&
    Object.values(product.nutritionPer100g).some((v) => v !== null && v !== undefined)

  return (
    <div className="bg-cream min-h-screen">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="border-b border-mist pt-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-3">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-stone">
            <Link href="/" className="hover:text-obsidian transition-colors no-underline text-stone">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/products"
              className="hover:text-obsidian transition-colors no-underline text-stone"
            >
              Shop
            </Link>
            {categoryTitle && categorySlug && (
              <>
                <span>/</span>
                <Link
                  href={`/products?category=${categorySlug}`}
                  className="hover:text-obsidian transition-colors no-underline text-stone"
                >
                  {categoryTitle}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-obsidian">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Main two-column layout ─────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-0 lg:gap-16 xl:gap-24">
          {/* ── LEFT: Sticky gallery ──────────────────────────── */}
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

          {/* ── RIGHT: Scrollable product info ────────────────── */}
          <div className="py-10 lg:py-16 lg:border-l lg:border-mist lg:pl-16 xl:pl-24">
            {/* Collection / brand tag */}
            {(collectionTitle || categoryTitle || brandName) && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium m-0 mb-4">
                {collectionTitle ?? categoryTitle ?? brandName}
              </p>
            )}

            {/* Title */}
            <h1 className="font-luxury text-3xl lg:text-4xl xl:text-[42px] font-medium m-0 mb-1 text-obsidian tracking-tight leading-[1.1]">
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

            {/* Dietary badges */}
            {activeDietary.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeDietary.map((d) => (
                  <span
                    key={d.key}
                    className="text-[10px] uppercase tracking-[0.15em] border border-mist text-stone px-3 py-1"
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            )}

            {/* Origin / Weight / SKU */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {product.countryOfOrigin && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1">
                    Origin
                  </p>
                  <p className="text-xs font-medium text-obsidian m-0">
                    {product.countryOfOrigin}
                  </p>
                </div>
              )}
              {product.weight && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1">
                    Weight
                  </p>
                  <p className="text-xs font-medium text-obsidian m-0">{product.weight}</p>
                </div>
              )}
              {product.sku && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-stone m-0 mb-1">
                    SKU
                  </p>
                  <p className="text-xs font-medium text-obsidian m-0">{product.sku}</p>
                </div>
              )}
            </div>

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

            {/* ── Accordions ───────────────────────────────────── */}
            <div className="mt-0">
              <AccordionItem
                label="Description"
                isOpen={openAccordion === 'description'}
                onToggle={() => toggleAccordion('description')}
              >
                {product.shortDescription ? (
                  <p className="m-0">{product.shortDescription}</p>
                ) : (
                  <p className="m-0 text-stone/60">No description available.</p>
                )}
              </AccordionItem>

              {(product.ingredients || product.allergens) && (
                <AccordionItem
                  label="Ingredients & Allergens"
                  isOpen={openAccordion === 'ingredients'}
                  onToggle={() => toggleAccordion('ingredients')}
                >
                  {product.ingredients && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-obsidian m-0 mb-1">
                        Ingredients
                      </p>
                      <p className="m-0">{product.ingredients}</p>
                    </div>
                  )}
                  {product.allergens && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-obsidian m-0 mb-1">
                        Allergens
                      </p>
                      <p className="m-0 font-medium text-obsidian">{product.allergens}</p>
                    </div>
                  )}
                </AccordionItem>
              )}

              {hasNutrition && (
                <AccordionItem
                  label="Nutritional Info"
                  isOpen={openAccordion === 'nutrition'}
                  onToggle={() => toggleAccordion('nutrition')}
                >
                  <p className="text-[10px] uppercase tracking-[0.15em] text-obsidian m-0 mb-3">
                    Per 100g
                  </p>
                  <table className="w-full text-xs">
                    <tbody>
                      {product.nutritionPer100g?.energyKcal != null && (
                        <tr className="border-b border-mist/50">
                          <td className="py-2 text-obsidian">Energy</td>
                          <td className="py-2 text-right text-stone">
                            {product.nutritionPer100g.energyKcal} kcal
                          </td>
                        </tr>
                      )}
                      {product.nutritionPer100g?.protein != null && (
                        <tr className="border-b border-mist/50">
                          <td className="py-2 text-obsidian">Protein</td>
                          <td className="py-2 text-right text-stone">
                            {product.nutritionPer100g.protein}g
                          </td>
                        </tr>
                      )}
                      {product.nutritionPer100g?.carbohydrates != null && (
                        <tr className="border-b border-mist/50">
                          <td className="py-2 text-obsidian">Carbohydrates</td>
                          <td className="py-2 text-right text-stone">
                            {product.nutritionPer100g.carbohydrates}g
                          </td>
                        </tr>
                      )}
                      {product.nutritionPer100g?.fat != null && (
                        <tr className="border-b border-mist/50">
                          <td className="py-2 text-obsidian">Fat</td>
                          <td className="py-2 text-right text-stone">
                            {product.nutritionPer100g.fat}g
                          </td>
                        </tr>
                      )}
                      {product.nutritionPer100g?.salt != null && (
                        <tr>
                          <td className="py-2 text-obsidian">Salt</td>
                          <td className="py-2 text-right text-stone">
                            {product.nutritionPer100g.salt}g
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </AccordionItem>
              )}

              {(product.storageInstructions || product.packaging) && (
                <AccordionItem
                  label="Storage & Packaging"
                  isOpen={openAccordion === 'storage'}
                  onToggle={() => toggleAccordion('storage')}
                >
                  {product.storageInstructions && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-obsidian m-0 mb-1">
                        Storage
                      </p>
                      <p className="m-0">{product.storageInstructions}</p>
                    </div>
                  )}
                  {product.packaging && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-obsidian m-0 mb-1">
                        Packaging
                      </p>
                      <p className="m-0">{product.packaging}</p>
                    </div>
                  )}
                </AccordionItem>
              )}

              {product.specifications && product.specifications.length > 0 && (
                <AccordionItem
                  label="Specifications"
                  isOpen={openAccordion === 'specs'}
                  onToggle={() => toggleAccordion('specs')}
                >
                  <table className="w-full text-xs">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? 'bg-parchment/40' : ''}
                        >
                          <td className="py-2.5 px-3 font-medium text-obsidian">{spec.label}</td>
                          <td className="py-2.5 px-3 text-stone">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AccordionItem>
              )}

              <AccordionItem
                label="Shipping"
                isOpen={openAccordion === 'shipping'}
                onToggle={() => toggleAccordion('shipping')}
              >
                <div className="space-y-1.5">
                  <p className="m-0">Free shipping on orders over $150.</p>
                  <p className="m-0">Standard delivery: 3–7 business days.</p>
                  <p className="m-0">Express delivery: 1–3 business days.</p>
                  <p className="m-0">International shipping available to select countries.</p>
                  {product.shipping?.handlingDays != null && (
                    <p className="m-0">
                      Handling time: {product.shipping.handlingDays} business day
                      {product.shipping.handlingDays !== 1 ? 's' : ''}.
                    </p>
                  )}
                </div>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related products ───────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-mist mt-12">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="font-luxury text-2xl lg:text-3xl font-medium tracking-tight m-0 text-obsidian">
                You May Also Like
              </h2>
              <Link
                href="/products"
                className="text-[11px] uppercase tracking-[0.2em] text-stone hover:text-obsidian transition-colors no-underline"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-mist border border-mist">
              {relatedProducts.map((p) => (
                <div key={p.id} className="bg-cream">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
