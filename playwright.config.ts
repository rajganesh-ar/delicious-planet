import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /*
   * The default 30s is not enough against `pnpm dev`, which compiles each route
   * on first request — a cold hit on the home page or the shop listing can take
   * most of a minute, and the whole suite failed on navigation timeouts that
   * had nothing to do with the pages being tested.
   */
  timeout: 90_000,
  expect: { timeout: 10_000 },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    /*
     * Most of this storefront's traffic is phones, and every layout regression
     * it has had was a phone one — the viewport tag going missing being the
     * worst. Desktop Chrome alone cannot catch those: it renders the `lg:`
     * rules that a phone never reaches.
     */
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      /*
       * The Payload admin is excluded rather than skipped in the spec, because
       * its `beforeAll` seeds a user and logs in — a describe-level skip still
       * runs that hook, so the suite failed in setup before any skip applied.
       * It is a back-office tool used at a desk; the storefront is what this
       * project is here to cover.
       */
      testIgnore: /admin\.e2e\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm dev',
    reuseExistingServer: true,
    url: 'http://localhost:3000',
    // Payload builds its import map and connects to Postgres before the first
    // response, so a cold `pnpm dev` needs well past Playwright's 60s default.
    timeout: 180_000,
  },
})
