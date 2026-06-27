import { describe, expect, it } from 'vitest'

import { DEMO_TRACKS } from '@/features/groovy-player/demo-tracks'
import {
  DEFAULT_SWING_PATTERN,
  DEMO_SWING_PATTERN,
  PLAYER_GROOVE_LENGTH,
  resolveGroovePattern,
} from '@/features/groovy-player/player.store'

import { compileGroove } from './compile-groove'
import { barSlotCount } from './compile-groove.test-helpers'

describe('demo playback groove length', () => {
  it('uses six-cell grooves for demo notation, not bar string width', () => {
    const bar = DEMO_TRACKS[0].bars[0]
    expect(bar.length).toBe(6)

    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    expect(groove.length).toBe(6)

    const compiled = compileGroove({ bars: [bar], groove })
    expect(compiled.cellsPerBar).toBe(6)
    expect(compiled.beats.length).toBe(barSlotCount(6))

    const hits = compiled.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    expect(hits).toEqual([0, 10, 23, 36, 59])
  })

  it('eight-cell grooves stretch demo bar spacing incorrectly', () => {
    const bar = DEMO_TRACKS[0].bars[0]
    const groove = resolveGroovePattern(DEFAULT_SWING_PATTERN, 8, true)
    const compiled = compileGroove({ bars: [bar], groove })

    const hits = compiled.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    expect(hits).toEqual([0, 14, 31, 46, 80])
  })
})
