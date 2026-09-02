// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { assignSku } from '../../md/seed/lib/sku'

describe('assignSku', () => {
  const base = { prefix: 'VLS', variantId: 45693138141333 }

  it('uses the handle alone for a single-variant product', () => {
    expect(assignSku({ ...base, handle: 'crimson-luxe', index: 0, total: 1 })).toBe(
      'VLS-CRIMSON-LUXE',
    )
  })

  it('discriminates every variant of a multi-variant product', () => {
    // The bug this exists to prevent: all three sizes of the custom box were
    // assigned "VLS-CUSTOM-CHOCOLATE-BOX" and the import was rejected by
    // assertUniqueVariantSkus.
    const labels = ['12-piece', '24-piece', '48-piece']
    const skus = labels.map((label, index) =>
      assignSku({ ...base, handle: 'custom-chocolate-box', label, index, total: 3 }),
    )

    expect(skus).toEqual([
      'VLS-CUSTOM-CHOCOLATE-BOX-12-PIECE',
      'VLS-CUSTOM-CHOCOLATE-BOX-24-PIECE',
      'VLS-CUSTOM-CHOCOLATE-BOX-48-PIECE',
    ])
    expect(new Set(skus).size).toBe(3)
  })

  it('falls back to the position when a variant has no usable label', () => {
    const skus = [0, 1].map((index) =>
      assignSku({ ...base, handle: 'box-of-4', label: 'Default Title', index, total: 2 }),
    )
    expect(skus).toEqual(['VLS-BOX-OF-4-1', 'VLS-BOX-OF-4-2'])
  })

  it('stays unique when a long handle has to be truncated', () => {
    const handle = 'box-of-4-dark-chocolate-with-raspberry-gelee-ganache-and-more-words'
    const a = assignSku({ ...base, handle, label: 'small', index: 0, total: 2, variantId: 111122 })
    const b = assignSku({ ...base, handle, label: 'large', index: 1, total: 2, variantId: 333344 })

    expect(a.length).toBeLessThanOrEqual(52)
    expect(b.length).toBeLessThanOrEqual(52)
    expect(a).not.toBe(b)
  })

  it('is stable across runs for the same input', () => {
    const args = { ...base, handle: 'golden-teddy', index: 0, total: 1 } as const
    expect(assignSku(args)).toBe(assignSku(args))
  })
})
