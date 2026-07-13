import {
  DRAG_SOURCE_OVERLAY_OPACITY,
  yellowyOverlay,
} from '@/lib/theme/yellowy'
import { darkCanvasColors, type CanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import {
  BAR_GAP_PX,
  barHeightForBar,
  barTopForIndex,
  barWidthForCanvas,
  layoutBar,
  renderBar,
  rowHeightsForBars,
} from '@/features/groovy-player/canvas/renderers'

export const drawYellowyOverlay = (
  context: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  dark: boolean,
  opacity: number,
) => {
  context.fillStyle = yellowyOverlay(dark, opacity)
  context.fillRect(left, top, width, height)
}

export const drawBarOverlayAtIndex = ({
  barIndex,
  bars,
  canvasWidth,
  barsPerRow,
  context,
  dark,
  opacity,
}: {
  barIndex: number
  bars: string[]
  canvasWidth: number
  barsPerRow: number
  context: CanvasRenderingContext2D
  dark: boolean
  opacity: number
}) => {
  const rowHeights = rowHeightsForBars(canvasWidth, barsPerRow, bars)
  const layout = layoutBar({
    bars,
    canvasWidth,
    barIndex,
    barsPerRow,
    rowHeights,
  })
  drawYellowyOverlay(
    context,
    layout.barEl.left,
    layout.barEl.top,
    layout.barEl.width,
    layout.barEl.height,
    dark,
    opacity,
  )
}

export const drawDragPreviewHighlights = ({
  bars,
  canvasWidth,
  barsPerRow,
  context,
  dark,
  sourceIndex,
  hoveredBarIndex,
}: {
  bars: string[]
  canvasWidth: number
  barsPerRow: number
  context: CanvasRenderingContext2D
  dark: boolean
  sourceIndex: number
  hoveredBarIndex: number
}) => {
  const highlighted = new Set<number>([sourceIndex])
  if (hoveredBarIndex >= 0) highlighted.add(hoveredBarIndex)

  highlighted.forEach((barIndex) => {
    drawBarOverlayAtIndex({
      barIndex,
      bars,
      canvasWidth,
      barsPerRow,
      context,
      dark,
      opacity: DRAG_SOURCE_OVERLAY_OPACITY,
    })
  })
}

export const renderGhostBar = ({
  bar,
  instrument,
  context,
  canvasWidth,
  barsPerRow,
  pointerX,
  pointerY,
  grabOffsetX,
  grabOffsetY,
  palette = darkCanvasColors,
}: {
  bar: string
  instrument: string
  context: CanvasRenderingContext2D
  canvasWidth: number
  barsPerRow: number
  pointerX: number
  pointerY: number
  grabOffsetX: number
  grabOffsetY: number
  palette?: CanvasColors
}) => {
  const rowHeights = [barHeightForBar(canvasWidth, barsPerRow, bar)]
  const layout = layoutBar({
    bars: [bar],
    canvasWidth,
    barIndex: 0,
    barsPerRow,
    palette,
    rowHeights,
  })

  const left = pointerX - grabOffsetX
  const top = pointerY - grabOffsetY
  const dx = left - layout.barEl.left
  const dy = top - layout.barEl.top

  context.save()
  context.translate(dx, dy)
  renderBar({
    bars: [bar],
    instrument,
    canvas: context.canvas,
    context,
    canvasWidth,
    barIndex: 0,
    barsPerRow,
    rowHeights,
  })
  context.restore()
}

export const grabOffsetForBar = (
  barIndex: number,
  bars: string[],
  canvasWidth: number,
  barsPerRow: number,
  pointerX: number,
  pointerY: number,
) => {
  const bounds = barBoundsAtIndex(bars, barIndex, canvasWidth, barsPerRow)
  return {
    grabOffsetX: pointerX - bounds.left,
    grabOffsetY: pointerY - bounds.top,
  }
}

export const barBoundsAtIndex = (
  bars: string[],
  barIndex: number,
  canvasWidth: number,
  barsPerRow: number,
) => {
  const rowHeights = rowHeightsForBars(canvasWidth, barsPerRow, bars)
  const barWidth = barWidthForCanvas(canvasWidth, barsPerRow)
  const bar = bars[barIndex] ?? ''
  const height = barHeightForBar(canvasWidth, barsPerRow, bar)
  const top = barTopForIndex(barIndex, barsPerRow, rowHeights)
  const left = (barIndex % barsPerRow) * (barWidth + BAR_GAP_PX)
  return { left, top, width: barWidth, height }
}
