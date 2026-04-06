'use client'

import type { ReactNode } from 'react'
import { CartProvider } from './CartContext'
import { CurrencyProvider } from './CurrencyContext'
import { CartDrawer } from './CartDrawer'
import { Header } from './Header'
import { SmoothScroll } from '../animations/SmoothScroll'
import type { NavItem } from './MegaMenu'
import { LocaleProvider } from '@/i18n/LocaleContext'

interface ClientShellProps {
  children: ReactNode
  navItems: NavItem[]
}

export function ClientShell({ children, navItems }: ClientShellProps) {
  return (
    <LocaleProvider>
      <CurrencyProvider>
        <CartProvider>
          <SmoothScroll>
            <Header navItems={navItems} />
            {children}
            <CartDrawer />
          </SmoothScroll>
        </CartProvider>
      </CurrencyProvider>
    </LocaleProvider>
  )
}
