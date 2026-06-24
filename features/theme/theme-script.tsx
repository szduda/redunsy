'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useRef } from 'react'

import { themeInitScript } from '@/features/theme/theme-init-script'

export const ThemeScript = () => {
  const inserted = useRef(false)

  useServerInsertedHTML(() => {
    if (inserted.current) return null
    inserted.current = true
    return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} id="redunsy-theme-init" />
  })

  return null
}
