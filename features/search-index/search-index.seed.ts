import { SEARCH_INDEX_SEED_VERSION } from '@/features/search-index/search-index.config'
import type { SearchIndexPayload } from '@/features/search-index/search-index.types'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

export const toSearchIndexPayload = (
  cards: RhythmCard[],
  version: string,
  generatedAt = Date.now(),
): SearchIndexPayload => ({
  version,
  generatedAt,
  count: cards.length,
  cards,
})

export const metaFromPayload = (payload: SearchIndexPayload) => ({
  version: payload.version,
  generatedAt: payload.generatedAt,
  count: payload.count,
})

export const loadSeedPayload = async (): Promise<SearchIndexPayload> => {
  const seed = await import('@/features/search-index/search-index.seed.json')
  const cards = seed.default as RhythmCard[]
  return toSearchIndexPayload(cards, SEARCH_INDEX_SEED_VERSION, 0)
}
