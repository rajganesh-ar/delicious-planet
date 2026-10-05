'use client'

import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { CartProvider } from './CartContext'
import { CartDrawer } from './CartDrawer'
import { Header, type SearchScope, type AnnouncementItem } from './Header'
import { SmoothScroll } from '../animations/SmoothScroll'
import type { NavEntry } from '@/lib/nav'

interface ClientShellProps {
  children: ReactNode
  nav: NavEntry[]
  searchScopes: SearchScope[]
  announcements?: AnnouncementItem[]
}

export function ClientShell({ children, nav, searchScopes, announcements }: ClientShellProps) {
  return (
    // `reducedMotion="user"` makes every framer-motion animation inside honour
    // the system setting — fades still happen, but nothing slides or zooms.
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <SmoothScroll>
          <Header nav={nav} searchScopes={searchScopes} announcements={announcements} />
          {children}
          <CartDrawer />
        </SmoothScroll>
      </CartProvider>
    </MotionConfig>
  )
}
