import { describe, expect, it } from 'vitest'

import { repeatBarsToFillCols } from './repeat-bars-to-fill-cols'

describe('repeatBarsToFillCols', () => {
  it('duplicates once when cols are exactly 2x the bar count', () => {
    expect(repeatBarsToFillCols(['a'], 2)).toEqual(['a', 'a'])
    expect(repeatBarsToFillCols(['a', 'b'], 4)).toEqual(['a', 'b', 'a', 'b'])
  })

  it('duplicates three times when cols are exactly 4x the bar count', () => {
    expect(repeatBarsToFillCols(['a'], 4)).toEqual(['a', 'a', 'a', 'a'])
  })

  it('returns bars unchanged when cols already match or are smaller', () => {
    expect(repeatBarsToFillCols(['a', 'b'], 2)).toEqual(['a', 'b'])
    expect(repeatBarsToFillCols(['a', 'b', 'c'], 2)).toEqual(['a', 'b', 'c'])
  })

  it('returns bars unchanged when the ratio is not exactly 2 or 4', () => {
    expect(repeatBarsToFillCols(['a'], 3)).toEqual(['a'])
    expect(repeatBarsToFillCols(['a', 'b'], 6)).toEqual(['a', 'b'])
  })
})
