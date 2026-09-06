// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * SITE_URL is resolved once at module load, so each case has to set the
 * environment and then re-import through a reset module registry — reading it
 * from a stale import would just re-assert the first case's value.
 */
async function loadWith(env: Record<string, string | undefined>) {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  return import('../../src/lib/site-url')
}

const ORIGINAL = { ...process.env }

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL
})

afterEach(() => {
  process.env = { ...ORIGINAL }
})

describe('SITE_URL', () => {
  it('prefers NEXT_PUBLIC_SITE_URL', async () => {
    const m = await loadWith({ NEXT_PUBLIC_SITE_URL: 'https://www.example.com' })
    expect(m.SITE_URL).toBe('https://www.example.com')
    expect(m.SITE_URL_IS_CONFIGURED).toBe(true)
  })

  it('strips a trailing slash so joined paths do not double up', async () => {
    const m = await loadWith({ NEXT_PUBLIC_SITE_URL: 'https://www.example.com/' })
    expect(m.SITE_URL).toBe('https://www.example.com')
    expect(m.absoluteUrl('/products')).toBe('https://www.example.com/products')
  })

  it('falls back to the Vercel production domain, not the per-deploy one', async () => {
    // VERCEL_URL would pin canonicals to a preview build; this must not read it.
    const m = await loadWith({
      VERCEL_PROJECT_PRODUCTION_URL: 'shop.vercel.app',
      VERCEL_URL: 'shop-git-branch-abc123.vercel.app',
    })
    expect(m.SITE_URL).toBe('https://shop.vercel.app')
    expect(m.SITE_URL_IS_CONFIGURED).toBe(true)
  })

  it('NEXT_PUBLIC_SITE_URL wins over the Vercel domain', async () => {
    const m = await loadWith({
      NEXT_PUBLIC_SITE_URL: 'https://www.example.com',
      VERCEL_PROJECT_PRODUCTION_URL: 'shop.vercel.app',
    })
    expect(m.SITE_URL).toBe('https://www.example.com')
  })

  it('defaults to localhost and reports itself unconfigured', async () => {
    // This flag is what makes the checkout route fall back to the request
    // origin in development instead of sending a developer on :3001 to :3000.
    const m = await loadWith({})
    expect(m.SITE_URL).toBe('http://localhost:3000')
    expect(m.SITE_URL_IS_CONFIGURED).toBe(false)
  })

  it('treats a blank value as unset rather than as an empty origin', async () => {
    const m = await loadWith({ NEXT_PUBLIC_SITE_URL: '   ' })
    expect(m.SITE_URL).toBe('http://localhost:3000')
    expect(m.SITE_URL_IS_CONFIGURED).toBe(false)
  })

  it('builds absolute URLs for a path with or without a leading slash', async () => {
    const m = await loadWith({ NEXT_PUBLIC_SITE_URL: 'https://www.example.com' })
    expect(m.absoluteUrl('/products/x')).toBe('https://www.example.com/products/x')
    expect(m.absoluteUrl('products/x')).toBe('https://www.example.com/products/x')
  })
})
