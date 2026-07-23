import { describe, expect, it, vi } from 'vitest'

import * as groupedNotation from '@/lib/midinike/notation/grouped-notation'
import { parseBarsNotation } from './bar-layout'
import {
  BAR_GAP_PX,
  canvasHeightForBars,
  layoutBar,
  renderBars,
  rowHeightsForBars,
} from './renderers'
import { tripletBracketSpans } from './triplet-brackets'
import { polyrhythmBracketSpans } from './polyrhythm-brackets'

const stubContext = () => {
  const noop = () => undefined
  return new Proxy(
    { canvas: { width: 300, height: 100 } },
    {
      get: (target, prop) => {
        if (prop in target) return Reflect.get(target, prop)
        if (prop === 'canvas') return target.canvas
        return noop
      },
      set: () => true,
    },
  ) as unknown as CanvasRenderingContext2D
}

describe('layout path single-parse', () => {
  it('layoutBar reuses a precomputed layout without re-parsing', () => {
    const bars = ['ttstts', 'ssssss']
    const { layouts } = parseBarsNotation(bars)
    const rowHeights = rowHeightsForBars(240, 2, bars, layouts)
    const spy = vi.spyOn(groupedNotation, 'parseGroupedNotation')
    const laidOut = layoutBar({
      bars,
      canvasWidth: 240,
      barIndex: 0,
      barsPerRow: 2,
      rowHeights,
      layout: layouts[0],
    })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    expect(laidOut.glyphs).toEqual(layouts[0].glyphs)
  })

  it('canvasHeightForBars matches rowHeightsForBars with shared layouts', () => {
    const bars = ['ttstts', '{ttt}--', 'ssssss']
    const { layouts } = parseBarsNotation(bars)
    const rowHeights = rowHeightsForBars(300, 2, bars, layouts)
    const expected =
      rowHeights.reduce((sum, height) => sum + height + 2 * BAR_GAP_PX, 0) - 2 * BAR_GAP_PX
    expect(canvasHeightForBars(300, 2, bars, layouts)).toBe(expected)
  })

  it('React call-site: shared parse for height + renderBars = 1 parse', () => {
    const bars = ['ttstts', 'ssssss', '{ttt}--', '-----{tt', '-}-----']
    const spy = vi.spyOn(groupedNotation, 'parseGroupedNotation')

    // Mirrors bars-canvas / editable-bars-canvas paint cycle:
    // parse once → height from layouts → renderBars with same parsed.
    const parsed = parseBarsNotation(bars)
    expect(spy).toHaveBeenCalledTimes(1)

    const height = canvasHeightForBars(300, 2, bars, parsed.layouts)
    expect(height).toBeGreaterThan(0)
    expect(spy).toHaveBeenCalledTimes(1)

    const context = stubContext()
    renderBars({
      bars,
      instrument: 'djembe',
      canvas: context.canvas as HTMLCanvasElement,
      context,
      canvasWidth: 300,
      barsPerRow: 2,
      markTriplets: true,
      parsed,
    })
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('bracket spans accept pre-parsed segments without re-parsing', () => {
    const bars = ['{ttt}----', '<fststs>---']
    const parsed = parseBarsNotation(bars)
    const layouts = bars.map((_, barIndex) =>
      layoutBar({
        bars,
        canvasWidth: 300,
        barIndex,
        barsPerRow: 1,
        rowHeights: rowHeightsForBars(300, 1, bars, parsed.layouts),
        layout: parsed.layouts[barIndex],
      }),
    )
    const bracketParsed = {
      segments: parsed.segments,
      barCellCounts: parsed.barCellCounts,
    }
    const spy = vi.spyOn(groupedNotation, 'parseGroupedNotation')
    const triplets = tripletBracketSpans(bars, layouts, 1, bracketParsed)
    const polys = polyrhythmBracketSpans(bars, layouts, 1, bracketParsed)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    expect(triplets).toHaveLength(1)
    expect(polys).toHaveLength(1)
  })
})
