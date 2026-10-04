import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

/**
 * Background photography for the homepage banners, and four banners that each
 * feature a catalogue product (the `product` field — see Banners.ts).
 *
 * Safe to re-run:
 *  - a photo is uploaded once, matched on `media.sourceUrl`;
 *  - an existing banner is only given a photo or product if it has none, so an
 *    editor's later choice is never overwritten;
 *  - a new banner is skipped if one with its title already exists.
 *
 * Photos are Unsplash-licensed: free for commercial use, no credit required.
 * Every one was picked to carry no third-party branding — the hot-sauce search
 * was all competitors' labels, hence dried chillies.
 */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`

const PHOTOS = {
  halal: { id: '1777716003985-68fed08d0c7e', alt: 'Grilled kebabs with pita, salad and tea' },
  pantry: { id: '1621318551436-68573392fd5c', alt: 'Glass jars of dried pantry staples' },
  pizza: { id: '1532460734809-e7f8475ca917', alt: 'Hands stretching pizza dough on a floured bench' },
  olives: { id: '1634657443172-efbae44fd04b', alt: 'Freshly harvested green and black olives' },
  caviar: { id: '1753078947472-c1b4c782f861', alt: 'Quenelles of black caviar on a chilled tray' },
  chocolate: { id: '1626697556651-67ebdcb8cbd6', alt: 'Broken dark chocolate bars on slate' },
  chillies: { id: '1771308355347-2a2b9e68bb56', alt: 'Bunches of dried red chillies hanging to dry' },
} as const

type PhotoKey = keyof typeof PHOTOS

/** Existing banners (from seed-banners.ts), matched on title. */
const UPDATES: { title: string; photo: PhotoKey; product?: string }[] = [
  { title: 'Split — halal range', photo: 'halal' },
  { title: 'Split — under AED 50', photo: 'pantry' },
  { title: 'Wide — Italian pantry', photo: 'pizza', product: 'caputo-00-pizzeria-flour' },
]

/**
 * Product banners. No `ctaHref`: a banner with a product and no link goes to
 * that product's page. Copy is taken from each product's own description.
 */
const CREATES = [
  {
    title: 'Split — García de la Cruz early harvest',
    placement: 'after-new-arrivals',
    eyebrow: 'García de la Cruz · Spain',
    heading: 'The first press of the season',
    subheading: 'Early Harvest olive oil from the Montes de Toledo groves, pressed in mid-October.',
    ctaLabel: 'Shop the oil',
    photo: 'olives',
    product: 'early-harvest-our-most-exquisite-masterpiece',
    sortOrder: 2,
  },
  {
    title: 'Split — Admiral Royal Beluga',
    placement: 'after-new-arrivals',
    eyebrow: 'Admiral Caviar',
    heading: 'Royal Beluga',
    subheading: 'Iranian beluga caviar, delivered across Dubai and the UAE.',
    ctaLabel: 'Shop caviar',
    photo: 'caviar',
    product: 'royal-beluga',
    sortOrder: 3,
  },
  {
    title: 'Split — Velsoro bonbons',
    placement: 'before-newsletter',
    eyebrow: 'Velsoro',
    heading: 'Handcrafted bonbons',
    subheading: 'Twelve chocolates in four gourmet flavours, each made from scratch.',
    ctaLabel: 'Shop the box',
    photo: 'chocolate',
    product: 'box-of-12-mixed-artisanal-bonbons',
    sortOrder: 2,
  },
  {
    title: 'Split — La Meridana habanero sampler',
    placement: 'before-newsletter',
    eyebrow: 'La Meridana · Mexico',
    heading: 'Mexican heat, sampled',
    subheading: 'Smoky, fruity and fiery habanero sauces, straight from Mexico.',
    ctaLabel: 'Shop the sampler',
    photo: 'chillies',
    product: 'hot-habanero-sauce-sampler-pack-la-meridana',
    sortOrder: 3,
  },
] as const satisfies readonly {
  title: string
  placement: 'below-hero' | 'after-best-sellers' | 'after-new-arrivals' | 'before-newsletter'
  photo: PhotoKey
  product: string
  [key: string]: unknown
}[]

const run = async () => {
  const payload = await getPayload({ config: await config })

  const mediaIds = new Map<PhotoKey, number>()
  const photo = async (key: PhotoKey): Promise<number> => {
    const cached = mediaIds.get(key)
    if (cached) return cached

    const { id, alt } = PHOTOS[key]
    const sourceUrl = unsplash(id)
    const existing = await payload.find({
      collection: 'media',
      where: { sourceUrl: { equals: sourceUrl } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      mediaIds.set(key, existing.docs[0].id)
      return existing.docs[0].id
    }

    // 2400px covers the 1920 `hero` rendition with headroom for its crop.
    const res = await fetch(`${sourceUrl}?w=2400&q=85&fm=jpg`)
    if (!res.ok) throw new Error(`Download failed for ${key}: HTTP ${res.status}`)
    const data = Buffer.from(await res.arrayBuffer())
    const doc = await payload.create({
      collection: 'media',
      data: { alt, sourceUrl },
      file: { data, mimetype: 'image/jpeg', name: `banner-${key}.jpg`, size: data.length },
    })
    console.log(`  uploaded: ${key} (media ${doc.id})`)
    mediaIds.set(key, doc.id)
    return doc.id
  }

  const productId = async (slug: string): Promise<number> => {
    const { docs } = await payload.find({
      collection: 'products',
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      limit: 1,
      depth: 0,
    })
    if (!docs[0]) throw new Error(`No published product with slug "${slug}"`)
    return docs[0].id
  }

  for (const { title, photo: key, product } of UPDATES) {
    const { docs } = await payload.find({
      collection: 'banners',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
    })
    const banner = docs[0]
    if (!banner) {
      console.log(`  skip (missing): ${title}`)
      continue
    }
    const data: { image?: number; product?: number } = {}
    if (!banner.image) data.image = await photo(key)
    if (product && !banner.product) data.product = await productId(product)
    if (Object.keys(data).length === 0) {
      console.log(`  skip (already set): ${title}`)
      continue
    }
    await payload.update({ collection: 'banners', id: banner.id, data })
    console.log(`  updated: ${title}`)
  }

  for (const { photo: key, product, ...banner } of CREATES) {
    const existing = await payload.find({
      collection: 'banners',
      where: { title: { equals: banner.title } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      console.log(`  skip (exists): ${banner.title}`)
      continue
    }
    await payload.create({
      collection: 'banners',
      data: {
        ...banner,
        variant: 'split',
        theme: 'dark',
        image: await photo(key),
        product: await productId(product),
        active: true,
      },
    })
    console.log(`  created: ${banner.title}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
