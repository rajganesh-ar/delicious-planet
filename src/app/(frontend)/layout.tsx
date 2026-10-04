import React from 'react'
import type { Metadata, Viewport } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ClientShell } from '@/components/layout/ClientShell'
import { Footer } from '@/components/layout/Footer'
import { FloatingElements } from '@/components/layout/FloatingElements'
import type { AnnouncementItem, SearchScope } from '@/components/layout/Header'
import { stockedBrands } from '@/lib/brand-marks'
import { buildNav } from '@/lib/nav'
import { countryName } from '@/lib/countries'
import { resolveRegions } from '@/lib/regions'
import { SITE_URL } from '@/lib/site-url'
import { siteImage } from '@/lib/site-image'
import './styles.css'

const SITE_NAME = 'Delicious Planet'
const DEFAULT_TITLE = 'Delicious Planet — Premium Food Ingredients'
const DEFAULT_DESCRIPTION =
  "The world's finest food ingredients, curated from artisan producers across the globe."

/**
 * Site-wide metadata defaults. Three things here are load-bearing:
 *
 * `metadataBase` is what lets every other route hand Next a *relative* OG image
 * path and get an absolute URL in the tag. Without it those tags are emitted
 * relative, and a crawler resolving them against its own host fetches nothing.
 *
 * `title.template` gives each page a "Page — Delicious Planet" title from a
 * bare `title: 'Page'`, so no route has to repeat the suffix.
 *
 * The openGraph and twitter blocks are inherited and merged by every child
 * route, so a page that sets only a title and description still emits a
 * complete card.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: siteImage('/images/logo/logo.svg'),
  },
}

/**
 * Declared explicitly rather than left to Next's default. This layout used to
 * render its own <head> element, which suppresses the framework's automatic
 * metadata injection — the tag went missing entirely and every phone laid the
 * site out at 980px and shrank it to fit, so no `lg:` rule ever applied. The
 * font links below are now plain children that React hoists into <head>; keep
 * it that way, and keep this export.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/**
 * Set on the layout rather than per page, because the layout is what goes stale
 * on every route: the mega-menu, footer and origin-country strip below are all
 * built from the live catalogue, so without this a product added in the admin
 * stays invisible site-wide until the next deploy.
 *
 * Routes that await `searchParams`/`params` (`/products`, `/categories/[slug]`,
 * `/journal`) are dynamic already and unaffected.
 */
export const revalidate = 300

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config: await config })

  const [siteSettings, navigation, categoriesRes, brandsRes, regionsRes, productsRes] =
    await Promise.all([
      payload.findGlobal({ slug: 'site-settings' }),
      payload.findGlobal({ slug: 'navigation' }),
      // Departments only. The menu lists top-level product types; a
      // sub-category reaches the shopper through its department's listing, and
      // without this filter it would sit in the menu as a peer of its own parent.
      payload.find({
        collection: 'categories',
        where: { parent: { exists: false } },
        limit: 20,
        depth: 1,
        sort: 'sortOrder',
      }),
      payload.find({ collection: 'brands', limit: 0, pagination: false, depth: 0 }),
      // Region wording and card art only — membership comes from origin.country.
      payload.find({ collection: 'regions', limit: 20, depth: 1 }),
      // Origins have no collection of their own — tally the free-text field so the
      // menu only offers countries that actually return products. Brands are
      // tallied from the same rows, for the same reason.
      payload.find({
        collection: 'products',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        depth: 0,
        select: { origin: true, brand: true },
      }),
    ])

  const originCounts = new Map<string, number>()
  for (const doc of productsRes.docs) {
    const country = countryName(doc.origin?.country)
    if (country) originCounts.set(country, (originCounts.get(country) ?? 0) + 1)
  }
  const originCountries = [...originCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([country]) => country)

  // The navbar is generated from the live catalogue so its menus can't drift
  // from it; anything an editor added in the CMS is appended.
  const nav = buildNav({
    categories: categoriesRes.docs,
    brands: stockedBrands(brandsRes.docs, productsRes.docs).map(({ brand }) => ({
      slug: brand.slug,
      title: brand.title,
    })),
    regions: resolveRegions(regionsRes.docs),
    originCountries,
    cmsItems: (navigation.mainNav ?? []).map((item) => ({ label: item.label, href: item.href })),
  })

  const searchScopes: SearchScope[] = categoriesRes.docs.map((cat) => ({
    label: cat.title,
    slug: cat.slug,
  }))

  const bar = siteSettings.announcementBar
  const announcements: AnnouncementItem[] | undefined =
    bar?.enabled && bar.message
      ? [{ message: bar.message, linkLabel: bar.linkLabel, linkHref: bar.linkHref }]
      : undefined

  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Outfit:wght@300;400;500;600;700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <ClientShell nav={nav} searchScopes={searchScopes} announcements={announcements}>
          <main>{children}</main>
        </ClientShell>
        <Footer navigation={navigation} siteSettings={siteSettings} />
        <FloatingElements />
      </body>
    </html>
  )
}
