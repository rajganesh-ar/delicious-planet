// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only unmounts between tests on its own when vitest `globals`
// is on, and it is off here — without this, each render stacks on the last and
// queries find duplicates.
afterEach(() => {
  cleanup()
})

// jsdom has no IntersectionObserver, and framer-motion's `whileInView` (FadeIn
// and friends) constructs one on mount. Nothing ever scrolls in a test, so an
// observer that never fires is the faithful stand-in.
if (typeof window !== 'undefined' && typeof window.IntersectionObserver === 'undefined') {
  class NoopIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds: ReadonlyArray<number> = [0]
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  window.IntersectionObserver = NoopIntersectionObserver
  globalThis.IntersectionObserver = NoopIntersectionObserver
}
