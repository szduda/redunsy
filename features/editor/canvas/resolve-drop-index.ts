import { canvasLogicalPoint } from '@/features/editor/canvas/canvas-pointer'
import { barBoundsAtIndex } from '@/features/editor/canvas/render-editor-bars'
import {
  BAR_GAP_PX,
  barWidthForCanvas,
  rowHeightsForBars,
  rowIndexFromY,
} from '@/features/groovy-player/canvas/renderers'

export const canvasPointFromPage = (
  canvas: HTMLCanvasElement,
  event: { clientX: number; clientY: number },
  logicalWidth: number,
  logicalHeight: number,
) => canvasLogicalPoint(canvas, event, logicalWidth, logicalHeight)

export type BarBounds = {
  barIndex: number
  left: number
  top: number
  width: number
  height: number
}

export const barBoundsForBars = (
  bars: string[],
  canvasWidth: number,
  barsPerRow: number,
): BarBounds[] =>
  bars.map((_, barIndex) => ({
    barIndex,
    ...barBoundsAtIndex(bars, barIndex, canvasWidth, barsPerRow),
  }))

export const barBoundsFromElements = (
  elements: {
    type: string
    barIndex?: number
    left: number
    top: number
    width: number
    height: number
  }[],
) =>
  elements
    .filter((element) => element.type === 'bar' && element.barIndex !== undefined)
    .map((element) => ({
      barIndex: element.barIndex!,
      left: element.left,
      top: element.top,
      width: element.width,
      height: element.height,
    }))

export type BarDropTarget = {
  dropIndex: number
  hoveredBarIndex: number
}

export const resolveBarDropTarget = (
  barCount: number,
  sourceIndex: number,
  x: number,
  y: number,
  barBounds: BarBounds[],
): BarDropTarget => {
  if (!barBounds.length) return { dropIndex: sourceIndex, hoveredBarIndex: -1 }

  const first = barBounds[0]
  if (x < first.left) return { dropIndex: 0, hoveredBarIndex: -1 }

  const last = barBounds[barCount - 1]
  const pastLastHorizontally = x >= last.left + last.width
  const belowLastBar = y >= last.top + last.height
  if (pastLastHorizontally || belowLastBar) {
    return { dropIndex: barCount, hoveredBarIndex: barCount - 1 }
  }

  const hovered = barBounds.find(
    (bar) => x >= bar.left && x < bar.left + bar.width && y >= bar.top && y < bar.top + bar.height,
  )

  if (!hovered) return { dropIndex: sourceIndex, hoveredBarIndex: -1 }
  if (hovered.barIndex === sourceIndex) {
    return { dropIndex: sourceIndex, hoveredBarIndex: sourceIndex }
  }

  const dropIndex = sourceIndex > hovered.barIndex ? hovered.barIndex : hovered.barIndex + 1

  return { dropIndex, hoveredBarIndex: hovered.barIndex }
}

export const slotIndexFromPoint = (
  x: number,
  y: number,
  canvasWidth: number,
  barsPerRow: number,
  bars: string[],
) => {
  const barWidth = barWidthForCanvas(canvasWidth, barsPerRow)
  const rowHeights = rowHeightsForBars(canvasWidth, barsPerRow, bars)
  const row = rowIndexFromY(y, rowHeights)
  const col = Math.max(0, Math.min(Math.floor(x / (barWidth + BAR_GAP_PX)), barsPerRow - 1))
  return { slotIndex: row * barsPerRow + col, barWidth, rowHeights, row }
}
