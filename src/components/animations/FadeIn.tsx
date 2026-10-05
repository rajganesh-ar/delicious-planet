'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  once?: boolean
  /**
   * False for content above the fold. The fade's start state is rendered by
   * the server as inline `opacity: 0`, so wrapped content stays invisible
   * until the JavaScript has loaded and hydrated — on a slow phone a blank
   * product page, and a late Largest Contentful Paint for search ranking.
   */
  appear?: boolean
}

const directionMap = {
  up: { y: 16 },
  down: { y: -16 },
  left: { x: 16 },
  right: { x: -16 },
  none: {},
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className,
  once = true,
  appear = true,
}: FadeInProps) {
  const offset = directionMap[direction]

  return (
    <motion.div
      className={className}
      initial={appear ? { opacity: 0, ...offset } : false}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-10%' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
