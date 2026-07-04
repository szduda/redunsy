import 'server-only'

import { unstable_cache } from 'next/cache'

import { getRhythmCardIndex } from '@/db/queries'
import { RHYTHM_SEARCH_INDEX_TAG } from '@/features/garage/rhythm-search-index-tag'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

const loadRhythmSearchIndex = unstable_cache(
  async (): Promise<RhythmCard[]> => getRhythmCardIndex(),
  ['rhythm-search-index'],
  { tags: [RHYTHM_SEARCH_INDEX_TAG] },
)

export const getCachedRhythmSearchIndex = () => loadRhythmSearchIndex()
