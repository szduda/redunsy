import {
  drawBarSelectionBorder,
  drawSelectionBorder,
} from '@/features/editor/canvas/draw-selection-border'
import {
  copyVisibleToOffscreen,
  resolveGhostLayout,
  type DragLayoutState,
} from '@/features/editor/canvas/bar-drag-paint'
import {
  drawDragPreviewHighlights,
  renderGhostBar,
  type GhostBarLayout,
} from '@/features/editor/canvas/render-editor-bars'
import { previewBarsForDrag } from '@/features/editor/notation/reorder-bars'
import type { SelectionMode } from '@/features/editor/use-note-editor'
import { darkCanvasColors, lightCanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import { getDevicePixelRatio, setupCanvasDpi } from '@/features/groovy-player/canvas/canvas-dpi'
import {
  cachedParseBarsNotation,
  type ParsedBarsNotation,
} from '@/features/groovy-player/canvas/bar-layout'
import {
  renderBars,
  rowHeightsForBars,
  type LaidOutBar,
} from '@/features/groovy-player/canvas/renderers'
import {
  blitAndHighlightBar,
  paintStaticBars,
  staticBarsKey,
} from '@/features/groovy-player/canvas/static-bars-layer'
import type { CanvasElement } from '@/features/groovy-player/canvas/types'

export type StaticFrameCache = {
  key: string
  layouts: LaidOutBar[]
  rowHeights: number[]
  elements: CanvasElement[]
}

export type PaintDragFrameArgs = {
  canvas: HTMLCanvasElement
  bars: string[]
  instrument: string
  canvasWidth: number
  canvasHeight: number
  contentWidth: number
  paddingX: number
  paddingY: number
  barsPerRow: number
  prefersDark: boolean
  showBarIndex: boolean
  markTriplets: boolean
  parsed: ParsedBarsNotation
  dragLayout: DragLayoutState
  pointerPos: { x: number; y: number }
  offscreenRef: { current: HTMLCanvasElement | null }
  ghostLayoutRef: { current: { key: string; layout: GhostBarLayout } | null }
  canvasElementsRef: { current: CanvasElement[] }
}

export const paintDragFrame = ({
  canvas,
  bars,
  instrument,
  canvasWidth,
  canvasHeight,
  contentWidth,
  paddingX,
  paddingY,
  barsPerRow,
  prefersDark,
  showBarIndex,
  markTriplets,
  parsed,
  dragLayout,
  pointerPos,
  offscreenRef,
  ghostLayoutRef,
  canvasElementsRef,
}: PaintDragFrameArgs) => {
  const context = setupCanvasDpi(canvas, canvasWidth, canvasHeight)
  if (!context) return

  const palette = prefersDark ? darkCanvasColors : lightCanvasColors
  context.fillStyle = palette.b0
  context.fillRect(0, 0, canvasWidth, canvasHeight)

  const draggedBar = bars[dragLayout.sourceIndex]
  const isDragPreview = dragLayout.dropIndex !== dragLayout.sourceIndex
  const barsToRender = isDragPreview
    ? previewBarsForDrag(bars, dragLayout.sourceIndex, dragLayout.dropIndex)
    : bars
  const renderParsed = isDragPreview ? cachedParseBarsNotation(barsToRender) : parsed

  context.save()
  context.translate(paddingX, paddingY)
  canvasElementsRef.current = renderBars({
    bars: barsToRender,
    instrument,
    canvas,
    context,
    canvasWidth: contentWidth,
    barsPerRow,
    highlightedBarIndex: -1,
    palette,
    showBarIndex,
    markTriplets,
    parsed: renderParsed,
  })

  if (isDragPreview) {
    drawDragPreviewHighlights({
      bars: barsToRender,
      canvasWidth: contentWidth,
      barsPerRow,
      context,
      dark: prefersDark,
      sourceIndex: dragLayout.sourceIndex,
      hoveredBarIndex: dragLayout.hoveredBarIndex,
      layouts: renderParsed.layouts,
      rowHeights: rowHeightsForBars(contentWidth, barsPerRow, barsToRender, renderParsed.layouts),
    })
  }
  context.restore()

  if (!draggedBar) return

  if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas')
  copyVisibleToOffscreen(canvas, offscreenRef.current)

  const ghostKey = `${draggedBar}|${contentWidth}|${barsPerRow}|${prefersDark ? 'd' : 'l'}`
  ghostLayoutRef.current = resolveGhostLayout({
    bar: draggedBar,
    contentWidth,
    barsPerRow,
    prefersDark,
    cached: ghostLayoutRef.current,
    cacheKey: ghostKey,
  })

  context.save()
  context.translate(paddingX, paddingY)
  renderGhostBar({
    bar: draggedBar,
    instrument,
    context,
    canvasWidth: contentWidth,
    barsPerRow,
    pointerX: pointerPos.x,
    pointerY: pointerPos.y,
    grabOffsetX: dragLayout.grabOffsetX,
    grabOffsetY: dragLayout.grabOffsetY,
    palette,
    ghostLayout: ghostLayoutRef.current.layout,
  })
  context.restore()
}

export type PaintPlayheadFrameArgs = {
  canvas: HTMLCanvasElement
  staticCanvas: HTMLCanvasElement
  staticCacheRef: { current: StaticFrameCache | null }
  bars: string[]
  hash: string
  instrument: string
  canvasWidth: number
  canvasHeight: number
  contentWidth: number
  paddingX: number
  paddingY: number
  barsPerRow: number
  dpr: number
  prefersDark: boolean
  showBarIndex: boolean
  markTriplets: boolean
  parsed: ParsedBarsNotation
  highlightedBarIndex: number
  previewSelection: { barIndex: number; glyphIndex: number } | null
  selectionMode: SelectionMode
  canvasElementsRef: { current: CanvasElement[] }
}

export const paintPlayheadFrame = ({
  canvas,
  staticCanvas,
  staticCacheRef,
  bars,
  hash,
  instrument,
  canvasWidth,
  canvasHeight,
  contentWidth,
  paddingX,
  paddingY,
  barsPerRow,
  dpr,
  prefersDark,
  showBarIndex,
  markTriplets,
  parsed,
  highlightedBarIndex,
  previewSelection,
  selectionMode,
  canvasElementsRef,
}: PaintPlayheadFrameArgs) => {
  const palette = prefersDark ? darkCanvasColors : lightCanvasColors
  const key = staticBarsKey({
    hash,
    canvasWidth,
    canvasHeight,
    dpr: dpr || getDevicePixelRatio(),
    barsPerRow,
    instrument,
    theme: prefersDark ? 'dark' : 'light',
    showBarIndex,
    markTriplets,
    paddingX,
    paddingY,
    contentWidth,
  })

  let staticCache = staticCacheRef.current
  if (!staticCache || staticCache.key !== key) {
    const painted = paintStaticBars({
      staticCanvas,
      bars,
      instrument,
      canvasWidth,
      canvasHeight,
      contentWidth,
      paddingX,
      paddingY,
      barsPerRow,
      palette,
      showBarIndex,
      markTriplets,
      parsed,
    })
    if (!painted) return
    staticCache = {
      key,
      layouts: painted.layouts,
      rowHeights: painted.rowHeights,
      elements: painted.elements,
    }
    staticCacheRef.current = staticCache
  }
  canvasElementsRef.current = staticCache.elements

  const context = blitAndHighlightBar({
    visibleCanvas: canvas,
    staticCanvas,
    bars,
    instrument,
    canvasWidth,
    canvasHeight,
    contentWidth,
    paddingX,
    paddingY,
    barsPerRow,
    highlightedBarIndex,
    palette,
    showBarIndex,
    markTriplets,
    parsed,
    layouts: staticCache.layouts,
    rowHeights: staticCache.rowHeights,
  })
  if (!context || !previewSelection) return

  context.save()
  context.translate(paddingX, paddingY)
  if (selectionMode === 'bar') {
    const selectedBar = canvasElementsRef.current.find(
      (element) => element.type === 'bar' && element.barIndex === previewSelection.barIndex,
    )
    if (selectedBar) drawBarSelectionBorder(context, selectedBar, prefersDark)
  } else {
    const selected = canvasElementsRef.current.find(
      (element) =>
        element.type === 'note' &&
        element.barIndex === previewSelection.barIndex &&
        element.noteIndex === previewSelection.glyphIndex,
    )
    if (selected) drawSelectionBorder(context, selected, prefersDark)
  }
  context.restore()
}
