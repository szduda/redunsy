import { describe, expect, it } from 'vitest'

import { rhythmTagChipClass, rhythmTags } from '@/features/rhythm/rhythm-metadata-view'
import { SHARED_WITH_ME_TAG } from '@/features/share-rhythm/shared/share-limits'

describe('rhythmTags', () => {
  it('sorts shared-with-me before rhythm groups and other tags', () => {
    expect(
      rhythmTags({
        rhythmGroup: ['soli'],
        tags: ['demo', SHARED_WITH_ME_TAG, 'warmup'],
      }),
    ).toEqual([SHARED_WITH_ME_TAG, 'soli', 'demo', 'warmup'])
  })
})

describe('rhythmTagChipClass', () => {
  it('highlights the shared-with-me tag', () => {
    expect(rhythmTagChipClass(SHARED_WITH_ME_TAG)).toContain('bg-yellowy-light/50')
    expect(rhythmTagChipClass('demo')).toContain('bg-zinc-100')
    expect(rhythmTagChipClass('demo')).not.toContain('bg-yellowy-light/50')
  })
})
