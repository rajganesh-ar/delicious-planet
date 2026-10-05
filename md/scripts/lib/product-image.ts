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

export type ImageFlag = 'CUT' | 'TOUCH' | 'TINY' | 'LOWRES'

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
  if (await touchesFrame(input)) flags.push('TOUCH')
  if (!scene && tileFrac !== null && tileFrac < 0.45) flags.push('TINY')
  if (width < MIN_WIDTH) flags.push('LOWRES')

  return { width, height, bbox, roughness, cutBy, tileFrac, flags }
}

/**
 * Does something run into the edge of the card's square? Looks at exactly the
 * square the card shows and asks whether any side's outer pixels break from
 * the backdrop (the median border colour) over more than 4% of their length.
 *
 * This catches what `cutBy` can't: a product that already touches the edge of
 * its own photo, where the border model counts the product as backdrop. Only
 * asked of photos whose border is mostly plain; a full-bleed scene touches
 * every edge by nature.
 */
export async function touchesFrame(input: Buffer | string): Promise<boolean> {
  const S = 300
  const { data } = await sharp(input)
    .resize(S, S, { fit: 'cover' })
    .flatten({ background: CREAM })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const px = (x: number, y: number) => {
    const o = (y * S + x) * 3
    return [data[o]!, data[o + 1]!, data[o + 2]!]
  }
  const sides: number[][][] = [[], [], [], []]
  for (let k = 0; k < S; k++) {
    sides[0]!.push(px(k, 1))
    sides[1]!.push(px(k, S - 2))
    sides[2]!.push(px(1, k))
    sides[3]!.push(px(S - 2, k))
  }
  const all = sides.flat()
  const med = [0, 1, 2].map((c) => all.map((p) => p[c]!).sort((a, b) => a - b)[all.length >> 1]!)
  const off = (p: number[]) => Math.max(...[0, 1, 2].map((c) => Math.abs(p[c]! - med[c]!))) > 45
  const plain = all.filter((p) => !off(p)).length / all.length
  if (plain < 0.6) return false
  return sides.some((side) => side.filter(off).length / side.length > 0.04)
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

/** Mean colour of a strip just inside one edge, clear of any 1–2px frame line. */
async function edgeColour(input: Buffer, W: number, H: number, side: 'top' | 'bottom' | 'left' | 'right') {
  const inset = Math.max(2, Math.round(Math.min(W, H) * 0.01))
  const t = Math.max(4, Math.round(Math.min(W, H) * 0.02))
  const box = {
    top: { left: 0, top: inset, width: W, height: t },
    bottom: { left: 0, top: H - inset - t, width: W, height: t },
    left: { left: inset, top: 0, width: t, height: H },
    right: { left: W - inset - t, top: 0, width: t, height: H },
  }[side]
  const { channels } = await sharp(input).extract(box).flatten({ background: '#ffffff' }).stats()
  return channels.slice(0, 3).map((c) => c.mean)
}

/**
 * Square a photo off without cropping it: the short sides grow, filled with
 * the photo's own backdrop colour and a feathered seam. For a whole product on
 * a plain, even backdrop (a seamless studio sweep) that the card would crop.
 *
 * @param margin Extra room around the photo, as a share of its long side.
 */
export async function padToSquare(input: Buffer, margin = 0.06): Promise<Buffer> {
  const meta = await sharp(input).metadata()
  const W = meta.width!
  const H = meta.height!
  const S = Math.round(Math.max(W, H) * (1 + margin))
  const padX = Math.round((S - W) / 2)
  const padY = Math.round((S - H) / 2)
  const sides = (['left', 'right', 'top', 'bottom'] as const).filter((s) => (s === 'left' || s === 'right' ? padX : padY) > 0)
  const cols = await Promise.all(sides.map((s) => edgeColour(input, W, H, s)))
  const bg = [0, 1, 2].map((k) => Math.round(cols.reduce((a, c) => a + c[k]!, 0) / cols.length))
  // fade the photo's outer few percent into the backdrop so no edge shows
  const f = Math.round(Math.min(W, H) * 0.04)
  const mask = Buffer.from(
    `<svg width="${W}" height="${H}"><defs><filter id="b"><feGaussianBlur stdDeviation="${f / 2}"/></filter></defs>` +
      `<rect x="${f}" y="${f}" width="${W - 2 * f}" height="${H - 2 * f}" fill="#fff" filter="url(#b)"/></svg>`,
  )
  const alpha = await sharp(mask).resize(W, H).extractChannel(0).toBuffer()
  const faded = await sharp(input).flatten({ background: '#ffffff' }).removeAlpha().joinChannel(alpha).png().toBuffer()
  const canvas = await sharp({ create: { width: S, height: S, channels: 3, background: { r: bg[0]!, g: bg[1]!, b: bg[2]! } } })
    .composite([{ input: faded, left: padX, top: padY }])
    .png()
    .toBuffer()
  return sharp(canvas).resize(SQUARE_SIZE, SQUARE_SIZE).webp({ quality: 86 }).toBuffer()
}

/**
 * Crop a chosen square out of a scene photo, for a product the centred crop
 * cuts but a shifted one shows whole. Where the window runs a little past the
 * photo, the edge is mirrored, which is invisible on stone or fabric.
 *
 * @param window [centre x, centre y, side] as fractions of the photo's width,
 *   height and width.
 */
export async function cropWindow(input: Buffer, window: [number, number, number]): Promise<Buffer> {
  const meta = await sharp(input).metadata()
  const W = meta.width!
  const H = meta.height!
  const side = Math.round(window[2] * W)
  const left = Math.round(window[0] * W - side / 2)
  const top = Math.round(window[1] * H - side / 2)
  const ext = {
    left: Math.max(0, -left),
    top: Math.max(0, -top),
    right: Math.max(0, left + side - W),
    bottom: Math.max(0, top + side - H),
  }
  if (Math.max(ext.left, ext.top, ext.right, ext.bottom) > side * 0.08) {
    throw new Error('crop window runs more than 8% past the photo; pick a smaller one')
  }
  const extended = await sharp(input).extend({ ...ext, extendWith: 'mirror' }).toBuffer()
  return sharp(extended)
    .extract({ left: left + ext.left, top: top + ext.top, width: side, height: side })
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

  // Drop specks: foreground islands far smaller than the product. The darkest
  // corner of a vignette can fall outside the backdrop test, and a stray speck
  // there would both show and stretch the trimmed box off-centre.
  const label = new Int32Array(N).fill(-1)
  const sizes: number[] = []
  for (let i = 0; i < N; i++) {
    if (bg[i] || label[i] !== -1) continue
    const id = sizes.length
    let size = 0
    label[i] = id
    stack.push(i)
    while (stack.length) {
      const p = stack.pop()!
      size++
      const x = p % W
      const y = (p / W) | 0
      const next = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]
      for (const j of next) {
        if (j >= 0 && !bg[j] && label[j] === -1) {
          label[j] = id
          stack.push(j)
        }
      }
    }
    sizes.push(size)
  }
  const keepFrom = Math.max(...sizes, 0) * 0.02
  const hard = Buffer.alloc(N)
  for (let i = 0; i < N; i++) hard[i] = !bg[i] && sizes[label[i]!]! >= keepFrom ? 255 : 0
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
 * Never enlarge a source product more than this many times. A 300px supplier
 * screenshot blown up to fill the frame turns to mush, so a small source is
 * placed smaller instead: whole and sharp beats big and blurred.
 */
export const MAX_UPSCALE = 3

/**
 * Centre a cut-out on a plain backdrop at exactly SQUARE_SIZE², its longest
 * side taking `fill` of the frame (less for a small source, see MAX_UPSCALE).
 * Tall bottles and wide bags end up the same visual size.
 *
 * @param background Cream by default; white keeps a fix in line with sibling
 *   products that are shot on white and were left alone.
 */
export async function onCream(
  cut: Buffer,
  fill = 0.82,
  background: { r: number; g: number; b: number } = CREAM,
): Promise<Buffer> {
  const src = await sharp(cut).metadata()
  const longest = Math.max(src.width ?? 0, src.height ?? 0)
  const effective = Math.max(0.5, Math.min(fill, (MAX_UPSCALE * longest) / SQUARE_SIZE))
  const { buf } = await withShadow(cut)
  const placed = await sharp(buf)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .resize(Math.round(SQUARE_SIZE * effective), Math.round(SQUARE_SIZE * effective), { fit: 'inside' })
    .toBuffer({ resolveWithObject: true })
  // composite and resize are separate passes: within one sharp pipeline resize runs first
  return sharp({ create: { width: SQUARE_SIZE, height: SQUARE_SIZE, channels: 3, background } })
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
