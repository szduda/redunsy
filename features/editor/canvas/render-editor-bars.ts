import {
  DRAG_SOURCE_OVERLAY_OPACITY,
  DRAG_SOURCE_SLOT_OVERLAY_OPACITY,
  yellowyOverlay,
} from '@/lib/theme/yellowy'
import { darkCanvasColors, type CanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import { parseBarsLayout, type BarLayout } from '@/features/groovy-player/canvas/bar-layout'
import {
  BAR_GAP_PX,
  barHeightForBar,
  barHeightForCellCount,
  barTopForIndex,
  barWidthForCanvas,
  layoutBar,
  paintLaidOutBar,
  rowHeightsForBars,
  type LaidOutBar,
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
  rowHeights,
  layouts,
}: {
  barIndex: number
  bars: string[]
  canvasWidth: number
  barsPerRow: number
  context: CanvasRenderingContext2D
  dark: boolean
  opacity: number
  rowHeights?: number[]
  layouts?: BarLayout[]
}) => {
  const resolvedLayouts = layouts ?? parseBarsLayout(bars)
  const resolvedRowHeights =
    rowHeights ?? rowHeightsForBars(canvasWidth, barsPerRow, bars, resolvedLayouts)
  const layout = layoutBar({
    bars,
    canvasWidth,
    barIndex,
    barsPerRow,
    rowHeights: resolvedRowHeights,
    layout: resolvedLayouts[barIndex],
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
  layouts: precomputedLayouts,
  rowHeights: precomputedRowHeights,
}: {
  bars: string[]
  canvasWidth: number
  barsPerRow: number
  context: CanvasRenderingContext2D
  dark: boolean
  sourceIndex: number
  hoveredBarIndex: number
  layouts?: BarLayout[]
  rowHeights?: number[]
}) => {
  const highlighted = new Set<number>([sourceIndex])
  if (hoveredBarIndex >= 0) highlighted.add(hoveredBarIndex)
  const layouts = precomputedLayouts ?? parseBarsLayout(bars)
  const rowHeights =
    precomputedRowHeights ?? rowHeightsForBars(canvasWidth, barsPerRow, bars, layouts)

  highlighted.forEach((barIndex) => {
    drawBarOverlayAtIndex({
      barIndex,
      bars,
      canvasWidth,
      barsPerRow,
      context,
      dark,
      rowHeights,
      layouts,
      opacity:
        barIndex === sourceIndex ? DRAG_SOURCE_SLOT_OVERLAY_OPACITY : DRAG_SOURCE_OVERLAY_OPACITY,
    })
  })
}

export type GhostBarLayout = {
  laidOut: LaidOutBar
  rowHeights: number[]
}

export const layoutGhostBar = ({
  bar,
  canvasWidth,
  barsPerRow,
  palette = darkCanvasColors,
}: {
  bar: string
  canvasWidth: number
  barsPerRow: number
  palette?: CanvasColors
}): GhostBarLayout => {
  const rowHeights = [barHeightForBar(canvasWidth, barsPerRow, bar)]
  const laidOut = layoutBar({
    bars: [bar],
    canvasWidth,
    barIndex: 0,
    barsPerRow,
    palette,
    rowHeights,
  })
  return { laidOut, rowHeights }
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
  ghostLayout,
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
  ghostLayout?: GhostBarLayout
}) => {
  const { laidOut } = ghostLayout ?? layoutGhostBar({ bar, canvasWidth, barsPerRow, palette })

  const left = pointerX - grabOffsetX
  const top = pointerY - grabOffsetY
  const dx = left - laidOut.barEl.left
  const dy = top - laidOut.barEl.top

  context.save()
  context.translate(dx, dy)
  paintLaidOutBar(context, instrument, laidOut)
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
  const layouts = parseBarsLayout(bars)
  const rowHeights = rowHeightsForBars(canvasWidth, barsPerRow, bars, layouts)
  const barWidth = barWidthForCanvas(canvasWidth, barsPerRow)
  const height = barHeightForCellCount(
    canvasWidth,
    barsPerRow,
    layouts[barIndex]?.cellCount ?? 0,
  )
  const top = barTopForIndex(barIndex, barsPerRow, rowHeights)
  const left = (barIndex % barsPerRow) * (barWidth + BAR_GAP_PX)
  return { left, top, width: barWidth, height }
}
