import { describe, expect, it, vi } from 'vitest'

import * as groupedNotation from '@/lib/midinike/notation/grouped-notation'
import {
  parseBarLayout,
  parseBarsLayout,
  cachedParseBarsNotation,
  clearParseBarsNotationCacheForTests,
} from './bar-layout'
import { rowHeightsForBars } from './renderers'

describe('parseBarLayout', () => {
  it('places plain 8th notes on whole cell boundaries', () => {
    const layout = parseBarLayout('ttstts')
    expect(layout.cellCount).toBe(6)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 1, 2, 3, 4, 5])
    expect(layout.glyphs.every((g) => g.kind === 'eighth')).toBe(true)
  })

  it('places 16th pair with second note midway to next 8th', () => {
    const layout = parseBarLayout('[tt]')
    expect(layout.cellCount).toBe(1)
    expect(layout.glyphs).toEqual([
      { note: 't', position: 0, kind: 'eighth' },
      { note: 't', position: 0.5, kind: 'sixteenth' },
    ])
  })

  it('places triplet notes across two 8th cells', () => {
    const layout = parseBarLayout('{ttt}')
    expect(layout.cellCount).toBe(2)
    expect(layout.glyphs).toEqual([
      { note: 't', position: 0, kind: 'eighth' },
      { note: 't', position: 2 / 3, kind: 'triplet' },
      { note: 't', position: 4 / 3, kind: 'triplet' },
    ])
  })

  it('lays out mixed 16th and 8th bar on stable 8th grid', () => {
    const layout = parseBarLayout('[tt]ts')
    expect(layout.cellCount).toBe(3)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 0.5, 1, 2])
    expect(layout.glyphs.map((g) => g.kind)).toEqual(['eighth', 'sixteenth', 'eighth', 'eighth'])
  })

  it('renders rest between triplet groups after glue hyphen', () => {
    const layout = parseBarLayout('s{tts}-{stt}')
    expect(layout.cellCount).toBe(6)
    expect(layout.glyphs).toEqual([
      { note: 's', position: 0, kind: 'eighth' },
      { note: 't', position: 1, kind: 'eighth' },
      { note: 't', position: 1 + 2 / 3, kind: 'triplet' },
      { note: 's', position: 1 + 4 / 3, kind: 'triplet' },
      { note: '-', position: 3, kind: 'eighth' },
      { note: 's', position: 4, kind: 'eighth' },
      { note: 't', position: 4 + 2 / 3, kind: 'triplet' },
      { note: 't', position: 4 + 4 / 3, kind: 'triplet' },
    ])
  })

  it('counts rests before a 16th group without treating the last hyphen as glue', () => {
    const layout = parseBarLayout('ts---[tt]')
    expect(layout.cellCount).toBe(6)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 1, 2, 3, 4, 5, 5.5])
  })

  it('lays out ts-b-[ss] as six 8th cells', () => {
    const layout = parseBarLayout('ts-b-[ss]')
    expect(layout.cellCount).toBe(6)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 1, 2, 3, 4, 5, 5.5])
  })

  it('links any note to a multi-pair 16th group via glue hyphen', () => {
    for (const bar of ['b-[----]', 't-[----]', 's-[----]', 'f-[----]']) {
      const layout = parseBarLayout(bar)
      expect(layout.cellCount).toBe(3)
      expect(layout.glyphs.map((g) => g.position)).toEqual([0, 1, 1.5, 2, 2.5])
    }
  })

  it('lays out ts-[ssss]t as five 8th cells when note links to multi-pair 16ths', () => {
    const layout = parseBarLayout('ts-[ssss]t')
    expect(layout.cellCount).toBe(5)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 1, 2, 2.5, 3, 3.5, 4])
  })

  it('lays out a triplet split across two bars', () => {
    const bars = ['-----{tt', '-}-----']
    const first = parseBarLayout(bars[0], bars, 0)
    const second = parseBarLayout(bars[1], bars, 1)
    expect(first.cellCount).toBe(6)
    expect(second.cellCount).toBe(6)
    expect(first.glyphs.map((g) => g.position)).toEqual([0, 1, 2, 3, 4, 5, 5 + 2 / 3])
    expect(second.glyphs.map((g) => g.position)[0]).toBeCloseTo(1 / 3, 5)
    expect(second.glyphs.map((g) => g.position).slice(1)).toEqual([1, 2, 3, 4, 5])
  })

  it('places polyrhythm notes on the 4:3 union grid across two 8th cells', () => {
    const layout = parseBarLayout('<fststs>')
    expect(layout.cellCount).toBe(2)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 0.5, 2 / 3, 1, 4 / 3, 3 / 2])
    expect(layout.glyphs.map((g) => g.kind)).toEqual([
      'eighth',
      'polyrhythm',
      'polyrhythm',
      'polyrhythm',
      'polyrhythm',
      'polyrhythm',
    ])
    expect(layout.glyphs.map((g) => g.polyrhythmIndex)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('absorbs a glued note into the first polyrhythm slot', () => {
    const layout = parseBarLayout('b-<------>s---')
    expect(layout.cellCount).toBe(6)
    expect(layout.glyphs.map((g) => g.note)).toEqual([
      'b',
      '-',
      '-',
      '-',
      '-',
      '-',
      's',
      '-',
      '-',
      '-',
    ])
    expect(layout.glyphs[0]).toMatchObject({ position: 0, polyrhythmIndex: 0 })
    expect(layout.glyphs[6]?.position).toBe(2)
  })
})

describe('parseBarsLayout', () => {
  it('matches per-bar parseBarLayout for cross-bar triplets', () => {
    const bars = ['-----{tt', '-}-----']
    const layouts = parseBarsLayout(bars)
    expect(layouts).toHaveLength(2)
    expect(layouts[0]).toEqual(parseBarLayout(bars[0], bars, 0))
    expect(layouts[1]).toEqual(parseBarLayout(bars[1], bars, 1))
  })
})

describe('cachedParseBarsNotation', () => {
  it('reuses parse for the same hash and misses after clear', () => {
    clearParseBarsNotationCacheForTests()
    const bars = ['ttstts', 'ssssss']
    const spy = vi.spyOn(groupedNotation, 'parseGroupedNotation')
    const first = cachedParseBarsNotation(bars, bars.join(''))
    const second = cachedParseBarsNotation(bars, bars.join(''))
    expect(first).toBe(second)
    expect(spy).toHaveBeenCalledTimes(1)
    clearParseBarsNotationCacheForTests()
    cachedParseBarsNotation(bars, bars.join(''))
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
    clearParseBarsNotationCacheForTests()
  })
})

describe('rowHeightsForBars single-parse', () => {
  it('parses grouped notation once when layouts are not provided', () => {
    const bars = ['ttstts', 'ssssss', 'tttttt', '{ttt}--']
    const spy = vi.spyOn(groupedNotation, 'parseGroupedNotation')
    rowHeightsForBars(300, 2, bars)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('reuses precomputed layouts without re-parsing', () => {
    const bars = ['ttstts', 'ssssss', '-----{tt', '-}-----']
    const layouts = parseBarsLayout(bars)
    const spy = vi.spyOn(groupedNotation, 'parseGroupedNotation')
    const withLayouts = rowHeightsForBars(300, 2, bars, layouts)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    expect(withLayouts).toEqual(rowHeightsForBars(300, 2, bars))
  })
})
