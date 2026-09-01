import type { Category, ProductCollection, Media } from '@/payload-types'

/**
 * Static art bundled in `public/` for known collection slugs. Preferred over
 * CMS media because these survive container restarts.
 */
const COLLECTION_IMAGES: Record<string, string> = {
  'caviar-selection': '/images/collections/caviar.avif',
  'truffle-treasury': '/images/collections/pantry.avif',
  'grand-cru-cocoa-chocolat': '/images/collections/coco.avif',
  'heritage-extra-virgin-oils': '/images/collections/oils.avif',
  'rare-estate-honey': '/images/collections/honey.avif',
  'aged-balsamic-vinegars': '/images/collections/vinegar.avif',
  'mediterranean-olive-reserve': '/images/collections/olives.avif',
  'single-origin-spices': '/images/collections/spices.avif',
  'signature-gourmet-spreads': '/images/collections/spreads.avif',
  'fromagerie-selection': '/images/collections/Fromagerie.avif',
  'artisan-heritage-breads': '/images/collections/breads.avif',
  'specialty-coffee-reserve': '/images/collections/coffee.avif',
  'botanical-seed-selection': '/images/collections/seeds.avif',
  'curated-fine-beverages': '/images/collections/beverages.avif',
  'bespoke-tableware-cutlery': '/images/collections/cutlery.avif',
}

const CATEGORY_IMAGES: Record<string, string> = {
  caviar: '/images/collections/caviar.avif',
  'caviar-selection': '/images/collections/caviar.avif',
  'caviar-gift-sets': '/images/collections/caviar.avif',
  'caviar-accessories': '/images/collections/cutlery.avif',
  chocolate: '/images/collections/coco.avif',
  'chocolate-boxes-bonbons': '/images/collections/coco.avif',
  'chocolate-bars': '/images/collections/coco.avif',
  'chocolate-truffles': '/images/collections/coco.avif',
  'flour-baking': '/images/collections/breads.avif',
  'caputo-flour-baking': '/images/collections/breads.avif',
  'teddy-bears': '/images/collections/spreads.avif',
  'velterra-collection': '/images/collections/pantry.avif',
}

function fromMedia(image: unknown): string | null {
  if (typeof image === 'object' && image !== null) {
    const media = image as Media
    return media.sizes?.hero?.url ?? media.sizes?.card?.url ?? media.url ?? null
  }
  return null
}

export function getCollectionImage(col: ProductCollection): string | null {
  return COLLECTION_IMAGES[col.slug] ?? fromMedia(col.image)
}

/** CMS media wins for categories — editors upload their own tile art. */
export function getCategoryImage(cat: Category): string | null {
  return fromMedia(cat.image) ?? CATEGORY_IMAGES[cat.slug] ?? null
}
