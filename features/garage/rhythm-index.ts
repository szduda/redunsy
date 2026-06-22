import rhythmIndexJson from '@/features/garage/rhythm-index.generated.json'
import { RHYTHM_INSTRUMENTS, type RhythmCard } from '@/features/rhythm/rhythm.types'

/**
 * Static rhythm search index, generated from Postgres at build time
 * (`scripts/generate-search-index.ts`). Holds card meta only — no patterns —
 * so the whole catalogue ships to the browser without any database access.
 */
export const RHYTHM_INDEX = rhythmIndexJson as RhythmCard[]

export const filterOptionsFromRhythmCards = (cards: RhythmCard[]) => ({
  meter: [3, 4] as const,
  instruments: RHYTHM_INSTRUMENTS,
  artist: [...new Set(cards.map((card) => card.author).filter(Boolean))].sort(),
  origin: [...new Set(cards.flatMap((card) => card.origin))].sort(),
  rhythmGroup: [...new Set(cards.flatMap((card) => card.rhythmGroup))].sort(),
  tags: [...new Set(cards.flatMap((card) => card.tags))].sort(),
})

export const GARAGE_FILTER_OPTIONS = filterOptionsFromRhythmCards(RHYTHM_INDEX)
