/**
 * Parsing for supplier-published nutrition panels and pack sizes.
 *
 * Kept separate from any importer because these are the functions most worth
 * testing directly: producers type these panels by hand and every one is
 * malformed differently, so the failure mode is a plausible-looking wrong
 * number rather than a crash.
 */
import { NUTRITION_LABELS } from '../casinetto-catalogue'
import { plainText } from './shopify-source'

/**
 * "3," → 3, "&lt;0.5&nbsp;" → 0.5, "&lt;0,01" → 0.01, "20" → 20.
 *
 * Real values seen in one collection: trailing commas, decimal commas from
 * mainland Europe, "less than" bounds and non-breaking spaces. A "<0.5" is
 * stored as its upper bound, which is how it reads on the pack.
 */
export function parseNutritionValue(raw: string): number | undefined {
  let t = raw
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/[<>~≈]/g, '')
    .trim()
    .replace(/[,.]$/, '')
    .trim()
  if (!t) return undefined
  // A comma with no dot present is a decimal separator, not a thousands mark:
  // these are per-100g figures, never large enough to need grouping.
  if (t.includes(',') && !t.includes('.')) t = t.replace(',', '.')
  const m = t.match(/-?\d+(?:\.\d+)?/)
  if (!m) return undefined
  const n = parseFloat(m[0])
  return Number.isFinite(n) ? n : undefined
}

export interface ParsedNutrition {
  /** Keyed by the field names on `nutritionPer100g`. */
  values: Record<string, number>
  /** Panel rows with no matching field — kept as specs so nothing is lost. */
  extras: Array<{ label: string; value: string }>
}

/**
 * The panel is a stack of `<div>Label: value</div>`, sometimes span-wrapped and
 * inconsistently worded ("of which saturates" / "of which saturated fats" /
 * "Sugar"). Labels are normalised and looked up; an unrecognised row becomes a
 * specification rather than being dropped, so no line of a nutrition panel is
 * silently lost.
 */
export function parseNutrition(html: string): ParsedNutrition {
  const out: ParsedNutrition = { values: {}, extras: [] }

  for (const chunk of html.split(/<\/div>|<br\s*\/?>/i)) {
    const row = plainText(chunk)
    if (!row) continue
    const i = row.indexOf(':')
    if (i < 0) continue

    const rawLabel = row.slice(0, i).trim()
    const rawValue = row.slice(i + 1).trim()
    if (!rawValue || /^nutrition/i.test(rawLabel)) continue

    const key = rawLabel.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, ' ').trim()
    const field = NUTRITION_LABELS[key]
    const n = parseNutritionValue(rawValue)

    if (field && n !== undefined) out.values[field] = n
    else out.extras.push({ label: rawLabel, value: rawValue })
  }
  return out
}

/** "1 Piece (500g)" → "500g"; falls back to "500.0000 GRAM" → "500g". */
export function sizeLabel(
  uom: string | undefined,
  pieceUom: string | undefined,
): string | undefined {
  const paren = uom?.match(/\(([^)]+)\)/)?.[1]?.trim()
  if (paren) return paren

  const m = pieceUom?.match(/^([\d.]+)\s*(GRAM|KILOGRAM|ML|LITER|LITRE)S?$/i)
  if (!m) return uom?.trim() || undefined
  const n = parseFloat(m[1]!)
  const unit = m[2]!.toUpperCase()
  if (unit.startsWith('KILOGRAM')) return `${n}kg`
  if (unit.startsWith('GRAM')) return `${n}g`
  if (unit === 'ML') return `${n}ml`
  return `${n}L`
}

/** Net weight in grams from a size label, where the label states a weight. */
export function gramsOf(size: string | undefined): number | undefined {
  if (!size) return undefined
  const g = size.match(/^([\d.]+)\s*g$/i)
  if (g) return Math.round(parseFloat(g[1]!))
  const kg = size.match(/^([\d.]+)\s*kg$/i)
  if (kg) return Math.round(parseFloat(kg[1]!) * 1000)
  return undefined
}
