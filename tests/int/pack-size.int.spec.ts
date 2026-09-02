// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { derivePackSize } from '../../md/seed/lib/pack-size'

/**
 * Titles and copy are verbatim from velsoro.com. Every Velsoro product is a
 * single "Default Title" variant, so this function decides the size label a
 * customer picks and the net weight shown as a spec.
 */
describe('derivePackSize', () => {
  it('reads a weight stated in the title', () => {
    expect(derivePackSize('Ruby Chocolate Bar with Roasted Crushed Pistachios – 56g', '')).toEqual({
      label: '56g',
      grams: 56,
      from: 'title-weight',
    })
    expect(derivePackSize('Milk Chocolate Almond 40g', '')).toEqual({
      label: '40g',
      grams: 40,
      from: 'title-weight',
    })
  })

  it('reads a multipack as count × unit weight, not one or the other', () => {
    // "Box of 5 … 40g Each" is 5 bars of 40g. Matching the count alone would
    // label it "5 pieces" and lose the weight; matching the weight alone would
    // call a 200g box a 40g bar.
    expect(derivePackSize('Box of 5 Artisanal Chocolate Bars – 40g Each', '')).toEqual({
      label: '5 × 40g',
      grams: 200,
      from: 'title-multipack',
    })
    expect(derivePackSize('Box of 5 Artisanal Chocolate Bars – 100g Each', '')).toEqual({
      label: '5 × 100g',
      grams: 500,
      from: 'title-multipack',
    })
  })

  it('reads a piece count from the title', () => {
    expect(derivePackSize('Box of 24 – Mixed Artisanal Bonbons', '')).toMatchObject({
      label: '24 pieces',
      from: 'title-count',
    })
    expect(derivePackSize('Salted Caramel Crunchy Box Of 12', '')).toMatchObject({
      label: '12 pieces',
      from: 'title-count',
    })
  })

  it('does not claim a weight for a piece count', () => {
    expect(derivePackSize('Box of 48 Mixed Artisanal Bonbons', '')?.grams).toBeUndefined()
  })

  it('falls back to a count stated only in the copy', () => {
    // The teddy bears carry no size in the title at all.
    expect(
      derivePackSize(
        'Red Teddy',
        'Inside, discover 4 handcrafted chocolates 2 decadent truffles and 2 rich bonbons',
      ),
    ).toMatchObject({ label: '4 pieces', from: 'body-count' })

    expect(
      derivePackSize(
        'Golden Teddy',
        'filled with four assorted artisanal bonbons, each bite reveals a surprise',
      ),
    ).toMatchObject({ label: '4 pieces', from: 'body-count' })
  })

  it('falls back to a weight stated only in the copy', () => {
    // "Caramel Pistachio Delight" names no size, but its copy opens
    // "Mini Bars (56g) with Dolce Chocolate".
    expect(
      derivePackSize(
        'Caramel Pistachio Delight',
        'Mini Bars (56g) with Dolce Chocolate & Roasted Pistachios Experience the sweet',
      ),
    ).toEqual({ label: '56g', grams: 56, from: 'body-weight' })
  })

  it('prefers a piece count over a gram figure mentioned in passing', () => {
    expect(
      derivePackSize(
        'Red Teddy',
        'Inside, discover 4 handcrafted chocolates, presented in a 250g gift box',
      ),
    ).toMatchObject({ label: '4 pieces', from: 'body-count' })
  })

  it('returns undefined rather than guessing when nothing states a size', () => {
    expect(
      derivePackSize(
        'Sugar Free Plain Chocolate (with Maltitol)',
        'Enjoy the pure, rich taste of fine chocolate, mindfully crafted without sugar.',
      ),
    ).toBeUndefined()
  })

  it('lets an explicit override win', () => {
    expect(derivePackSize('Anything 56g', 'body', '80g')).toEqual({
      label: '80g',
      from: 'override',
    })
  })
})
