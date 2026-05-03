'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function MagneticButton({ children, className, strength = 0.25 }: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 })

  const x = useTransform(springX, (v) => v * strength)
  const y = useTransform(springY, (v) => v * strength)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const isFullWidth = !!className && /\bw-full\b/.test(className)

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={isFullWidth ? undefined : { display: 'inline-block' }}
    >
      <motion.div
        style={{ x, y, display: isFullWidth ? 'block' : 'inline-block', width: '100%' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
