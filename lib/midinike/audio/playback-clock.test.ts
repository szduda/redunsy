import { describe, expect, it } from 'vitest'

import {
  playbackCursorAfter,
  playbackIndexAt,
  rebaseLoopTiming,
  schedulePlaybackWindow,
  stepMsForBpm,
} from './playback-clock'

describe('playbackIndexAt', () => {
  it('derives the audible slot from elapsed transport time and wraps the loop', () => {
    expect(playbackIndexAt(2, 100, 129, 10, 4)).toBe(0)
  })
})

describe('rebaseLoopTiming / setPlayLoopTempo', () => {
  const density = 1 / 16
  const beatCount = 16

  it('updates step timing for the new bpm without resetting density', () => {
    const timing = {
      startIndex: 0,
      startedAtMs: 0,
      stepMs: stepMsForBpm(120, density),
      density,
    }
    const rebased = rebaseLoopTiming(timing, 60, 1500, 5)

    expect(rebased.stepMs).toBe(stepMsForBpm(60, density))
    expect(rebased.stepMs).toBe(timing.stepMs * 2)
    expect(rebased.density).toBe(density)
    expect(rebased.startIndex).toBe(5)
    expect(rebased.startedAtMs).toBe(1500)
  })

  it('keeps getBeatIndex continuous at the rebase instant', () => {
    const timing = {
      startIndex: 2,
      startedAtMs: 100,
      stepMs: stepMsForBpm(120, density),
      density,
    }
    const nowMs = timing.startedAtMs + timing.stepMs * 3 + 1
    const currentIndex = playbackIndexAt(
      timing.startIndex,
      timing.startedAtMs,
      nowMs,
      timing.stepMs,
      beatCount,
    )

    const rebased = rebaseLoopTiming(timing, 90, nowMs, currentIndex)

    expect(
      playbackIndexAt(rebased.startIndex, rebased.startedAtMs, nowMs, rebased.stepMs, beatCount),
    ).toBe(currentIndex)
  })

  it('advances from the rebased index with the new step size', () => {
    const timing = {
      startIndex: 4,
      startedAtMs: 0,
      stepMs: stepMsForBpm(120, density),
      density,
    }
    const rebaseAt = 250
    const currentIndex = playbackIndexAt(
      timing.startIndex,
      timing.startedAtMs,
      rebaseAt,
      timing.stepMs,
      beatCount,
    )
    const rebased = rebaseLoopTiming(timing, 60, rebaseAt, currentIndex)

    expect(
      playbackIndexAt(
        rebased.startIndex,
        rebased.startedAtMs,
        rebaseAt + rebased.stepMs,
        rebased.stepMs,
        beatCount,
      ),
    ).toBe((currentIndex + 1) % beatCount)

    expect(
      playbackIndexAt(
        rebased.startIndex,
        rebased.startedAtMs,
        rebaseAt + timing.stepMs,
        rebased.stepMs,
        beatCount,
      ),
    ).toBe(currentIndex)
  })
})

describe('schedulePlaybackWindow', () => {
  it('collects future slots through the lookahead boundary', () => {
    const result = schedulePlaybackWindow({
      beatCount: 4,
      cursor: { nextIndex: 1, nextTimeMs: 10 },
      nowMs: 0,
      scheduleUntilMs: 35,
      stepMs: 10,
    })

    expect(result.skipped).toBe(0)
    expect(result.scheduled).toEqual([
      { index: 1, timeMs: 10 },
      { index: 2, timeMs: 20 },
      { index: 3, timeMs: 30 },
    ])
    expect(result.cursor).toEqual({ nextIndex: 0, nextTimeMs: 40 })
  })

  it('skips every stale slot after a long scheduler stall', () => {
    const result = schedulePlaybackWindow({
      beatCount: 4,
      cursor: { nextIndex: 1, nextTimeMs: 10 },
      nowMs: 95,
      scheduleUntilMs: 125,
      stepMs: 10,
    })

    expect(result.skipped).toBe(9)
    expect(result.scheduled).toEqual([
      { index: 2, timeMs: 100 },
      { index: 3, timeMs: 110 },
      { index: 0, timeMs: 120 },
    ])
    expect(result.scheduled.every(({ timeMs }) => timeMs > 95)).toBe(true)
  })

  it('does not enqueue a slot on an already-reached boundary', () => {
    const result = schedulePlaybackWindow({
      beatCount: 4,
      cursor: { nextIndex: 2, nextTimeMs: 100 },
      nowMs: 100,
      scheduleUntilMs: 121,
      stepMs: 10,
    })

    expect(result.skipped).toBe(1)
    expect(result.scheduled).toEqual([
      { index: 3, timeMs: 110 },
      { index: 0, timeMs: 120 },
    ])
  })

  it('keeps the recovered audible phase aligned with the first future slot', () => {
    const nowMs = 95
    const currentIndex = playbackIndexAt(0, 0, nowMs, 10, 4)
    const result = schedulePlaybackWindow({
      beatCount: 4,
      cursor: { nextIndex: 1, nextTimeMs: 10 },
      nowMs,
      scheduleUntilMs: 105,
      stepMs: 10,
    })

    expect(currentIndex).toBe(1)
    expect(result.scheduled[0]).toEqual({ index: 2, timeMs: 100 })
  })

  it('rebuilds a canceled lookahead queue from the next transport slot', () => {
    const nowMs = 35
    const cursor = playbackCursorAfter(0, 0, nowMs, 10, 4)
    const result = schedulePlaybackWindow({
      beatCount: 4,
      cursor,
      nowMs,
      scheduleUntilMs: 56,
      stepMs: 10,
    })

    expect(cursor).toEqual({ nextIndex: 0, nextTimeMs: 40 })
    expect(result.scheduled).toEqual([
      { index: 0, timeMs: 40 },
      { index: 1, timeMs: 50 },
    ])
  })
})
