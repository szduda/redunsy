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
  DEMO_SWING_PATTERN,
  fitSwingPattern,
  PLAYER_GROOVE_LENGTH,
  playbackGrooveLengthForMeter,
  resolveGroovePattern,
  swingBarSizeForMeter,
} from '@/features/groovy-player/player.store'
import { compileGroove } from '@/lib/midinike/groove/compile-groove'
import { barSlotCount } from '@/lib/midinike/groove/compile-groove.test-helpers'
import { calcPlaybackTempo, compiledPatternDurationSeconds } from '@/lib/midinike/groove/playback-tempo'
import { TICKS_PER_EIGHTH } from '@/lib/midinike/notation/cell-duration'
import {
  barsMatchGrooveLength,
  tracksMatchGrooveLength,
  validateBarsForGroove,
} from '@/lib/midinike/notation/fit-bar'
import { barCellCount } from '@/lib/midinike/notation/cell-duration'

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
const SWING4 = DEMO_SWING_PATTERN // '-<(-<(--' — 8 cells
const SWING3 = fitSwingPattern(DEMO_SWING_PATTERN, 6) // '-<(-<(' — 6 cells

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
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, swingBarSizeForMeter(4), true)
    expect(groove).toBe(DEMO_SWING_PATTERN)
    expect(groove.length).toBe(8)
  })

  it('produces a 6-char groove for meter=3 even when the store carries an 8-char pattern', () => {
    // The Zustand store always hydrates with an 8-char DEMO_SWING_PATTERN.
    // resolveGroovePattern must still return the correct length for the rhythm's meter.
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
// 2. Demo player (6-cell notation bars on an 8-cell groove)
// ---------------------------------------------------------------------------

describe('demo player — 6-cell bars with 8-cell groove', () => {
  it('demo bars have at most 6 notation cells (some use 16th/triplet groups, but cell count ≤ groove length)', () => {
    // String length may exceed 6 due to [xx] sixteenth and {xxx} triplet groups;
    // what matters for playback is barCellCount which must not exceed PLAYER_GROOVE_LENGTH.
    DEMO_TRACKS[0].bars.forEach((bar) => {
      expect(barCellCount(bar)).toBeLessThanOrEqual(PLAYER_GROOVE_LENGTH)
    })
  })

  it('demo groove is 8 cells (PLAYER_GROOVE_LENGTH)', () => {
    expect(DEMO_SWING_PATTERN.length).toBe(PLAYER_GROOVE_LENGTH)
    expect(PLAYER_GROOVE_LENGTH).toBe(8)
  })

  it('compiles every demo track bar without errors using the 8-cell demo groove', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    expect(() => {
      for (const track of DEMO_TRACKS) {
        compileGroove({ bars: track.bars, groove })
      }
    }).not.toThrow()
  })

  it('bar slot count equals 8-cell bar size (cellsPerBar follows groove, not notation)', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
    const compiled = compileGroove({ bars: [DEMO_TRACKS[0].bars[0]], groove })
    expect(compiled.cellsPerBar).toBe(8)
    expect(compiled.beats.length).toBe(barSlotCount(8))
  })

  it('produces legacy playback tempo from the demo groove', () => {
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
    expect(playbackTempo).toBe((4 / 4) * bpm * TICKS_PER_EIGHTH)
    const slotInterval = (1 / 16) * ((4 * 60) / playbackTempo)
    expect(compiled.beats.length * slotInterval).toBeCloseTo((4 * 60) / bpm / 2)
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

  it('produces legacy 4/4 bar duration at the user BPM', () => {
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
    expect(playbackTempo).toBe((4 / 4) * bpm * TICKS_PER_EIGHTH)
    expect(compiledPatternDurationSeconds(compiled, bpm)).toBeCloseTo((4 * 60) / bpm / 2)
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

  it('migrated full-grid swing keeps even hit spacing (matches canvas)', () => {
    const maaneSwing = '-<-<-<'
    const maaneBar = 'b-stts'
    const groove = resolveGroovePattern(maaneSwing, 6, true)
    const beatHits = (beats: ReturnType<typeof compileGroove>['beats']) =>
      beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    const straight = compileGroove({ bars: [maaneBar], groove: GROOVE3 })
    const swung = compileGroove({ bars: [maaneBar], groove })
    expect(beatHits(swung.beats)).toEqual(beatHits(straight.beats))
    expect(beatHits(swung.beats)).toEqual([0, 24, 36, 48, 60])
  })

  it('meter=3 playback stretches six-cell bars on an eight-cell groove', () => {
    const maaneBar = 'b-stts'
    const playbackGroove = resolveGroovePattern('-<-<-<', playbackGrooveLengthForMeter(3), true)
    expect(playbackGroove.length).toBe(8)
    const compiled = compileGroove({ bars: [maaneBar], groove: playbackGroove })
    expect(compiled.cellsPerBar).toBe(8)
    expect(compiled.beats.length).toBe(barSlotCount(8))
    const beatHits = compiled.beats.flatMap((slot, index) => (slot[0].length ? [index] : []))
    expect(beatHits).not.toEqual([0, 24, 36, 48, 60])
    expect(beatHits[0]).toBe(0)
  })

  it('produces the same bar duration as 4/4 when compiled on the eight-cell playback groove', () => {
    const bpm = 110
    const duration34 = compiledPatternDurationSeconds(
      compileGroove({
        bars: [METER3_BARS[0]],
        groove: resolveGroovePattern(GROOVE3, playbackGrooveLengthForMeter(3), false),
      }),
      bpm,
    )
    const duration44 = compiledPatternDurationSeconds(
      compileGroove({ bars: [METER4_BARS[0]], groove: GROOVE4 }),
      bpm,
    )
    expect(duration34).toBeCloseTo(duration44)
    expect(duration44).toBeCloseTo((4 * 60) / bpm / 2)
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

describe('player initialization — store carries 8-char pattern, rhythm needs 6', () => {
  it('resolveGroovePattern always trims the store pattern to the correct groove length', () => {
    // Simulates GroovyPlayer: store starts with DEMO_SWING_PATTERN (8 chars from
    // localStorage), but the rhythm has meter=3, so grooveLength=6.
    const storeSwingPattern = DEMO_SWING_PATTERN // 8 chars — from localStorage hydration
    const grooveLength = swingBarSizeForMeter(3) // 6

    const groove = resolveGroovePattern(storeSwingPattern, grooveLength, true)
    expect(groove.length).toBe(6)
    // The resulting groove must be valid for meter=3 bars
    expect(() => compileGroove({ bars: METER3_BARS, groove })).not.toThrow()
  })

  it('fitSwingPattern trims 8-char pattern to the target length without padding', () => {
    expect(fitSwingPattern(DEMO_SWING_PATTERN, 6)).toBe(SWING3)
    expect(fitSwingPattern(DEMO_SWING_PATTERN, 6).length).toBe(6)
  })

  it('groove computed from trimmed store pattern matches groove from native meter pattern', () => {
    const fromStore = resolveGroovePattern(DEMO_SWING_PATTERN, 6, true)
    const fromRhythm = resolveGroovePattern(SWING3, 6, true)
    expect(fromStore).toBe(fromRhythm)
  })

  it('the trimmed groove compiles consistently with multi-track meter=3 tracks', () => {
    const groove = resolveGroovePattern(DEMO_SWING_PATTERN, swingBarSizeForMeter(3), true)
    expect(() => {
      compileGroove({ bars: METER3_BARS, groove })
      compileGroove({ bars: METER3_DUNDUN_BARS, groove })
    }).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// 6. Meter tempo comparison
// ---------------------------------------------------------------------------

describe('playback tempo — meter=3 playback stretch matches 4/4 bar duration', () => {
  const bpm = 120
  const playbackGroove3 = resolveGroovePattern(GROOVE3, playbackGrooveLengthForMeter(3), false)

  const durationFor = (bars: string[], groove: string) =>
    compiledPatternDurationSeconds(compileGroove({ bars: [bars[0]], groove }), bpm)

  it('matches 4/4 wall-clock bar duration at the same BPM', () => {
    const duration34 = durationFor(METER3_BARS, playbackGroove3)
    const duration44 = durationFor(METER4_BARS, GROOVE4)
    expect(duration34).toBeCloseTo(duration44)
  })

  it('demo 4/4 bar duration equals the meter=4 reference bar', () => {
    const tempoDemo = durationFor(DEMO_TRACKS[0].bars, DEMO_SWING_PATTERN)
    const tempo44 = durationFor(METER4_BARS, GROOVE4)
    expect(tempoDemo).toBeCloseTo(tempo44)
  })
})
