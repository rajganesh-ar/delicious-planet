'use client'

import type { ReactNode } from 'react'
import { CartProvider } from './CartContext'
import { CartDrawer } from './CartDrawer'
import { Header } from './Header'
import { SmoothScroll } from '../animations/SmoothScroll'
import type { NavItem } from './MegaMenu'

interface ClientShellProps {
  children: ReactNode
  navItems: NavItem[]
}

export function ClientShell({ children, navItems }: ClientShellProps) {
  return (
    <CartProvider>
      <SmoothScroll>
        <Header navItems={navItems} />
        {children}
        <CartDrawer />
      </SmoothScroll>
    </CartProvider>
  )
}
