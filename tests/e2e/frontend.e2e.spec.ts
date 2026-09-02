import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('serves the home page', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Delicious Planet/)
    await expect(page.locator('header').first()).toBeVisible()
  })
})
