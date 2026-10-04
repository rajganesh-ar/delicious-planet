// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { resolveBrand, resolveCategory } from '../../md/seed/intermex-catalogue'

/**
 * Titles and collection memberships are verbatim from intermexuae.com. Their
 * taxonomy is incomplete and overlapping, so this function decides where 200
 * products land — and a silent misfile is the failure mode, not an error.
 */
describe('resolveCategory', () => {
  it("uses the store's own collection when there is exactly one", () => {
    expect(resolveCategory('Valentina Hot Sauce', ['mexican-sauces'])).toEqual({
      category: 'mexican-sauces',
      from: 'collection',
    })
  })

  it('sends drinks to the department we already have, and skips accessories', () => {
    expect(resolveCategory('Jarritos Mandarin 370ml', ['drinks']).category).toBe(
      'curated-fine-beverages',
    )
    // The store sells food only.
    expect(resolveCategory('Molcajete', ['mexican-accessories']).category).toBeNull()
  })

  it('prefers the specific collection when a product is in two', () => {
    // Their catch-all is mexican-pantry, so anything paired with it loses.
    expect(
      resolveCategory('Maggi Seasoning Sauce (100ml)', ['mexican-pantry', 'mexican-sauces']),
    ).toEqual({ category: 'mexican-sauces', from: 'collection' })

    expect(
      resolveCategory('La Costeña Jalapeño Nachos 220g', ['chilis', 'mexican-pantry']),
    ).toEqual({ category: 'chilis', from: 'collection' })
  })

  it('falls back to the title when the store files a product nowhere', () => {
    expect(resolveCategory('Botanera Sauce 370 ml', [])).toEqual({
      category: 'mexican-sauces',
      from: 'title-rule',
    })
    expect(resolveCategory('Assorted Mexican Candy Bag', [])).toEqual({
      category: 'mexican-candy',
      from: 'title-rule',
    })
    expect(resolveCategory('Nachos jalapeno 2.8kg Costena', [])).toEqual({
      category: 'chilis',
      from: 'title-rule',
    })
  })

  it('reads "hot sauce" as a sauce even when the flavour is chilli', () => {
    // The sauce rule must beat the chilli rule, or Cholula becomes a chilli.
    expect(resolveCategory('Cholula Original Chilli Lime Hot Sauce', []).category).toBe(
      'mexican-sauces',
    )
  })

  it('does not turn a chilli-flavoured snack into a chilli', () => {
    // The chilli rule matches pepper varieties, not the word "chilli", so a bag
    // of peanuts stays a pantry item.
    expect(resolveCategory('Pepe Crunch Peanuts Chilli Flavour 500g', []).category).toBe(
      'pantry-staples',
    )
    expect(resolveCategory('No, Guilt nachos, Chilli Lime Inzi', []).category).toBe(
      'pantry-staples',
    )
  })

  it('drops unmatched products into the catch-all and says so', () => {
    expect(resolveCategory("Corn Tortilla 4.5'' 1kg", [])).toEqual({
      category: 'pantry-staples',
      from: 'default',
    })
    expect(resolveCategory('Rice Morelo 1kg valle verde', [])).toEqual({
      category: 'pantry-staples',
      from: 'default',
    })
  })

  it('ignores merchandising collections entirely', () => {
    // "Special Offers" and "Mexican Must Haves" are promotions, not types, so a
    // product in only those is still classified from its title.
    expect(resolveCategory('Pepe Crunch Peanuts Mango Flavour 500g', ['special-offers'])).toEqual({
      category: 'pantry-staples',
      from: 'default',
    })

    expect(resolveCategory('Chocorroles 8 pieces', ['mexican-must-haves'])).toEqual({
      category: 'mexican-candy',
      from: 'title-rule',
    })
  })
})

describe('resolveBrand', () => {
  it('files a product under the maker on the pack, not the store collection', () => {
    // Intermex lists these as "Intermex Production"; they are not.
    expect(resolveBrand('jarritos-mexican-cola-370ml', ['intermex'])?.slug).toBe('jarritos')
    expect(resolveBrand('fit-panda-flamin-hot-instant-noodles', ['intermex'])?.slug).toBe(
      'fit-panda',
    )
    expect(resolveBrand('intermex-mexican-beef-chorizo', ['intermex'])?.slug).toBe('intermex')
  })

  it('falls back to the two collections that hold only their own brand', () => {
    expect(resolveBrand('some-new-salsa', ['la-costena'])).toEqual({
      slug: 'la-costena',
      title: 'La Costeña',
    })
    expect(resolveBrand('some-new-salsa', ['la-meridana'])?.title).toBe('La Meridana')
  })

  it('gives no brand rather than a guess', () => {
    expect(resolveBrand('some-new-salsa', ['intermex'])).toBeNull()
    expect(resolveBrand('dried-corn-husks', [])).toBeNull()
  })
})
