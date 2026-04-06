'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Navigation as NavigationType, SiteSetting } from '@/payload-types'

interface FooterProps {
  navigation: NavigationType
  siteSettings: SiteSetting
}

const FALLBACK_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'Brands', href: '/brands' },
      { label: 'Commercial Supply', href: '/commercial' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { label: 'Experiences', href: '/experiences' },
      { label: 'Journal', href: '/journal' },
      { label: 'Recipes', href: '/recipes' },
      { label: 'Sourcing', href: '/sourcing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Vendors & Partnerships', href: '/vendors' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Policies', href: '/policies' },
      { label: 'Shipping Policy', href: '/shipping' },
      { label: 'Commercial Terms', href: '/policies#commercial-terms' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'Account', href: '/account' },
    ],
  },
]

export function Footer({ navigation, siteSettings }: FooterProps) {
  const socials = siteSettings.socials
  const cmsColumns = navigation.footerColumns ?? []
  const columns = cmsColumns.length > 0 ? cmsColumns : FALLBACK_COLUMNS

  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current) return
      const rect = bgRef.current.closest('footer')!.getBoundingClientRect()
      const progress = -rect.top / (window.innerHeight + rect.height)
      bgRef.current.style.transform = `translateY(${progress * 80}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const socialLinks: { label: string; href: string | null | undefined }[] = [
    { label: 'Instagram', href: socials?.instagram },
    { label: 'Facebook', href: socials?.facebook },
    { label: 'X (Twitter)', href: socials?.twitter },
    { label: 'LinkedIn', href: socials?.linkedin },
  ].filter((s) => s.href)

  return (
    <footer className="relative overflow-hidden bg-black text-cream/80 pb-20">
      {/* Parallax background image */}
      <div ref={bgRef} className="absolute inset-[-80px]" style={{ willChange: 'transform' }}>
        <img src="/images/misc/footer.avif" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Gradient: transparent at top → solid black towards bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.92) 55%, #000000 70%)',
        }}
      />

      {/* Content wrapper — sets footer height, pushes text to bottom */}
      <div
        className="relative z-10 flex flex-col"
        style={{ minHeight: 'clamp(420px, 38vw, 620px)' }}
      >
        <div className="flex-1" />

        <div className="w-full px-6 lg:px-16 pb-12 pt-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            {/* Left: Logo + copyright */}
            <div className="shrink-0 lg:max-w-65">
              <Link href="/" className="no-underline inline-block">
                <img
                  src="/images/logo/logo.svg"
                  alt="Delicious Planet"
                  className="h-10 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </Link>
              <p className="text-xs text-cream/30 m-0 mt-5">
                &copy; {new Date().getFullYear()} Delicious Planet. All rights reserved.
              </p>
            </div>

            {/* Right: Link columns */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10">
              {columns.map((col, idx) => (
                <div key={idx}>
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-cream/35 font-semibold mb-5 mt-0">
                    {col.heading}
                  </h4>
                  <ul className="list-none m-0 p-0 space-y-2.5">
                    {col.links?.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className="text-[13px] text-cream/50 hover:text-cream/90 transition-colors no-underline leading-snug"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Connect column (social links as text) */}
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-cream/35 font-semibold mb-5 mt-0">
                  Connect
                </h4>
                <ul className="list-none m-0 p-0 space-y-2.5">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-cream/50 hover:text-cream/90 transition-colors no-underline leading-snug"
                        >
                          {social.label}
                        </a>
                      </li>
                    ))
                  ) : (
                    <>
                      <li>
                        <a
                          href="https://instagram.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-cream/50 hover:text-cream/90 transition-colors no-underline"
                        >
                          Instagram
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://facebook.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-cream/50 hover:text-cream/90 transition-colors no-underline"
                        >
                          Facebook
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://x.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-cream/50 hover:text-cream/90 transition-colors no-underline"
                        >
                          X (Twitter)
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://linkedin.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-cream/50 hover:text-cream/90 transition-colors no-underline"
                        >
                          LinkedIn
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
