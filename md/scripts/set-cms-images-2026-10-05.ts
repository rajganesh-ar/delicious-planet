/**
 * Category art and brand logos sourced on 2026-10-05 (OPEN-ISSUES.md §4).
 *
 *   pnpm tsx md/scripts/set-cms-images-2026-10-05.ts --dry-run --dir=<files>
 *   pnpm tsx md/scripts/set-cms-images-2026-10-05.ts --dir=<files>
 *   ... --only=categories | --only=brands
 *
 * The plan is md/scripts/cms-images-2026-10-05.json; each `file` there is
 * relative to --dir.
 *
 * Categories: the four sub-categories whose banner was one of their own
 * products' photos (chocolate-bars, mexican-sauces, pantry-staples,
 * mexican-candy) get Unsplash/Pexels art instead, scaled to at most 2560px on
 * the long edge. The stand-in product photos stay on their products.
 *
 * Brands: the logo of every stocked brand that had none, from Wikimedia
 * Commons or the brand's own site (`sourceUrl` on each media row). Every file,
 * SVG included, is rendered to a transparent PNG trimmed to the mark and at
 * most 800×400, so no SVG is served from the media store and every logo sits
 * the same way in the /brands and homepage cells.
 *
 * Idempotent: a category whose image already has the plan's sourceUrl, or a
 * brand that already has a logo, is skipped.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

type CategoryArt = { slug: string; file: string; sourceUrl: string; alt: string }
type BrandLogo = { slug: string; file: string; sourceUrl: string }
type Plan = { categories: CategoryArt[]; brands: BrandLogo[] }

const dirname = path.dirname(fileURLToPath(import.meta.url))
const PLAN: Plan = JSON.parse(fs.readFileSync(path.join(dirname, 'cms-images-2026-10-05.json'), 'utf8'))

const DRY_RUN = process.argv.includes('--dry-run')
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
const DIR = arg('dir')
const ONLY = arg('only')

/** Long edge a vector is rendered at before the trim and the final fit. */
const SVG_RENDER_EDGE = 1600

async function renderLogo(file: string): Promise<Buffer> {
  const input = fs.readFileSync(file)
  let img: sharp.Sharp
  if (path.extname(file).toLowerCase() === '.svg') {
    // An SVG's own size is often tiny (a 100×40 viewBox): pick the density
    // that renders it at a useful size instead of upscaling a raster.
    const meta = await sharp(input).metadata()
    const edge = Math.max(meta.width ?? 0, meta.height ?? 0) || 100
    const density = Math.min(2400, Math.max(72, Math.round((72 * SVG_RENDER_EDGE) / edge)))
    img = sharp(input, { density })
  } else {
    img = sharp(input)
  }
  const trimmed = await img.rotate().trim().png().toBuffer()
  return sharp(trimmed)
    .resize(800, 400, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function main() {
  if (!DIR) throw new Error('--dir=<folder with the files> is required')
  const payload = await getPayload({ config })
  console.log(DRY_RUN ? '\nDRY RUN — nothing is written\n' : '\nLIVE RUN\n')

  if (!ONLY || ONLY === 'categories') {
    for (const art of PLAN.categories) {
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
  }

  if (!ONLY || ONLY === 'brands') {
    for (const logo of PLAN.brands) {
      const { docs } = await payload.find({
        collection: 'brands',
        where: { slug: { equals: logo.slug } },
        limit: 2,
        depth: 0,
      })
      if (docs.length !== 1) throw new Error(`${logo.slug}: expected 1 brand, found ${docs.length}`)
      const brand = docs[0]!
      if (brand.logo) {
        console.log(`  skip   brand ${logo.slug} (has a logo)`)
        continue
      }

      const png = await renderLogo(path.join(DIR, logo.file))
      const meta = await sharp(png).metadata()
      console.log(
        `  ${DRY_RUN ? 'would' : 'set  '}  brand ${logo.slug}: ${meta.width}×${meta.height}, ${Math.round(png.length / 1024)} KB`,
      )
      if (DRY_RUN) continue

      const media = await payload.create({
        collection: 'media',
        data: { alt: brand.title, sourceUrl: logo.sourceUrl },
        file: { data: png, mimetype: 'image/png', name: `brand-${logo.slug}.png`, size: png.length },
      })
      await payload.update({ collection: 'brands', id: brand.id, data: { logo: media.id }, depth: 0 })
    }
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
