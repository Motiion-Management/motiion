'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { usePathname } from 'next/navigation'

export function ThemeProvider({ children }: ThemeProviderProps) {
  const pathname = usePathname()
  const isOnboarding = pathname.startsWith('/onboarding')
  return (
    <NextThemesProvider
      forcedTheme={isOnboarding ? 'dark' : 'light'}
      attribute="class"
      defaultTheme="light"
    >
      {children}
    </NextThemesProvider>
  )
}
