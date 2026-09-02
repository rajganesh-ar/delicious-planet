'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

interface TextRevealProps {
  children: string
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  delay?: number
  stagger?: number
}

export function TextReveal({
  children,
  as: Tag = 'p',
  className,
  delay = 0,
  stagger = 0.04,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const split = new SplitText(ref.current, { type: 'words,chars' })

    gsap.fromTo(
      split.chars,
      { opacity: 0, yPercent: 110 },
      {
        opacity: 1,
        yPercent: 0,
        duration: 0.6,
        stagger,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
      },
    )

    return () => split.revert()
  }, [delay, stagger])

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className} style={{ overflow: 'hidden' }}>
      {children}
    </Tag>
  )
}
