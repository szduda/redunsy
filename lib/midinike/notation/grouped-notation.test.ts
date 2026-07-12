import { describe, expect, it } from 'vitest'

import { barsCellCounts, joinedNotation, parseGroupedNotation } from './grouped-notation'

describe('parseGroupedNotation', () => {
  it('counts self-contained groups within one bar', () => {
    expect(barsCellCounts(['{ttt}'])).toEqual([2])
    expect(barsCellCounts(['[tttt]'])).toEqual([2])
    expect(barsCellCounts(['<fststs>'])).toEqual([2])
    expect(barsCellCounts(['b-[----]'])).toEqual([3])
    expect(barsCellCounts(['b-<------>s---'])).toEqual([6])
  })

  it('splits triplet cells across two bars without rewriting notation', () => {
    const bars = ['-----{tt', '-}-----']
    expect(barsCellCounts(bars)).toEqual([6, 6])
    expect(joinedNotation(bars)).toBe('-----{tt-}-----')
    expect(parseGroupedNotation(bars).glyphLocationsByBar[0]).toHaveLength(7)
    expect(parseGroupedNotation(bars).glyphLocationsByBar[1]).toHaveLength(6)
  })

  it('allows unopened and unclosed bracket halves per bar', () => {
    const bars = ['-----{tt', 't}-----']
    expect(() => parseGroupedNotation(bars)).not.toThrow()
    expect(barsCellCounts(bars)).toEqual([6, 6])
  })

  it('counts a triplet opened before the bar boundary as six cells', () => {
    const bars = ['sss-s{ss', 's}-----']
    expect(barsCellCounts(bars)).toEqual([6, 6])
    expect(joinedNotation(bars)).toBe('sss-s{sss}-----')
  })

  it('does not treat converted triplet glue as a rest before an open brace', () => {
    const bars = [
      'ttsb-s',
      'b-sb-{st',
      '-}tsb-{sb',
      '-}-sb-{ss',
      '-}ssst{t-',
      '-}ssst{tt',
      '-}s---{tt',
      '-}tbsb{-s',
      '-}s{ttsstt}',
      'sstss-',
      'f-{sf-}-s',
      'f-fss{-s',
      '-}ss-s{ss',
      '-}-sss{-b',
      '-}---[ss]{ss',
      '-}st--{tt',
      '-}stts{tt',
      '-}-ssb{bb',
      '-}---[ss]{ss',
      '-}st--{tt',
      '-}st-t{tt',
      '-}-st',
      '[ttt-]ssb{tt',
      '-}-f--{ss',
      's}s----',
    ]
    const counts = barsCellCounts(bars)
    expect(counts.slice(1, 4)).toEqual([6, 6, 6])
    expect(counts[10]).toBe(6)
    expect(counts[21]).toBe(4)
    expect(counts.filter((count) => count === 6)).toHaveLength(24)
  })
})
