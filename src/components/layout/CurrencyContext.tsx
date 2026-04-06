'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'AED', symbol: 'AED', label: 'AED' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'INR', symbol: '₹', label: 'INR' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

// Approximate exchange rates from USD
const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  AED: 3.67,
  GBP: 0.79,
  EUR: 0.92,
  INR: 83.5,
}

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  convert: (amountUSD: number) => number
  format: (amountUSD: number) => string
  symbol: string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

const STORAGE_KEY = 'dp-currency'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null
    if (stored && RATES[stored]) setCurrencyState(stored)
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  const convert = (amountUSD: number) => Math.round(amountUSD * RATES[currency] * 100) / 100

  const format = (amountUSD: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(convert(amountUSD))

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '$'

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, symbol }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
