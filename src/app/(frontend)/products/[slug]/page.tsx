import { cache } from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { ProductDetail } from '@/components/sections/ProductDetail'
import { getImageUrl, getPrice, getVariants } from '@/lib/product'
import { absoluteUrl } from '@/lib/site-url'
import type { Product } from '@/payload-types'

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * `generateMetadata` and the page component both need the product, and Next
 * calls them as two separate invocations. React's `cache` memoises the lookup
 * for the lifetime of one request, so this stays a single database round trip
 * rather than doubling every product page's query count.
 */
const loadProduct = cache(async (slug: string): Promise<Product | null> => {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 3,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await loadProduct(slug)

  // A missing product still renders (the page calls notFound() next), so the
  // metadata has to be valid for that pass too.
  if (!product) return { title: 'Product not found' }

  // The CMS `meta` group wins when an editor has filled it in; otherwise the
  // product's own copy stands in, which is what the vast majority of imported
  // rows will use.
  const title = product.meta?.title?.trim() || product.title
  const description =
    product.meta?.description?.trim() ||
    product.shortDescription?.trim() ||
    `${product.title} — sourced by Delicious Planet.`

  const metaImage = product.meta?.image
  const imageUrl =
    (typeof metaImage === 'object' && metaImage !== null ? metaImage.url : null) ||
    getImageUrl(product)

  const url = absoluteUrl(`/products/${product.slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: product.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}

/**
 * Product structured data.
 *
 * This is the markup that turns a search result into a rich one — price,
 * currency and availability shown in the listing itself. Emitted per variant
 * through `offers` so a multi-size product advertises its real price range
 * rather than only the cheapest tin.
 */
function productJsonLd(product: Product, imageUrl: string | null) {
  const variants = getVariants(product)
  const price = getPrice(product)

  const offers = variants
    .filter((v) => typeof v.price === 'number' && v.sku)
    .map((v) => ({
      '@type': 'Offer',
      sku: v.sku,
      ...(v.size ? { name: `${product.title} — ${v.size}` } : {}),
      price: v.price,
      priceCurrency: price?.currency ?? 'AED',
      availability:
        v.inStock === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: absoluteUrl(`/products/${product.slug}`),
    }))

  const brand =
    typeof product.brand === 'object' && product.brand !== null ? product.brand.title : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.shortDescription ? { description: product.shortDescription } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    ...(offers.length > 0 ? { offers } : {}),
  }
}

export default async function SingleProductPage({ params }: Props) {
  const { slug } = await params
  const product = await loadProduct(slug)
  if (!product) notFound()

  const payload = await getPayload({ config: await config })

  // Get related products from same category
  const categoryId =
    typeof product.category === 'object' && product.category !== null
      ? product.category.id
      : product.category

  const related = await payload.find({
    collection: 'products',
    where: {
      and: [
        { category: { equals: categoryId } },
        { id: { not_equals: product.id } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 5,
    depth: 2,
  })

  return (
    <>
      <script
        type="application/ld+json"
        // The payload is built from our own database rows, not user input, and
        // JSON.stringify escapes the quotes that would otherwise break out.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, getImageUrl(product))),
        }}
      />
      <ProductDetail product={product} relatedProducts={related.docs} />
    </>
  )
}
