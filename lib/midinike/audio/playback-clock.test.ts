import { describe, expect, it } from 'vitest'

import { playbackCursorAfter, playbackIndexAt, schedulePlaybackWindow } from './playback-clock'

describe('playbackIndexAt', () => {
  it('derives the audible slot from elapsed transport time and wraps the loop', () => {
    expect(playbackIndexAt(2, 100, 129, 10, 4)).toBe(0)
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
