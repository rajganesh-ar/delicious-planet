import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SITE_URL } from '@/lib/site-url'

/**
 * Served at /sitemap.xml.
 *
 * Regenerated on the same 300s cadence as the storefront layout, so a product
 * published in the admin appears to crawlers without a redeploy — a static
 * sitemap would pin the catalogue to whatever existed at build time, which for
 * a CMS-driven store is the whole problem.
 */
export const revalidate = 300

/**
 * Routes that are real, indexable pages. Deliberately excludes the basket,
 * checkout, account and auth routes — those are listed as disallowed in
 * robots.ts, and a URL should never appear in both.
 */
const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/categories', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/categories/directory', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/brands', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/journal', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/b2b', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/sourcing', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/sustainability', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/retail', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/vendors', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/experiences', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/recipes', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/shipping', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/policies', priority: 0.3, changeFrequency: 'yearly' },
]

/** Payload returns ISO strings; the sitemap wants a Date, and a bad one throws. */
function toDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: await config })

  // `select` keeps these to the two columns the sitemap actually emits — the
  // catalogue is large enough that pulling whole documents here would be the
  // most expensive query on the site.
  const [products, categories, posts] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: 5000,
      depth: 0,
      sort: '-updatedAt',
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'categories',
      limit: 500,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'blog-posts',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      sort: '-updatedAt',
      select: { slug: true, updatedAt: true },
    }),
  ])

  const now = new Date()

  return [
    ...STATIC_PATHS.map((entry) => ({
      url: `${SITE_URL}${entry.path}`,
      lastModified: now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
    ...products.docs
      .filter((doc) => doc.slug)
      .map((doc) => ({
        url: `${SITE_URL}/products/${doc.slug}`,
        lastModified: toDate(doc.updatedAt) ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ...categories.docs
      .filter((doc) => doc.slug)
      .map((doc) => ({
        url: `${SITE_URL}/categories/${doc.slug}`,
        lastModified: toDate(doc.updatedAt) ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ...posts.docs
      .filter((doc) => doc.slug)
      .map((doc) => ({
        url: `${SITE_URL}/journal/${doc.slug}`,
        lastModified: toDate(doc.updatedAt) ?? now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
  ]
}
