import type { CanvasElement } from '@/features/groovy-player/canvas/types'

export const canvasLogicalPoint = (
  canvas: HTMLCanvasElement,
  event: { clientX: number; clientY: number },
  logicalWidth: number,
  logicalHeight: number,
) => {
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return { x: -1, y: -1 }

  return {
    x: ((event.clientX - rect.left) / rect.width) * logicalWidth,
    y: ((event.clientY - rect.top) / rect.height) * logicalHeight,
  }
}

export const detectNoteAtPoint = (canvasElements: CanvasElement[], x: number, y: number) => {
  const index = canvasElements.findIndex(
    (element) =>
      element.type === 'note' &&
      element.barIndex !== undefined &&
      element.noteIndex !== undefined &&
      y >= element.top &&
      y <= element.top + element.height &&
      x >= element.left &&
      x <= element.left + element.width,
  )

  return { element: canvasElements[index], index }
}

export const detectBarAtPoint = (canvasElements: CanvasElement[], x: number, y: number) => {
  const bar = canvasElements.find(
    (element) =>
      element.type === 'bar' &&
      element.barIndex !== undefined &&
      y >= element.top &&
      y <= element.top + element.height &&
      x >= element.left &&
      x <= element.left + element.width,
  )

  return bar?.barIndex ?? -1
}
