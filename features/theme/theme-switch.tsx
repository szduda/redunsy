'use client'

import { useThemeStore } from '@/features/store/theme.store'
import { Switch } from '@/features/theme/switch'

export const ThemeSwitch = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <Switch
      checked={theme === 'dark'}
      inline
      reversed
      label={`${theme === 'dark' ? 'Dark' : 'Light'} Theme`}
      onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
    />
  )
}
