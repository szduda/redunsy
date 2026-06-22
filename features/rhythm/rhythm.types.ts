export const RHYTHM_INSTRUMENTS = ['djembe', 'dundunba', 'sangban', 'kenkeni', 'bell'] as const

export type RhythmInstrument = (typeof RHYTHM_INSTRUMENTS)[number]

export type RhythmMeter = 3 | 4

export type Track = {
  id: string
  name: string
  instrument: string
  bars: string[]
}

/**
 * A single instrument pattern as stored in the `rhythms.patterns` JSON column.
 * Merges the original export shape (`pattern`, `title`) with the editor/player
 * {@link Track} shape (`id`, `name`, `instrument`, `bars`).
 */
export type RhythmPattern = {
  id: string
  name: string
  instrument: string
  title: string
  pattern: string
  bars: string[]
}

export type RhythmCard = {
  slug: string
  title: string
  description: string
  meter: RhythmMeter
  instruments: RhythmInstrument[]
  longestTrack: number
  author: string[]
  origin: string[]
  tags: string[]
  rhythmGroup: string[]
  swingPattern: string
  tempo: number
  signalPattern: string
  createdAt: number
  updatedAt: number
  userOwned?: boolean
}

export type Rhythm = {
  slug: string
  title: string
  description: string
  meter: RhythmMeter
  author: string[]
  origin: string[]
  tags: string[]
  rhythmGroup: string[]
  swingPattern: string
  tempo: number
  signalPattern: string
  createdAt: number
  updatedAt: number
  userOwned?: boolean
  instruments: Record<string, Track>
}

export type OwnershipFilter = 'all' | 'private' | 'public'

export type GarageFilters = {
  meter: RhythmMeter[]
  instruments: RhythmInstrument[]
  artist: string[]
  origin: string[]
  rhythmGroup: string[]
  tags: string[]
  ownership: OwnershipFilter
}

export const EMPTY_GARAGE_FILTERS: GarageFilters = {
  meter: [],
  instruments: [],
  artist: [],
  origin: [],
  rhythmGroup: [],
  tags: [],
  ownership: 'all',
}

export type SearchRhythmCardsParams = {
  search: string
  filters: GarageFilters
  page: number
  pageSize: number
}

export type SearchRhythmCardsResult = {
  items: RhythmCard[]
  total: number
  page: number
  pageSize: number
}
