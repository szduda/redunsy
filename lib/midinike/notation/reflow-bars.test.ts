import { describe, expect, it } from 'vitest'

import { barCellCount } from './cell-duration'
import { barsCellCounts } from './grouped-notation'
import { reflowBarsToSize } from './reflow-bars'

const totalCells = (bars: string[]) => bars.reduce((sum, bar) => sum + barCellCount(bar), 0)

const DJEMBE_BARS = [
  'ttsb-s',
  'b-sb-s',
  'ttsb-s',
  'b-sb-s',
  '[ss]ssstt',
  '-ssstt',
  'ts---[tt]',
  '[tt]tbsb-',
  'f-sf-s',
  'f-sf--',
  'f-tt-t',
  't-tt--',
] as const

describe('reflowBarsToSize', () => {
  it('preserves all cells when reflowing to the same bar size', () => {
    const bars = ['ttsb-s', 'b-sb-s']
    const reflowed = reflowBarsToSize(bars, 6)
    expect(reflowed.every((bar) => barCellCount(bar) <= 6)).toBe(true)
    expect(reflowed.join('')).toBe(bars.join(''))
  })

  it('leaves the last bar incomplete instead of padding rests', () => {
    const reflowed = reflowBarsToSize(['----oo'], 8)
    expect(reflowed).toEqual(['----oo'])
    expect(barCellCount(reflowed[0])).toBe(6)
  })

  it('preserves total cell count when redistributing', () => {
    const bars = [...DJEMBE_BARS]
    expect(totalCells(reflowBarsToSize(bars, 8))).toBe(totalCells(bars))
    expect(reflowBarsToSize(bars, 8)).toHaveLength(9)
  })

  it('keeps sixteenth and triplet groups intact across reflow boundaries', () => {
    const bars = ['ts---[tt]', '[tt]tbsb-']
    const reflowed = reflowBarsToSize(bars, 8)
    expect(reflowed.join('')).toContain('[tt]')
    expect(reflowed.every((bar) => barCellCount(bar) <= 8)).toBe(true)
  })

  it('preserves split triplet notation when reflowing', () => {
    const bars = ['-----{tt', '-}-----', '------']
    const reflowed = reflowBarsToSize(bars, 6)
    expect(reflowed.join('')).toBe(bars.join(''))
    expect(barsCellCounts(reflowed)).toEqual([6, 6, 6])
  })

  it('roundtrips 6→8→6 without appending rests', () => {
    const original = [...DJEMBE_BARS]
    const at8 = reflowBarsToSize(original, 8)
    const back6 = reflowBarsToSize(at8, 6)
    expect(back6).toEqual(original)
  })

  it('roundtrips 8→6→8 without appending rests', () => {
    const at8 = reflowBarsToSize([...DJEMBE_BARS], 8)
    const back6 = reflowBarsToSize(at8, 6)
    const at8Again = reflowBarsToSize(back6, 8)
    expect(at8Again).toEqual(at8)
  })

  it('stays stable when toggling bar size repeatedly on a short bar', () => {
    const original = ['----oo']
    let bars = original
    for (let index = 0; index < 5; index += 1) {
      bars = reflowBarsToSize(bars, 8)
      expect(bars).toEqual(original)
      bars = reflowBarsToSize(bars, 6)
      expect(bars).toEqual(original)
    }
  })
})
