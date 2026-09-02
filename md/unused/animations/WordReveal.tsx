'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface WordRevealProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export function WordReveal({ text, className, style }: WordRevealProps) {
  const containerRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      containerRef.current.querySelectorAll('.word-reveal-word').forEach((el) => {
        ;(el as HTMLElement).style.opacity = '1'
      })
      return
    }

    const words = containerRef.current.querySelectorAll('.word-reveal-word')

    // Find the nearest <section> ancestor to use as trigger & pin target
    const section = containerRef.current.closest('section') ?? containerRef.current

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
    })

    tl.fromTo(words, { opacity: 0.15 }, { opacity: 1, stagger: 0.08, ease: 'none' })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [text])

  return (
    <p ref={containerRef} className={className} style={style}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="word-reveal-word inline-block mr-[0.3em]">
          {word}
        </span>
      ))}
    </p>
  )
}
