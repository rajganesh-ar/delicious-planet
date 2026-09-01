'use client'

import type { ReactNode } from 'react'
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
    <CartProvider>
      <SmoothScroll>
        <Header nav={nav} searchScopes={searchScopes} announcements={announcements} />
        {children}
        <CartDrawer />
      </SmoothScroll>
    </CartProvider>
  )
}
