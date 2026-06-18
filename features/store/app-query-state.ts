import {
  EMPTY_GARAGE_FILTERS,
  type GarageFilters,
  type SnippetInstrument,
  type SnippetMeter,
} from '@/features/garage/snippet.types'
import { SEARCH_QUERY_PARAM } from '@/features/store/search.store'

export const GARAGE_FILTER_QUERY_PARAMS = {
  meter: 'meter',
  instruments: 'instruments',
  artist: 'artist',
  origin: 'origin',
  tags: 'tags',
} as const

const SNIPPET_INSTRUMENTS: SnippetInstrument[] = ['djembe', 'dundunba', 'sangban', 'kenkeni', 'bell']

const parseCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const parseMeter = (value: string): SnippetMeter[] =>
  parseCsv(value)
    .map(Number)
    .filter((item): item is SnippetMeter => item === 3 || item === 4)

const parseInstruments = (value: string): SnippetInstrument[] =>
  parseCsv(value).filter((item): item is SnippetInstrument =>
    SNIPPET_INSTRUMENTS.includes(item as SnippetInstrument),
  )

const serializeCsv = (values: readonly (string | number)[]) =>
  values.length ? values.join(',') : ''

const arraysEqual = <T,>(left: readonly T[], right: readonly T[]) =>
  left.length === right.length && left.every((value, index) => value === right[index])

export const filtersEqual = (left: GarageFilters, right: GarageFilters) =>
  arraysEqual(left.meter, right.meter) &&
  arraysEqual(left.instruments, right.instruments) &&
  arraysEqual(left.artist, right.artist) &&
  arraysEqual(left.origin, right.origin) &&
  arraysEqual(left.tags, right.tags)

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

  const tags = params.get(GARAGE_FILTER_QUERY_PARAMS.tags)
  if (tags) filters.tags = parseCsv(tags)

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
    ['tags', serializeCsv(filters.tags)],
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
