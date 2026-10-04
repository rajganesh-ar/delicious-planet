/**
 * Images for the CMS rows that had none (OPEN-ISSUES.md §4).
 *
 *   pnpm tsx md/scripts/set-cms-images-2026-10-04.ts --dry-run --dir=<photos>
 *   pnpm tsx md/scripts/set-cms-images-2026-10-04.ts --dir=<photos>
 *
 * Categories: art for the five food categories without any. All five are
 * Unsplash/Pexels photos (free for commercial use, no credit required); each
 * media row's `sourceUrl` is the photo's page. Uploaded through Payload so
 * they land in R2 with the usual `hero`/`card` sizes, scaled to at most 2560px
 * on the long edge first — the originals are 5–6k.
 *
 * Suppliers: each supplier's `logo`, using the files that already shipped as
 * site art (public/images/partner-logo/). The Caputo supplier was deleted the
 * same day (Caputo is a brand, see OPEN-ISSUES.md §3.7), so it is not listed;
 * its logo upload, media 953, was removed with it.
 *
 * Idempotent: a category whose image already came from the same source page,
 * or a supplier that already has a logo, is skipped. The Team photos stay
 * empty on purpose — they must be the real people.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

const DRY_RUN = process.argv.includes('--dry-run')
const DIR = process.argv.find((a) => a.startsWith('--dir='))?.split('=')[1]

const CATEGORY_ART: Array<{ slug: string; file: string; sourceUrl: string; alt: string }> = [
  {
    slug: 'chilis',
    file: 'category-chilis.jpg',
    sourceUrl: 'https://unsplash.com/photos/eVINbDavN8c',
    alt: 'Dried red chillies on black slate, scattered with chilli flakes',
  },
  {
    slug: 'chocolate-boxes',
    file: 'category-chocolate-boxes.jpg',
    sourceUrl: 'https://www.pexels.com/photo/elegant-box-of-assorted-chocolate-truffles-38444667/',
    alt: 'A gold gift box of dark, milk and white chocolate truffles',
  },
  {
    slug: 'flours',
    file: 'category-flours.jpg',
    sourceUrl: 'https://www.pexels.com/photo/chef-sprinkling-flour-while-making-dough-6294380/',
    alt: 'A hand sprinkling flour over a heap beside a paper flour sack',
  },
  {
    slug: 'mexican-pantry',
    file: 'category-mexican-pantry.jpg',
    sourceUrl: 'https://www.pexels.com/photo/ingredients-on-wooden-chopping-board-7601436/',
    alt: 'Dried ancho and árbol chillies, serranos, garlic, onion and a molcajete of salt',
  },
  {
    slug: 'teddy-bear',
    file: 'category-teddy-bear.jpg',
    sourceUrl: 'https://www.pexels.com/photo/pralines-sprinkled-with-cocoa-powder-11178478/',
    alt: 'Dark chocolate pralines drizzled with chocolate on cocoa dust',
  },
]

/** Supplier slug → its logo, already used as site art. */
const SUPPLIER_LOGOS: Record<string, string> = {
  'admiral-caviar': 'public/images/partner-logo/admiral.webp',
  'velsoro-chocolate': 'public/images/partner-logo/velsoro.avif',
}

async function main() {
  if (!DIR) throw new Error('--dir=<folder with the photos> is required')
  const payload = await getPayload({ config })
  console.log(DRY_RUN ? '\nDRY RUN — nothing is written\n' : '\nLIVE RUN\n')

  for (const art of CATEGORY_ART) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: art.slug } },
      limit: 2,
      depth: 1,
    })
    if (docs.length !== 1) throw new Error(`${art.slug}: expected 1 category, found ${docs.length}`)
    const category = docs[0]!
    const current = category.image
    if (current && typeof current === 'object' && current.sourceUrl === art.sourceUrl) {
      console.log(`  skip   ${art.slug} (already set)`)
      continue
    }

    const image = await sharp(fs.readFileSync(path.join(DIR, art.file)))
      .rotate()
      .resize(2560, 2560, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
    const meta = await sharp(image).metadata()
    console.log(
      `  ${DRY_RUN ? 'would' : 'set  '}  ${art.slug}: ${meta.width}×${meta.height}, ${Math.round(image.length / 1024)} KB` +
        (current ? ` (replacing media ${typeof current === 'object' ? current.id : current})` : ''),
    )
    if (DRY_RUN) continue

    const media = await payload.create({
      collection: 'media',
      data: { alt: art.alt, sourceUrl: art.sourceUrl },
      file: { data: image, mimetype: 'image/webp', name: `category-${art.slug}.webp`, size: image.length },
    })
    await payload.update({ collection: 'categories', id: category.id, data: { image: media.id }, depth: 0 })
  }

  for (const [slug, file] of Object.entries(SUPPLIER_LOGOS)) {
    const { docs } = await payload.find({
      collection: 'suppliers',
      where: { slug: { equals: slug } },
      limit: 2,
      depth: 0,
    })
    if (docs.length !== 1) throw new Error(`${slug}: expected 1 supplier, found ${docs.length}`)
    const supplier = docs[0]!
    if (supplier.logo) {
      console.log(`  skip   supplier ${slug} (has a logo)`)
      continue
    }
    const logo = fs.readFileSync(file)
    console.log(`  ${DRY_RUN ? 'would' : 'set  '}  supplier ${slug}: ${path.basename(file)}`)
    if (DRY_RUN) continue
    const ext = path.extname(file).slice(1)
    const media = await payload.create({
      collection: 'media',
      data: { alt: supplier.name },
      file: { data: logo, mimetype: `image/${ext}`, name: `supplier-${slug}.${ext}`, size: logo.length },
    })
    await payload.update({ collection: 'suppliers', id: supplier.id, data: { logo: media.id }, depth: 0 })
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
