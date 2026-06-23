import { yellowyBorderColor } from '@/lib/theme/yellowy'

import type { CanvasElement } from '@/features/groovy-player/canvas/types'

export const drawSelectionBorder = (
  context: CanvasRenderingContext2D,
  el: CanvasElement,
  dark: boolean,
) => {
  context.strokeStyle = yellowyBorderColor(dark)
  context.lineWidth = 2
  context.strokeRect(el.left + 1, el.top + 1, el.width - 2, el.height - 2)
}
