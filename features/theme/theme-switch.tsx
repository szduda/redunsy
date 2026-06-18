'use client'

import { useThemeStore } from '@/features/store/theme.store'
import { Switch } from '@/features/theme/switch'

type ThemeSwitchProps = {
  className?: string
}

export const ThemeSwitch = ({ className }: ThemeSwitchProps) => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <Switch
      className={className}
      checked={theme === 'dark'}
      label={`${theme === 'dark' ? 'Dark' : 'Light'} Theme`}
      onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
    />
  )
}
