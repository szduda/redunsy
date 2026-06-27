import { yellowyBorderColor } from '@/lib/theme/yellowy'

import type { CanvasElement } from '@/features/groovy-player/canvas/types'

const BAR_MARKER_MARGIN_PX = 3
const BAR_MARKER_EXTRA_HEIGHT_PX = 4

export const drawSelectionBorder = (
  context: CanvasRenderingContext2D,
  el: CanvasElement,
  dark: boolean,
) => {
  context.strokeStyle = yellowyBorderColor(dark)
  context.lineWidth = 2
  context.strokeRect(el.left + 1, el.top + 1, el.width - 2, el.height - 2)
}

export const drawBarSelectionBorder = (
  context: CanvasRenderingContext2D,
  el: CanvasElement,
  dark: boolean,
) => {
  const { left, top, width, height } = el
  const stroke = yellowyBorderColor(dark)

  context.strokeStyle = stroke
  context.lineWidth = 2
  context.strokeRect(left + 1, top + 1, width - 2, height - 2)

  const markerX = left + width - BAR_MARKER_MARGIN_PX
  const markerTop = top - BAR_MARKER_EXTRA_HEIGHT_PX
  const markerBottom = top + height + BAR_MARKER_EXTRA_HEIGHT_PX

  context.beginPath()
  context.moveTo(markerX, markerTop)
  context.lineTo(markerX, markerBottom)
  context.stroke()
}
