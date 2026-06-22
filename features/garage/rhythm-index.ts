import rhythmIndexJson from '@/features/garage/rhythm-index.generated.json'
import { RHYTHM_INSTRUMENTS, type RhythmCard } from '@/features/rhythm/rhythm.types'

/**
 * Static rhythm search index, generated from Postgres at build time
 * (`scripts/generate-search-index.ts`). Holds card meta only — no patterns —
 * so the whole catalogue ships to the browser without any database access.
 */
export const RHYTHM_INDEX = rhythmIndexJson as RhythmCard[]

const uniqueSorted = (values: string[]) => [...new Set(values.filter(Boolean))].sort()

export const filterOptionsFromRhythmCards = (cards: RhythmCard[]) => ({
  meter: [3, 4] as const,
  instruments: RHYTHM_INSTRUMENTS,
  artist: uniqueSorted(cards.flatMap((card) => card.author)),
  origin: uniqueSorted(cards.flatMap((card) => card.origin)),
  rhythmGroup: uniqueSorted(cards.flatMap((card) => card.rhythmGroup)),
  tags: uniqueSorted(cards.flatMap((card) => card.tags)),
})

export const GARAGE_FILTER_OPTIONS = filterOptionsFromRhythmCards(RHYTHM_INDEX)
