import type { Category, Media } from '@/payload-types'
import { siteImage } from '@/lib/site-image'

/**
 * Static tile art for known category slugs, served from R2 (see siteImage).
 *
 * Preferred over CMS media: the paths are fixed in code, so a category tile
 * can't lose its art to an upload being removed in the admin. CMS media is the
 * fallback, which is what a category added through the admin UI will use.
 *
 * The first block is the 15 departments that came over from product-collections
 * (see migration 20260901_180000); the rest are leaf slugs waiting on the
 * sub-category tree.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  'caviar-selection': siteImage('/images/collections/caviar.avif'),
  'truffle-treasury': siteImage('/images/collections/pantry.avif'),
  'grand-cru-cocoa-chocolat': siteImage('/images/collections/coco.avif'),
  'heritage-extra-virgin-oils': siteImage('/images/collections/oils.avif'),
  'rare-estate-honey': siteImage('/images/collections/honey.avif'),
  'aged-balsamic-vinegars': siteImage('/images/collections/vinegar.avif'),
  'mediterranean-olive-reserve': siteImage('/images/collections/olives.avif'),
  'single-origin-spices': siteImage('/images/collections/spices.avif'),
  'signature-gourmet-spreads': siteImage('/images/collections/spreads.avif'),
  'fromagerie-selection': siteImage('/images/collections/Fromagerie.avif'),
  'artisan-heritage-breads': siteImage('/images/collections/breads.avif'),
  'specialty-coffee-reserve': siteImage('/images/collections/coffee.avif'),
  'botanical-seed-selection': siteImage('/images/collections/seeds.avif'),
  'curated-fine-beverages': siteImage('/images/collections/fine-beverages.avif'),

  caviar: siteImage('/images/collections/caviar.avif'),
  'caviar-gift-sets': siteImage('/images/collections/caviar.avif'),
  'caviar-accessories': siteImage('/images/collections/cutlery.avif'),
  chocolate: siteImage('/images/collections/coco.avif'),
  'chocolate-boxes-bonbons': siteImage('/images/collections/coco.avif'),
  'chocolate-bars': siteImage('/images/collections/coco.avif'),
  'chocolate-truffles': siteImage('/images/collections/coco.avif'),
  'flour-baking': siteImage('/images/collections/breads.avif'),
  'caputo-flour-baking': siteImage('/images/collections/breads.avif'),
  'teddy-bears': siteImage('/images/collections/spreads.avif'),
  'velterra-collection': siteImage('/images/collections/pantry.avif'),
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
