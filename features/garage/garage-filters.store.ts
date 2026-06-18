import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { garageFiltersUrlStorage } from '@/features/garage/garage-filters-url-storage'
import { EMPTY_GARAGE_FILTERS, type GarageFilters } from '@/features/garage/snippet.types'

type GarageFiltersState = GarageFilters & {
  toggleMeter: (meter: GarageFilters['meter'][number]) => void
  toggleInstrument: (instrument: GarageFilters['instruments'][number]) => void
  toggleArtist: (artist: string) => void
  toggleOrigin: (origin: string) => void
  toggleTag: (tag: string) => void
  clearFilters: () => void
}

const toggleValue = <T,>(values: T[], value: T) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

export const useGarageFiltersStore = create<GarageFiltersState>()(
  persist(
    (set) => ({
      ...EMPTY_GARAGE_FILTERS,
      toggleMeter: (meter) => set((state) => ({ meter: toggleValue(state.meter, meter) })),
      toggleInstrument: (instrument) =>
        set((state) => ({ instruments: toggleValue(state.instruments, instrument) })),
      toggleArtist: (artist) => set((state) => ({ artist: toggleValue(state.artist, artist) })),
      toggleOrigin: (origin) => set((state) => ({ origin: toggleValue(state.origin, origin) })),
      toggleTag: (tag) => set((state) => ({ tags: toggleValue(state.tags, tag) })),
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
        tags: state.tags,
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
  tags: state.tags,
})

export const hasActiveGarageFilters = (state: GarageFiltersState) =>
  state.meter.length > 0 ||
  state.instruments.length > 0 ||
  state.artist.length > 0 ||
  state.origin.length > 0 ||
  state.tags.length > 0
