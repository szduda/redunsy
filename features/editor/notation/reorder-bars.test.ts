import { describe, expect, it } from 'vitest'

import { buildDragSlots, remapBarIndex, reorderBar } from '@/features/editor/notation/reorder-bars'

describe('reorder-bars', () => {
  it('moves a bar to an earlier index', () => {
    expect(reorderBar(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('moves a bar to the end', () => {
    expect(reorderBar(['a', 'b', 'c'], 0, 3)).toEqual(['b', 'c', 'a'])
  })

  it('remaps moved bar index', () => {
    expect(remapBarIndex(3, 3, 1)).toBe(1)
  })

  it('builds drag slots with a gap before drop index', () => {
    expect(buildDragSlots(['a', 'b', 'c', 'd'], 3, 1)).toEqual([
      { bar: 'a', originalIndex: 0 },
      { bar: null, originalIndex: null },
      { bar: 'b', originalIndex: 1 },
      { bar: 'c', originalIndex: 2 },
    ])
  })
})
