import type { CollectionConfig } from 'payload'
import { publicMediaUrl } from '@/lib/media-url'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'sourceUrl',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description:
          'Where this file was fetched from, when it came from an external catalogue. An importer matches on it so a second run reuses this upload instead of creating a near-duplicate — filenames alone are not enough, two products can both ship a "Garlic-1.jpg".',
      },
    },
  ],
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 800,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'hero',
        width: 1920,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      // `og` (1200×630) was removed: nothing read it. Every social card on the
      // site sets its own art, so it was a fourth derivative written on every
      // upload that no page ever requested.
      //
      // Each size is a separate write, a separate sharp encode and a separate
      // stored object, so the count here multiplies the cost of every import.
      // That bill fell on the previous Vercel Blob store, whose per-month
      // "advanced operations" allowance a 530-image import exhausted at five
      // files apiece; R2 prices operations far more generously, but an
      // unrequested rendition is waste under any provider.
      //
      // Both halves of that removal are accounted for: md/scripts/cleanup-r2.ts
      // swept the 511 superseded 1200×630 objects out of the bucket, and the
      // `sizes_og_*` columns go with 20260906_190000_drop_media_og_size.
      //
      // An earlier note here claimed the columns had to outlive the sweep
      // because they were "what identifies the old og files in the bucket".
      // They were not. cleanup-r2.ts diffs the bucket against the keys Payload
      // reports, and dropping a size from this array removes it from the
      // adapter's table definition, so those columns were never read back —
      // which is exactly why the objects showed up as strays. Either step could
      // have gone first.
    ],
    // A size name here would make Payload build `thumbnailURL` from its own
    // static route, which the R2 switch retired — the storage plugin rewrites
    // `url` and every `sizes.*.url`, but not this one, so admin thumbnails
    // would be the only 404s on the site. Building it by hand keeps them on the
    // same public domain as everything else.
    adminThumbnail: ({ doc }) => {
      const sizes = doc?.sizes as Record<string, { filename?: string | null }> | undefined
      const filename = sizes?.thumbnail?.filename ?? (doc?.filename as string | undefined)
      return filename ? publicMediaUrl(filename) : null
    },
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
    ],
  },
}
