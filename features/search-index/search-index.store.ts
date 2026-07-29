import { create } from 'zustand'

import { readSearchIndexLocalCache } from '@/features/search-index/search-index.local-cache'
import type { SearchIndexPayload } from '@/features/search-index/search-index.types'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

type SearchIndexStatus = 'idle' | 'loading' | 'ready' | 'error'

type SearchIndexState = {
  cards: RhythmCard[]
  version: string
  generatedAt: number
  status: SearchIndexStatus
  setIndex: (payload: SearchIndexPayload) => void
  setStatus: (status: SearchIndexStatus) => void
}

const initialFromCache = (): Pick<
  SearchIndexState,
  'cards' | 'version' | 'generatedAt' | 'status'
> => {
  const cached = readSearchIndexLocalCache()
  if (!cached) {
    return { cards: [], version: '', generatedAt: 0, status: 'idle' }
  }
  return {
    cards: cached.cards,
    version: cached.version,
    generatedAt: cached.generatedAt,
    status: 'ready',
  }
}

export const useSearchIndexStore = create<SearchIndexState>((set) => ({
  ...initialFromCache(),
  setIndex: (payload) =>
    set({
      cards: payload.cards,
      version: payload.version,
      generatedAt: payload.generatedAt,
      status: 'ready',
    }),
  setStatus: (status) => set({ status }),
}))

export const getRhythmIndexCards = () => useSearchIndexStore.getState().cards

export const getSearchIndexVersion = () => useSearchIndexStore.getState().version
