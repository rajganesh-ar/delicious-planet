// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { safeRedirect, withRedirect } from '@/lib/redirect'

describe('safeRedirect', () => {
  it('keeps same-origin absolute paths', () => {
    expect(safeRedirect('/checkout')).toBe('/checkout')
    expect(safeRedirect('/account?tab=orders')).toBe('/account?tab=orders')
  })

  it('falls back to /account when there is nothing to honour', () => {
    expect(safeRedirect(null)).toBe('/account')
    expect(safeRedirect(undefined)).toBe('/account')
    expect(safeRedirect('')).toBe('/account')
  })

  it('refuses off-site destinations', () => {
    expect(safeRedirect('https://evil.example/phish')).toBe('/account')
    expect(safeRedirect('//evil.example/phish')).toBe('/account')
    expect(safeRedirect('javascript:alert(1)')).toBe('/account')
    expect(safeRedirect('checkout')).toBe('/account')
  })
})

describe('withRedirect', () => {
  it('carries the destination across auth pages', () => {
    expect(withRedirect('/register', '/checkout')).toBe('/register?redirect=%2Fcheckout')
  })

  it('leaves the href alone when there is no destination', () => {
    expect(withRedirect('/register', null)).toBe('/register')
  })
})
