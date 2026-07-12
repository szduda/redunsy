import { describe, expect, it } from 'vitest'

import { updateRhythmInstrumentsMap } from '@/features/editor/update-rhythm-instruments'
import { createTrack } from '@/features/rhythm/rhythm-helpers'

describe('updateRhythmInstrumentsMap', () => {
  it('keeps existing tracks and adds new ones', () => {
    const djembe = createTrack('djembe', 4, ['s--ss-tt', 's--ss-tt'])
    const next = updateRhythmInstrumentsMap({ djembe }, ['djembe', 'bell'], 4)

    expect(next.djembe).toBe(djembe)
    expect(next.bell?.bars).toEqual(['--------', '--------'])
  })

  it('drops instruments not in the layer list', () => {
    const djembe = createTrack('djembe', 4)
    const bell = createTrack('bell', 4)
    const next = updateRhythmInstrumentsMap({ djembe, bell }, ['djembe'], 4)

    expect(next).toEqual({ djembe })
  })
})
