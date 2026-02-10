'use client'

/**
 * Theme Provider - Gestion du thème dark/light
 * Utilise next-themes pour la persistance et la détection du système
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="cabinet-saas-theme"
    >
      {children}
    </NextThemesProvider>
  )
}
