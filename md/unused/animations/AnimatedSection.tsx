'use client'

import React, { ReactNode, useRef, useEffect, useState } from 'react'

type Variant =
  | 'fade-up'
  | 'fade-in'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in'
  | 'reveal-up'
  | 'stagger'

const hiddenStyles: Record<Variant, React.CSSProperties> = {
  'fade-up': { opacity: 0, transform: 'translateY(40px)' },
  'fade-in': { opacity: 0 },
  'fade-left': { opacity: 0, transform: 'translateX(-40px)' },
  'fade-right': { opacity: 0, transform: 'translateX(40px)' },
  'scale-in': { opacity: 0, transform: 'scale(0.94)' },
  'reveal-up': { opacity: 0, transform: 'translateY(60px)' },
  stagger: { opacity: 0, transform: 'translateY(30px)' },
}

interface AnimatedSectionProps {
  children: ReactNode
  variant?: Variant
  className?: string
  delay?: number
}

export function AnimatedSection({
  children,
  variant = 'fade-up',
  className,
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(visible ? { opacity: 1, transform: 'none' } : hiddenStyles[variant]),
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
