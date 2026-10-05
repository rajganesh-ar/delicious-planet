'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MENU_LOCK_EVENT } from '../layout/menu-events'

interface SmoothScrollProps {
  children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Someone who has asked their system for less motion gets the browser's own
    // scrolling. Nothing else depends on Lenis being there: the menu lock below
    // only pauses it, and the page itself is locked separately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Leave gestures inside a dialog to the browser. An open overlay stops
      // Lenis, and a stopped Lenis cancels every wheel and touchmove it sees —
      // which made the basket, the mobile menu and the filter sheet impossible
      // to scroll. Matching the role covers those three and any added later.
      prevent: (node) => node.getAttribute('role') === 'dialog',
    })

    lenisRef.current = lenis

    const unsubscribe = lenis.on('scroll', ScrollTrigger.update)

    const onMenuLock = (event: Event) => {
      const { locked } = (event as CustomEvent<{ locked?: boolean }>).detail ?? {}

      if (locked) {
        lenis.stop()
        return
      }

      lenis.start()
      ScrollTrigger.update()
    }

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    window.addEventListener(MENU_LOCK_EVENT, onMenuLock)

    return () => {
      window.removeEventListener(MENU_LOCK_EVENT, onMenuLock)
      unsubscribe()
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
