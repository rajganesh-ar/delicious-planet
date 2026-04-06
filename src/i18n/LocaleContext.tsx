'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import en from '../../messages/en.json'
import ar from '../../messages/ar.json'
import es from '../../messages/es.json'
import fr from '../../messages/fr.json'

export type Locale = 'en' | 'ar' | 'es' | 'fr'

export const LOCALES: { code: Locale; label: string; nativeLabel: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' },
]

const MESSAGES: Record<Locale, typeof en> = { en, ar, es, fr }

const STORAGE_KEY = 'dp-locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  dir: 'ltr' | 'rtl'
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    const browserLang = navigator.language.slice(0, 2) as Locale
    const detected = stored ?? (MESSAGES[browserLang] ? browserLang : 'en')
    setLocaleState(detected)
    setMounted(true)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
    // Update html dir for RTL
    const dir = LOCALES.find((loc) => loc.code === l)?.dir ?? 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', l)
  }, [])

  // Set initial dir/lang on mount
  useEffect(() => {
    if (!mounted) return
    const dir = LOCALES.find((loc) => loc.code === locale)?.dir ?? 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', locale)
  }, [mounted, locale])

  const dir = LOCALES.find((loc) => loc.code === locale)?.dir ?? 'ltr'

  // Don't render until hydrated to prevent locale flash
  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: 'en', setLocale, dir: 'ltr' }}>
        <NextIntlClientProvider locale="en" messages={MESSAGES['en']}>
          {children}
        </NextIntlClientProvider>
      </LocaleContext.Provider>
    )
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
