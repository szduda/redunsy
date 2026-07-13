import { EMPTY_GARAGE_FILTERS, type GarageFilters } from '@/features/rhythm/rhythm.types'

export const PRIVATE_GARAGE_FILTERS: GarageFilters = {
  ...EMPTY_GARAGE_FILTERS,
  ownership: 'private',
}
