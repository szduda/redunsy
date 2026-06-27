import { describe, expect, it } from 'vitest'

import { buildPlayerDemoRhythm, PLAYER_DEMO_METER } from '@/features/groovy-player/demo-rhythm'
import { demoTrackBars } from '@/features/groovy-player/demo-tracks'
import {
  DEMO_SWING_PATTERN,
  PLAYER_GROOVE_LENGTH,
  swingBarSizeForMeter,
} from '@/features/groovy-player/player.store'
import { tracksMatchGrooveLength } from '@/lib/midinike/notation/fit-bar'

describe('player demo rhythm', () => {
  it('uses meter 3 for the Soli demo', () => {
    expect(PLAYER_DEMO_METER).toBe(3)
    expect(PLAYER_GROOVE_LENGTH).toBe(6)
    expect(DEMO_SWING_PATTERN).toBe('-<(-<(')
    expect(DEMO_SWING_PATTERN.length).toBe(6)
  })

  it('builds a forkable rhythm with matching bar and groove lengths', () => {
    const rhythm = buildPlayerDemoRhythm(110, DEMO_SWING_PATTERN)
    expect(rhythm.meter).toBe(3)
    expect(rhythm.swingPattern).toBe(DEMO_SWING_PATTERN)
    expect(tracksMatchGrooveLength(demoTrackBars(), swingBarSizeForMeter(3))).toBe(true)
    expect(tracksMatchGrooveLength(demoTrackBars(), swingBarSizeForMeter(4))).toBe(false)
  })
})
