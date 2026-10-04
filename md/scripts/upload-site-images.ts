/**
 * Upload static site images (page art, logos, category tiles) to R2 under
 * `site/`, sized for the web on the way. The site reads them back through
 * siteImage() in src/lib/site-image.ts.
 *
 *   pnpm images:site --dry-run --manifest=<file.json>   show what would be uploaded
 *   pnpm images:site --manifest=<file.json>             upload
 *   pnpm images:site <local-file> <images/path.avif> [--ratio=16:9] [--width=2400]
 *
 * A manifest is a JSON array of { from, to, ratio?, width? }. `to` is the path
 * the code uses without its leading slash (`images/about/about-cover.avif`);
 * the object key is `site/<to>` and the output format follows its extension.
 *
 *   ratio  crop to exactly this aspect (`16:9`, `4:3`, `4:5`, `3:4`, `1:1`)
 *          around the most interesting region, then size to `width`
 *   width  output width for a cropped image (default 2400)
 *
 * Without `ratio` the image keeps its shape and is only scaled down to fit
 * within MAX_EDGE. Nothing is ever scaled up. SVGs are uploaded untouched.
 *
 * Replacing a file at an existing path is fine, but browsers and the image
 * optimiser may hold the old one for up to CACHE_SECONDS — give a new photo a
 * new filename when it must show at once.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { SITE_IMAGE_PREFIX } from '../../src/lib/site-image'

/** Longest edge kept for an uncropped image: a full-bleed hero on a 1280px-wide 2× screen. */
const MAX_EDGE = 2560
const CACHE_SECONDS = 86_400

const DRY_RUN = process.argv.includes('--dry-run')
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]

type Item = { from: string; to: string; ratio?: string; width?: number }

const CONTENT_TYPE: Record<string, string> = {
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing ${name}. See .env.example.`)
    process.exit(1)
  }
  return value
}

async function render(item: Item): Promise<Buffer> {
  const ext = path.extname(item.to).toLowerCase()
  const input = fs.readFileSync(item.from)
  if (ext === '.svg') return input

  let img = sharp(input).rotate() // honour EXIF orientation before measuring
  if (!item.ratio && path.extname(item.from).toLowerCase() === ext) {
    // already web-sized and in the right format: re-encoding would only lose quality
    const meta = await img.metadata()
    if (Math.max(meta.width ?? 0, meta.height ?? 0) <= MAX_EDGE) return input
  }
  if (item.ratio) {
    const [w, h] = item.ratio.split(':').map(Number)
    if (!w || !h) throw new Error(`bad ratio "${item.ratio}"`)
    const width = item.width ?? 2400
    const meta = await sharp(input).rotate().metadata()
    // never upscale: shrink the target until the source can fill it
    const scale = Math.min(1, meta.width! / width, meta.height! / Math.round((width * h) / w))
    const outW = Math.round(width * scale)
    img = img.resize(outW, Math.round((outW * h) / w), { fit: 'cover', position: sharp.strategy.attention })
  } else {
    img = img.resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
  }

  switch (ext) {
    case '.avif':
      return img.avif({ quality: 55, effort: 4 }).toBuffer()
    case '.webp':
      return img.webp({ quality: 82 }).toBuffer()
    case '.jpg':
    case '.jpeg':
      return img.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
    case '.png':
      return img.png({ compressionLevel: 9, palette: false }).toBuffer()
    default:
      throw new Error(`unsupported output type "${ext}"`)
  }
}

async function main() {
  const manifest = arg('manifest')
  const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const items: Item[] = manifest
    ? JSON.parse(fs.readFileSync(manifest, 'utf8'))
    : positional.length === 2
      ? [{ from: positional[0]!, to: positional[1]!, ratio: arg('ratio'), width: arg('width') ? Number(arg('width')) : undefined }]
      : []
  if (!items.length) {
    console.error('Nothing to do. Pass --manifest=<file.json>, or <local-file> <images/path.ext>.')
    process.exit(1)
  }
  for (const item of items) {
    if (!/^images\//.test(item.to)) throw new Error(`"${item.to}" must start with images/`)
    if (!CONTENT_TYPE[path.extname(item.to).toLowerCase()]) throw new Error(`"${item.to}": unknown type`)
  }

  const bucket = DRY_RUN ? '' : required('R2_BUCKET')
  const s3 = DRY_RUN
    ? null
    : new S3Client({
        endpoint: required('R2_ENDPOINT'),
        region: 'auto',
        credentials: {
          accessKeyId: required('R2_ACCESS_KEY_ID'),
          secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
        },
        forcePathStyle: true,
      })

  console.log(DRY_RUN ? '\nDRY RUN — nothing is uploaded\n' : '\nUploading\n')
  let inBytes = 0
  let outBytes = 0
  for (const item of items) {
    const body = await render(item)
    const meta = path.extname(item.to) === '.svg' ? null : await sharp(body).metadata()
    const before = fs.statSync(item.from).size
    inBytes += before
    outBytes += body.length
    const key = `${SITE_IMAGE_PREFIX}/${item.to}`
    console.log(
      `  ${key}  ${meta ? `${meta.width}×${meta.height}` : 'svg'}  ${Math.round(before / 1024)} → ${Math.round(body.length / 1024)} KB`,
    )
    if (DRY_RUN) continue
    await s3!.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: CONTENT_TYPE[path.extname(item.to).toLowerCase()],
        CacheControl: `public, max-age=${CACHE_SECONDS}`,
      }),
    )
  }
  console.log(`\n${items.length} files, ${(inBytes / 1048576).toFixed(1)} MB → ${(outBytes / 1048576).toFixed(1)} MB`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
