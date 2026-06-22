import Fuse, { type IFuseOptions } from 'fuse.js'

import { getRhythmIndexCards } from '@/features/garage/rhythm-index.store'
import { listMyRhythms } from '@/features/rhythm/my-rhythms-storage'
import { rhythmToCard } from '@/features/rhythm/rhythm-helpers'
import type {
  GarageFilters,
  RhythmCard,
  SearchRhythmCardsParams,
  SearchRhythmCardsResult,
} from '@/features/rhythm/rhythm.types'

// ─── Card collection ──────────────────────────────────────────────────────────

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

// ─── Filtering ────────────────────────────────────────────────────────────────

/**
 * Guard against localStorage-hydrated cards that may have been created before
 * array fields (rhythmGroup, origin, tags, author) were introduced.
 */
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

// ─── Fuzzy scoring via Fuse.js ────────────────────────────────────────────────

const FUSE_OPTIONS: IFuseOptions<RhythmCard> = {
  keys: [
    { name: 'title', weight: 4 },
    { name: 'rhythmGroup', weight: 3 },
    { name: 'author', weight: 2 },
    { name: 'tags', weight: 2 },
    { name: 'origin', weight: 1.5 },
    { name: 'instruments', weight: 1 },
    { name: 'description', weight: 0.5 },
  ],
  // 0 = exact, 1 = match anything. 0.3 allows ~1 typo in a 5-char word without
  // producing false positives on random English words like "sonnet".
  threshold: 0.3,
  // Search the whole field value, not just near the start.
  ignoreLocation: true,
  // Return numeric scores so we can sort by relevance.
  includeScore: true,
  minMatchCharLength: 2,
}

const fuseSearch = (
  cards: RhythmCard[],
  query: string,
): Array<{ card: RhythmCard; score: number }> => {
  const fuse = new Fuse(cards, FUSE_OPTIONS)
  return fuse.search(query).map(({ item, score = 1 }) => ({
    card: item,
    // Fuse score: 0 = perfect, 1 = no match. Invert so higher = better.
    score: 1 - score,
  }))
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

const sortByRecent = (a: RhythmCard, b: RhythmCard) => b.updatedAt - a.updatedAt

// ─── Main search function ─────────────────────────────────────────────────────

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
