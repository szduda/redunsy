export type {
  GarageFilters,
  OwnershipFilter,
  Rhythm,
  RhythmCard,
  RhythmInstrument,
  RhythmMeter,
  SearchRhythmCardsParams,
  SearchRhythmCardsResult,
  Track,
} from '@/features/rhythm/rhythm.types'

export {
  EMPTY_GARAGE_FILTERS,
} from '@/features/rhythm/rhythm.types'

/** @deprecated Use RhythmCard */
export type { RhythmCard as Snippet } from '@/features/rhythm/rhythm.types'

/** @deprecated Use RhythmInstrument */
export type { RhythmInstrument as SnippetInstrument } from '@/features/rhythm/rhythm.types'

/** @deprecated Use RhythmMeter */
export type { RhythmMeter as SnippetMeter } from '@/features/rhythm/rhythm.types'

/** @deprecated Use SearchRhythmCardsParams */
export type { SearchRhythmCardsParams as SearchSnippetsParams } from '@/features/rhythm/rhythm.types'

/** @deprecated Use SearchRhythmCardsResult */
export type { SearchRhythmCardsResult as SearchSnippetsResult } from '@/features/rhythm/rhythm.types'
