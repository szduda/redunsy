import { describe, expect, it, vi } from 'vitest'

import * as groupedNotation from '@/lib/midinike/notation/grouped-notation'
import { parseBarsNotation } from './bar-layout'
import {
  BAR_GAP_PX,
  canvasHeightForBars,
  layoutBar,
  rowHeightsForBars,
} from './renderers'
import { tripletBracketSpans } from './triplet-brackets'
import { polyrhythmBracketSpans } from './polyrhythm-brackets'

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
