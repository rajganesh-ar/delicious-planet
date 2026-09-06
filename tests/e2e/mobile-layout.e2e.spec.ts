import { test, expect } from '@playwright/test'

/**
 * Phone-layout regressions, pinned.
 *
 * These exist because the failures they catch are invisible on desktop and
 * silent in a build: nothing throws, nothing logs, the page just renders wrong
 * on the devices most of the traffic uses.
 */

const PAGES = ['/', '/products', '/categories', '/about', '/contact']

test.describe('Mobile layout', () => {
  test('declares a device-width viewport', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // The regression this guards: the layout once rendered its own <head>,
    // which suppressed Next's metadata injection and dropped this tag. Phones
    // then laid the site out at 980px and scaled it down, so no `lg:` rule ever
    // applied and every breakpoint in the codebase was dead on mobile.
    const content = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(content).toContain('width=device-width')
  })

  for (const path of PAGES) {
    test(`does not scroll horizontally on ${path}`, async ({ page }) => {
      await page.goto(`http://localhost:3000${path}`, { waitUntil: 'load' })

      // Deliberately not `networkidle`: the home page never reaches it. The
      // carousels and rails keep fetching images as they come into view, so the
      // condition is one this site cannot satisfy and the test hung on it
      // rather than measuring anything. Waiting for the footer instead proves
      // the full page laid out, which is the actual precondition here.
      await page.locator('footer').first().waitFor({ state: 'attached' })
      await page.waitForTimeout(500)

      const overflow = await page.evaluate(() => {
        const el = document.documentElement
        return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }
      })

      // A single pixel of slack absorbs sub-pixel rounding at fractional device
      // scale factors; anything beyond that is a real element sticking out, and
      // on a phone it shows up as the whole page sliding sideways.
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
    })
  }

  test('keeps form inputs at a font size iOS will not zoom into', async ({ page }, testInfo) => {
    // Phone widths only. Input.tsx is `text-[16px] sm:text-[15px]`, so the
    // desktop project legitimately renders 15px and would fail this.
    test.skip(testInfo.project.name !== 'mobile', 'Phone-width rule only')

    await page.goto('http://localhost:3000/contact', { waitUntil: 'load' })

    const input = page.locator('input[type="text"], input[type="email"]').first()
    await expect(input).toBeVisible()

    // Safari on iOS zooms the viewport when a focused input renders below 16px.
    // It is a jarring jump mid-form and it does not zoom back out.
    const fontSize = await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(fontSize).toBeGreaterThanOrEqual(16)
  })
})
