import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

async function upsertBySlug(
  payload: PayloadInstance,
  collection: 'warehouses' | 'categories' | 'suppliers' | 'brands',
  data: Record<string, unknown>,
): Promise<number> {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: data.slug as string } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  [skip] ${collection}/${data.slug} already exists`)
    return existing.docs[0]!.id as number
  }
  const doc = await payload.create({ collection, data: data as never, overrideAccess: true })
  console.log(`  [created] ${collection}/${data.slug}`)
  return doc.id as number
}

export async function seedBaseData(payload?: PayloadInstance) {
  if (!payload) payload = await getPayload({ config })

  console.log('\n=== Warehouses ===')
  await upsertBySlug(payload, 'warehouses', {
    name: 'Dubai Main',
    slug: 'dubai-main',
    isActive: true,
    address: { city: 'Dubai', country: 'UAE' },
  })
  await upsertBySlug(payload, 'warehouses', {
    name: 'Abu Dhabi',
    slug: 'abu-dhabi',
    isActive: true,
    address: { city: 'Abu Dhabi', country: 'UAE' },
  })

  console.log('\n=== Suppliers ===')
  await upsertBySlug(payload, 'suppliers', {
    name: 'Admiral Caviar',
    slug: 'admiral-caviar',
    country: 'UAE',
    website: 'https://www.admiralcaviar.com',
  })
  await upsertBySlug(payload, 'suppliers', {
    name: 'Velsoro Chocolate',
    slug: 'velsoro-chocolate',
    country: 'UAE',
    website: 'https://www.velsoro.com',
  })
  await upsertBySlug(payload, 'suppliers', {
    name: 'Casinetto',
    slug: 'casinetto',
    country: 'UAE',
    website: 'https://casinetto.com',
  })

  console.log('\n=== Brands ===')
  await upsertBySlug(payload, 'brands', {
    title: 'Admiral Caviar',
    slug: 'admiral-caviar',
    website: 'https://www.admiralcaviar.com',
  })
  await upsertBySlug(payload, 'brands', {
    title: 'Velsoro',
    slug: 'velsoro',
    website: 'https://www.velsoro.com',
  })
  await upsertBySlug(payload, 'brands', {
    title: 'Caputo',
    slug: 'caputo',
    description: 'Mulino Caputo — premium Italian flour from Naples since 1924.',
    website: 'https://www.mulinocaputo.it',
  })

  console.log('\n=== Categories ===')
  // Top-level
  const caviarId = await upsertBySlug(payload, 'categories', {
    title: 'Caviar',
    slug: 'caviar',
    sortOrder: 1,
  })
  const chocolateId = await upsertBySlug(payload, 'categories', {
    title: 'Chocolate',
    slug: 'chocolate',
    sortOrder: 2,
  })
  const flourId = await upsertBySlug(payload, 'categories', {
    title: 'Flour & Baking',
    slug: 'flour-baking',
    sortOrder: 3,
  })

  // Caviar sub-categories
  await upsertBySlug(payload, 'categories', {
    title: 'Caviar Selection',
    slug: 'caviar-selection',
    parent: caviarId,
    sortOrder: 1,
  })
  await upsertBySlug(payload, 'categories', {
    title: 'Caviar Gift Sets',
    slug: 'caviar-gift-sets',
    parent: caviarId,
    sortOrder: 2,
  })
  await upsertBySlug(payload, 'categories', {
    title: 'Caviar Accessories',
    slug: 'caviar-accessories',
    parent: caviarId,
    sortOrder: 3,
  })

  // Chocolate sub-categories
  await upsertBySlug(payload, 'categories', {
    title: 'Chocolate Boxes & Bonbons',
    slug: 'chocolate-boxes-bonbons',
    parent: chocolateId,
    sortOrder: 1,
  })
  await upsertBySlug(payload, 'categories', {
    title: 'Chocolate Bars',
    slug: 'chocolate-bars',
    parent: chocolateId,
    sortOrder: 2,
  })
  await upsertBySlug(payload, 'categories', {
    title: 'Chocolate Truffles',
    slug: 'chocolate-truffles',
    parent: chocolateId,
    sortOrder: 3,
  })
  await upsertBySlug(payload, 'categories', {
    title: 'Teddy Bears',
    slug: 'teddy-bears',
    parent: chocolateId,
    sortOrder: 4,
  })
  await upsertBySlug(payload, 'categories', {
    title: 'Velterra Collection',
    slug: 'velterra-collection',
    parent: chocolateId,
    sortOrder: 5,
  })

  // Flour sub-categories
  await upsertBySlug(payload, 'categories', {
    title: 'Caputo Flour & Baking',
    slug: 'caputo-flour-baking',
    parent: flourId,
    sortOrder: 1,
  })

  console.log('\n✅ Base data seeded successfully.')
}

// Run directly: tsx src/seed/seed-base-data.ts
if (process.argv[1]?.endsWith('seed-base-data.ts')) {
  seedBaseData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
