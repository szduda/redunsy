'use client'

import { useLayoutEffect, useState } from 'react'

const getPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches

export const usePrefersDark = () => {
  const [prefersDark, setPrefersDark] = useState(getPrefersDark)

  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = ({ matches }: MediaQueryListEvent) => setPrefersDark(matches)
    setPrefersDark(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return prefersDark
}
