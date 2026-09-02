import type { Category, Media } from '@/payload-types'

/**
 * Static tile art bundled in `public/` for known category slugs.
 *
 * Preferred over CMS media: these ship with the build, so a category tile can
 * never render as a grey box because an upload is missing or the blob store is
 * slow. CMS media is the fallback, which is what a category added through the
 * admin UI will use.
 *
 * The first block is the 15 departments that came over from product-collections
 * (see migration 20260901_180000); the rest are leaf slugs waiting on the
 * sub-category tree.
 */
const CATEGORY_IMAGES: Record<string, string> = {
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

  caviar: '/images/collections/caviar.avif',
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

/**
 * URL for a populated upload field, largest useful size first. Returns null for
 * an unset field or a relation that was fetched un-populated (depth: 0).
 */
export function mediaUrl(image: unknown): string | null {
  if (typeof image === 'object' && image !== null) {
    const media = image as Media
    return media.sizes?.hero?.url ?? media.sizes?.card?.url ?? media.url ?? null
  }
  return null
}

export function getCategoryImage(cat: Category): string | null {
  return CATEGORY_IMAGES[cat.slug] ?? mediaUrl(cat.image)
}
