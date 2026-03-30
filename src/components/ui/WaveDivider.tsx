'use client'

interface WaveDividerProps {
  fill?: string
  flip?: boolean
  className?: string
}

export function WaveDivider({
  fill = 'var(--color-cream)',
  flip = false,
  className = '',
}: WaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-[0] ${className}`}
      style={flip ? { transform: 'rotate(180deg)' } : undefined}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: 'clamp(60px, 8vw, 120px)' }}
      >
        <path d="M0,120 C360,0 1080,0 1440,120 L1440,120 L0,120 Z" fill={fill} />
      </svg>
    </div>
  )
}
