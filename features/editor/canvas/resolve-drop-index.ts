import { canvasLogicalPoint } from '@/features/editor/canvas/canvas-pointer'
import type { DragSlot } from '@/features/editor/notation/reorder-bars'
import { BAR_GAP_PX } from '@/features/groovy-player/canvas/renderers'

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
  elements: { type: string; barIndex?: number; left: number; top: number; width: number; height: number }[],
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
  barHeight: number,
  barsPerRow: number,
) => {
  const barHeightGross = barHeight + 2 * BAR_GAP_PX
  const barWidth = (canvasWidth - (barsPerRow - 1) * BAR_GAP_PX) / barsPerRow
  const row = Math.max(0, Math.floor(y / barHeightGross))
  const col = Math.max(0, Math.min(Math.floor(x / (barWidth + BAR_GAP_PX)), barsPerRow - 1))
  return { slotIndex: row * barsPerRow + col, barWidth, barHeightGross }
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
  barHeight: number,
  barsPerRow: number,
  slots: DragSlot[],
  currentDrop: number,
) => {
  if (!slots.length) return sourceIndex

  const { slotIndex, barWidth, barHeightGross } = slotIndexFromPoint(
    x,
    y,
    canvasWidth,
    barHeight,
    barsPerRow,
  )

  const lastSlotIndex = slots.length - 1
  const lastRow = Math.floor(lastSlotIndex / barsPerRow)
  const lastCol = lastSlotIndex % barsPerRow
  const lastLeft = lastCol * (barWidth + BAR_GAP_PX)
  const lastTop = lastRow * barHeightGross

  const pastLastHorizontally = x >= lastLeft + barWidth
  const belowLastBar = y >= lastTop + barHeight
  if (pastLastHorizontally || belowLastBar) return barCount

  if (slotIndex >= slots.length) return barCount

  const slot = slots[slotIndex]
  if (slot.originalIndex === null) return currentDrop

  return slot.originalIndex
}
