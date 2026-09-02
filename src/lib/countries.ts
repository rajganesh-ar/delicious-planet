/**
 * Canonical country list and the country → region map.
 *
 * This replaces the free-text `countryOfOrigin` field. A product's region is
 * never authored: it is derived from `origin.country` by a field hook, so a
 * region listing can never miss a product because someone typed "UAE" instead
 * of "United Arab Emirates".
 *
 * Regions are defined once, here, as groups of countries. `COUNTRY_OPTIONS`
 * (for the Payload select) and `REGION_BY_COUNTRY` (for the hook) are both
 * derived from that single source, so they cannot drift apart.
 *
 * Presentation for a region — its label, blurb and card art — lives in
 * src/lib/regions.ts. This file is data only.
 */

export const REGION_SLUGS = [
  'europe',
  'middle-east',
  'africa',
  'latin-america',
  'north-america',
  'asia',
  'oceania',
] as const

export type RegionSlug = (typeof REGION_SLUGS)[number]

interface CountryDef {
  /** ISO 3166-1 alpha-2. Stored on the product. */
  code: string
  name: string
}

const COUNTRIES_BY_REGION: Record<RegionSlug, CountryDef[]> = {
  europe: [
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czechia' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'GR', name: 'Greece' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'RO', name: 'Romania' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'ES', name: 'Spain' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'GB', name: 'United Kingdom' },
  ],
  'middle-east': [
    { code: 'BH', name: 'Bahrain' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IL', name: 'Israel' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'OM', name: 'Oman' },
    { code: 'PS', name: 'Palestine' },
    { code: 'QA', name: 'Qatar' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SY', name: 'Syria' },
    { code: 'TR', name: 'Türkiye' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'YE', name: 'Yemen' },
  ],
  africa: [
    { code: 'DZ', name: 'Algeria' },
    { code: 'CI', name: "Côte d'Ivoire" },
    { code: 'EG', name: 'Egypt' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'GH', name: 'Ghana' },
    { code: 'KE', name: 'Kenya' },
    { code: 'LY', name: 'Libya' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MA', name: 'Morocco' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'SN', name: 'Senegal' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'UG', name: 'Uganda' },
  ],
  'latin-america': [
    { code: 'AR', name: 'Argentina' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CU', name: 'Cuba' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'HN', name: 'Honduras' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'PA', name: 'Panama' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VE', name: 'Venezuela' },
  ],
  'north-america': [
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'United States' },
  ],
  asia: [
    { code: 'BD', name: 'Bangladesh' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'JP', name: 'Japan' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'NP', name: 'Nepal' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PH', name: 'Philippines' },
    { code: 'SG', name: 'Singapore' },
    { code: 'KR', name: 'South Korea' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
  ],
  oceania: [
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
  ],
}

export const ALL_COUNTRIES: CountryDef[] = REGION_SLUGS.flatMap(
  (region) => COUNTRIES_BY_REGION[region],
).sort((a, b) => a.name.localeCompare(b.name))

/** Options for the Payload `origin.country` select. */
export const COUNTRY_OPTIONS = ALL_COUNTRIES.map((c) => ({ label: c.name, value: c.code }))

/** ISO code → region slug. Used by the `origin.region` field hook. */
export const REGION_BY_COUNTRY: Record<string, RegionSlug> = Object.fromEntries(
  REGION_SLUGS.flatMap((region) =>
    COUNTRIES_BY_REGION[region].map((c) => [c.code, region] as const),
  ),
)

const NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  ALL_COUNTRIES.map((c) => [c.code, c.name] as const),
)

/** Lower-cased country name → ISO code. Lets importers accept human names. */
const CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  ALL_COUNTRIES.map((c) => [c.name.toLowerCase(), c.code] as const),
)

/**
 * Spellings that appear in supplier feeds but are not the canonical name.
 * Extend this rather than loosening the matcher — every alias here is a
 * deliberate decision, and unknown values stay loud.
 */
const COUNTRY_ALIASES: Record<string, string> = {
  uae: 'AE',
  'u.a.e.': 'AE',
  emirates: 'AE',
  'united arab emirates': 'AE',
  uk: 'GB',
  'great britain': 'GB',
  england: 'GB',
  scotland: 'GB',
  usa: 'US',
  'u.s.a.': 'US',
  'united states of america': 'US',
  turkey: 'TR',
  turkiye: 'TR',
  'ivory coast': 'CI',
  "cote d'ivoire": 'CI',
  holland: 'NL',
  'czech republic': 'CZ',
  'south korea': 'KR',
  'republic of korea': 'KR',
  'new zeland': 'NZ',
}

/** Countries filed under a region, in name order. */
export function countriesInRegion(region: RegionSlug): CountryDef[] {
  return [...COUNTRIES_BY_REGION[region]].sort((a, b) => a.name.localeCompare(b.name))
}

export function regionForCountry(code: string | null | undefined): RegionSlug | null {
  if (!code) return null
  return REGION_BY_COUNTRY[code.toUpperCase()] ?? null
}

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null
  return NAME_BY_CODE[code.toUpperCase()] ?? null
}

/**
 * Resolve whatever a supplier feed gave us to an ISO code — an ISO code, a
 * canonical name, or a known alias. Returns null so the importer can report
 * the value rather than guessing.
 */
export function resolveCountryCode(input: string | null | undefined): string | null {
  if (!input) return null
  const raw = input.trim()
  if (!raw) return null

  const upper = raw.toUpperCase()
  if (NAME_BY_CODE[upper]) return upper

  const lower = raw.toLowerCase()
  return CODE_BY_NAME[lower] ?? COUNTRY_ALIASES[lower] ?? null
}
