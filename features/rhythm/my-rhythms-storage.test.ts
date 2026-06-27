import { describe, expect, it } from 'vitest'

import { DEMO_TRACKS } from '@/features/groovy-player/demo-tracks'
import { buildPlayerDemoRhythm } from '@/features/groovy-player/demo-rhythm'
import { DEMO_SWING_PATTERN } from '@/features/groovy-player/player.store'
import { normalizeRhythmSwing } from '@/features/rhythm/my-rhythms-storage'

describe('normalizeRhythmSwing', () => {
  it('fixes forked demo rhythms that were saved with meter 4', () => {
    const rhythm = buildPlayerDemoRhythm(110, DEMO_SWING_PATTERN)
    const broken = { ...rhythm, meter: 4 as const, swingPattern: '-<(-<(--' }
    const normalized = normalizeRhythmSwing(broken)

    expect(normalized.meter).toBe(3)
    expect(normalized.swingPattern).toBe('-<(-<(')
    expect(normalized.instruments.djembe.bars).toEqual(DEMO_TRACKS[0].bars)
  })
})
