import { font } from './drum-font'
import { onBeatCellIndexes, parseBarLayout } from './bar-layout'

import type { CanvasElement } from './types'

export const BAR_GAP_PX = 1
export const BAR_HEIGHT_PX = 32
export const BAR_HEIGHT_LARGE_PX = 48

export const colors = {
  b0: '#121211',
  b1: '#141414',
  b2: '#1f1f1f',
  w0: '#666',
  w1: '#afafaf',
  w2: '#d4d4d4',
  g0: '#131',
  g1: '#242',
}

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

export const renderNote = ({ instrument, el, context }: RendererArgs) => {
  context.fillStyle = el.bgColor
  context.fillRect(el.left, el.top, el.width, el.height)
  renderChar({ instrument, el, context })
}

const renderGlyphOnly = ({ instrument, el, context }: RendererArgs) => {
  renderChar({ instrument, el, context })
}

export const renderBarWrapper = ({ context, el, isLastInRow }: RendererArgs) => {
  context.fillStyle = el.bgColor
  context.lineCap = 'square'
  context.fillRect(el.left, el.top, el.width, el.height)

  if (isLastInRow) return

  context.beginPath()
  context.moveTo(el.left + el.width + 2, el.top + 1)
  context.lineTo(el.left + el.width + 2, el.top + el.height - 1)
  context.strokeStyle = colors.w0
  context.lineWidth = 2
  context.stroke()
  context.closePath()
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
    bgColor: highlighted ? colors.g0 : colors.b1,
    width: barWidth,
    height: barHeight,
    top,
    left: barLeft,
    barIndex,
  }

  renderBarWrapper({
    context,
    el: barEl,
    isLastInRow: !((barEl.barIndex! + 1) % barsPerRow),
  })

  const toNoteEl = (glyph: (typeof glyphs)[number], noteIndex: number): Required<CanvasElement> => {
    const cellIndex = Math.floor(glyph.position)
    const isOnBeat = beatCells.includes(cellIndex)

    return {
      type: 'note',
      colour: glyph.note === '-' ? colors.w0 : colors.w2,
      bgColor: isOnBeat
        ? highlighted
          ? colors.g1
          : colors.b2
        : highlighted
          ? colors.g0
          : colors.b1,
      width: eighthWidth,
      height: barHeight,
      top,
      left: barLeft + glyph.position * eighthWidth,
      note: glyph.note,
      barIndex,
      noteIndex,
    }
  }

  const noteElements = glyphs.map((glyph, noteIndex) => toNoteEl(glyph, noteIndex))

  glyphs.forEach((glyph, noteIndex) => {
    if (glyph.kind !== 'eighth') return
    renderNote({ instrument, el: noteElements[noteIndex], context })
  })

  glyphs.forEach((glyph, noteIndex) => {
    if (glyph.kind === 'eighth') return
    renderGlyphOnly({ instrument, el: noteElements[noteIndex], context })
  })

  return [barEl, ...noteElements]
}
