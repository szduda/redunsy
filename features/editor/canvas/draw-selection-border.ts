import type { CanvasElement } from '@/features/groovy-player/canvas/types'

export const YELOWY_BORDER = '#f9c926'

export const drawSelectionBorder = (context: CanvasRenderingContext2D, el: CanvasElement) => {
  context.strokeStyle = YELOWY_BORDER
  context.lineWidth = 2
  context.strokeRect(el.left + 1, el.top + 1, el.width - 2, el.height - 2)
}
