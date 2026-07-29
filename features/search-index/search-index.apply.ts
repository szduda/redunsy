import type { QueryClient } from '@tanstack/react-query'

import { SEARCH_INDEX_SEED_VERSION } from '@/features/search-index/search-index.config'
import { writeSearchIndexLocalCache } from '@/features/search-index/search-index.local-cache'
import {
  getSearchIndexVersion,
  useSearchIndexStore,
} from '@/features/search-index/search-index.store'
import type {
  RebuildSearchIndexResult,
  SearchIndexPayload,
} from '@/features/search-index/search-index.types'

const currentGeneratedAt = () => useSearchIndexStore.getState().generatedAt

/** Prefer a live Blob payload over seed; never regress generatedAt. */
export const shouldAdoptSearchIndex = (incoming: SearchIndexPayload) => {
  const currentVersion = getSearchIndexVersion()
  if (!currentVersion) return true
  if (
    incoming.version === SEARCH_INDEX_SEED_VERSION &&
    currentVersion !== SEARCH_INDEX_SEED_VERSION
  ) {
    return false
  }
  if (incoming.generatedAt < currentGeneratedAt()) return false
  return incoming.version !== currentVersion || incoming.generatedAt > currentGeneratedAt()
}

export const applySearchIndexLocally = async (
  payload: SearchIndexPayload,
  queryClient?: QueryClient,
) => {
  if (!shouldAdoptSearchIndex(payload)) {
    if (
      payload.version === getSearchIndexVersion() &&
      payload.version !== SEARCH_INDEX_SEED_VERSION
    ) {
      writeSearchIndexLocalCache(payload)
    }
    return false
  }

  useSearchIndexStore.getState().setIndex(payload)
  writeSearchIndexLocalCache(payload)
  await queryClient?.invalidateQueries({ queryKey: ['garage-snippets'] })
  return true
}

/** Apply cards returned by an admin rebuild/publish without hitting the CDN. */
export const applyRebuildResultLocally = async (
  result: Pick<RebuildSearchIndexResult, 'status' | 'version' | 'generatedAt' | 'count' | 'cards'>,
  queryClient?: QueryClient,
) => {
  if (!result.cards) return false
  return applySearchIndexLocally(
    {
      version: result.version,
      generatedAt: result.generatedAt,
      count: result.count,
      cards: result.cards,
    },
    queryClient,
  )
}
