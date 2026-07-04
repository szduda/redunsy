import { create } from 'zustand'

import { RHYTHM_INDEX } from '@/features/garage/rhythm-index'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

type RhythmIndexState = {
  cards: RhythmCard[]
  /** Bumped whenever cards are replaced from the runtime search-index API. */
  version: number
  setCards: (cards: RhythmCard[]) => void
}

/** Search/garage store, initialised from the static build-time rhythm index. */
export const useRhythmIndexStore = create<RhythmIndexState>((set) => ({
  cards: RHYTHM_INDEX,
  version: 0,
  setCards: (cards) => set((state) => ({ cards, version: state.version + 1 })),
}))

export const getRhythmIndexCards = () => useRhythmIndexStore.getState().cards

export const selectRhythmIndexVersion = (state: RhythmIndexState) => state.version
