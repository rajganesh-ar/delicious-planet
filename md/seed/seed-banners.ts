import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

/**
 * Example homepage banners. Safe to re-run: it skips any banner whose title
 * already exists. Edit or delete them in the admin at /admin/collections/banners.
 */
const BANNERS = [
  {
    title: 'Hero strip — sourced direct',
    placement: 'below-hero',
    variant: 'strip',
    theme: 'forest',
    eyebrow: 'Delicious Planet',
    heading: 'Authentic gourmet, sourced direct from origin',
    ctaLabel: 'Shop all',
    ctaHref: '/products',
    sortOrder: 1,
  },
  {
    title: 'Split — halal range',
    placement: 'after-best-sellers',
    variant: 'split',
    theme: 'dark',
    eyebrow: 'Certified',
    heading: 'Halal Range',
    subheading: 'Explore our halal-certified selection across every category.',
    ctaLabel: 'Shop halal',
    ctaHref: '/products?dietary=halal',
    sortOrder: 1,
  },
  {
    title: 'Split — under AED 50',
    placement: 'after-best-sellers',
    variant: 'split',
    theme: 'forest',
    eyebrow: 'Everyday value',
    heading: 'Under AED 50',
    subheading: 'Pantry staples and small-format essentials.',
    ctaLabel: 'Shop the range',
    ctaHref: '/products?price=under-50',
    sortOrder: 2,
  },
  {
    title: 'Wide — Italian pantry',
    placement: 'after-new-arrivals',
    variant: 'wide',
    theme: 'dark',
    eyebrow: 'Direct from Italy',
    heading: 'The Italian Pantry',
    subheading: 'Professional milling from Naples — pizza, pasta and bread flours.',
    ctaLabel: 'Shop Italy',
    ctaHref: '/products?originCountry=Italy',
    sortOrder: 1,
  },
  {
    title: 'Strip — trade & wholesale',
    placement: 'before-newsletter',
    variant: 'strip',
    theme: 'dark',
    eyebrow: 'Trade & wholesale',
    heading: 'Pricing for restaurants and retailers',
    ctaLabel: 'Enquire',
    ctaHref: '/b2b',
    sortOrder: 1,
  },
] as const

const run = async () => {
  const payload = await getPayload({ config: await config })

  for (const banner of BANNERS) {
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
    await payload.create({ collection: 'banners', data: { ...banner, active: true } })
    console.log(`  created: ${banner.title}`)
  }

  const total = await payload.find({ collection: 'banners', limit: 0 })
  console.log(`\nBanners in database: ${total.totalDocs}`)
  process.exit(0)
}

run()
