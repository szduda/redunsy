import { YELOWY_BORDER } from '@/features/editor/canvas/draw-selection-border'
import type { DragSlot } from '@/features/editor/notation/reorder-bars'
import { darkCanvasColors, type CanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import {
  BAR_GAP_PX,
  barTopForIndex,
  barWidthForCanvas,
  layoutBar,
  renderBar,
  rowHeightsForBars,
} from '@/features/groovy-player/canvas/renderers'
import type { CanvasElement } from '@/features/groovy-player/canvas/types'

type RenderEditorBarSlotsArgs = {
  slots: DragSlot[]
  instrument: string
  context: CanvasRenderingContext2D
  canvasWidth: number
  barsPerRow: number
  palette?: CanvasColors
}

const drawGapSlot = (
  context: CanvasRenderingContext2D,
  slotIndex: number,
  canvasWidth: number,
  barsPerRow: number,
  rowHeights: number[],
) => {
  const barWidth = barWidthForCanvas(canvasWidth, barsPerRow)
  const row = Math.trunc(slotIndex / barsPerRow)
  const barHeight = rowHeights[row] ?? 0
  const top = barTopForIndex(slotIndex, barsPerRow, rowHeights)
  const left = (slotIndex % barsPerRow) * (barWidth + BAR_GAP_PX)

  context.fillStyle = 'rgba(249, 201, 38, 0.08)'
  context.fillRect(left, top, barWidth, barHeight)
  context.strokeStyle = YELOWY_BORDER
  context.lineWidth = 2
  context.setLineDash([5, 4])
  context.strokeRect(left + 1, top + 1, barWidth - 2, barHeight - 2)
  context.setLineDash([])
}

export const renderEditorBarSlots = ({
  slots,
  instrument,
  context,
  canvasWidth,
  barsPerRow,
  palette = darkCanvasColors,
}: RenderEditorBarSlotsArgs) => {
  const barsForLayout = slots.map((slot) => slot.bar ?? '-'.repeat(8))
  const rowHeights = rowHeightsForBars(canvasWidth, barsPerRow, barsForLayout)
  const elements: CanvasElement[] = []

  slots.forEach((slot, slotIndex) => {
    if (slot.bar === null) {
      drawGapSlot(context, slotIndex, canvasWidth, barsPerRow, rowHeights)
      return
    }

    const slotElements = renderBar({
      bars: barsForLayout,
      instrument,
      canvas: context.canvas,
      context,
      canvasWidth,
      barIndex: slotIndex,
      barsPerRow,
      rowHeights,
    })
    elements.push(...slotElements)
  })

  return elements
}

export const renderGhostBar = ({
  bar,
  instrument,
  context,
  canvasWidth,
  pointerX,
  pointerY,
  palette = darkCanvasColors,
}: {
  bar: string
  instrument: string
  context: CanvasRenderingContext2D
  canvasWidth: number
  pointerX: number
  pointerY: number
  palette?: CanvasColors
}) => {
  const layout = layoutBar({
    bars: [bar],
    canvasWidth,
    barIndex: 0,
    barsPerRow: 1,
    palette,
  })

  const centerX = layout.barEl.left + layout.barEl.width / 2
  const centerY = layout.barEl.top + layout.barEl.height / 2
  const dx = pointerX - centerX
  const dy = pointerY - centerY

  context.save()
  context.globalAlpha = 0.8
  context.translate(dx, dy)
  renderBar({
    bars: [bar],
    instrument,
    canvas: context.canvas,
    context,
    canvasWidth,
    barIndex: 0,
    barsPerRow: 1,
  })
  context.restore()
}
