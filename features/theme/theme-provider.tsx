'use client'

import { useLayoutEffect, type ReactNode } from 'react'

import { applyThemeClass, useThemeStore } from '@/features/store/theme.store'

type ThemeProviderProps = {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme = useThemeStore((state) => state.theme)

  useLayoutEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  return children
}
