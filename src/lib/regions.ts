/**
 * Region taxonomy for the storefront.
 *
 * The CMS models regions as top-level `categories` ("Bite Into Europe"), but
 * products carry no `region` field — only a free-text `countryOfOrigin`, and
 * almost none are assigned to a category yet. So the region *cards* render from
 * the CMS categories while the *links* resolve through the country buckets
 * below, letting `/products?region=europe` filter on `countryOfOrigin: { in }`
 * without a schema change.
 */
export interface Region {
  slug: string
  /** Big display name on the card, e.g. "Europe" */
  label: string
  /** Small line above the label, e.g. "Bite into" */
  eyebrow: string
  /** Short blurb used on listing pages */
  description: string
  image: string
  countries: string[]
}

export const REGIONS: Region[] = [
  {
    slug: 'europe',
    label: 'Europe',
    eyebrow: 'Bite into',
    description:
      'Explore authentic European gourmet foods from Italy, France, Spain, Greece and more.',
    image: '/images/collections/olives.avif',
    countries: [
      'Italy',
      'France',
      'Spain',
      'Greece',
      'Portugal',
      'Germany',
      'Netherlands',
      'Belgium',
      'Switzerland',
      'Austria',
      'United Kingdom',
      'Ireland',
      'Denmark',
      'Sweden',
      'Norway',
      'Finland',
      'Poland',
      'Hungary',
      'Croatia',
      'Cyprus',
    ],
  },
  {
    slug: 'middle-east',
    label: 'Middle East',
    eyebrow: 'Bite into',
    description:
      'Spices, mezze and confections from the Levant, the Gulf and Anatolia.',
    image: '/images/collections/spices.avif',
    countries: [
      'United Arab Emirates',
      'UAE',
      'Turkey',
      'Lebanon',
      'Jordan',
      'Israel',
      'Palestine',
      'Syria',
      'Iraq',
      'Iran',
      'Saudi Arabia',
      'Qatar',
      'Oman',
      'Kuwait',
      'Bahrain',
      'Yemen',
    ],
  },
  {
    slug: 'africa',
    label: 'Africa',
    eyebrow: 'Bite into',
    description:
      'Single-origin coffee, honey, argan and heritage grains from across the continent.',
    image: '/images/sourcing/sourcing-agriculture.avif',
    countries: [
      'Morocco',
      'Egypt',
      'Tunisia',
      'Algeria',
      'Libya',
      'Ethiopia',
      'Kenya',
      'Tanzania',
      'Uganda',
      'Rwanda',
      'Ghana',
      'Nigeria',
      'Senegal',
      'Ivory Coast',
      "Côte d'Ivoire",
      'Madagascar',
      'South Africa',
    ],
  },
  {
    slug: 'latin-america',
    label: 'Latin America',
    eyebrow: 'Bite into',
    description:
      'Cacao, coffee, ancient grains and chillies from Mexico down to Patagonia.',
    image: '/images/collections/coffee.avif',
    countries: [
      'Mexico',
      'Brazil',
      'Peru',
      'Colombia',
      'Argentina',
      'Chile',
      'Ecuador',
      'Bolivia',
      'Uruguay',
      'Paraguay',
      'Venezuela',
      'Guatemala',
      'Costa Rica',
      'Panama',
      'Honduras',
      'Nicaragua',
      'El Salvador',
      'Cuba',
      'Dominican Republic',
    ],
  },
  {
    slug: 'asia',
    label: 'Asia',
    eyebrow: 'Bite into',
    description: 'Rice, tea, soy and spice traditions from East, South and Southeast Asia.',
    image: '/images/collections/seeds.avif',
    countries: [
      'China',
      'Japan',
      'South Korea',
      'India',
      'Sri Lanka',
      'Thailand',
      'Vietnam',
      'Indonesia',
      'Malaysia',
      'Singapore',
      'Philippines',
      'Nepal',
      'Pakistan',
      'Bangladesh',
    ],
  },
]

export function getRegionBySlug(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug)
}

/**
 * Resolve a CMS category title such as `"Bite Into the Middle East "` to its
 * region. Tolerates the stray casing and trailing whitespace present in the
 * seeded category records.
 */
export function getRegionForCategoryTitle(title: string): Region | undefined {
  const cleaned = title
    .trim()
    .toLowerCase()
    .replace(/^bite\s+into\s+/, '')
    .replace(/^the\s+/, '')
    .trim()
  return REGIONS.find((r) => r.label.toLowerCase() === cleaned)
}

/** Reverse lookup: which region does a free-text country string belong to? */
export function getRegionForCountry(country: string | null | undefined): Region | undefined {
  if (!country) return undefined
  const needle = country.trim().toLowerCase()
  return REGIONS.find((r) => r.countries.some((c) => c.toLowerCase() === needle))
}
