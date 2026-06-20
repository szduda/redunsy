import type { StateStorage } from 'zustand/middleware'

import { sanitizeGarageFilters } from '@/features/garage/garage-filters.store'
import { readGarageFiltersFromUrl } from '@/features/store/app-query-state'

export { GARAGE_FILTER_QUERY_PARAMS } from '@/features/store/app-query-state'

export const garageFiltersUrlStorage: StateStorage = {
  getItem: () => {
    if (typeof window === 'undefined') return null
    const filters = sanitizeGarageFilters(readGarageFiltersFromUrl())
    const hasFilters =
      filters.meter.length > 0 ||
      filters.instruments.length > 0 ||
      filters.artist.length > 0 ||
      filters.origin.length > 0 ||
      filters.tags.length > 0 ||
      filters.ownership !== 'all'
    if (!hasFilters) return null
    return JSON.stringify({ state: filters, version: 0 })
  },
  setItem: () => undefined,
  removeItem: () => undefined,
}
