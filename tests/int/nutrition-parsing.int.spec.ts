// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  gramsOf,
  parseNutrition,
  parseNutritionValue,
  sizeLabel,
} from '../../md/seed/lib/nutrition'

/**
 * Every string here is copied verbatim from a Casinetto product page. Producers
 * type these panels by hand, so the failure mode is never a crash — it is a
 * plausible-looking wrong number reaching a food label on the storefront.
 */
describe('parseNutritionValue', () => {
  it('reads plain numbers', () => {
    expect(parseNutritionValue('1463')).toBe(1463)
    expect(parseNutritionValue('5.8')).toBe(5.8)
    expect(parseNutritionValue('20')).toBe(20)
  })

  it('drops a trailing comma left by the producer', () => {
    // Sterilgarda's mascarpone panel writes "Carbohydrate (g): 3,"
    expect(parseNutritionValue('3,')).toBe(3)
    expect(parseNutritionValue('36,')).toBe(36)
  })

  it('treats a lone comma as a decimal separator, not a thousands mark', () => {
    // Kolios writes European decimals: "<0,1", "<0,01"
    expect(parseNutritionValue('0,1')).toBe(0.1)
    expect(parseNutritionValue('&lt;0,01')).toBe(0.01)
  })

  it('reads a "less than" bound as its upper bound', () => {
    expect(parseNutritionValue('&lt;0.5&nbsp;')).toBe(0.5)
    expect(parseNutritionValue('<0.5')).toBe(0.5)
  })

  it('returns undefined for values with no number in them', () => {
    expect(parseNutritionValue('')).toBeUndefined()
    expect(parseNutritionValue('n/a')).toBeUndefined()
  })
})

describe('parseNutrition', () => {
  it('maps a Sterilgarda panel onto nutritionPer100g fields', () => {
    const html =
      '<div>Nutritional Information per 100g</div><div>Energy (kJ): 1463</div>' +
      '<div>Energy (kcal): 355</div><div>Protein (g): 5.8</div>' +
      '<div>Carbohydrate (g): 3,</div><div>of which sugars (g): 3</div>' +
      '<div>Fat (g): 36,</div><div>of which saturates (g): 25</div><div>Salt (g): 0.07</div>'

    expect(parseNutrition(html).values).toEqual({
      energyKJ: 1463,
      energyKcal: 355,
      protein: 5.8,
      carbohydrates: 3,
      sugars: 3,
      fat: 36,
      saturatedFat: 25,
      salt: 0.07,
    })
  })

  it('handles the span-wrapped, decimal-comma Kolios panel', () => {
    const html =
      '<div><span style="font-size: 13px;">Nutritional information per 100g:</span></div>' +
      '<div><span style="font-size: 13px;">Energy (kcal): 275</span></div>' +
      '<div><span style="font-size: 13px;">Protein (g): 16</span></div>' +
      '<div><span style="font-size: 13px;">Of which sugars (g): &lt;0,1</span></div>' +
      '<div><span style="font-size: 13px;">Of which saturates (g): 16</span></div>'

    const { values } = parseNutrition(html)
    expect(values.energyKcal).toBe(275)
    expect(values.protein).toBe(16)
    expect(values.sugars).toBe(0.1)
    expect(values.saturatedFat).toBe(16)
  })

  it('accepts the alternative wordings producers use for the same row', () => {
    const a = parseNutrition('<div>of which saturated fats (g): 18</div>').values
    const b = parseNutrition('<div>of which saturates (g): 18</div>').values
    expect(a.saturatedFat).toBe(18)
    expect(b.saturatedFat).toBe(18)
    expect(parseNutrition('<div>Sugar (g): 4</div>').values.sugars).toBe(4)
  })

  it('keeps an unmapped row rather than dropping it', () => {
    // Castello's Danablu reports Sodium, for which there is no field. It must
    // survive as a specification instead of vanishing — and it must NOT be
    // silently converted into salt, which would overstate it 2.5×.
    const { values, extras } = parseNutrition('<div>Sodium (g): 3.3</div>')
    expect(values.salt).toBeUndefined()
    expect(extras).toEqual([{ label: 'Sodium (g)', value: '3.3' }])
  })

  it('ignores the panel heading', () => {
    const { values, extras } = parseNutrition('<div>Nutritional information per 100g:</div>')
    expect(values).toEqual({})
    expect(extras).toEqual([])
  })
})

describe('sizeLabel', () => {
  it('prefers the parenthetical in the unit-of-measure label', () => {
    expect(sizeLabel('1 Piece (500g)', '500.0000 GRAM')).toBe('500g')
    expect(sizeLabel('1 Piece (1kg)', '1.0000 KILOGRAM')).toBe('1kg')
  })

  it('falls back to the raw piece unit when there is no parenthetical', () => {
    expect(sizeLabel(undefined, '150.0000 GRAM')).toBe('150g')
    expect(sizeLabel(undefined, '1.0000 KILOGRAM')).toBe('1kg')
  })

  it('returns undefined when neither is usable', () => {
    expect(sizeLabel(undefined, undefined)).toBeUndefined()
  })
})

describe('gramsOf', () => {
  it('converts weight labels to grams', () => {
    expect(gramsOf('500g')).toBe(500)
    expect(gramsOf('1kg')).toBe(1000)
    expect(gramsOf('One size')).toBeUndefined()
  })
})
