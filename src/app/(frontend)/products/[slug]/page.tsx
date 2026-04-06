import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { ProductDetail } from '@/components/sections/ProductDetail'
import type { Media } from '@/payload-types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 1,
  })

  const product = result.docs[0]
  if (!product) return {}

  const title = product.meta?.title ?? `${product.title} — Delicious Planet`
  const description =
    product.meta?.description ??
    `Premium ${product.title} from Delicious Planet. Sourced from the world's finest producers.`

  const ogImage =
    product.meta?.image && typeof product.meta.image === 'object'
      ? (product.meta.image as Media).url
      : product.images?.[0]?.image && typeof product.images[0].image === 'object'
        ? (product.images[0].image as Media).url
        : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(ogImage && {
        images: [{ url: ogImage, width: 1200, height: 630, alt: product.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function SingleProductPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 3,
  })

  const product = result.docs[0]
  if (!product) notFound()

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
    limit: 4,
    depth: 2,
  })

  // JSON-LD structured data
  const price = product.prices?.[0]
  const imageUrl =
    product.images?.[0]?.image && typeof product.images[0].image === 'object'
      ? (product.images[0].image as Media).url
      : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.meta?.description ?? undefined,
    sku: product.sku ?? undefined,
    ...(imageUrl && { image: imageUrl }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.amount,
        priceCurrency: price.currency,
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: `https://deliciousplanet.com/products/${product.slug}`,
      },
    }),
    brand: {
      '@type': 'Organization',
      name: 'Delicious Planet',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} relatedProducts={related.docs} />
    </>
  )
}
