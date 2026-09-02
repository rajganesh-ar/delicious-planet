/**
 * Deriving a pack size from a product title and its marketing copy.
 *
 * Velsoro ships every product as a single Shopify variant called "Default
 * Title", so the `size` a customer sees has to come out of prose. It drives
 * `weightGrams` and the variant label, so a wrong reading is a wrong spec on a
 * food product rather than a crash — hence its own module and its own tests.
 */

const WORD_NUMBERS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  eight: 8,
  ten: 10,
  twelve: 12,
  twenty: 20,
  24: 24,
}

export interface PackSize {
  /** The label shown on the variant, e.g. "56g", "5 × 40g", "24 pieces". */
  label: string
  /** Net weight, only where a weight is actually stated. */
  grams?: number
  /** How it was worked out — reported so a guess is never invisible. */
  from:
    | 'title-weight'
    | 'title-multipack'
    | 'title-count'
    | 'body-count'
    | 'body-weight'
    | 'override'
}

/**
 * Order matters: a multipack ("Box of 5 … 40g Each") states both a count and a
 * weight, and the count alone would describe it as loosely as the weight alone
 * would describe it wrongly.
 */
export function derivePackSize(
  title: string,
  bodyText: string,
  override?: string,
): PackSize | undefined {
  if (override) return { label: override, from: 'override' }

  // "Box of 5 Artisanal Chocolate Bars – 100g Each" → 5 × 100g
  const multipack = title.match(/box of\s*(\d+)\b[\s\S]*?(\d+)\s*g\b/i)
  if (multipack) {
    const count = parseInt(multipack[1]!, 10)
    const each = parseInt(multipack[2]!, 10)
    return { label: `${count} × ${each}g`, grams: count * each, from: 'title-multipack' }
  }

  // "Ruby Chocolate Bar with Roasted Crushed Pistachios – 56g" → 56g
  const weight = title.match(/(\d+)\s*g\b/i)
  if (weight) {
    const g = parseInt(weight[1]!, 10)
    return { label: `${g}g`, grams: g, from: 'title-weight' }
  }

  // "Box of 24 – Mixed Artisanal Bonbons" → 24 pieces
  const count = title.match(/box of\s*(\d+)\b/i)
  if (count) {
    const n = parseInt(count[1]!, 10)
    return { label: `${n} ${n === 1 ? 'piece' : 'pieces'}`, from: 'title-count' }
  }

  // "Inside, discover 4 handcrafted chocolates" / "filled with four assorted
  // artisanal bonbons" — the teddy bears state their count only in the copy.
  const body = bodyText.match(
    /\b(\d+|two|three|four|five|six|eight|ten|twelve|twenty)\s+(?:\w+\s+){0,3}?(?:chocolates|bonbons|truffles|pieces)\b/i,
  )
  if (body) {
    const token = body[1]!.toLowerCase()
    const n = WORD_NUMBERS[token] ?? parseInt(token, 10)
    if (Number.isFinite(n) && n > 0 && n <= 200) {
      return { label: `${n} ${n === 1 ? 'piece' : 'pieces'}`, from: 'body-count' }
    }
  }

  // "Mini Bars (56g) with Dolce Chocolate…" — a few bars state their weight
  // only in the opening line of the copy. Last, so an assortment's piece count
  // is never overridden by a gram figure mentioned in passing.
  const bodyWeight = bodyText.match(/(\d+)\s*g\b/i)
  if (bodyWeight) {
    const g = parseInt(bodyWeight[1]!, 10)
    if (g > 0 && g <= 5000) return { label: `${g}g`, grams: g, from: 'body-weight' }
  }

  return undefined
}
