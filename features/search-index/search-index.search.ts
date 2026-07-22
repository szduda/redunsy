import Fuse from 'fuse.js'

import { SEARCH_INDEX_FUSE_OPTIONS } from '@/features/search-index/search-index.config'
import { getRhythmIndexCards } from '@/features/search-index/search-index.store'
import { listMyRhythms } from '@/features/rhythm/my-rhythms-storage'
import { rhythmToCard } from '@/features/rhythm/rhythm-helpers'
import type {
  GarageFilters,
  RhythmCard,
  SearchRhythmCardsParams,
  SearchRhythmCardsResult,
} from '@/features/rhythm/rhythm.types'

const allRhythmCards = (): RhythmCard[] => [
  ...getRhythmIndexCards(),
  ...listMyRhythms().map(rhythmToCard),
]

export const listAllRhythmCards = allRhythmCards

export const matchesOwnership = (card: RhythmCard, ownership: GarageFilters['ownership']) => {
  if (ownership === 'all') return true
  if (ownership === 'private') return card.userOwned === true
  return card.userOwned !== true
}

export const listIndexRhythmCardsForOwnership = (ownership: GarageFilters['ownership']) =>
  getRhythmIndexCards().filter((card) => matchesOwnership(card, ownership))

export const listRhythmCardsForOwnership = (ownership: GarageFilters['ownership']) =>
  allRhythmCards().filter((card) => matchesOwnership(card, ownership))

const sa = (value: string[] | null | undefined): string[] => value ?? []

const matchesFilters = (card: RhythmCard, filters: GarageFilters) => {
  if (filters.meter.length && !filters.meter.includes(card.meter)) return false
  if (
    filters.instruments.length &&
    !filters.instruments.every((i) => sa(card.instruments).includes(i))
  )
    return false
  if (
    filters.artist.length &&
    !filters.artist.some((name) =>
      sa(card.author).some((a) => a.toLowerCase() === name.toLowerCase()),
    )
  )
    return false
  if (
    filters.origin.length &&
    !filters.origin.some((place) =>
      sa(card.origin).some((o) => o.toLowerCase() === place.toLowerCase()),
    )
  )
    return false
  if (
    filters.rhythmGroup.length &&
    !filters.rhythmGroup.some((group) =>
      sa(card.rhythmGroup).some((g) => g.toLowerCase() === group.toLowerCase()),
    )
  )
    return false
  if (
    filters.tags.length &&
    !filters.tags.some((tag) => sa(card.tags).some((t) => t.toLowerCase() === tag.toLowerCase()))
  )
    return false
  if (!matchesOwnership(card, filters.ownership)) return false
  return true
}

const fuseSearch = (
  cards: RhythmCard[],
  query: string,
): Array<{ card: RhythmCard; score: number }> => {
  const fuse = new Fuse(cards, SEARCH_INDEX_FUSE_OPTIONS)
  return fuse.search(query).map(({ item, score = 1 }) => ({
    card: item,
    score: 1 - score,
  }))
}
const sortByRecent = (a: RhythmCard, b: RhythmCard) => b.updatedAt - a.updatedAt

export const searchRhythmCards = ({
  search,
  filters,
  page,
  pageSize,
}: SearchRhythmCardsParams): SearchRhythmCardsResult => {
  let results = allRhythmCards().filter((card) => matchesFilters(card, filters))

  const query = search.trim()
  if (query) {
    const scored = fuseSearch(results, query)
    scored.sort((a, b) => b.score - a.score || sortByRecent(a.card, b.card))
    results = scored.map(({ card }) => card)
  } else {
    results.sort(sortByRecent)
  }

  const total = results.length
  const start = (page - 1) * pageSize
  const items = results.slice(start, start + pageSize)

  return { items, total, page, pageSize }
}
