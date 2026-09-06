import React from 'react'
import type { Tone } from './shared'
import './admin.css'

/**
 * The status pill used everywhere in the admin.
 *
 * No hooks and no client directive, so the same component renders inside server
 * panels (the dashboard) and inside client cells (the orders list) without two
 * near-identical copies drifting apart.
 */
export function Badge({
  children,
  tone = 'neutral',
  withDot = true,
}: {
  children: React.ReactNode
  tone?: Tone
  withDot?: boolean
}) {
  return (
    <span className={`dp-badge dp-badge--${tone}${withDot ? '' : ' dp-badge--no-dot'}`}>
      {children}
    </span>
  )
}
