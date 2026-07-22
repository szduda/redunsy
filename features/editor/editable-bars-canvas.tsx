'use client'

import { memo, useLayoutEffect, useRef, useState } from 'react'

import {
  canvasLogicalPoint,
  detectBarAtPoint,
  detectNoteAtPoint,
} from '@/features/editor/canvas/canvas-pointer'
import {
  barBoundsFromElements,
  resolveBarDropTarget,
  type BarBounds,
} from '@/features/editor/canvas/resolve-drop-index'
import {
  drawBarSelectionBorder,
  drawSelectionBorder,
} from '@/features/editor/canvas/draw-selection-border'
import { editorCanvasInsets } from '@/features/editor/canvas/editor-canvas-padding'
import {
  drawDragPreviewHighlights,
  grabOffsetForBar,
  renderGhostBar,
} from '@/features/editor/canvas/render-editor-bars'
import { previewBarsForDrag } from '@/features/editor/notation/reorder-bars'
import { useNoteSelectionStore } from '@/features/editor/note-selection.store'
import type { SelectionMode } from '@/features/editor/use-note-editor'
import { setupCanvasDpi } from '@/features/groovy-player/canvas/canvas-dpi'
import { darkCanvasColors, lightCanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import { findPatternLength } from '@/features/groovy-player/canvas/find-pattern-length'
import { parseBarsNotation } from '@/features/groovy-player/canvas/bar-layout'
import {
  canvasHeightForBars,
  renderBars,
  rowHeightsForBars,
} from '@/features/groovy-player/canvas/renderers'
import { useCanvasWidth } from '@/features/groovy-player/canvas/use-canvas-width'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { useIsDark } from '@/features/store/theme.store'
import { cn } from '@/features/theme/cn'
import type { CanvasElement } from '@/features/groovy-player/canvas/types'

const DRAG_THRESHOLD_PX = 6

type DragLayoutState = {
  sourceIndex: number
  dropIndex: number
  hoveredBarIndex: number
  grabOffsetX: number
  grabOffsetY: number
}

const isPointerOutsideCanvas = (
  canvas: HTMLCanvasElement,
  event: { clientX: number; clientY: number },
) => {
  const rect = canvas.getBoundingClientRect()
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
}

type EditableBarsCanvasProps = {
  id: string
  bars: string[]
  barsPerRow: number
  instrument: string
  beatSize: number
  activeIndex?: number
  selectionMode: SelectionMode
  onSelectNote: (barIndex: number, glyphIndex: number) => void
  onSelectBar: (barIndex: number) => void
  onReorderBar: (from: number, to: number) => void
}

const EditableBars = ({
  bars,
  barsPerRow,
  instrument,
  beatSize,
  activeIndex = -1,
  onSelectNote,
  onSelectBar,
  onReorderBar,
  selectionMode,
  id,
}: EditableBarsCanvasProps) => {
  const previewSelection = useNoteSelectionStore((state) => state.previewSelection)
  const showBarIndex = usePlayerStore((state) => state.showBarIndex)
  const markTriplets = usePlayerStore((state) => state.markTriplets)
  const isMobile = useIsMobile()
  const prefersDark = useIsDark()
  const allowBarDrag = selectionMode === 'bar' && !isMobile
  const canvasId = `${instrument}-editor-canvas-${id}`
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElementsRef = useRef<CanvasElement[]>([])
  const pointerRef = useRef<{
    barIndex: number
    noteIndex: number | null
    startX: number
    startY: number
    grabOffsetX: number
    grabOffsetY: number
    dragging: boolean
    dropIndex?: number
    hoveredBarIndex?: number
  } | null>(null)
  const pendingDragLayoutRef = useRef<DragLayoutState | null>(null)
  const dragLayoutRef = useRef<DragLayoutState | null>(null)
  const dragBoundsRef = useRef<BarBounds[]>([])
  const pointerPosRef = useRef({ x: 0, y: 0 })
  const baseFrameRef = useRef<ImageData | null>(null)
  const dragRafRef = useRef<number | null>(null)
  const ghostRafRef = useRef<number | null>(null)
  const [dragLayout, setDragLayout] = useState<DragLayoutState | null>(null)
  const { width: canvasWidth, dpr } = useCanvasWidth(containerRef)
  const { paddingX, paddingY, contentWidth } = editorCanvasInsets(canvasWidth, isMobile)
  const hash = bars.join('')
  const parsed = parseBarsNotation(bars)
  const contentHeight = canvasHeightForBars(contentWidth, barsPerRow, bars, parsed.layouts)
  const canvasHeight = contentHeight + paddingY * 2
  const barsInPattern = Math.max(findPatternLength(bars, 8), barsPerRow)
  const highlightedBarIndex =
    activeIndex < 0 ? -1 : barsInPattern > 1 ? activeIndex % barsInPattern : activeIndex

  const paintEnvRef = useRef({
    bars,
    instrument,
    contentWidth,
    barsPerRow,
    paddingX,
    paddingY,
    prefersDark,
  })
  paintEnvRef.current = {
    bars,
    instrument,
    contentWidth,
    barsPerRow,
    paddingX,
    paddingY,
    prefersDark,
  }

  const cancelDragRaf = () => {
    if (dragRafRef.current === null) return
    cancelAnimationFrame(dragRafRef.current)
    dragRafRef.current = null
  }

  const cancelGhostRaf = () => {
    if (ghostRafRef.current === null) return
    cancelAnimationFrame(ghostRafRef.current)
    ghostRafRef.current = null
  }

  const clearDrag = () => {
    cancelDragRaf()
    cancelGhostRaf()
    pendingDragLayoutRef.current = null
    dragLayoutRef.current = null
    dragBoundsRef.current = []
    baseFrameRef.current = null
    setDragLayout(null)
  }

  const paintGhostOnly = () => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    const layout = dragLayoutRef.current
    const base = baseFrameRef.current
    if (!canvas || !layout || !base) return
    const context = canvas.getContext('2d')
    if (!context) return

    const env = paintEnvRef.current
    const draggedBar = env.bars[layout.sourceIndex]
    if (!draggedBar) return

    context.putImageData(base, 0, 0)
    const palette = env.prefersDark ? darkCanvasColors : lightCanvasColors
    const { x, y } = pointerPosRef.current

    context.save()
    context.translate(env.paddingX, env.paddingY)
    renderGhostBar({
      bar: draggedBar,
      instrument: env.instrument,
      context,
      canvasWidth: env.contentWidth,
      barsPerRow: env.barsPerRow,
      pointerX: x,
      pointerY: y,
      grabOffsetX: layout.grabOffsetX,
      grabOffsetY: layout.grabOffsetY,
      palette,
    })
    context.restore()
  }

  const scheduleGhostPaint = () => {
    if (ghostRafRef.current !== null) return
    ghostRafRef.current = requestAnimationFrame(() => {
      ghostRafRef.current = null
      paintGhostOnly()
    })
  }

  const scheduleDragLayoutUpdate = (next: DragLayoutState) => {
    const current = pendingDragLayoutRef.current ?? dragLayoutRef.current
    if (
      current &&
      current.sourceIndex === next.sourceIndex &&
      current.dropIndex === next.dropIndex &&
      current.hoveredBarIndex === next.hoveredBarIndex
    ) {
      return false
    }

    cancelGhostRaf()
    baseFrameRef.current = null
    pendingDragLayoutRef.current = next
    if (dragRafRef.current !== null) return true
    dragRafRef.current = requestAnimationFrame(() => {
      dragRafRef.current = null
      const pending = pendingDragLayoutRef.current
      if (!pending) return
      dragLayoutRef.current = pending
      setDragLayout(pending)
    })
    return true
  }

  useLayoutEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return
    const context = setupCanvasDpi(canvas, canvasWidth, canvasHeight)
    if (!context) return

    const palette = prefersDark ? darkCanvasColors : lightCanvasColors
    context.fillStyle = palette.b0
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    const draggedBar = dragLayout ? bars[dragLayout.sourceIndex] : null
    const isDragPreview = dragLayout !== null && dragLayout.dropIndex !== dragLayout.sourceIndex
    const barsToRender = isDragPreview
      ? previewBarsForDrag(bars, dragLayout.sourceIndex, dragLayout.dropIndex)
      : bars
    const renderParsed = isDragPreview ? parseBarsNotation(barsToRender) : parsed

    context.save()
    context.translate(paddingX, paddingY)

    const elements = renderBars({
      bars: barsToRender,
      instrument,
      canvas,
      context,
      canvasWidth: contentWidth,
      barsPerRow,
      highlightedBarIndex: isDragPreview ? -1 : highlightedBarIndex,
      palette,
      showBarIndex,
      markTriplets,
      parsed: renderParsed,
    })

    canvasElementsRef.current = elements

    if (!dragLayout && previewSelection) {
      if (selectionMode === 'bar') {
        const selectedBar = elements.find(
          (element) => element.type === 'bar' && element.barIndex === previewSelection.barIndex,
        )
        if (selectedBar) drawBarSelectionBorder(context, selectedBar, prefersDark)
      } else {
        const selected = elements.find(
          (element) =>
            element.type === 'note' &&
            element.barIndex === previewSelection.barIndex &&
            element.noteIndex === previewSelection.glyphIndex,
        )
        if (selected) drawSelectionBorder(context, selected, prefersDark)
      }
    }

    if (isDragPreview && dragLayout) {
      const rowHeights = rowHeightsForBars(contentWidth, barsPerRow, bars, parsed.layouts)
      drawDragPreviewHighlights({
        bars,
        canvasWidth: contentWidth,
        barsPerRow,
        context,
        dark: prefersDark,
        sourceIndex: dragLayout.sourceIndex,
        hoveredBarIndex: dragLayout.hoveredBarIndex,
        layouts: parsed.layouts,
        rowHeights,
      })
    }

    context.restore()

    if (dragLayout && draggedBar) {
      baseFrameRef.current = context.getImageData(0, 0, canvas.width, canvas.height)
      context.save()
      context.translate(paddingX, paddingY)
      renderGhostBar({
        bar: draggedBar,
        instrument,
        context,
        canvasWidth: contentWidth,
        barsPerRow,
        pointerX: pointerPosRef.current.x,
        pointerY: pointerPosRef.current.y,
        grabOffsetX: dragLayout.grabOffsetX,
        grabOffsetY: dragLayout.grabOffsetY,
        palette,
      })
      context.restore()
    } else {
      baseFrameRef.current = null
    }
  }, [
    hash,
    canvasId,
    canvasWidth,
    canvasHeight,
    dpr,
    barsPerRow,
    instrument,
    bars.length,
    highlightedBarIndex,
    prefersDark,
    beatSize,
    previewSelection,
    selectionMode,
    dragLayout,
    bars,
    showBarIndex,
    markTriplets,
    paddingX,
    paddingY,
    contentWidth,
    isMobile,
  ])

  const toContentPoint = (x: number, y: number) => ({
    x: x - paddingX,
    y: y - paddingY,
  })

  const contentPointFromEvent = (
    canvas: HTMLCanvasElement,
    event: { clientX: number; clientY: number },
  ) => {
    const { x, y } = canvasLogicalPoint(canvas, event, canvasWidth, canvasHeight)
    return toContentPoint(x, y)
  }

  const getCanvas = () => document.getElementById(canvasId) as HTMLCanvasElement | null

  const getNoteTarget = (event: { clientX: number; clientY: number }) => {
    const canvas = getCanvas()
    if (!canvas || canvasWidth <= 0 || canvasHeight <= 0) return null
    const { x, y } = contentPointFromEvent(canvas, event)
    return detectNoteAtPoint(canvasElementsRef.current, x, y)
  }

  const getBarIndexAt = (event: { clientX: number; clientY: number }) => {
    const canvas = getCanvas()
    if (!canvas || canvasWidth <= 0 || canvasHeight <= 0) return -1
    const { x, y } = contentPointFromEvent(canvas, event)
    return detectBarAtPoint(canvasElementsRef.current, x, y)
  }

  const resolveDragTarget = (x: number, y: number) => {
    const barBounds =
      dragBoundsRef.current.length > 0
        ? dragBoundsRef.current
        : barBoundsFromElements(canvasElementsRef.current)
    return resolveBarDropTarget(bars.length, pointerRef.current?.barIndex ?? 0, x, y, barBounds)
  }

  const updateDragPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    const state = pointerRef.current
    if (!canvas || !state?.dragging) return

    const { x, y } = contentPointFromEvent(canvas, event)
    pointerPosRef.current = { x, y }

    if (isPointerOutsideCanvas(canvas, event)) {
      state.dropIndex = state.barIndex
      state.hoveredBarIndex = -1
      const layoutChanged = scheduleDragLayoutUpdate({
        sourceIndex: state.barIndex,
        dropIndex: state.barIndex,
        hoveredBarIndex: -1,
        grabOffsetX: state.grabOffsetX,
        grabOffsetY: state.grabOffsetY,
      })
      if (!layoutChanged) scheduleGhostPaint()
      return
    }

    const { dropIndex, hoveredBarIndex } = resolveDragTarget(x, y)
    state.dropIndex = dropIndex
    state.hoveredBarIndex = hoveredBarIndex

    const layoutChanged = scheduleDragLayoutUpdate({
      sourceIndex: state.barIndex,
      dropIndex,
      hoveredBarIndex,
      grabOffsetX: state.grabOffsetX,
      grabOffsetY: state.grabOffsetY,
    })
    if (!layoutChanged) scheduleGhostPaint()
  }

  const capturePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isMobile) event.currentTarget.setPointerCapture(event.pointerId)
  }

  const releasePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isMobile) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasWidth <= 0 || canvasHeight <= 0) return

    if (selectionMode === 'note') {
      const noteTarget = getNoteTarget(event)
      if (
        !noteTarget?.element ||
        noteTarget.element.barIndex === undefined ||
        noteTarget.element.noteIndex === undefined
      ) {
        return
      }

      pointerRef.current = {
        barIndex: noteTarget.element.barIndex,
        noteIndex: noteTarget.element.noteIndex,
        startX: event.clientX,
        startY: event.clientY,
        grabOffsetX: 0,
        grabOffsetY: 0,
        dragging: false,
      }
      capturePointer(event)
      return
    }

    const barIndex = getBarIndexAt(event)
    if (barIndex < 0) return

    const canvas = getCanvas()
    if (!canvas) return
    const { x, y } = contentPointFromEvent(canvas, event)
    const barEl = canvasElementsRef.current.find(
      (element) => element.type === 'bar' && element.barIndex === barIndex,
    )
    const { grabOffsetX, grabOffsetY } = barEl
      ? { grabOffsetX: x - barEl.left, grabOffsetY: y - barEl.top }
      : grabOffsetForBar(barIndex, bars, contentWidth, barsPerRow, x, y)

    pointerRef.current = {
      barIndex,
      noteIndex: null,
      startX: event.clientX,
      startY: event.clientY,
      grabOffsetX,
      grabOffsetY,
      dragging: false,
    }
    capturePointer(event)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = pointerRef.current
    if (!state || !allowBarDrag) return

    const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY)
    if (!state.dragging && distance > DRAG_THRESHOLD_PX) {
      state.dragging = true
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      if (!canvas) return
      const { x, y } = contentPointFromEvent(canvas, event)
      pointerPosRef.current = { x, y }
      dragBoundsRef.current = barBoundsFromElements(canvasElementsRef.current)
      const initialLayout: DragLayoutState = {
        sourceIndex: state.barIndex,
        dropIndex: state.barIndex,
        hoveredBarIndex: state.barIndex,
        grabOffsetX: state.grabOffsetX,
        grabOffsetY: state.grabOffsetY,
      }
      pendingDragLayoutRef.current = initialLayout
      dragLayoutRef.current = initialLayout
      setDragLayout(initialLayout)
      state.dropIndex = state.barIndex
      state.hoveredBarIndex = state.barIndex
    }

    if (state.dragging) updateDragPosition(event)
  }

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = pointerRef.current
    pointerRef.current = null

    if (!state) {
      releasePointer(event)
      return
    }

    const movedDistance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY)
    if (isMobile && movedDistance > DRAG_THRESHOLD_PX) {
      clearDrag()
      releasePointer(event)
      return
    }

    if (allowBarDrag && state.dragging) {
      const canvas = getCanvas()
      if (!canvas || isPointerOutsideCanvas(canvas, event)) {
        clearDrag()
        releasePointer(event)
        return
      }

      const { x, y } = contentPointFromEvent(canvas, event)
      const barBounds =
        dragBoundsRef.current.length > 0
          ? dragBoundsRef.current
          : barBoundsFromElements(canvasElementsRef.current)
      const { dropIndex } = resolveBarDropTarget(bars.length, state.barIndex, x, y, barBounds)

      if (dropIndex !== state.barIndex) {
        onReorderBar(state.barIndex, dropIndex)
      }

      clearDrag()
      releasePointer(event)
      return
    }

    clearDrag()

    if (selectionMode === 'bar') {
      onSelectBar(state.barIndex)
      releasePointer(event)
      return
    }

    if (state.noteIndex !== null) {
      onSelectNote(state.barIndex, state.noteIndex)
      releasePointer(event)
      return
    }

    const target = getNoteTarget(event)
    if (
      !target?.element ||
      target.element.barIndex === undefined ||
      target.element.noteIndex === undefined
    ) {
      releasePointer(event)
      return
    }

    onSelectNote(target.element.barIndex, target.element.noteIndex)
    releasePointer(event)
  }

  const onPointerCancel = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointerRef.current = null
    clearDrag()
    releasePointer(event)
  }

  return (
    <div ref={containerRef} className="w-full min-w-0 flex-1">
      <canvas
        id={canvasId}
        className={cn(
          'h-auto w-full bg-zinc-50 dark:bg-zinc-950',
          !isMobile && 'touch-none',
          dragLayout ? 'cursor-grabbing' : allowBarDrag ? 'cursor-grab' : 'cursor-pointer',
          canvasWidth <= 0 && 'invisible',
        )}
        onContextMenu={(event) => event.preventDefault()}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  )
}

export const EditableBarsCanvas = memo(
  EditableBars,
  (prev, next) =>
    prev.id === next.id &&
    prev.activeIndex === next.activeIndex &&
    prev.barsPerRow === next.barsPerRow &&
    prev.beatSize === next.beatSize &&
    prev.instrument === next.instrument &&
    prev.bars.join('') === next.bars.join('') &&
    prev.selectionMode === next.selectionMode,
)
