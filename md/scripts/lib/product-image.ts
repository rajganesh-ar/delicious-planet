import sharp from 'sharp'

/**
 * Shared rules for product photography: what makes a primary image "bad" on
 * the storefront, and the two ways of turning one into an exact square.
 *
 * The product card (src/components/ui/ProductCard.tsx) shows the primary
 * image in an `aspect-square` frame with `object-cover` on #f5f4f1. Supplier
 * photos arrive in every shape and on every backdrop, so the frame decides
 * what a visitor sees: a tall bottle loses its cap and base, a can shot from
 * across the room is a speck in the middle.
 *
 * Fixed images are always exactly SQUARE_SIZE × SQUARE_SIZE. Payload derives
 * `thumbnail` (400×400) and `card` (800 wide, so 800×800) from that on upload,
 * which makes every rendition of a fixed image exact too.
 */

export const SQUARE_SIZE = 1200

/** The product card's own backdrop. Cut-outs land on it so they sit flush. */
export const CREAM = { r: 245, g: 244, b: 241 } as const

/** Below this width the card upscales on a 2× screen and the photo goes soft. */
export const MIN_WIDTH = 600

export type ImageFlag = 'CUT' | 'TINY' | 'LOWRES'

export type ImageMeasure = {
  width: number
  height: number
  /** Product bounding box as fractions of the image: [x0, y0, x1, y1]. */
  bbox: [number, number, number, number] | null
  /** Mean step between neighbouring border pixels. Low = plain or graded backdrop, high = a scene. */
  roughness: number
  /** How far the product runs outside the card's centred square crop, as a fraction. */
  cutBy: number
  /** Product's longest side as a share of the card's edge, after that crop. */
  tileFrac: number | null
  flags: ImageFlag[]
}

const lum = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b

/**
 * Measure a primary image the way the card will show it.
 *
 * The product box comes from a background model, not a corner colour: each
 * pixel is compared with a blend of the four border strips, so a vignette or
 * a graded studio sweep counts as backdrop and only the product stands out.
 */
export async function measure(
  input: Buffer | string,
  /** The upload's own dimensions, when `input` is a smaller rendition of it. */
  original?: { width: number; height: number },
): Promise<ImageMeasure> {
  const meta = await sharp(input).metadata()
  const width = original?.width ?? meta.width ?? 0
  const height = original?.height ?? meta.height ?? 0
  const { data, info } = await sharp(input)
    .flatten({ background: CREAM })
    .resize(400, 400, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const W = info.width
  const H = info.height
  const C = info.channels
  const px = (x: number, y: number) => {
    const o = (y * W + x) * C
    return [data[o]!, data[o + 1]!, data[o + 2]!] as const
  }

  const top: (readonly [number, number, number])[] = []
  const bot: typeof top = []
  const lef: typeof top = []
  const rig: typeof top = []
  for (let x = 0; x < W; x++) {
    top.push(px(x, 1))
    bot.push(px(x, H - 2))
  }
  for (let y = 0; y < H; y++) {
    lef.push(px(1, y))
    rig.push(px(W - 2, y))
  }
  const rough = (arr: typeof top) => {
    let s = 0
    for (let i = 1; i < arr.length; i++) s += Math.abs(lum(...arr[i]!) - lum(...arr[i - 1]!))
    return s / arr.length
  }
  const roughness = (rough(top) + rough(bot) + rough(lef) + rough(rig)) / 4

  const colCount = new Array<number>(W).fill(0)
  const rowCount = new Array<number>(H).fill(0)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / (W - 1)
      const v = y / (H - 1)
      const c = px(x, y)
      let d = 0
      for (let k = 0; k < 3; k++) {
        const h = lef[y]![k]! * (1 - u) + rig[y]![k]! * u
        const w = top[x]![k]! * (1 - v) + bot[x]![k]! * v
        d = Math.max(d, Math.abs(c[k]! - (h + w) / 2))
      }
      if (d > 28) {
        colCount[x]!++
        rowCount[y]!++
      }
    }
  }
  let x0 = W
  let y0 = H
  let x1 = -1
  let y1 = -1
  for (let x = 0; x < W; x++) {
    if (colCount[x]! > Math.max(2, H * 0.01)) {
      x0 = Math.min(x0, x)
      x1 = Math.max(x1, x)
    }
  }
  for (let y = 0; y < H; y++) {
    if (rowCount[y]! > Math.max(2, W * 0.01)) {
      y0 = Math.min(y0, y)
      y1 = Math.max(y1, y)
    }
  }
  const bbox: ImageMeasure['bbox'] =
    x1 < 0 ? null : [x0 / W, y0 / H, (x1 + 1) / W, (y1 + 1) / H]

  const ar = width / height
  const win =
    ar > 1 ? [(1 - 1 / ar) / 2, 0, 1 - (1 - 1 / ar) / 2, 1] : [0, (1 - ar) / 2, 1, 1 - (1 - ar) / 2]
  const cutBy = bbox
    ? Math.max(0, win[0]! - bbox[0], win[1]! - bbox[1], bbox[2] - win[2]!, bbox[3] - win[3]!)
    : 0
  const tileFrac = bbox
    ? Math.max((bbox[2] - bbox[0]) * (ar > 1 ? ar : 1), (bbox[3] - bbox[1]) / (ar < 1 ? ar : 1))
    : null

  // A scene (chocolate on a stone table, a shop shelf) survives a little
  // cropping; a packshot on a plain backdrop does not.
  const scene = roughness > 4
  const flags: ImageFlag[] = []
  if (cutBy > 0.03 && !(scene && cutBy < 0.12)) flags.push('CUT')
  if (!scene && tileFrac !== null && tileFrac < 0.45) flags.push('TINY')
  if (width < MIN_WIDTH) flags.push('LOWRES')

  return { width, height, bbox, roughness, cutBy, tileFrac, flags }
}

/**
 * Re-crop an existing photo around its product, keeping the photo's own
 * backdrop. For a product shot small in a large, plain frame (`TINY`).
 *
 * @param fill Share of the square the product's longest side should take.
 */
export async function reframe(input: Buffer | string, fill = 0.68): Promise<Buffer> {
  const m = await measure(input)
  if (!m.bbox) throw new Error('no product found against the backdrop')
  const W = m.width
  const H = m.height
  const [bx0, by0, bx1, by1] = m.bbox
  const cx = ((bx0 + bx1) / 2) * W
  const cy = ((by0 + by1) / 2) * H
  const side = Math.round(Math.max((bx1 - bx0) * W, (by1 - by0) * H) / fill)
  if (side > W || side > H) {
    throw new Error(`crop of ${side}px does not fit a ${W}×${H} photo; replace the image instead`)
  }
  const left = Math.min(Math.max(Math.round(cx - side / 2), 0), W - side)
  const top = Math.min(Math.max(Math.round(cy - side / 2), 0), H - side)
  return sharp(input)
    .extract({ left, top, width: side, height: side })
    .resize(SQUARE_SIZE, SQUARE_SIZE)
    .webp({ quality: 86 })
    .toBuffer()
}

/**
 * Lift a product off a light, plain backdrop (white, cream, a vignetted
 * studio sweep) and return it as RGBA with a soft edge, trimmed to the product.
 *
 * Region-grows from the whole border through light, low-chroma pixels that
 * change only gradually, so it follows a vignette but stops at the product's
 * edge. Light areas inside the product (a white label inside a gold rim) are
 * not connected to the border and stay opaque. Transparent PNGs work too.
 */
export async function cutout(
  input: Buffer | string,
  { step = 7, minLum = 150, maxChroma = 40 } = {},
): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const W = info.width
  const H = info.height
  const N = W * H
  const ok = (i: number) => {
    const r = data[i * 3]!
    const g = data[i * 3 + 1]!
    const b = data[i * 3 + 2]!
    return lum(r, g, b) >= minLum && Math.max(r, g, b) - Math.min(r, g, b) <= maxChroma
  }
  const diff = (a: number, b: number) =>
    Math.max(
      Math.abs(data[a * 3]! - data[b * 3]!),
      Math.abs(data[a * 3 + 1]! - data[b * 3 + 1]!),
      Math.abs(data[a * 3 + 2]! - data[b * 3 + 2]!),
    )

  const bg = new Uint8Array(N)
  const stack: number[] = []
  const seed = (i: number) => {
    if (!bg[i] && ok(i)) {
      bg[i] = 1
      stack.push(i)
    }
  }
  for (let x = 0; x < W; x++) {
    seed(x)
    seed((H - 1) * W + x)
  }
  for (let y = 0; y < H; y++) {
    seed(y * W)
    seed(y * W + W - 1)
  }
  while (stack.length) {
    const i = stack.pop()!
    const x = i % W
    const y = (i / W) | 0
    const next = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]
    for (const j of next) {
      if (j >= 0 && !bg[j] && ok(j) && diff(i, j) <= step) {
        bg[j] = 1
        stack.push(j)
      }
    }
  }

  const hard = Buffer.alloc(N)
  for (let i = 0; i < N; i++) hard[i] = bg[i] ? 0 : 255
  // extractChannel: sharp hands a blurred one-channel raw image back as three
  const soft = await sharp(hard, { raw: { width: W, height: H, channels: 1 } })
    .blur(1.2)
    .extractChannel(0)
    .raw()
    .toBuffer()
  const rgba = Buffer.alloc(N * 4)
  for (let i = 0; i < N; i++) {
    rgba[i * 4] = data[i * 3]!
    rgba[i * 4 + 1] = data[i * 3 + 1]!
    rgba[i * 4 + 2] = data[i * 3 + 2]!
    // the blur softens the edge inward only; it never grows the product
    rgba[i * 4 + 3] = Math.min(hard[i] ? 255 : soft[i]!, soft[i]! * 1.6)
  }
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .png()
    .toBuffer()
}

/** A soft contact shadow under a cut-out, so it doesn't look pasted on. */
export async function withShadow(
  png: Buffer,
  { blur = 14, dy = 10, opacity = 0.2 } = {},
): Promise<{ buf: Buffer; pad: number }> {
  const m = await sharp(png).metadata()
  const w = m.width!
  const h = m.height!
  const pad = blur * 3
  const a = await sharp(png).extractChannel(3).raw().toBuffer()
  const shade = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    shade[i * 4] = 60
    shade[i * 4 + 1] = 48
    shade[i * 4 + 2] = 30
    shade[i * 4 + 3] = Math.round(a[i]! * opacity)
  }
  const shadow = await sharp(shade, { raw: { width: w, height: h, channels: 4 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .blur(blur)
    .png()
    .toBuffer()
  const buf = await sharp({
    create: { width: w + pad * 2, height: h + pad * 2 + dy, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: shadow, left: 0, top: dy },
      { input: png, left: pad, top: pad },
    ])
    .png()
    .toBuffer()
  return { buf, pad }
}

/**
 * Centre a cut-out on cream at exactly SQUARE_SIZE², its longest side taking
 * `fill` of the frame. Tall bottles and wide bags end up the same visual size.
 */
export async function onCream(cut: Buffer, fill = 0.82): Promise<Buffer> {
  const { buf } = await withShadow(cut)
  const placed = await sharp(buf)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .resize(Math.round(SQUARE_SIZE * fill), Math.round(SQUARE_SIZE * fill), { fit: 'inside' })
    .toBuffer({ resolveWithObject: true })
  // composite and resize are separate passes: within one sharp pipeline resize runs first
  return sharp({ create: { width: SQUARE_SIZE, height: SQUARE_SIZE, channels: 3, background: CREAM } })
    .composite([
      {
        input: placed.data,
        left: Math.round((SQUARE_SIZE - placed.info.width) / 2),
        top: Math.round((SQUARE_SIZE - placed.info.height) / 2),
      },
    ])
    .webp({ quality: 86 })
    .toBuffer()
}

/** Throw unless `buf` is already an exact SQUARE_SIZE square. */
export async function assertExactSquare(buf: Buffer): Promise<void> {
  const m = await sharp(buf).metadata()
  if (m.width !== SQUARE_SIZE || m.height !== SQUARE_SIZE) {
    throw new Error(`expected ${SQUARE_SIZE}×${SQUARE_SIZE}, got ${m.width}×${m.height}`)
  }
}
