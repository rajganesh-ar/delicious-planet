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

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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
