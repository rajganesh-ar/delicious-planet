import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ClientShell } from '@/components/layout/ClientShell'
import { Footer } from '@/components/layout/Footer'
import { FloatingElements } from '@/components/layout/FloatingElements'
import type { NavItem } from '@/components/layout/MegaMenu'
import type { Media } from '@/payload-types'
import './styles.css'

export const metadata = {
  title: 'Delicious Planet — Premium Food Ingredients',
  description:
    "The world's finest food ingredients, curated from artisan producers across the globe.",
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
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Outfit:wght@300;400;500;600;700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientShell navItems={navItems}>
          <main>{children}</main>
        </ClientShell>
        <Footer navigation={navigation} siteSettings={siteSettings} />
        <FloatingElements />
      </body>
    </html>
  )
}
