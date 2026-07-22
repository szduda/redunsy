import type { GhostBarLayout } from '@/features/editor/canvas/render-editor-bars'
import { layoutGhostBar, renderGhostBar } from '@/features/editor/canvas/render-editor-bars'
import { darkCanvasColors, lightCanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import { ensureCanvasDpi } from '@/features/groovy-player/canvas/canvas-dpi'

export type DragLayoutState = {
  sourceIndex: number
  dropIndex: number
  hoveredBarIndex: number
  grabOffsetX: number
  grabOffsetY: number
}

export type GhostPaintEnv = {
  bars: string[]
  instrument: string
  contentWidth: number
  barsPerRow: number
  paddingX: number
  paddingY: number
  prefersDark: boolean
}

export const copyVisibleToOffscreen = (
  visible: HTMLCanvasElement,
  offscreen: HTMLCanvasElement,
) => {
  offscreen.width = visible.width
  offscreen.height = visible.height
  const context = offscreen.getContext('2d')
  if (!context) return false
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, offscreen.width, offscreen.height)
  context.drawImage(visible, 0, 0)
  return true
}

export const paintGhostOnly = ({
  canvas,
  offscreen,
  dragLayout,
  pointerPos,
  env,
  ghostLayout,
  canvasWidth,
  canvasHeight,
}: {
  canvas: HTMLCanvasElement
  offscreen: HTMLCanvasElement
  dragLayout: DragLayoutState
  pointerPos: { x: number; y: number }
  env: GhostPaintEnv
  ghostLayout: GhostBarLayout | null
  canvasWidth: number
  canvasHeight: number
}) => {
  const draggedBar = env.bars[dragLayout.sourceIndex]
  if (!draggedBar) return

  const context = ensureCanvasDpi(canvas, canvasWidth, canvasHeight)
  if (!context) return

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(offscreen, 0, 0)

  const dpr = canvas.width / Math.max(1, canvasWidth)
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  const palette = env.prefersDark ? darkCanvasColors : lightCanvasColors
  context.save()
  context.translate(env.paddingX, env.paddingY)
  renderGhostBar({
    bar: draggedBar,
    instrument: env.instrument,
    context,
    canvasWidth: env.contentWidth,
    barsPerRow: env.barsPerRow,
    pointerX: pointerPos.x,
    pointerY: pointerPos.y,
    grabOffsetX: dragLayout.grabOffsetX,
    grabOffsetY: dragLayout.grabOffsetY,
    palette,
    ghostLayout: ghostLayout ?? undefined,
  })
  context.restore()
}

export const resolveGhostLayout = ({
  bar,
  contentWidth,
  barsPerRow,
  prefersDark,
  cached,
  cacheKey,
}: {
  bar: string
  contentWidth: number
  barsPerRow: number
  prefersDark: boolean
  cached: { key: string; layout: GhostBarLayout } | null
  cacheKey: string
}): { key: string; layout: GhostBarLayout } => {
  if (cached?.key === cacheKey) return cached
  const palette = prefersDark ? darkCanvasColors : lightCanvasColors
  return {
    key: cacheKey,
    layout: layoutGhostBar({ bar, canvasWidth: contentWidth, barsPerRow, palette }),
  }
}

export const dragLayoutUnchanged = (current: DragLayoutState | null, next: DragLayoutState) =>
  !!current &&
  current.sourceIndex === next.sourceIndex &&
  current.dropIndex === next.dropIndex &&
  current.hoveredBarIndex === next.hoveredBarIndex
