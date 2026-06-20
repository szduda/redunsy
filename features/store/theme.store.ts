import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { THEME_STORAGE_KEY } from '@/features/theme/theme-init-script'

export type Theme = 'dark' | 'light'

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const applyThemeClass = (theme: Theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        applyThemeClass(theme)
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme)
      },
    },
  ),
)

export const useIsDark = () => useThemeStore((state) => state.theme === 'dark')
