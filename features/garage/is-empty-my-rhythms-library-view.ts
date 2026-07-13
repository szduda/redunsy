import { hasNonOwnershipGarageFilters } from '@/features/garage/garage-filters.store'
import { listMyRhythms } from '@/features/rhythm/my-rhythms-storage'
import type { GarageFilters } from '@/features/rhythm/rhythm.types'

export const isEmptyMyRhythmsLibraryView = (filters: GarageFilters, searchTerm: string) =>
  filters.ownership === 'private' &&
  searchTerm.length === 0 &&
  !hasNonOwnershipGarageFilters(filters) &&
  listMyRhythms().length === 0
