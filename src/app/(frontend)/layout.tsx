import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Lexend, Merriweather, Poppins } from 'next/font/google'
import { unstable_cache } from 'next/cache'
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

/**
 * Self-hosted through next/font rather than a fonts.googleapis.com stylesheet.
 * That link was render-blocking and cross-origin on every first visit, and sat
 * in <body> where React does not hoist it. next/font serves the files from this
 * deployment and adds metric-matched fallbacks, so text does not jump when the
 * real face arrives. The CSS variables feed the @theme font stacks in
 * styles.css. Outfit is no longer loaded: it only ever sat behind Lexend in
 * the sans stack, where it was never reached.
 */
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend', display: 'swap' })
const merriweather = Merriweather({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-merriweather',
  display: 'swap',
})
// Static family, so each weight is its own file — not preloaded, or every
// page would fetch all ten up front.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
})

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
  // Site-wide values only. Next merges `openGraph` per key rather than deriving
  // it from `title`, so a title, description and url set here were inherited
  // by every page that did not set its own — /about, /contact and every journal
  // post shared as the homepage. Without them, link previews fall back to the
  // page's own <title> and description; pages that want more set their own
  // (home, products, categories, journal posts).
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
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
 * site out at 980px and shrank it to fit, so no `lg:` rule ever applied. Keep
 * this export, and keep <head> out of this layout.
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
 * `/journal`) are dynamic already, which is why the reads themselves are
 * cached too — see loadLayoutData.
 */
export const revalidate = 300

/**
 * The layout's reads, cached across requests on the same 300s window.
 *
 * `revalidate` only helps statically rendered pages. On the dynamic routes this
 * layout re-ran all six queries — a 1,000-row product scan among them — for
 * every visitor, which is most of the database work behind a /products page.
 * The window matches the facet cache in products/page.tsx, so the menus and the
 * filter counts pick up admin changes on the same cadence.
 */
const loadLayoutData = unstable_cache(
  async () => {
    const payload = await getPayload({ config: await config })
    const [siteSettings, navigation, categoriesRes, brandsRes, regionsRes, productsRes] =
      await loadLayoutQueries(payload)
    return {
      siteSettings,
      navigation,
      categories: categoriesRes.docs,
      brands: brandsRes.docs,
      regions: regionsRes.docs,
      products: productsRes.docs,
    }
  },
  ['storefront-layout'],
  { revalidate: 300, tags: ['layout', 'products'] },
)

function loadLayoutQueries(payload: Awaited<ReturnType<typeof getPayload>>) {
  return Promise.all([
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
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { siteSettings, navigation, categories, brands, regions, products } =
    await loadLayoutData()

  const originCounts = new Map<string, number>()
  for (const doc of products) {
    const country = countryName(doc.origin?.country)
    if (country) originCounts.set(country, (originCounts.get(country) ?? 0) + 1)
  }
  const originCountries = [...originCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([country]) => country)

  // The navbar is generated from the live catalogue so its menus can't drift
  // from it; anything an editor added in the CMS is appended.
  const nav = buildNav({
    categories,
    brands: stockedBrands(brands, products).map(({ brand }) => ({
      slug: brand.slug,
      title: brand.title,
    })),
    regions: resolveRegions(regions),
    originCountries,
    cmsItems: (navigation.mainNav ?? []).map((item) => ({ label: item.label, href: item.href })),
  })

  const searchScopes: SearchScope[] = categories.map((cat) => ({
    label: cat.title,
    slug: cat.slug,
  }))

  const bar = siteSettings.announcementBar
  const announcements: AnnouncementItem[] | undefined =
    bar?.enabled && bar.message
      ? [{ message: bar.message, linkLabel: bar.linkLabel, linkHref: bar.linkHref }]
      : undefined

  return (
    <html lang="en" className={`${lexend.variable} ${merriweather.variable} ${poppins.variable}`}>
      <body>
        {/* First focusable thing on every page, so keyboard and switch users
            are not walked through the whole header before the content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-1000 focus:bg-obsidian focus:text-cream focus:px-4 focus:py-3 focus:text-sm focus:no-underline"
        >
          Skip to content
        </a>
        <ClientShell nav={nav} searchScopes={searchScopes} announcements={announcements}>
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </ClientShell>
        {/* Only the socials: the footer is a client component, and the whole
            settings global would ship the staff alert address to the browser. */}
        <Footer navigation={navigation} socials={siteSettings.socials} />
        <FloatingElements />
      </body>
    </html>
  )
}
