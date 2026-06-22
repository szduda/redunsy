import {
  EMPTY_GARAGE_FILTERS,
  type GarageFilters,
  type OwnershipFilter,
  type RhythmInstrument,
  type RhythmMeter,
} from '@/features/rhythm/rhythm.types'
import { SEARCH_QUERY_PARAM } from '@/features/store/search.store'

export const GARAGE_FILTER_QUERY_PARAMS = {
  meter: 'meter',
  instruments: 'instruments',
  artist: 'artist',
  origin: 'origin',
  rhythmGroup: 'group',
  tags: 'tags',
  ownership: 'ownership',
} as const

const RHYTHM_INSTRUMENTS: RhythmInstrument[] = ['djembe', 'dundunba', 'sangban', 'kenkeni', 'bell']

const parseCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const parseMeter = (value: string): RhythmMeter[] =>
  parseCsv(value)
    .map(Number)
    .filter((item): item is RhythmMeter => item === 3 || item === 4)

const parseInstruments = (value: string): RhythmInstrument[] =>
  parseCsv(value).filter((item): item is RhythmInstrument =>
    RHYTHM_INSTRUMENTS.includes(item as RhythmInstrument),
  )

const parseOwnership = (value: string): OwnershipFilter =>
  value === 'private' || value === 'public' ? value : 'all'

const serializeCsv = (values: readonly (string | number)[]) =>
  values.length ? values.join(',') : ''

const arraysEqual = <T>(left: readonly T[], right: readonly T[]) =>
  left.length === right.length && left.every((value, index) => value === right[index])

export const filtersEqual = (left: GarageFilters, right: GarageFilters) =>
  arraysEqual(left.meter, right.meter) &&
  arraysEqual(left.instruments, right.instruments) &&
  arraysEqual(left.artist, right.artist) &&
  arraysEqual(left.origin, right.origin) &&
  arraysEqual(left.rhythmGroup, right.rhythmGroup) &&
  arraysEqual(left.tags, right.tags) &&
  left.ownership === right.ownership

export const readSearchTermFromUrl = () => {
  if (typeof window === 'undefined') return ''
  return readSearchTermFromParams(new URLSearchParams(window.location.search))
}

export const readSearchTermFromParams = (params: URLSearchParams) =>
  (params.get(SEARCH_QUERY_PARAM) ?? '').trim()

export const readGarageFiltersFromParams = (params: URLSearchParams): GarageFilters => {
  const filters: GarageFilters = { ...EMPTY_GARAGE_FILTERS }

  const meter = params.get(GARAGE_FILTER_QUERY_PARAMS.meter)
  if (meter) filters.meter = parseMeter(meter)

  const instruments = params.get(GARAGE_FILTER_QUERY_PARAMS.instruments)
  if (instruments) filters.instruments = parseInstruments(instruments)

  const artist = params.get(GARAGE_FILTER_QUERY_PARAMS.artist)
  if (artist) filters.artist = parseCsv(artist)

  const origin = params.get(GARAGE_FILTER_QUERY_PARAMS.origin)
  if (origin) filters.origin = parseCsv(origin)

  const rhythmGroup = params.get(GARAGE_FILTER_QUERY_PARAMS.rhythmGroup)
  if (rhythmGroup) filters.rhythmGroup = parseCsv(rhythmGroup)

  const tags = params.get(GARAGE_FILTER_QUERY_PARAMS.tags)
  if (tags) filters.tags = parseCsv(tags)

  const ownership = params.get(GARAGE_FILTER_QUERY_PARAMS.ownership)
  if (ownership) filters.ownership = parseOwnership(ownership)

  return filters
}

export const readGarageFiltersFromUrl = (): GarageFilters => {
  if (typeof window === 'undefined') return { ...EMPTY_GARAGE_FILTERS }
  return readGarageFiltersFromParams(new URLSearchParams(window.location.search))
}

export const parseAppQueryFromSearchParams = (params: URLSearchParams) => ({
  searchTerm: readSearchTermFromParams(params),
  filters: readGarageFiltersFromParams(params),
})

export const buildAppQuerySearchParams = (searchTerm: string, filters: GarageFilters) => {
  const params = new URLSearchParams()

  if (searchTerm) {
    params.set(SEARCH_QUERY_PARAM, searchTerm)
  }

  const entries: [keyof typeof GARAGE_FILTER_QUERY_PARAMS, string][] = [
    ['meter', serializeCsv(filters.meter)],
    ['instruments', serializeCsv(filters.instruments)],
    ['artist', serializeCsv(filters.artist)],
    ['origin', serializeCsv(filters.origin)],
    ['rhythmGroup', serializeCsv(filters.rhythmGroup)],
    ['tags', serializeCsv(filters.tags)],
    ['ownership', filters.ownership === 'all' ? '' : filters.ownership],
  ]

  entries.forEach(([key, value]) => {
    if (value) params.set(GARAGE_FILTER_QUERY_PARAMS[key], value)
  })

  return params
}

export const buildAppQueryHref = (pathname: string, searchTerm: string, filters: GarageFilters) => {
  const query = buildAppQuerySearchParams(searchTerm, filters).toString()
  return query ? `${pathname}?${query}` : pathname
}
