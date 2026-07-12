import { describe, expect, it, vi } from 'vitest'

import { layoutBar } from './renderers'
import { drawTripletBracket, tripletBracketSpans } from './triplet-brackets'

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
    expect(spans[0]?.endCaps).toBe('start')
    expect(spans[1]?.left).toBe(layouts[2]?.barEl.left)
    expect(spans[1]?.endCaps).toBe('end')
    expect(spans.every((span) => span.showLabel)).toBe(true)
  })

  it('draws only one vertical tick per split row half', () => {
    const stroke = vi.fn()
    const lineTo = vi.fn()
    const moveTo = vi.fn()
    const context = {
      beginPath: vi.fn(),
      stroke,
      fillText: vi.fn(),
      moveTo,
      lineTo,
    } as unknown as CanvasRenderingContext2D

    drawTripletBracket(context, {
      left: 10,
      right: 50,
      y: 5,
      showLabel: false,
      endCaps: 'start',
    })
    expect(moveTo).toHaveBeenCalledTimes(2)
    expect(lineTo).toHaveBeenCalledTimes(2)

    moveTo.mockClear()
    lineTo.mockClear()

    drawTripletBracket(context, {
      left: 10,
      right: 50,
      y: 5,
      showLabel: false,
      endCaps: 'end',
    })
    expect(moveTo).toHaveBeenCalledTimes(2)
    expect(lineTo).toHaveBeenCalledTimes(2)

    moveTo.mockClear()
    lineTo.mockClear()

    drawTripletBracket(context, {
      left: 10,
      right: 50,
      y: 5,
      showLabel: false,
      endCaps: 'both',
    })
    expect(moveTo).toHaveBeenCalledTimes(3)
    expect(lineTo).toHaveBeenCalledTimes(3)
  })
})
