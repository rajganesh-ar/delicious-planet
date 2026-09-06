/**
 * Measurement units for recipe ingredients.
 *
 * One list, used in three places that must agree: the `unit` select on the
 * Recipes collection, the unit dropdown in the chef's recipe builder, and the
 * rendering on the public recipe page. Defining it here rather than inline in
 * each is what stops a chef from saving "tbsp" against an enum that only knows
 * "tablespoon".
 *
 * `base` is grams for weight and millilitres for volume, so a quantity can be
 * normalised for scaling or for a shopping list. Count units deliberately have
 * none — half a clove of garlic is a fine instruction, but "1 clove = 5 g" is a
 * guess, and a guess baked into data outlives the person who made it.
 *
 * Cup and spoon sizes are metric (250 / 15 / 5 ml), which is what the UAE, the
 * UK and the EU use. US customary spoons differ by about 1.4%, and cups by 5%.
 */

export type UnitGroup = 'weight' | 'volume' | 'count'

export interface UnitDef {
  /** Stored value. Kept short and stable — this is what lands in the database. */
  value: string
  /** Abbreviation shown beside a quantity, e.g. "250 g". */
  label: string
  /** Spelled out, for the admin panel's select and for screen readers. */
  name: string
  group: UnitGroup
  /** Grams (weight) or millilitres (volume) in one unit. Absent for counts. */
  base?: number
  /** Plural of `name`, when adding an "s" would be wrong. */
  plural?: string
}

export const UNITS: UnitDef[] = [
  // ── Weight ──────────────────────────────────────────────────────────
  { value: 'g', label: 'g', name: 'gram', group: 'weight', base: 1 },
  { value: 'kg', label: 'kg', name: 'kilogram', group: 'weight', base: 1000 },
  { value: 'mg', label: 'mg', name: 'milligram', group: 'weight', base: 0.001 },
  { value: 'oz', label: 'oz', name: 'ounce', group: 'weight', base: 28.3495 },
  { value: 'lb', label: 'lb', name: 'pound', group: 'weight', base: 453.592 },

  // ── Volume ──────────────────────────────────────────────────────────
  { value: 'ml', label: 'ml', name: 'millilitre', group: 'volume', base: 1 },
  { value: 'cl', label: 'cl', name: 'centilitre', group: 'volume', base: 10 },
  { value: 'l', label: 'l', name: 'litre', group: 'volume', base: 1000 },
  { value: 'tsp', label: 'tsp', name: 'teaspoon', group: 'volume', base: 5 },
  { value: 'tbsp', label: 'tbsp', name: 'tablespoon', group: 'volume', base: 15 },
  { value: 'cup', label: 'cup', name: 'cup', group: 'volume', base: 250 },
  { value: 'fl-oz', label: 'fl oz', name: 'fluid ounce', group: 'volume', base: 29.5735 },

  // ── Count and kitchen measures ──────────────────────────────────────
  { value: 'piece', label: 'pc', name: 'piece', group: 'count' },
  { value: 'clove', label: 'clove', name: 'clove', group: 'count' },
  { value: 'slice', label: 'slice', name: 'slice', group: 'count' },
  { value: 'sheet', label: 'sheet', name: 'sheet', group: 'count' },
  { value: 'sprig', label: 'sprig', name: 'sprig', group: 'count' },
  { value: 'leaf', label: 'leaf', name: 'leaf', group: 'count', plural: 'leaves' },
  { value: 'bunch', label: 'bunch', name: 'bunch', group: 'count', plural: 'bunches' },
  { value: 'handful', label: 'handful', name: 'handful', group: 'count' },
  { value: 'pinch', label: 'pinch', name: 'pinch', group: 'count', plural: 'pinches' },
  { value: 'dash', label: 'dash', name: 'dash', group: 'count', plural: 'dashes' },
  { value: 'drop', label: 'drop', name: 'drop', group: 'count' },
  { value: 'can', label: 'can', name: 'can', group: 'count' },
  { value: 'jar', label: 'jar', name: 'jar', group: 'count' },
  { value: 'packet', label: 'packet', name: 'packet', group: 'count' },
  { value: 'to-taste', label: 'to taste', name: 'to taste', group: 'count' },
]

export type UnitValue = (typeof UNITS)[number]['value']

const BY_VALUE = new Map(UNITS.map((unit) => [unit.value, unit]))

export function unitFor(value: string | null | undefined): UnitDef | null {
  return value ? (BY_VALUE.get(value) ?? null) : null
}

/**
 * Options for a Payload select. Grouped labels are not supported there, so the
 * group is spelled into the label — "Weight · gram (g)" sorts and scans in a
 * long dropdown far better than 27 bare abbreviations.
 */
const GROUP_LABEL: Record<UnitGroup, string> = {
  weight: 'Weight',
  volume: 'Volume',
  count: 'Count',
}

export const UNIT_OPTIONS = UNITS.map((unit) => ({
  label:
    unit.value === 'to-taste'
      ? 'Count · to taste'
      : `${GROUP_LABEL[unit.group]} · ${unit.name} (${unit.label})`,
  value: unit.value,
}))

/** The same list grouped, for the storefront's own <optgroup> dropdown. */
export const UNIT_GROUPS: { group: UnitGroup; label: string; units: UnitDef[] }[] = (
  ['weight', 'volume', 'count'] as UnitGroup[]
).map((group) => ({
  group,
  label: GROUP_LABEL[group],
  units: UNITS.filter((unit) => unit.group === group),
}))

/** `to taste` carries no number, so the quantity field is hidden for it. */
export function unitTakesQuantity(value: string | null | undefined): boolean {
  return value !== 'to-taste'
}

/**
 * Trims a computed quantity to something a cook can act on.
 *
 * Scaling 1.5 tsp for six servings gives 4.499999999999999; nobody wants to
 * read that, and rounding to a fixed number of places would print "250.00 g".
 */
export function roundQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0
  const places = Math.abs(value) >= 10 ? 0 : Math.abs(value) >= 1 ? 1 : 2
  return Number(value.toFixed(places))
}

/** "250 g", "2 cloves", "to taste". */
export function formatIngredientAmount(
  quantity: number | null | undefined,
  unitValue: string | null | undefined,
): string {
  const unit = unitFor(unitValue)
  if (!unit) return quantity ? String(roundQuantity(quantity)) : ''
  if (unit.value === 'to-taste') return 'to taste'
  if (quantity == null) return unit.label

  const amount = roundQuantity(quantity)

  // Abbreviations never take a plural — "250 gs" is wrong — but the count
  // units are spelled out, so those do.
  if (unit.group === 'count' && unit.label === unit.name) {
    const word = amount === 1 ? unit.name : (unit.plural ?? `${unit.name}s`)
    return `${amount} ${word}`
  }

  return `${amount} ${unit.label}`
}

/** Scales a quantity from the recipe's own yield to the one being cooked. */
export function scaleQuantity(
  quantity: number | null | undefined,
  fromServings: number | null | undefined,
  toServings: number | null | undefined,
): number | null {
  if (quantity == null) return null
  if (!fromServings || !toServings || fromServings <= 0) return quantity
  return roundQuantity((quantity * toServings) / fromServings)
}
