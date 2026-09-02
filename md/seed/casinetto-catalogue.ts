/**
 * Mapping decisions for the Casinetto import.
 *
 * Casinetto is a competitor, not a supplier and not a brand. Their storefront
 * is the source of the product *detail* — the ingredient lists, allergen
 * statements, nutrition panels and country of origin that producers rarely
 * publish themselves. The brand on each imported product is therefore the
 * producer Casinetto lists as `vendor` (Sterilgarda, Castello, Kolios, …), and
 * "casinetto" appears only as `source.provider`, which is a provenance record
 * of where the data came from rather than anything a customer sees.
 */

/**
 * Source collection → the department it lands in.
 *
 * Cheese goes to the existing "Fromagerie Selection" department rather than a
 * new "Cheese" one: it is already the catalogue's cheese department, and a
 * second one beside it would split the category for no gain. Add a line here
 * for each further collection taken from this source.
 */
export const COLLECTION_TO_CATEGORY: Record<string, string> = {
  'soft-semi-soft-cheeses': 'fromagerie-selection',
}

/**
 * Casinetto's product tags → dietary flags.
 *
 * Only tags that make an explicit claim are mapped; merchandising tags like
 * "discounted" are ignored. "Vegatarian" is misspelled at source and is matched
 * as spelled — correcting it upstream is not an option, and silently dropping
 * it would lose a real claim on every vegetarian cheese they list.
 */
export const TAG_TO_DIETARY: Record<string, keyof DietaryFlags> = {
  gluten_free: 'isGlutenFree',
  'gluten-free': 'isGlutenFree',
  halal: 'isHalal',
  vegatarian: 'isVegetarian',
  vegetarian: 'isVegetarian',
  vegan: 'isVegan',
  lactose_free: 'isLactoseFree',
  'lactose-free': 'isLactoseFree',
  organic: 'isOrganic',
}

export interface DietaryFlags {
  isOrganic: boolean
  isVegan: boolean
  isVegetarian: boolean
  isHalal: boolean
  isGlutenFree: boolean
  isLactoseFree: boolean
}

/**
 * Nutrition panel labels → the fields on `nutritionPer100g`.
 *
 * Every producer words the panel differently — "of which saturates", "of which
 * saturated fats", "Sugar", "Of which sugars" — so labels are normalised to
 * lowercase without punctuation and looked up here. A label that is not in this
 * table is kept as a specification row rather than dropped, so nothing on a
 * nutrition panel silently disappears.
 */
export const NUTRITION_LABELS: Record<string, string> = {
  'energy kj': 'energyKJ',
  'energy kcal': 'energyKcal',
  protein: 'protein',
  'protein g': 'protein',
  carbohydrate: 'carbohydrates',
  'carbohydrate g': 'carbohydrates',
  carbohydrates: 'carbohydrates',
  'carbohydrates g': 'carbohydrates',
  'of which sugars g': 'sugars',
  'of which sugars': 'sugars',
  'sugar g': 'sugars',
  'sugars g': 'sugars',
  'fat g': 'fat',
  fat: 'fat',
  'of which saturates g': 'saturatedFat',
  'of which saturated fats g': 'saturatedFat',
  'of which saturates': 'saturatedFat',
  'saturated fat g': 'saturatedFat',
  'salt g': 'salt',
  salt: 'salt',
  'fibre g': 'fibre',
  'fiber g': 'fibre',
}

/**
 * Prices come across as Casinetto's own AED retail prices.
 *
 * They are imported verbatim because a competitor's shelf price is a fact and
 * inventing a margin on top would be worse. But they are a *competitor's*
 * prices, not ours — every imported product is flagged so the catalogue is
 * repriced deliberately rather than by default.
 */
export const PRICING_NOTE =
  "price is Casinetto's own AED retail price, imported verbatim — reprice before selling"

/**
 * Claims a product title can make, checked against the tags that were actually
 * set.
 *
 * Their tagging is inconsistent: Kolios' "Feta Cheese Lactose-Free PDO" carries
 * a `Lactose_free` tag while Olympus' "Feta Cheese Lactose-free" does not, so
 * two products whose names make the same claim import with different flags.
 *
 * The mismatch is reported, never resolved. Setting a dietary flag because a
 * word appears in a product name is exactly the inference that puts a false
 * allergen claim on a shelf — a "lactose-free" title is a marketing name, and
 * only the producer's own tagging is evidence. Someone has to look.
 */
export const TITLE_CLAIMS: Array<{ pattern: RegExp; field: keyof DietaryFlags; label: string }> = [
  { pattern: /lactose[\s-]?free/i, field: 'isLactoseFree', label: 'lactose-free' },
  { pattern: /gluten[\s-]?free/i, field: 'isGlutenFree', label: 'gluten-free' },
  { pattern: /\bvegan\b/i, field: 'isVegan', label: 'vegan' },
  { pattern: /\borganic\b/i, field: 'isOrganic', label: 'organic' },
]
