import { MOCK_RHYTHM_CARDS } from '@/features/garage/mock-snippets'
import { listMyRhythms } from '@/features/rhythm/my-rhythms-storage'
import { rhythmToCard } from '@/features/rhythm/rhythm-helpers'
import type {
  GarageFilters,
  RhythmCard,
  SearchRhythmCardsParams,
  SearchRhythmCardsResult,
} from '@/features/rhythm/rhythm.types'

const API_DELAY_MS = 450

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const allRhythmCards = (): RhythmCard[] => [
  ...MOCK_RHYTHM_CARDS,
  ...listMyRhythms().map(rhythmToCard),
]

const matchesSearch = (card: RhythmCard, search: string) => {
  const query = search.toLowerCase()
  return (
    card.title.toLowerCase().includes(query) ||
    card.author.toLowerCase().includes(query) ||
    card.description.toLowerCase().includes(query) ||
    card.origin.some((place) => place.toLowerCase().includes(query)) ||
    card.tags.some((tag) => tag.toLowerCase().includes(query)) ||
    card.instruments.some((instrument) => instrument.toLowerCase().includes(query))
  )
}

const matchesOwnership = (card: RhythmCard, ownership: GarageFilters['ownership']) => {
  if (ownership === 'all') return true
  if (ownership === 'private') return card.userOwned === true
  return card.userOwned !== true
}

const matchesFilters = (card: RhythmCard, filters: GarageFilters) => {
  if (filters.meter.length && !filters.meter.includes(card.meter)) return false
  if (
    filters.instruments.length &&
    !filters.instruments.every((instrument) => card.instruments.includes(instrument))
  ) {
    return false
  }
  if (filters.artist.length && !filters.artist.includes(card.author)) return false
  if (filters.origin.length && !filters.origin.some((place) => card.origin.includes(place))) {
    return false
  }
  if (filters.tags.length && !filters.tags.some((tag) => card.tags.includes(tag))) return false
  if (!matchesOwnership(card, filters.ownership)) return false
  return true
}

const sortByRecent = (left: RhythmCard, right: RhythmCard) => right.updatedAt - left.updatedAt

export const searchRhythmCards = async ({
  search,
  filters,
  page,
  pageSize,
}: SearchRhythmCardsParams): Promise<SearchRhythmCardsResult> => {
  await delay(API_DELAY_MS)

  let results = allRhythmCards().filter((card) => matchesFilters(card, filters))

  if (search) {
    results = results.filter((card) => matchesSearch(card, search))
    results.sort((left, right) => {
      const leftExact = left.title.toLowerCase() === search.toLowerCase()
      const rightExact = right.title.toLowerCase() === search.toLowerCase()
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

/** @deprecated Use searchRhythmCards */
export const searchSnippets = searchRhythmCards
