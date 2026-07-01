import 'server-only'

import { unstable_cache } from 'next/cache'

import { getRhythmCardIndex } from '@/db/rhythms'

export const RHYTHM_INDEX_CACHE_TAG = 'rhythm-index'

export const getCachedRhythmCardIndex = unstable_cache(
  async () => getRhythmCardIndex(),
  ['rhythm-index'],
  { tags: [RHYTHM_INDEX_CACHE_TAG] },
)
