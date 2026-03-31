import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { ProductDetail } from '@/components/sections/ProductDetail'

interface Props {
  params: Promise<{ slug: string }>
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

  return <ProductDetail product={product} relatedProducts={related.docs} />
}
