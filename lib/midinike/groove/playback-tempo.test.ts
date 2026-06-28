import { describe, expect, it } from 'vitest'

import { DEMO_TRACKS, demoTrackBars } from '@/features/groovy-player/demo-tracks'
import {
  DEMO_SWING_PATTERN,
  PLAYER_GROOVE_LENGTH,
  resolveGroovePattern,
} from '@/features/groovy-player/player.store'
import { TICKS_PER_EIGHTH } from '@/lib/midinike/notation/cell-duration'

import { compileGroove } from './compile-groove'
import { barSlotCount } from './compile-groove.test-helpers'
import {
  calcPlaybackTempo,
  compiledPatternDurationSeconds,
  playbackSlotIntervalSeconds,
} from './playback-tempo'

const USER_TEMPO = 140
const GROOVE_8 = '--------'

/** Legacy dunsy bar duration: beatSize quarter notes at user BPM, on the tick grid. */
const legacyBarDurationSeconds = (beatSize: number, grooveLength: number, userTempo: number) => {
  const slotCount = barSlotCount(grooveLength)
  const playbackTempo = (beatSize / 4) * userTempo * TICKS_PER_EIGHTH
  return slotCount * playbackSlotIntervalSeconds(playbackTempo)
}

describe('calcPlaybackTempo — legacy dunsy convention', () => {
  it('uses beatSize and TICKS_PER_EIGHTH, not cellsPerBar alone', () => {
    const compiled = compileGroove({ bars: [DEMO_TRACKS[0].bars[0]], groove: GROOVE_8 })
    const playbackTempo = calcPlaybackTempo(
      compiled.cellsPerBar,
      compiled.cellCount,
      compiled.preGrooveSlots,
      compiled.beats.length,
      USER_TEMPO,
    )

    expect(playbackTempo).toBe((4 / 4) * USER_TEMPO * TICKS_PER_EIGHTH)
    expect(playbackTempo).toBe(USER_TEMPO * 12)
  })
})

describe('demo player — tempo matches legacy dunsy rate', () => {
  const groove = resolveGroovePattern(DEMO_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)
  const expectedBarSec = legacyBarDurationSeconds(4, PLAYER_GROOVE_LENGTH, USER_TEMPO)

  it('plays every demo djembe bar at the legacy bar duration', () => {
    DEMO_TRACKS[0].bars.forEach((bar) => {
      const duration = compiledPatternDurationSeconds(
        compileGroove({ bars: [bar], groove }),
        USER_TEMPO,
      )
      expect(duration).toBeCloseTo(expectedBarSec, 10)
    })
  })

  it('matches metronome quarter spacing at the displayed BPM (two clicks per 4/4 bar)', () => {
    const compiled = compileGroove({ bars: [DEMO_TRACKS[0].bars[0]], groove })
    const playbackTempo = calcPlaybackTempo(
      compiled.cellsPerBar,
      compiled.cellCount,
      compiled.preGrooveSlots,
      compiled.beats.length,
      USER_TEMPO,
    )
    const quarterSec = 60 / USER_TEMPO
    const slotInterval = playbackSlotIntervalSeconds(playbackTempo)
    const slotsPerMetronomePulse = (PLAYER_GROOVE_LENGTH / 2) * TICKS_PER_EIGHTH

    expect(slotsPerMetronomePulse * slotInterval).toBeCloseTo(quarterSec, 10)
  })

  it('keeps full multi-track demo loops at consistent per-bar timing', () => {
    const tracks = demoTrackBars()
    Object.values(tracks).forEach((bars) => {
      bars.forEach((bar) => {
        const duration = compiledPatternDurationSeconds(
          compileGroove({ bars: [bar], groove }),
          USER_TEMPO,
        )
        expect(duration).toBeCloseTo(expectedBarSec, 10)
      })
    })
  })
})

describe('meter=3 — playback stretch on eight-cell groove', () => {
  it('matches 4/4 bar wall-clock duration at the same user BPM', () => {
    const duration34 = compiledPatternDurationSeconds(
      compileGroove({
        bars: ['b--b--'],
        groove: resolveGroovePattern('------', PLAYER_GROOVE_LENGTH, false),
      }),
      USER_TEMPO,
    )
    const duration44 = compiledPatternDurationSeconds(
      compileGroove({ bars: ['b---t---'], groove: GROOVE_8 }),
      USER_TEMPO,
    )
    expect(duration34).toBeCloseTo(duration44, 10)
  })
})
