import { darkCanvasColors, type CanvasColors } from './canvas-colors'
import { font } from './drum-font'
import { onBeatCellIndexes, parseBarLayout } from './bar-layout'

import type { BarGlyph } from './bar-layout'
import type { CanvasElement } from './types'

export const BAR_GAP_PX = 1
export const BAR_HEIGHT_PX = 32
export const BAR_HEIGHT_LARGE_PX = 48

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
  barHeight: number
  barIndex?: number
  barsPerRow?: number
  highlighted?: boolean
}

type LayoutBarArgs = Omit<BarRendererArgs, 'canvas' | 'context' | 'instrument'> & {
  palette?: CanvasColors
}

export type LaidOutBar = {
  barEl: CanvasElement
  noteElements: Required<CanvasElement>[]
  glyphs: BarGlyph[]
}

export const layoutBar = ({
  bars,
  canvasWidth,
  barHeight,
  barIndex = 0,
  barsPerRow = 2,
  highlighted = false,
  palette = darkCanvasColors,
}: LayoutBarArgs): LaidOutBar => {
  const bar = bars[barIndex]
  const { cellCount, glyphs } = parseBarLayout(bar)
  const barHeightGross = barHeight + 2 * BAR_GAP_PX
  const barWidth = (canvasWidth - (barsPerRow - 1) * BAR_GAP_PX) / barsPerRow
  const eighthWidth = barWidth / cellCount
  const beatCells = onBeatCellIndexes(cellCount)
  const top = Math.trunc(barIndex / barsPerRow) * barHeightGross
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
      width: eighthWidth,
      height: barHeight,
      top,
      left: barLeft + glyph.position * eighthWidth,
      note: glyph.note,
      barIndex,
      noteIndex,
    }
  })

  return { barEl, noteElements, glyphs }
}

export const renderBar = ({
  bars,
  instrument,
  context,
  canvasWidth,
  barHeight,
  barIndex = 0,
  barsPerRow = 2,
  highlighted = false,
}: BarRendererArgs) => {
  const layout = layoutBar({
    bars,
    canvasWidth,
    barHeight,
    barIndex,
    barsPerRow,
    highlighted,
  })

  renderBarWrapper({ context, el: layout.barEl })

  layout.glyphs.forEach((glyph, noteIndex) => {
    if (glyph.kind !== 'eighth') return
    renderNoteBackground({ context, el: layout.noteElements[noteIndex] })
  })

  layout.glyphs.forEach((_, noteIndex) => {
    renderGlyphOnly({ instrument, el: layout.noteElements[noteIndex], context })
  })

  return [layout.barEl, ...layout.noteElements]
}

type RenderBarsArgs = Omit<BarRendererArgs, 'barIndex' | 'highlighted'> & {
  highlightedBarIndex?: number
  palette?: CanvasColors
}

export const renderBars = ({
  bars,
  instrument,
  context,
  canvasWidth,
  barHeight,
  barsPerRow = 2,
  highlightedBarIndex = -1,
  palette = darkCanvasColors,
}: RenderBarsArgs) => {
  const layouts = bars.map((_, barIndex) =>
    layoutBar({
      bars,
      canvasWidth,
      barHeight,
      barIndex,
      barsPerRow,
      highlighted: barIndex === highlightedBarIndex,
      palette,
    }),
  )

  layouts.forEach((layout) => {
    renderBarWrapper({ context, el: layout.barEl })
  })

  layouts.forEach((layout) => {
    layout.glyphs.forEach((glyph, noteIndex) => {
      if (glyph.kind !== 'eighth') return
      renderNoteBackground({ context, el: layout.noteElements[noteIndex] })
    })
  })

  layouts.forEach((layout) => {
    layout.glyphs.forEach((_, noteIndex) => {
      renderGlyphOnly({ instrument, el: layout.noteElements[noteIndex], context })
    })
  })

  return layouts.flatMap((layout) => [layout.barEl, ...layout.noteElements])
}
