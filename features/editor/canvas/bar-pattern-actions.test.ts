import { describe, expect, it } from 'vitest'

import { applyBarPatternAction } from '@/features/editor/canvas/bar-pattern-actions'

describe('applyBarPatternAction', () => {
  it('appends an empty bar when cursor is unset', () => {
    const bars = ['{ts-}ttttt', 'tttttttt', 'tttttttt', 'tttttttt']
    const result = applyBarPatternAction(bars, 8, -1, 'add')
    expect(result.bars).toHaveLength(5)
    expect(result.bars[4]).toBe('--------')
    expect(result.bars[0]).toBe('{ts-}ttttt')
  })

  it('inserts an empty bar at the cursor without resplitting notation', () => {
    const bars = ['aaaa', '[tt]bb']
    const result = applyBarPatternAction(bars, 8, 1, 'add')
    expect(result.bars).toEqual(['aaaa', '--------', '[tt]bb'])
  })

  it('removes the last bar when cursor is unset', () => {
    const bars = ['aaaa', 'bbbb', 'cccc']
    const result = applyBarPatternAction(bars, 8, -1, 'remove')
    expect(result.bars).toEqual(['aaaa', 'bbbb'])
  })

  it('removes the bar before the cursor', () => {
    const bars = ['aaaa', 'bbbb', 'cccc']
    const result = applyBarPatternAction(bars, 8, 2, 'remove')
    expect(result.bars).toEqual(['aaaa', 'cccc'])
    expect(result.cursor).toBe(1)
  })
})
