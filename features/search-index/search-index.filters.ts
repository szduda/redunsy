import { RHYTHM_INSTRUMENTS, type RhythmCard } from '@/features/rhythm/rhythm.types'

const uniqueSorted = (values: string[]) => [...new Set(values.filter(Boolean))].sort()

export const filterOptionsFromRhythmCards = (cards: RhythmCard[]) => ({
  meter: [3, 4] as const,
  instruments: RHYTHM_INSTRUMENTS,
  artist: uniqueSorted(cards.flatMap((card) => card.author)),
  origin: uniqueSorted(cards.flatMap((card) => card.origin)),
  rhythmGroup: uniqueSorted(cards.flatMap((card) => card.rhythmGroup)),
  tags: uniqueSorted(cards.flatMap((card) => card.tags)),
})
