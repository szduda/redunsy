import { MOCK_SNIPPETS } from '@/features/garage/mock-snippets'
import type { GarageFilters, SearchSnippetsParams, SearchSnippetsResult, Snippet } from '@/features/garage/snippet.types'

const API_DELAY_MS = 450

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const matchesSearch = (snippet: Snippet, search: string) => {
  const query = search.toLowerCase()
  return (
    snippet.name.toLowerCase().includes(query) ||
    snippet.artist.some((name) => name.toLowerCase().includes(query)) ||
    snippet.origin.some((place) => place.toLowerCase().includes(query)) ||
    snippet.tags.some((tag) => tag.toLowerCase().includes(query)) ||
    snippet.instruments.some((instrument) => instrument.toLowerCase().includes(query))
  )
}

const matchesFilters = (snippet: Snippet, filters: GarageFilters) => {
  if (filters.meter.length && !filters.meter.includes(snippet.meter)) return false
  if (
    filters.instruments.length &&
    !filters.instruments.every((instrument) => snippet.instruments.includes(instrument))
  ) {
    return false
  }
  if (filters.artist.length && !filters.artist.some((name) => snippet.artist.includes(name))) {
    return false
  }
  if (filters.origin.length && !filters.origin.some((place) => snippet.origin.includes(place))) {
    return false
  }
  if (filters.tags.length && !filters.tags.some((tag) => snippet.tags.includes(tag))) return false
  return true
}

const sortByRecent = (left: Snippet, right: Snippet) =>
  new Date(right.addedAt).getTime() - new Date(left.addedAt).getTime()

export const searchSnippets = async ({
  search,
  filters,
  page,
  pageSize,
}: SearchSnippetsParams): Promise<SearchSnippetsResult> => {
  await delay(API_DELAY_MS)

  let results = MOCK_SNIPPETS.filter((snippet) => matchesFilters(snippet, filters))

  if (search) {
    results = results.filter((snippet) => matchesSearch(snippet, search))
    results.sort((left, right) => {
      const leftExact = left.name.toLowerCase() === search.toLowerCase()
      const rightExact = right.name.toLowerCase() === search.toLowerCase()
      if (leftExact !== rightExact) return leftExact ? -1 : 1
      return sortByRecent(left, right)
    })
  } else {
    results.sort(sortByRecent)
  }

  const total = results.length
  const start = (page - 1) * pageSize
  const items = results.slice(start, start + pageSize)

  return { items, total, page, pageSize }
}
