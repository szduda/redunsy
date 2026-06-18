'use client'

import { useEffect, useState } from 'react'

import { useUiStore } from '@/features/store/ui.store'
import { Input } from '@/features/theme/input'

const DEBOUNCE_MS = 300

export const HomepageSearch = () => {
  const setSearchTerm = useUiStore((state) => state.setSearchTerm)
  const [value, setValue] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => setSearchTerm(value), DEBOUNCE_MS)
    return () => clearTimeout(timeoutId)
  }, [setSearchTerm, value])

  return (
    <Input
      aria-label="Search grooves"
      placeholder="Search grooves…"
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}
