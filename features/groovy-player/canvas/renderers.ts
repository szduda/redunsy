import { darkCanvasColors, type CanvasColors } from './canvas-colors'
import { font } from './drum-font'
import { drawBarIndexLabel } from '@/features/groovy-player/bar-index-mark'
import {
  onBeatCellIndexes,
  parseBarLayout,
  parseBarsLayout,
  parseBarsNotation,
  type BarLayout,
  type ParsedBarsNotation,
} from './bar-layout'
import { drawTripletBracket, tripletBracketSpans } from './triplet-brackets'
import {
  drawPolyrhythmBracket,
  polyrhythmBracketSpans,
  scaledPolyrhythmNoteRect,
} from './polyrhythm-brackets'

import type { BarGlyph } from './bar-layout'
import type { BracketParsedNotation } from './triplet-brackets'
import type { CanvasElement } from './types'

export const BAR_GAP_PX = 1
export const NOTE_ASPECT_W_OVER_H = 3 / 4

export const barWidthForCanvas = (canvasWidth: number, barsPerRow: number) =>
  (canvasWidth - (barsPerRow - 1) * BAR_GAP_PX) / barsPerRow

export const noteHeightFromWidth = (width: number) => width / NOTE_ASPECT_W_OVER_H

export const barHeightForCellCount = (canvasWidth: number, barsPerRow: number, cellCount: number) =>
  noteHeightFromWidth(barWidthForCanvas(canvasWidth, barsPerRow) / cellCount)

export const barHeightForBar = (
  canvasWidth: number,
  barsPerRow: number,
  bar: string,
  bars?: string[],
  barIndex?: number,
  layout?: BarLayout,
) => {
  const { cellCount } = layout ?? parseBarLayout(bar, bars, barIndex)
  return barHeightForCellCount(canvasWidth, barsPerRow, cellCount)
}

export const rowHeightsForBars = (
  canvasWidth: number,
  barsPerRow: number,
  bars: string[],
  layouts?: BarLayout[],
) => {
  const resolved = layouts ?? parseBarsLayout(bars)
  const rowCount = Math.ceil(bars.length / barsPerRow)
  return Array.from({ length: rowCount }, (_, row) => {
    const start = row * barsPerRow
    const end = Math.min(start + barsPerRow, bars.length)
    return Math.max(
      0,
      ...Array.from({ length: end - start }, (_, offset) =>
        barHeightForCellCount(canvasWidth, barsPerRow, resolved[start + offset]?.cellCount ?? 0),
      ),
    )
  })
}

export const barTopForIndex = (barIndex: number, barsPerRow: number, rowHeights: number[]) => {
  const row = Math.trunc(barIndex / barsPerRow)
  let top = 0
  for (let index = 0; index < row; index += 1) top += (rowHeights[index] ?? 0) + 2 * BAR_GAP_PX
  return top
}

export const canvasHeightForBars = (
  canvasWidth: number,
  barsPerRow: number,
  bars: string[],
  layouts?: BarLayout[],
) => {
  const rowHeights = rowHeightsForBars(canvasWidth, barsPerRow, bars, layouts)
  if (!rowHeights.length) return 0
  return rowHeights.reduce((sum, height) => sum + height + 2 * BAR_GAP_PX, 0) - 2 * BAR_GAP_PX
}

export const rowIndexFromY = (y: number, rowHeights: number[]) => {
  let top = 0
  for (let row = 0; row < rowHeights.length; row += 1) {
    const gross = rowHeights[row] + 2 * BAR_GAP_PX
    if (y < top + gross) return row
    top += gross
  }
  return Math.max(0, rowHeights.length - 1)
}

export const colors = darkCanvasColors

type RendererArgs = {
  context: CanvasRenderingContext2D
  el: CanvasElement
  instrument?: string
  selected?: boolean
  isLastInRow?: boolean
  barsPerRow?: number
}

const renderChar = ({ instrument, el, context }: RendererArgs) =>
  font[instrument!]?.[el.note ?? '-']?.(context, el, el.bgColor)

export const renderNoteBackground = ({ context, el }: RendererArgs) => {
  context.fillStyle = el.bgColor
  context.fillRect(el.left, el.top, el.width, el.height)
}

export const renderNote = ({ instrument, el, context }: RendererArgs) => {
  renderNoteBackground({ context, el })
  renderChar({ instrument, el, context })
}

const renderGlyphOnly = ({ instrument, el, context }: RendererArgs) => {
  renderChar({ instrument, el, context })
}

const renderScaledGlyph = ({
  instrument,
  el,
  glyph,
  context,
}: RendererArgs & { glyph: BarGlyph }) => {
  const rect = scaledPolyrhythmNoteRect(el as Required<CanvasElement>, glyph)
  renderChar({
    instrument,
    el: { ...el, ...rect },
    context,
  })
}

export const renderBarWrapper = ({ context, el }: RendererArgs) => {
  context.fillStyle = el.bgColor
  context.lineCap = 'square'
  context.fillRect(el.left, el.top, el.width, el.height)
}

type BarRendererArgs = {
  bars: string[]
  instrument: string
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  canvasWidth: number
  barIndex?: number
  barsPerRow?: number
  highlighted?: boolean
}

type LayoutBarArgs = Omit<BarRendererArgs, 'canvas' | 'context' | 'instrument'> & {
  palette?: CanvasColors
  rowHeights?: number[]
  layout?: BarLayout
}

export type LaidOutBar = {
  barEl: CanvasElement
  noteElements: Required<CanvasElement>[]
  glyphs: BarGlyph[]
}

export const layoutBar = ({
  bars,
  canvasWidth,
  barIndex = 0,
  barsPerRow = 2,
  highlighted = false,
  palette = darkCanvasColors,
  rowHeights,
  layout,
}: LayoutBarArgs): LaidOutBar => {
  const bar = bars[barIndex]
  const { cellCount, glyphs } = layout ?? parseBarLayout(bar, bars, barIndex)
  const barWidth = barWidthForCanvas(canvasWidth, barsPerRow)
  const noteWidth = barWidth / cellCount
  const barHeight = noteHeightFromWidth(noteWidth)
  const beatCells = onBeatCellIndexes(cellCount)
  const resolvedRowHeights = rowHeights ?? rowHeightsForBars(canvasWidth, barsPerRow, bars)
  const top = barTopForIndex(barIndex, barsPerRow, resolvedRowHeights)
  const barLeft = (barIndex % barsPerRow) * (barWidth + BAR_GAP_PX)

  const barEl: CanvasElement = {
    type: 'bar',
    bgColor: highlighted ? palette.g0 : palette.b1,
    width: barWidth,
    height: barHeight,
    top,
    left: barLeft,
    barIndex,
  }

  const noteElements = glyphs.map((glyph, noteIndex) => {
    const cellIndex = Math.floor(glyph.position)
    const isOnBeat = beatCells.includes(cellIndex)

    return {
      type: 'note' as const,
      colour: glyph.note === '-' ? palette.w0 : palette.w2,
      bgColor: isOnBeat
        ? highlighted
          ? palette.g1
          : palette.b2
        : highlighted
          ? palette.g0
          : palette.b1,
      width: noteWidth,
      height: barHeight,
      top,
      left: barLeft + glyph.position * noteWidth,
      note: glyph.note,
      barIndex,
      noteIndex,
    }
  })

  return { barEl, noteElements, glyphs }
}

export const paintLaidOutBar = (
  context: CanvasRenderingContext2D,
  instrument: string,
  laidOut: LaidOutBar,
) => {
  renderBarWrapper({ context, el: laidOut.barEl })

  laidOut.glyphs.forEach((glyph, noteIndex) => {
    if (glyph.kind !== 'eighth') return
    renderNoteBackground({ context, el: laidOut.noteElements[noteIndex] })
  })

  laidOut.glyphs.forEach((glyph, noteIndex) => {
    const note = laidOut.noteElements[noteIndex]
    if (glyph.kind === 'polyrhythm' || glyph.polyrhythmIndex !== undefined) {
      renderScaledGlyph({ instrument, el: note, glyph, context })
      return
    }
    renderGlyphOnly({ instrument, el: note, context })
  })
}

export const renderBar = ({
  bars,
  instrument,
  context,
  canvasWidth,
  barIndex = 0,
  barsPerRow = 2,
  highlighted = false,
  rowHeights,
  layout,
  palette,
}: BarRendererArgs & {
  rowHeights?: number[]
  layout?: BarLayout
  palette?: CanvasColors
}) => {
  const laidOut = layoutBar({
    bars,
    canvasWidth,
    barIndex,
    barsPerRow,
    highlighted,
    rowHeights,
    layout,
    palette,
  })

  paintLaidOutBar(context, instrument, laidOut)
  return [laidOut.barEl, ...laidOut.noteElements]
}

type RenderBarsArgs = Omit<BarRendererArgs, 'barIndex' | 'highlighted'> & {
  highlightedBarIndex?: number
  palette?: CanvasColors
  showBarIndex?: boolean
  markTriplets?: boolean
  /** Pre-parsed notation; when provided, renderBars does not re-parse. */
  parsed?: ParsedBarsNotation
}

const renderBarIndexLabels = (
  context: CanvasRenderingContext2D,
  layouts: LaidOutBar[],
  palette: CanvasColors,
) => {
  layouts.forEach((layout) => {
    const firstNote = layout.noteElements[0]
    if (!firstNote) return
    drawBarIndexLabel(
      context,
      firstNote.left + firstNote.width / 2,
      firstNote.top + firstNote.height,
      layout.barEl.barIndex ?? 0,
      palette.w1,
    )
  })
}

const renderPolyrhythmMarks = (
  context: CanvasRenderingContext2D,
  bars: string[],
  layouts: LaidOutBar[],
  palette: CanvasColors,
  barsPerRow: number,
  parsed?: BracketParsedNotation,
) => {
  context.strokeStyle = palette.w1
  context.fillStyle = palette.w1
  context.lineWidth = 2
  context.font = '7px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'bottom'

  polyrhythmBracketSpans(bars, layouts, barsPerRow, parsed).forEach((span) =>
    drawPolyrhythmBracket(context, span),
  )
}

const renderTripletMarks = (
  context: CanvasRenderingContext2D,
  bars: string[],
  layouts: LaidOutBar[],
  palette: CanvasColors,
  barsPerRow: number,
  parsed?: BracketParsedNotation,
) => {
  context.strokeStyle = palette.w1
  context.fillStyle = palette.w1
  context.lineWidth = 1
  context.font = '7px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'bottom'

  tripletBracketSpans(bars, layouts, barsPerRow, parsed).forEach((span) =>
    drawTripletBracket(context, span),
  )
}

export const renderBars = ({
  bars,
  instrument,
  context,
  canvasWidth,
  barsPerRow = 2,
  highlightedBarIndex = -1,
  palette = darkCanvasColors,
  showBarIndex = false,
  markTriplets = false,
  parsed: preParsed,
}: RenderBarsArgs) => {
  const parsed = preParsed ?? parseBarsNotation(bars)
  const rowHeights = rowHeightsForBars(canvasWidth, barsPerRow, bars, parsed.layouts)
  const layouts = bars.map((_, barIndex) =>
    layoutBar({
      bars,
      canvasWidth,
      barIndex,
      barsPerRow,
      highlighted: barIndex === highlightedBarIndex,
      palette,
      rowHeights,
      layout: parsed.layouts[barIndex],
    }),
  )

  layouts.forEach((layout) => {
    paintLaidOutBar(context, instrument, layout)
  })

  if (markTriplets) {
    const bracketParsed: BracketParsedNotation = {
      segments: parsed.segments,
      barCellCounts: parsed.barCellCounts,
    }
    renderTripletMarks(context, bars, layouts, palette, barsPerRow, bracketParsed)
    renderPolyrhythmMarks(context, bars, layouts, palette, barsPerRow, bracketParsed)
  }
  if (showBarIndex) renderBarIndexLabels(context, layouts, palette)

  return layouts.flatMap((layout) => [layout.barEl, ...layout.noteElements])
}
