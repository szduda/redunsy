/**
 * Playback pipeline tests — ensure that groove length, bar cell count, and
 * tempo are always consistent for every supported meter.
 *
 * These tests guard against the class of bugs where a wrong groove length
 * (e.g. an 8-char store pattern used for a meter=3 rhythm that needs 6 chars)
 * causes off-timing playback or React hydration mismatches.
 */
import { describe, expect, it } from 'vitest'

import { DEMO_TRACKS, demoTrackBars } from '@/features/groovy-player/demo-tracks'
import {
  DEFAULT_SWING_PATTERN,
  DEMO_SWING_PATTERN,
  fitSwingPattern,
  PLAYER_GROOVE_LENGTH,
  resolveGroovePattern,
  swingBarSizeForMeter,
} from '@/features/groovy-player/player.store'
import { compileGroove } from '@/lib/midinike/groove/compile-groove'
import { barSlotCount } from '@/lib/midinike/groove/compile-groove.test-helpers'
import { calcPlaybackTempo } from '@/lib/midinike/groove/playback-tempo'
import {
  barsMatchGrooveLength,
  tracksMatchGrooveLength,
  validateBarsForGroove,
} from '@/lib/midinike/notation/fit-bar'
import { barCellCount, TICKS_PER_EIGHTH } from '@/lib/midinike/notation/cell-duration'

// ---------------------------------------------------------------------------
// Representative test fixtures
// ---------------------------------------------------------------------------

/** 4/4 djembe bars — 8 cells each. */
const METER4_BARS = ['b---t---', 'ttsb--ts', 'b---t---', 'ttstts--']

/** 3/4 djembe bars — 6 cells each. */
const METER3_BARS = ['b--b--', 'ttstts', 'b-tb-t']

/** 3/4 dundun bars — 6 cells each. */
const METER3_DUNDUN_BARS = ['o--o--', 'o----o']

/** Straight (no-swing) grooves per meter. */
const GROOVE4 = '--------' // 8 cells for 4/4
const GROOVE3 = '------' // 6 cells for 3/4

/** Swing grooves per meter derived from the default demo swing. */
const SWING4 = fitSwingPattern(DEFAULT_SWING_PATTERN, 8) // '-<(-<(--' — 8 cells
const SWING3 = DEMO_SWING_PATTERN // '-<(-<(' — 6 cells

// ---------------------------------------------------------------------------
// 1. Groove sizing invariants
// ---------------------------------------------------------------------------

describe('groove sizing — swingBarSizeForMeter', () => {
  it('returns 8 for 4/4', () => {
    expect(swingBarSizeForMeter(4)).toBe(8)
  })

  it('returns 6 for 3/4', () => {
    expect(swingBarSizeForMeter(3)).toBe(6)
  })
})

describe('groove sizing — resolveGroovePattern always matches the target bar size', () => {
  it('produces an 8-char groove for meter=4 with swing enabled', () => {
    const groove = resolveGroovePattern(SWING4, swingBarSizeForMeter(4), true)
    expect(groove).toBe(SWING4)
    expect(groove.length).toBe(8)
  })

  it('produces a 6-char groove for meter=3 from the demo swing pattern', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, swingBarSizeForMeter(3), true)
    expect(groove.length).toBe(6)
    expect(groove).toBe(SWING3)
  })

  it('produces a straight groove of the right length when swing is disabled', () => {
    expect(resolveGroovePattern(SWING4, 8, false)).toBe(GROOVE4)
    expect(resolveGroovePattern(SWING3, 6, false)).toBe(GROOVE3)
  })
})

// ---------------------------------------------------------------------------
// 2. Demo player (3/4 — 6-cell bars with 6-cell groove)
// ---------------------------------------------------------------------------

describe('demo player — 6-cell bars with 6-cell groove', () => {
  it('demo bars have exactly 6 notation cells', () => {
    DEMO_TRACKS[0].bars.forEach((bar) => {
      expect(barCellCount(bar)).toBe(6)
    })
  })

  it('demo groove is 6 cells (PLAYER_GROOVE_LENGTH)', () => {
    expect(DEMO_SWING_PATTERN.length).toBe(PLAYER_GROOVE_LENGTH)
    expect(PLAYER_GROOVE_LENGTH).toBe(6)
  })

  it('compiles every demo track bar without errors using the 6-cell demo groove', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    expect(() => {
      for (const track of DEMO_TRACKS) {
        compileGroove({ bars: track.bars, groove })
      }
    }).not.toThrow()
  })

  it('bar slot count equals 6-cell bar size', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    const compiled = compileGroove({ bars: [DEMO_TRACKS[0].bars[0]], groove })
    expect(compiled.cellsPerBar).toBe(6)
    expect(compiled.beats.length).toBe(barSlotCount(6))
  })

  it('produces 3/4 playback tempo from the demo groove', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    const bpm = 110
    const compiled = compileGroove({ bars: [DEMO_TRACKS[0].bars[0]], groove })
    const playbackTempo = calcPlaybackTempo(
      compiled.cellsPerBar,
      compiled.cellCount,
      compiled.preGrooveSlots,
      compiled.beats.length,
      bpm,
    )
    expect(playbackTempo).toBeCloseTo((3 / 4) * bpm * TICKS_PER_EIGHTH)
  })

  it('compiles the full multi-track demoTrackBars record without errors', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    const tracks = demoTrackBars()
    expect(() => {
      for (const bars of Object.values(tracks)) {
        compileGroove({ bars, groove })
      }
    }).not.toThrow()
  })

  it('demo bars match the demo groove length', () => {
    expect(tracksMatchGrooveLength(demoTrackBars(), PLAYER_GROOVE_LENGTH)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 3. Meter=4 DB rhythm (4/4, 8-cell bars, 8-cell groove)
// ---------------------------------------------------------------------------

describe('meter=4 playback — 8-cell bars with 8-cell groove', () => {
  it('validates bars without errors', () => {
    expect(() => validateBarsForGroove(METER4_BARS, swingBarSizeForMeter(4))).not.toThrow()
  })

  it('bars match groove length exactly', () => {
    expect(barsMatchGrooveLength(METER4_BARS, swingBarSizeForMeter(4))).toBe(true)
    expect(tracksMatchGrooveLength({ djembe: METER4_BARS }, swingBarSizeForMeter(4))).toBe(true)
  })

  it('compiles straight groove without errors', () => {
    const groove = resolveGroovePattern(GROOVE4, 8, false)
    expect(() => compileGroove({ bars: METER4_BARS, groove })).not.toThrow()
  })

  it('compiles swing groove without errors', () => {
    const groove = resolveGroovePattern(SWING4, 8, true)
    expect(() => compileGroove({ bars: METER4_BARS, groove })).not.toThrow()
  })

  it('produces 4/4 playback tempo', () => {
    const groove = resolveGroovePattern(GROOVE4, 8, false)
    const bpm = 110
    const compiled = compileGroove({ bars: [METER4_BARS[0]], groove })
    const playbackTempo = calcPlaybackTempo(
      compiled.cellsPerBar,
      compiled.cellCount,
      compiled.preGrooveSlots,
      compiled.beats.length,
      bpm,
    )
    expect(playbackTempo).toBeCloseTo((4 / 4) * bpm * TICKS_PER_EIGHTH)
  })

  it('each bar produces exactly 8 cell-slots', () => {
    const groove = resolveGroovePattern(GROOVE4, 8, false)
    const compiled = compileGroove({ bars: METER4_BARS, groove })
    const barLengths = compiled.barSlotOffsets.map((offset, i) => {
      const next = compiled.barSlotOffsets[i + 1] ?? compiled.beats.length
      return next - offset
    })
    barLengths.forEach((len) => expect(len).toBe(barSlotCount(8)))
  })
})

// ---------------------------------------------------------------------------
// 4. Meter=3 DB rhythm (3/4, 6-cell bars, 6-cell groove)
// ---------------------------------------------------------------------------

describe('meter=3 playback — 6-cell bars with 6-cell groove', () => {
  it('validates bars without errors', () => {
    expect(() => validateBarsForGroove(METER3_BARS, swingBarSizeForMeter(3))).not.toThrow()
  })

  it('bars match groove length exactly', () => {
    expect(barsMatchGrooveLength(METER3_BARS, swingBarSizeForMeter(3))).toBe(true)
    expect(
      tracksMatchGrooveLength(
        { djembe: METER3_BARS, dundunba: METER3_DUNDUN_BARS },
        swingBarSizeForMeter(3),
      ),
    ).toBe(true)
  })

  it('compiles straight groove without errors', () => {
    const groove = resolveGroovePattern(GROOVE3, 6, false)
    expect(() => compileGroove({ bars: METER3_BARS, groove })).not.toThrow()
  })

  it('compiles swing groove without errors', () => {
    const groove = resolveGroovePattern(SWING3, 6, true)
    expect(() => compileGroove({ bars: METER3_BARS, groove })).not.toThrow()
  })

  it('produces 3/4 playback tempo (75% of 4/4)', () => {
    const groove = resolveGroovePattern(GROOVE3, 6, false)
    const bpm = 110
    const compiled = compileGroove({ bars: [METER3_BARS[0]], groove })
    const playbackTempo = calcPlaybackTempo(
      compiled.cellsPerBar,
      compiled.cellCount,
      compiled.preGrooveSlots,
      compiled.beats.length,
      bpm,
    )
    // beatSize = cellsPerBar / 2 = 3; tempo = (3/4) * bpm * TICKS_PER_EIGHTH
    expect(playbackTempo).toBeCloseTo((3 / 4) * bpm * TICKS_PER_EIGHTH)
    // Sanity: 3/4 is slower than 4/4 at the same BPM
    expect(playbackTempo).toBeLessThan(bpm * TICKS_PER_EIGHTH)
  })

  it('each bar produces exactly 6 cell-slots', () => {
    const groove = resolveGroovePattern(GROOVE3, 6, false)
    const compiled = compileGroove({ bars: METER3_BARS, groove })
    const barLengths = compiled.barSlotOffsets.map((offset, i) => {
      const next = compiled.barSlotOffsets[i + 1] ?? compiled.beats.length
      return next - offset
    })
    barLengths.forEach((len) => expect(len).toBe(barSlotCount(6)))
  })

  it('rejects 8-cell groove for 6-cell bars (tracksMatchGrooveLength guard)', () => {
    // If the store still holds an 8-char pattern when the player loads a meter=3 rhythm,
    // tracksMatchGrooveLength must catch the inconsistency before playback starts.
    expect(tracksMatchGrooveLength({ djembe: METER3_BARS }, 8)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 5. Player initialization — persisted 8-char store pattern for a meter=3 rhythm
// ---------------------------------------------------------------------------

describe('player initialization — persisted pattern trimmed to rhythm groove length', () => {
  it('resolveGroovePattern trims an 8-char store pattern to meter=3 groove length', () => {
    const storeSwingPattern = fitSwingPattern(DEFAULT_SWING_PATTERN, 8)
    const grooveLength = swingBarSizeForMeter(3)

    const groove = resolveGroovePattern(storeSwingPattern, grooveLength, true)
    expect(groove.length).toBe(6)
    expect(() => compileGroove({ bars: METER3_BARS, groove })).not.toThrow()
  })

  it('fitSwingPattern trims 8-char pattern to the target length without padding', () => {
    expect(fitSwingPattern(fitSwingPattern(DEFAULT_SWING_PATTERN, 8), 6)).toBe(SWING3)
    expect(fitSwingPattern(fitSwingPattern(DEFAULT_SWING_PATTERN, 8), 6).length).toBe(6)
  })

  it('groove computed from trimmed store pattern matches groove from native meter pattern', () => {
    const fromStore = resolveGroovePattern(fitSwingPattern(DEFAULT_SWING_PATTERN, 8), 6, true)
    const fromRhythm = resolveGroovePattern(SWING3, 6, true)
    expect(fromStore).toBe(fromRhythm)
  })

  it('the trimmed groove compiles consistently with multi-track meter=3 tracks', () => {
    const groove = resolveGroovePattern(
      fitSwingPattern(DEFAULT_SWING_PATTERN, 8),
      swingBarSizeForMeter(3),
      true,
    )
    expect(() => {
      compileGroove({ bars: METER3_BARS, groove })
      compileGroove({ bars: METER3_DUNDUN_BARS, groove })
    }).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// 6. Meter tempo comparison
// ---------------------------------------------------------------------------

describe('playback tempo — 3/4 is slower than 4/4 at the same BPM', () => {
  const bpm = 120

  const tempoFor = (bars: string[], groove: string) => {
    const compiled = compileGroove({ bars: [bars[0]], groove })
    return calcPlaybackTempo(
      compiled.cellsPerBar,
      compiled.cellCount,
      compiled.preGrooveSlots,
      compiled.beats.length,
      bpm,
    )
  }

  it('produces lower tempo value for 3/4 than 4/4', () => {
    const tempo34 = tempoFor(METER3_BARS, GROOVE3)
    const tempo44 = tempoFor(METER4_BARS, GROOVE4)
    expect(tempo34).toBeLessThan(tempo44)
  })

  it('tempo ratio matches the beat-size ratio (3:4)', () => {
    const tempo34 = tempoFor(METER3_BARS, GROOVE3)
    const tempo44 = tempoFor(METER4_BARS, GROOVE4)
    expect(tempo34 / tempo44).toBeCloseTo(3 / 4)
  })

  it('demo 3/4 tempo equals the meter=3 tempo (both use 6-cell groove)', () => {
    const tempoDemo = tempoFor(DEMO_TRACKS[0].bars, DEMO_SWING_PATTERN)
    const tempo34 = tempoFor(METER3_BARS, GROOVE3)
    expect(tempoDemo).toBeCloseTo(tempo34)
  })
})
