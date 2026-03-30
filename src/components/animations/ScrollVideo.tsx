'use client'

import { useRef, useEffect } from 'react'
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

interface ScrollVideoProps {
  src: string
  className?: string
}

export function ScrollVideo({ src, className = '' }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const progress = useTransform(scrollYProgress, [0, 1], [0, 1])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Prevent autoplay — we drive playback manually
    video.pause()

    const handleLoaded = () => {
      // Seek to frame 0 once metadata is ready
      video.currentTime = 0
    }

    video.addEventListener('loadedmetadata', handleLoaded)
    return () => video.removeEventListener('loadedmetadata', handleLoaded)
  }, [])

  useMotionValueEvent(progress, 'change', (v) => {
    const video = videoRef.current
    if (!video || !video.duration || isNaN(video.duration)) return
    video.currentTime = v * video.duration
  })

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  )
}
