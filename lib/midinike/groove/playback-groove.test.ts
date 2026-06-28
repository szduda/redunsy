import { describe, expect, it } from 'vitest'

import { DEMO_TRACKS } from '@/features/groovy-player/demo-tracks'
import {
  DEMO_SWING_PATTERN,
  PLAYER_GROOVE_LENGTH,
  resolveGroovePattern,
} from '@/features/groovy-player/player.store'

import { compileGroove } from './compile-groove'
import { barSlotCount } from './compile-groove.test-helpers'

describe('demo playback groove length', () => {
  it('uses eight-cell grooves for demo notation, not bar string width', () => {
    const bar = DEMO_TRACKS[0].bars[0]
    expect(bar.length).toBe(6)

    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    expect(groove.length).toBe(8)

    const compiled = compileGroove({ bars: [bar], groove })
    expect(compiled.cellsPerBar).toBe(8)
    expect(compiled.beats.length).toBe(barSlotCount(8))

    const hits = compiled.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    expect(hits).toEqual([0, 14, 31, 46, 80])
  })

  it('six-cell grooves on six-cell bars stay straight (full grid)', () => {
    const bar = DEMO_TRACKS[0].bars[0]
    const groove = '-<(-<('
    const straight = compileGroove({ bars: [bar], groove: '------' })
    const compiled = compileGroove({ bars: [bar], groove })

    const hits = compiled.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    const straightHits = straight.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    expect(hits).toEqual(straightHits)
  })
})
