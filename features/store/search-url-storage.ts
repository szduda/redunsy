import type { StateStorage } from 'zustand/middleware'

import { readSearchTermFromUrl } from '@/features/store/app-query-state'

export const searchUrlStorage: StateStorage = {
  getItem: () => {
    if (typeof window === 'undefined') return null
    const searchTerm = readSearchTermFromUrl()
    if (!searchTerm) return null
    return JSON.stringify({ state: { searchTerm }, version: 0 })
  },
  setItem: () => undefined,
  removeItem: () => undefined,
}
