'use client'

import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import type { Supplier, Media } from '@/payload-types'

const PARTNER_LOGOS = [
  { name: 'Admiral Caviar', src: '/images/partner-logo/admiral.webp', w: 160, h: 80 },
  { name: 'Velsoro', src: '/images/partner-logo/velsoro.avif', w: 120, h: 50 },
  { name: 'Caputo', src: '/images/partner-logo/caputo.avif', w: 120, h: 50 },
  { name: 'Cebon', src: '/images/partner-logo/cebon.png', w: 110, h: 40 },
  { name: 'García de la Cruz', src: '/images/partner-logo/garcia.webp', w: 150, h: 70 },
]

interface PartnersMarqueeProps {
  suppliers: Supplier[]
}

export function PartnersMarquee({ suppliers }: PartnersMarqueeProps) {
  // Build logo list: use CMS suppliers with logos, fall back to static logos
  const cmsLogos = suppliers
    .filter((s) => {
      const logo = s.logo
      return typeof logo === 'object' && logo !== null && ((logo as Media).url ?? null)
    })
    .map((s) => ({
      name: s.name,
      src: ((s.logo as Media).sizes?.thumbnail?.url ?? (s.logo as Media).url) as string,
    }))

  const logos = cmsLogos.length > 0 ? cmsLogos : PARTNER_LOGOS

  return (
    <section className="bg-black py-12 md:py-20 lg:py-28 px-5 md:px-6 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        <FadeIn>
          <p className="text-xs md:text-sm text-cream/40 text-center m-0 mb-8 md:mb-12 lg:mb-16 font-light tracking-wide">
            Trusted by culinary professionals from farm to fine dining
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-20">
            {logos.map((logo, i) => (
              <div key={i} className="opacity-50 hover:opacity-90 transition-opacity duration-300">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={'w' in logo ? (logo as any).w : 140}
                  height={'h' in logo ? (logo as any).h : 50}
                  style={{ height: 'auto' }}
                  className="object-contain max-h-10 md:max-h-14 lg:max-h-20 w-auto grayscale invert"
                />
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
