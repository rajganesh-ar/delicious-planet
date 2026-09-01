import Link from 'next/link'
import { FadeIn } from '@/components/animations/FadeIn'
import { SectionHeader } from './SectionHeader'

export interface CountryCount {
  country: string
  count: number
}

interface ShopByCountryProps {
  countries: CountryCount[]
}

/** Regional-indicator flag emoji, e.g. "IT" → 🇮🇹 */
function flag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

const ISO: Record<string, string> = {
  Belgium: 'BE',
  Italy: 'IT',
  France: 'FR',
  Spain: 'ES',
  Greece: 'GR',
  Portugal: 'PT',
  Germany: 'DE',
  Netherlands: 'NL',
  Switzerland: 'CH',
  Turkey: 'TR',
  Lebanon: 'LB',
  'United Arab Emirates': 'AE',
  UAE: 'AE',
  'Saudi Arabia': 'SA',
  Morocco: 'MA',
  Egypt: 'EG',
  Tunisia: 'TN',
  Ethiopia: 'ET',
  Kenya: 'KE',
  'South Africa': 'ZA',
  Mexico: 'MX',
  Brazil: 'BR',
  Peru: 'PE',
  Colombia: 'CO',
  Argentina: 'AR',
  Chile: 'CL',
  China: 'CN',
  Japan: 'JP',
  India: 'IN',
  Thailand: 'TH',
  Vietnam: 'VN',
  USA: 'US',
  'United States': 'US',
  'United Kingdom': 'GB',
}

export function ShopByCountry({ countries }: ShopByCountryProps) {
  if (countries.length === 0) return null

  return (
    <section className="py-8 md:py-11">
      <SectionHeader title="Shop by Country of Origin" href="/products" className="mb-5 md:mb-7" />

      <div className="flex flex-wrap gap-2 md:gap-2.5">
        {countries.map(({ country, count }, i) => {
          const iso = ISO[country]
          return (
            <FadeIn key={country} delay={i * 0.04}>
              <Link
                href={`/products?originCountry=${encodeURIComponent(country)}`}
                className="group flex items-center gap-2 h-10 pl-3 pr-3.5 bg-white border border-stone/15 rounded-sm no-underline transition-colors hover:border-forest-green hover:bg-forest-green"
              >
                {iso && (
                  <span aria-hidden="true" className="text-base leading-none">
                    {flag(iso)}
                  </span>
                )}
                <span className="font-sans text-[12.5px] text-obsidian group-hover:text-cream transition-colors leading-none">
                  {country}
                </span>
                <span className="font-sans text-[11px] text-stone/60 group-hover:text-cream/70 transition-colors leading-none tabular-nums">
                  {count}
                </span>
              </Link>
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}
