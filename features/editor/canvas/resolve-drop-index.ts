import { canvasLogicalPoint } from '@/features/editor/canvas/canvas-pointer'
import type { DragSlot } from '@/features/editor/notation/reorder-bars'
import {
  BAR_GAP_PX,
  barTopForIndex,
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

export const resolveDropIndex = (
  barCount: number,
  sourceIndex: number,
  x: number,
  y: number,
  barBounds: BarBounds[],
) => {
  if (!barBounds.length) return sourceIndex

  const last = barBounds.reduce((current, candidate) =>
    candidate.barIndex > current.barIndex ? candidate : current,
  )

  const pastLastHorizontally = x >= last.left + last.width
  const belowLastBar = y >= last.top + last.height
  if (pastLastHorizontally || belowLastBar) return barCount

  const hovered = barBounds.find(
    (bar) => x >= bar.left && x < bar.left + bar.width && y >= bar.top && y < bar.top + bar.height,
  )

  if (hovered) return hovered.barIndex

  return sourceIndex
}

export const resolveDropIndexFromDrag = (
  barCount: number,
  sourceIndex: number,
  x: number,
  y: number,
  canvasWidth: number,
  barsPerRow: number,
  slots: DragSlot[],
  currentDrop: number,
) => {
  if (!slots.length) return sourceIndex

  const slotBars = slots.map((slot) => slot.bar ?? '-'.repeat(8))
  const { slotIndex, barWidth, rowHeights } = slotIndexFromPoint(
    x,
    y,
    canvasWidth,
    barsPerRow,
    slotBars,
  )

  const lastSlotIndex = slots.length - 1
  const lastRow = Math.floor(lastSlotIndex / barsPerRow)
  const lastLeft = (lastSlotIndex % barsPerRow) * (barWidth + BAR_GAP_PX)
  const lastTop = barTopForIndex(lastSlotIndex, barsPerRow, rowHeights)
  const lastBarHeight = rowHeights[lastRow] ?? 0

  const pastLastHorizontally = x >= lastLeft + barWidth
  const belowLastBar = y >= lastTop + lastBarHeight
  if (pastLastHorizontally || belowLastBar) return barCount

  if (slotIndex >= slots.length) return barCount

  const slot = slots[slotIndex]
  if (slot.originalIndex === null) return currentDrop

  return slot.originalIndex
}
