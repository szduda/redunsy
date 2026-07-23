import { describe, expect, it } from 'vitest'

import { dragLayoutUnchanged, resolveGhostLayout, type DragLayoutState } from './bar-drag-paint'

describe('dragLayoutUnchanged', () => {
  const base: DragLayoutState = {
    sourceIndex: 1,
    dropIndex: 2,
    hoveredBarIndex: 2,
    grabOffsetX: 4,
    grabOffsetY: 5,
  }

  it('ignores grab offset differences for layout identity', () => {
    expect(dragLayoutUnchanged(base, { ...base, grabOffsetX: 99, grabOffsetY: 99 })).toBe(true)
  })

  it('detects drop/hover changes', () => {
    expect(dragLayoutUnchanged(base, { ...base, dropIndex: 3 })).toBe(false)
    expect(dragLayoutUnchanged(base, { ...base, hoveredBarIndex: -1 })).toBe(false)
    expect(dragLayoutUnchanged(null, base)).toBe(false)
  })
})

describe('resolveGhostLayout', () => {
  it('reuses cached layout for the same key', () => {
    const first = resolveGhostLayout({
      bar: 'ttstts',
      contentWidth: 240,
      barsPerRow: 2,
      prefersDark: true,
      cached: null,
      cacheKey: 'k1',
    })
    const second = resolveGhostLayout({
      bar: 'ttstts',
      contentWidth: 240,
      barsPerRow: 2,
      prefersDark: true,
      cached: first,
      cacheKey: 'k1',
    })
    expect(second.layout).toBe(first.layout)

    const third = resolveGhostLayout({
      bar: 'ssssss',
      contentWidth: 240,
      barsPerRow: 2,
      prefersDark: true,
      cached: first,
      cacheKey: 'k2',
    })
    expect(third.layout).not.toBe(first.layout)
  })
})
