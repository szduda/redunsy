import type { DemoTrack } from '@/features/groovy-player/demo-tracks'

export type SnippetInstrument = 'djembe' | 'dundunba' | 'sangban' | 'kenkeni' | 'bell'

export type SnippetMeter = 3 | 4

export type Snippet = {
  id: string
  name: string
  meter: SnippetMeter
  instruments: SnippetInstrument[]
  longestTrack: number
  artist: string[]
  origin: string[]
  tags: string[]
  addedAt: string
  tracks: DemoTrack[]
}

export type GarageFilters = {
  meter: SnippetMeter[]
  instruments: SnippetInstrument[]
  artist: string[]
  origin: string[]
  tags: string[]
}

export const EMPTY_GARAGE_FILTERS: GarageFilters = {
  meter: [],
  instruments: [],
  artist: [],
  origin: [],
  tags: [],
}

export type SearchSnippetsParams = {
  search: string
  filters: GarageFilters
  page: number
  pageSize: number
}

export type SearchSnippetsResult = {
  items: Snippet[]
  total: number
  page: number
  pageSize: number
}
