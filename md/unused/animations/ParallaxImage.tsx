'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'

interface ParallaxImageProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxImage({ children, speed = 0.15, className }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [target, setTarget] = useState<HTMLDivElement | null>(null)

  const refCallback = (node: HTMLDivElement | null) => {
    containerRef.current = node
    setTarget(node)
  }

  const { scrollYProgress } = useScroll({
    ...(target ? { target: { current: target } } : {}),
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}%`, `${speed * 100}%`])

  return (
    <div ref={refCallback} className={`overflow-hidden ${className ?? ''}`}>
      <motion.div style={{ y }} className="w-full h-full scale-110">
        {children}
      </motion.div>
    </div>
  )
}
