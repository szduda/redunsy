import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { garageFiltersUrlStorage } from '@/features/garage/garage-filters-url-storage'
import { filterOptionsFromRhythmCards } from '@/features/garage/rhythm-index'
import { listRhythmCardsForOwnership } from '@/features/garage/search-snippets'
import {
  EMPTY_GARAGE_FILTERS,
  type GarageFilters,
  type OwnershipFilter,
} from '@/features/rhythm/rhythm.types'

type GarageFiltersState = GarageFilters & {
  toggleMeter: (meter: GarageFilters['meter'][number]) => void
  toggleInstrument: (instrument: GarageFilters['instruments'][number]) => void
  toggleArtist: (artist: string) => void
  toggleOrigin: (origin: string) => void
  toggleRhythmGroup: (rhythmGroup: string) => void
  toggleTag: (tag: string) => void
  setOwnership: (ownership: OwnershipFilter) => void
  clearFilters: () => void
}

const toggleValue = <T>(values: T[], value: T) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

const pruneFiltersForOwnership = (
  filters: GarageFilters,
  ownership: OwnershipFilter,
): Pick<GarageFilters, 'meter' | 'instruments' | 'artist' | 'origin' | 'rhythmGroup' | 'tags'> => {
  const options = filterOptionsFromRhythmCards(listRhythmCardsForOwnership(ownership))
  return {
    meter: filters.meter.filter((value) => options.meter.includes(value)),
    instruments: filters.instruments.filter((value) => options.instruments.includes(value)),
    artist: filters.artist.filter((value) => options.artist.includes(value)),
    origin: filters.origin.filter((value) => options.origin.includes(value)),
    rhythmGroup: filters.rhythmGroup.filter((value) => options.rhythmGroup.includes(value)),
    tags: filters.tags.filter((value) => options.tags.includes(value)),
  }
}

export const sanitizeGarageFilters = (filters: GarageFilters): GarageFilters => ({
  ...filters,
  ...pruneFiltersForOwnership(filters, filters.ownership),
})

export const useGarageFiltersStore = create<GarageFiltersState>()(
  persist(
    (set) => ({
      ...EMPTY_GARAGE_FILTERS,
      toggleMeter: (meter) => set((state) => ({ meter: toggleValue(state.meter, meter) })),
      toggleInstrument: (instrument) =>
        set((state) => ({ instruments: toggleValue(state.instruments, instrument) })),
      toggleArtist: (artist) => set((state) => ({ artist: toggleValue(state.artist, artist) })),
      toggleOrigin: (origin) => set((state) => ({ origin: toggleValue(state.origin, origin) })),
      toggleRhythmGroup: (rhythmGroup) =>
        set((state) => ({ rhythmGroup: toggleValue(state.rhythmGroup, rhythmGroup) })),
      toggleTag: (tag) => set((state) => ({ tags: toggleValue(state.tags, tag) })),
      setOwnership: (ownership) =>
        set((state) => ({
          ownership,
          ...pruneFiltersForOwnership(state, ownership),
        })),
      clearFilters: () => set(EMPTY_GARAGE_FILTERS),
    }),
    {
      name: 'redunsy-garage-filters',
      storage: createJSONStorage(() => garageFiltersUrlStorage),
      partialize: (state): GarageFilters => ({
        meter: state.meter,
        instruments: state.instruments,
        artist: state.artist,
        origin: state.origin,
        rhythmGroup: state.rhythmGroup,
        tags: state.tags,
        ownership: state.ownership,
      }),
      skipHydration: true,
    },
  ),
)

export const selectGarageFilters = (state: GarageFiltersState): GarageFilters => ({
  meter: state.meter,
  instruments: state.instruments,
  artist: state.artist,
  origin: state.origin,
  rhythmGroup: state.rhythmGroup,
  tags: state.tags,
  ownership: state.ownership,
})

export const hasActiveGarageFilters = (state: GarageFiltersState) =>
  state.meter.length > 0 ||
  state.instruments.length > 0 ||
  state.artist.length > 0 ||
  state.origin.length > 0 ||
  state.rhythmGroup.length > 0 ||
  state.tags.length > 0 ||
  state.ownership !== 'all'
