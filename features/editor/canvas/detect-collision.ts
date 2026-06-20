import { canvasLogicalPoint, detectNoteAtPoint } from '@/features/editor/canvas/canvas-pointer'
import type { CanvasElement } from '@/features/groovy-player/canvas/types'

export const detectCollision = (
  canvas: HTMLCanvasElement,
  canvasElements: CanvasElement[],
  event: { clientX: number; clientY: number },
  logicalWidth: number,
  logicalHeight: number,
) => {
  const { x, y } = canvasLogicalPoint(canvas, event, logicalWidth, logicalHeight)
  return detectNoteAtPoint(canvasElements, x, y)
}
