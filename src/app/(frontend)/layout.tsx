import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ClientShell } from '@/components/layout/ClientShell'
import { Footer } from '@/components/layout/Footer'
import type { NavItem } from '@/components/layout/MegaMenu'
import type { Media } from '@/payload-types'
import './styles.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deliciousplanet.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Delicious Planet — Premium Food Ingredients',
    template: '%s | Delicious Planet',
  },
  description:
    "The world's finest food ingredients, curated from artisan producers across the globe.",
  openGraph: {
    type: 'website',
    siteName: 'Delicious Planet',
    title: 'Delicious Planet — Premium Food Ingredients',
    description:
      "The world's finest food ingredients, curated from artisan producers across the globe.",
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@deliciousplanet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Delicious Planet',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/logo.svg`,
  description:
    'Global sourcing platform providing high-quality food ingredients selected for consistency, traceability, and culinary performance.',
  sameAs: ['https://instagram.com/deliciousplanet', 'https://facebook.com/deliciousplanet'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'info@deliciousplanet.com',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config: await config })

  const [siteSettings, navigation] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'navigation' }),
  ])

  // Transform CMS nav data for the header
  const navItems: NavItem[] = (navigation.mainNav ?? []).map((item) => ({
    label: item.label,
    href: item.href,
    type: item.type ?? 'link',
    megaMenuColumns: item.megaMenuColumns?.map((col) => ({
      heading: col.heading,
      links: col.links?.map((link) => ({
        label: link.label,
        href: link.href,
        image:
          typeof link.image === 'object' && link.image !== null
            ? ((link.image as Media).url ?? null)
            : null,
      })),
    })),
  }))

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100;200;300;400;500;600;700;800;900&family=Geist+Mono:wght@100;400;500;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <ClientShell navItems={navItems}>
          <main>{children}</main>
        </ClientShell>
        <Footer navigation={navigation} siteSettings={siteSettings} />
      </body>
    </html>
  )
}
