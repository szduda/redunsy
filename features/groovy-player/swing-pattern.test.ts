import { describe, expect, it } from 'vitest'

import {
  barSizeFromTrackBars,
  DEFAULT_SWING_PATTERN,
  DEMO_SWING_PATTERN,
  defaultSwingPatternForMeter,
  fitSwingPattern,
  isSwingPatternIncorrect,
  normalizeSwingPatternForMeter,
  PLAYER_GROOVE_LENGTH,
  resolveGroovePattern,
} from '@/features/groovy-player/player.store'
import { DEMO_TRACKS } from '@/features/groovy-player/demo-tracks'

describe('swing pattern helpers', () => {
  it('uses straight defaults per beat size in the editor', () => {
    expect(defaultSwingPatternForMeter(3)).toBe('------')
    expect(defaultSwingPatternForMeter(4)).toBe('--------')
  })

  it('fits demo swing patterns to the player groove length', () => {
    expect(fitSwingPattern('-<(-<(', PLAYER_GROOVE_LENGTH)).toBe('-<(-<(')
    expect(resolveGroovePattern('-<(-<(', PLAYER_GROOVE_LENGTH, true)).toBe('-<(-<(')
    expect(resolveGroovePattern('-<(-<(', PLAYER_GROOVE_LENGTH, false)).toBe('------')
  })

  it('treats all-dash patterns as valid at any checked length', () => {
    expect(isSwingPatternIncorrect('--------', 6)).toBe(false)
    expect(isSwingPatternIncorrect('-<(-<(', 8)).toBe(true)
    expect(isSwingPatternIncorrect('-<(-<(', PLAYER_GROOVE_LENGTH)).toBe(false)
  })

  it('fits invalid editor patterns to the meter groove length', () => {
    expect(normalizeSwingPatternForMeter('--------', 3)).toBe('------')
    expect(normalizeSwingPatternForMeter('------', 4)).toBe('--------')
    expect(normalizeSwingPatternForMeter('-<(-<(--', 3)).toBe('-<(-<(')
  })

  it('keeps demo groove length independent from bar character width', () => {
    expect(barSizeFromTrackBars({ djembe: DEMO_TRACKS[0].bars })).toBe(6)
    expect(resolveGroovePattern(DEFAULT_SWING_PATTERN, PLAYER_GROOVE_LENGTH, true)).toBe(
      DEMO_SWING_PATTERN,
    )
  })
})
