import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ClientShell } from '@/components/layout/ClientShell'
import { Footer } from '@/components/layout/Footer'
import { FloatingElements } from '@/components/layout/FloatingElements'
import type { AnnouncementItem, SearchScope } from '@/components/layout/Header'
import { buildNav } from '@/lib/nav'
import './styles.css'

export const metadata = {
  title: 'Delicious Planet — Premium Food Ingredients',
  description:
    "The world's finest food ingredients, curated from artisan producers across the globe.",
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config: await config })

  const [siteSettings, navigation, categoriesRes, collectionsRes, suppliersRes, originsRes] =
    await Promise.all([
      payload.findGlobal({ slug: 'site-settings' }),
      payload.findGlobal({ slug: 'navigation' }),
      // Regions are modelled as top-level categories ("Bite Into Europe").
      payload.find({ collection: 'categories', limit: 12, depth: 1, sort: 'sortOrder' }),
      payload.find({ collection: 'product-collections', limit: 20, depth: 1, sort: 'sortOrder' }),
      payload.find({ collection: 'suppliers', limit: 8, depth: 0, sort: 'name' }),
      // Origins have no collection of their own — tally the free-text field so the
      // menu only offers countries that actually return products.
      payload.find({
        collection: 'products',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        depth: 0,
        select: { countryOfOrigin: true },
      }),
    ])

  const originCounts = new Map<string, number>()
  for (const doc of originsRes.docs) {
    const country = doc.countryOfOrigin?.trim()
    if (country) originCounts.set(country, (originCounts.get(country) ?? 0) + 1)
  }
  const originCountries = [...originCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([country]) => country)

  // The navbar is generated from the live catalogue so its menus can't drift
  // from it; anything an editor added in the CMS is appended.
  const nav = buildNav({
    categories: categoriesRes.docs,
    collections: collectionsRes.docs,
    suppliers: suppliersRes.docs,
    originCountries,
    cmsItems: (navigation.mainNav ?? []).map((item) => ({ label: item.label, href: item.href })),
  })

  const searchScopes: SearchScope[] = collectionsRes.docs.map((col) => ({
    label: col.title,
    slug: col.slug,
  }))

  const bar = siteSettings.announcementBar
  const announcements: AnnouncementItem[] | undefined =
    bar?.enabled && bar.message
      ? [{ message: bar.message, linkLabel: bar.linkLabel, linkHref: bar.linkHref }]
      : undefined

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Outfit:wght@300;400;500;600;700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientShell nav={nav} searchScopes={searchScopes} announcements={announcements}>
          <main>{children}</main>
        </ClientShell>
        <Footer navigation={navigation} siteSettings={siteSettings} />
        <FloatingElements />
      </body>
    </html>
  )
}
