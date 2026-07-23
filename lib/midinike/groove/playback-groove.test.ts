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
    const straight = compileGroove({ bars: [bar], groove: '--------' })
    const straightHits = straight.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    // Demo groove `-<(-<(--`: force-2 early (`<`) and force-1 early (`(`).
    expect(hits[0]).toBe(0)
    expect(hits[1]).toBe(straightHits[1]! - 2)
    expect(hits[2]).toBe(straightHits[2]! - 1)
    expect(hits[3]).toBe(straightHits[3]! - 2)
    expect(hits[4]).toBe(straightHits[4])
    expect(hits).toEqual([0, 14, 31, 46, 80])
  })

  it('six-cell grooves on six-cell bars apply full-grid swing shifts', () => {
    const bar = DEMO_TRACKS[0].bars[0]
    const groove = '-<(-<('
    const straight = compileGroove({ bars: [bar], groove: '------' })
    const compiled = compileGroove({ bars: [bar], groove })

    const hits = compiled.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    const straightHits = straight.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    expect(hits[0]).toBe(straightHits[0])
    expect(hits[1]).toBeLessThan(straightHits[1]!)
    expect(hits).not.toEqual(straightHits)
  })
})
