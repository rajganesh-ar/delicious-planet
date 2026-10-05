'use client'

import { useEffect, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Keyboard focus for a modal overlay (the basket, the mobile menu, the filter
 * sheet). Each is `aria-modal`, which tells a screen reader the page behind is
 * out of reach — so focus has to be held inside to match:
 *
 * - on open, focus moves inside if the overlay has not already placed it;
 * - Tab and Shift+Tab wrap around inside instead of walking into the page
 *   behind, which is locked and, to a screen reader, hidden;
 * - on close, focus returns to whatever opened the overlay. Without that it
 *   fell to <body>, and a keyboard user had to tab through the whole header
 *   again to get back to the product they were adding.
 *
 * Focus that drops out from under the trap — removing the last unit of a
 * basket line removes the button that had it — is picked up again by the next
 * Tab rather than escaping to the page.
 */
export function useDialogFocus(open: boolean, containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusables = () => {
      const root = containerRef.current
      if (!root) return []
      return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0,
      )
    }

    // After the overlay's own effects, which may already have focused its
    // close button.
    const frame = requestAnimationFrame(() => {
      const root = containerRef.current
      if (root && !root.contains(document.activeElement)) focusables()[0]?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const root = containerRef.current
      const items = focusables()
      if (!root || items.length === 0) return

      const first = items[0]!
      const last = items[items.length - 1]!
      const active = document.activeElement
      const outside = !root.contains(active)

      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      if (opener && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open, containerRef])
}
