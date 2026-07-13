import { describe, expect, it } from 'vitest'

import { previewBarsForDrag, remapBarIndex, reorderBar } from '@/features/editor/notation/reorder-bars'
import {
  barBoundsForBars,
  resolveBarDropTarget,
} from '@/features/editor/canvas/resolve-drop-index'

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

  it('previews bars after a drag without mutating the source array', () => {
    const bars = ['a', 'b', 'c', 'd']
    expect(previewBarsForDrag(bars, 3, 2)).toEqual(['a', 'b', 'd', 'c'])
    expect(bars).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('resolveBarDropTarget', () => {
  const bars = ['a', 'b', 'c', 'd']
  const canvasWidth = 400
  const barsPerRow = 4
  const bounds = barBoundsForBars(bars, canvasWidth, barsPerRow)

  it('places before the first bar when the pointer is left of it', () => {
    expect(resolveBarDropTarget(4, 2, bounds[0].left - 1, bounds[0].top + 1, bounds)).toEqual({
      dropIndex: 0,
      hoveredBarIndex: -1,
    })
  })

  it('places after the hovered bar', () => {
    const hovered = bounds[1]
    expect(
      resolveBarDropTarget(
        4,
        3,
        hovered.left + hovered.width / 2,
        hovered.top + hovered.height / 2,
        bounds,
      ),
    ).toEqual({
      dropIndex: 2,
      hoveredBarIndex: 1,
    })
  })

  it('places at the end when hovering the last bar', () => {
    const last = bounds[3]
    expect(
      resolveBarDropTarget(
        4,
        0,
        last.left + last.width / 2,
        last.top + last.height / 2,
        bounds,
      ),
    ).toEqual({
      dropIndex: 4,
      hoveredBarIndex: 3,
    })
  })

  it('keeps the source index when hovering the dragged bar', () => {
    const source = bounds[2]
    expect(
      resolveBarDropTarget(
        4,
        2,
        source.left + source.width / 2,
        source.top + source.height / 2,
        bounds,
      ),
    ).toEqual({
      dropIndex: 2,
      hoveredBarIndex: 2,
    })
  })
})
