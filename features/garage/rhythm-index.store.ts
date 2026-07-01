import { create } from 'zustand'

import { RHYTHM_INDEX } from '@/features/garage/rhythm-index'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

type RhythmIndexState = {
  cards: RhythmCard[]
  revision: number
  setCards: (cards: RhythmCard[]) => void
}

/** Search/garage store, initialised from the static build-time rhythm index. */
export const useRhythmIndexStore = create<RhythmIndexState>((set) => ({
  cards: RHYTHM_INDEX,
  revision: 0,
  setCards: (cards) => set((state) => ({ cards, revision: state.revision + 1 })),
}))

export const getRhythmIndexCards = () => useRhythmIndexStore.getState().cards
