import { describe, expect, it } from 'vitest'

import { reattachTracksForMeter } from '@/features/editor/reattach-tracks-for-meter'
import { createTrack } from '@/features/rhythm/rhythm-helpers'

describe('reattachTracksForMeter', () => {
  it('returns the same map when nothing is selected', () => {
    const djembe = createTrack('djembe', 4, ['s--ss-tt', 's--ss-tt'])
    const instruments = { djembe }
    expect(reattachTracksForMeter(instruments, 3, [])).toBe(instruments)
  })

  it('clears selected tracks to empty bars for the new meter and preserves bar count', () => {
    const djembe = createTrack('djembe', 4, ['s--ss-tt', 's--ss-tt', 'tt------'])
    const bell = createTrack('bell', 4, ['x-------', 'x-------'])
    const next = reattachTracksForMeter({ djembe, bell }, 3, ['djembe'])

    expect(next.djembe.bars).toEqual(['------', '------', '------'])
    expect(next.bell).toBe(bell)
  })

  it('clears every selected track', () => {
    const djembe = createTrack('djembe', 4, ['s--ss-tt'])
    const bell = createTrack('bell', 4, ['x-------'])
    const next = reattachTracksForMeter({ djembe, bell }, 3, ['djembe', 'bell'])

    expect(next.djembe.bars).toEqual(['------'])
    expect(next.bell.bars).toEqual(['------'])
  })
})
