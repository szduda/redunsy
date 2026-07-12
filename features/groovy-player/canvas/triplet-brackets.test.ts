import { describe, expect, it } from 'vitest'

import { layoutBar } from './renderers'
import { tripletBracketSpans } from './triplet-brackets'

const layoutBars = (bars: string[], barsPerRow: number, canvasWidth = 300) =>
  bars.map((_, barIndex) => layoutBar({ bars, canvasWidth, barIndex, barsPerRow }))

describe('tripletBracketSpans', () => {
  it('draws one centered bracket for an in-bar triplet', () => {
    const bars = ['{ttt}----']
    const layouts = layoutBars(bars, 2)
    const spans = tripletBracketSpans(bars, layouts, 2)
    expect(spans).toHaveLength(1)
    expect(spans[0]?.showLabel).toBe(true)
    expect(spans[0]?.left).toBeLessThan(spans[0]?.right ?? 0)
  })

  it('draws one spanning bracket for cross-bar triplets on the same row', () => {
    const bars = ['-----{tt', '-}-----']
    const layouts = layoutBars(bars, 2)
    const spans = tripletBracketSpans(bars, layouts, 2)
    expect(spans).toHaveLength(1)
    expect(spans[0]?.left).toBeLessThan(spans[0]?.right ?? 0)
    expect(spans[0]?.right).toBeGreaterThan(layouts[1]?.barEl.left ?? 0)
  })

  it('draws split brackets when the open bar ends the row', () => {
    const bars = ['ttsb-s', '-----{tt', '-}-----']
    const layouts = layoutBars(bars, 2)
    const spans = tripletBracketSpans(bars, layouts, 2)
    expect(spans).toHaveLength(2)
    expect(spans[0]?.right).toBe(layouts[1]?.barEl.left + layouts[1]?.barEl.width)
    expect(spans[1]?.left).toBe(layouts[2]?.barEl.left)
    expect(spans.every((span) => span.showLabel)).toBe(true)
  })
})
