import { describe, expect, it } from 'vitest'

import {
  applyBarModeAction,
  applyBarPatternAction,
} from '@/features/editor/canvas/bar-pattern-actions'

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

describe('applyBarModeAction', () => {
  it('adds a bar after the selected bar', () => {
    const bars = ['aaaa', 'bbbb', 'cccc']
    const result = applyBarModeAction(bars, 8, 1, 'add')
    expect(result.bars).toEqual(['aaaa', 'bbbb', '--------', 'cccc'])
    expect(result.barIndex).toBe(1)
  })

  it('removes the selected bar', () => {
    const bars = ['aaaa', 'bbbb', 'cccc']
    const result = applyBarModeAction(bars, 8, 1, 'remove')
    expect(result.bars).toEqual(['aaaa', 'cccc'])
    expect(result.barIndex).toBe(0)
  })

  it('clears the selected bar to rests', () => {
    const bars = ['aaaa', 'bbbb']
    const result = applyBarModeAction(bars, 8, 0, 'clear')
    expect(result.bars).toEqual(['--------', 'bbbb'])
    expect(result.barIndex).toBe(0)
  })

  it('keeps one empty bar when removing the last remaining bar', () => {
    const result = applyBarModeAction(['aaaa'], 8, 0, 'remove')
    expect(result.bars).toEqual(['--------'])
    expect(result.barIndex).toBe(0)
  })
})
