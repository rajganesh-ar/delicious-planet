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

/**
 * Product grid alignment.
 *
 * The regression: the card header is a flex row of "01 / Category" against a
 * status flag, and neither side was constrained. A long category name squeezed
 * the flag until "Sold Out" broke onto two lines, which made that one card's
 * header taller — so its image started lower than its neighbours' and the whole
 * grid row lost its baseline.
 */
test.describe('Product grid', () => {
  test('status flags never wrap, so cards in a row stay aligned', async ({ page }) => {
    await page.goto('http://localhost:3000/products', { waitUntil: 'load' })
    await page.locator('footer').first().waitFor({ state: 'attached' })

    const flags = page.getByText(/^(Sold Out|Sale|New|-\d+%)$/)
    const count = await flags.count()
    // The catalogue always carries some out-of-stock lines; if this is ever 0
    // the assertion below is passing vacuously and the test needs revisiting.
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(count, 12); i++) {
      const flag = flags.nth(i)
      const box = await flag.boundingBox()
      if (!box) continue

      // A single line of 8px text in a py-0.5 chip is ~14px. Two lines would be
      // ~22px+, so this catches a wrap without pinning the exact type metrics.
      expect(box.height).toBeLessThan(20)
    }
  })

  test('every card header is the same height, flagged or not', async ({ page }) => {
    await page.goto('http://localhost:3000/products', { waitUntil: 'load' })
    await page.locator('footer').first().waitFor({ state: 'attached' })

    // The header is the card's own box, independent of the entrance animation
    // that moves the whole card — so this measures the thing that regressed
    // (header height) rather than where the card happens to be mid-transition.
    const heights = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('a[href^="/products/"]')]
        .map((a) => a.closest('.group'))
        .filter((c, i, arr): c is Element => Boolean(c) && arr.indexOf(c) === i)
        .slice(0, 20)
      return cards
        .map((card) => card.firstElementChild?.getBoundingClientRect().height ?? 0)
        .filter((h) => h > 0)
    })

    expect(heights.length).toBeGreaterThan(1)

    // A wrapped "Sold Out" made its card's header ~8px taller than its
    // neighbours'. Rounding absorbs sub-pixel text metrics only.
    const distinct = [...new Set(heights.map((h) => Math.round(h)))]
    expect(distinct).toHaveLength(1)
  })

  test('cards in the same grid row line up once the entrance settles', async ({ page }) => {
    await page.goto('http://localhost:3000/products', { waitUntil: 'load' })
    await page.locator('footer').first().waitFor({ state: 'attached' })

    // The first row only — taken by walking cards while x increases rather than
    // assuming a column count, because the grid is 5-up on desktop and 2-up on
    // a phone and this test runs at both widths.
    const readTops = () =>
      page.evaluate(() => {
        const boxes = [...document.querySelectorAll('a[href^="/products/"] img')]
          .slice(0, 12)
          .map((i) => i.getBoundingClientRect())

        const firstRow: number[] = []
        let lastLeft = -Infinity
        for (const box of boxes) {
          if (box.left <= lastLeft) break // x reset — a new row started
          lastLeft = box.left
          firstRow.push(Math.round(box.top))
        }
        return firstRow
      })

    // The grid staggers its cards in, so poll until two consecutive reads agree
    // before measuring. This waits for rendering to finish, not for the
    // assertion to pass — the check below still fails on a real misalignment.
    let previous = await readTops()
    let tops = previous
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(250)
      tops = await readTops()
      if (tops.length === previous.length && tops.every((t, j) => t === previous[j])) break
      previous = tops
    }

    expect(tops.length).toBeGreaterThan(1)
    // Settled, the first row's cards share one top edge exactly.
    expect([...new Set(tops)]).toHaveLength(1)
  })
})
