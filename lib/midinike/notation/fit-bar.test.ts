import { describe, expect, it } from 'vitest'

import { barCellCount } from './cell-duration'
import { barsCellCounts } from './grouped-notation'
import { barsMatchGrooveLength, validateBarForGroove, validateBarsForGroove } from './fit-bar'
import { compileGroove } from '../groove/compile-groove'

const GROOVE_6 = '------'

describe('fit-bar cross-bar validation', () => {
  const crossBarTriplet = ['sss-s{ss', 's}-----'] as const

  it('over-counts an isolated bar that continues a group in the next bar', () => {
    expect(barCellCount('sss-s{ss')).toBe(7)
    expect(barsCellCounts([...crossBarTriplet])).toEqual([6, 6])
  })

  it('validates cross-bar tracks using full bar context', () => {
    expect(() => validateBarsForGroove([...crossBarTriplet], 6)).not.toThrow()
    expect(barsMatchGrooveLength([...crossBarTriplet], 6)).toBe(true)
  })

  it('still rejects isolated validation when a self-contained bar is too long', () => {
    expect(() => validateBarForGroove('b---b---', 6)).toThrow(/more than groove length/)
  })

  it('compiles cross-bar triplet tracks without cell-count errors', () => {
    expect(() => compileGroove({ bars: [...crossBarTriplet], groove: GROOVE_6 })).not.toThrow()
  })
})
