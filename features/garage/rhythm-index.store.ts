import { create } from 'zustand'

import { RHYTHM_INDEX } from '@/features/garage/rhythm-index'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

type RhythmIndexState = {
  cards: RhythmCard[]
}

/** Search/garage store, initialised from the static build-time rhythm index. */
export const useRhythmIndexStore = create<RhythmIndexState>(() => ({
  cards: RHYTHM_INDEX,
}))

export const getRhythmIndexCards = () => useRhythmIndexStore.getState().cards
