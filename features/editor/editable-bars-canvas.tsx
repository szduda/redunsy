'use client'

import { memo, useLayoutEffect, useRef, useState } from 'react'

import {
  canvasLogicalPoint,
  detectBarAtPoint,
  detectNoteAtPoint,
} from '@/features/editor/canvas/canvas-pointer'
import { barBoundsForBars, resolveBarDropTarget } from '@/features/editor/canvas/resolve-drop-index'
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
import { canvasHeightForBars, renderBars } from '@/features/groovy-player/canvas/renderers'
import { useCanvasWidth } from '@/features/groovy-player/canvas/use-canvas-width'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { useIsDark } from '@/features/store/theme.store'
import { cn } from '@/features/theme/cn'
import type { CanvasElement } from '@/features/groovy-player/canvas/types'

const DRAG_THRESHOLD_PX = 6

type BarDragState = {
  sourceIndex: number
  dropIndex: number
  hoveredBarIndex: number
  pointerX: number
  pointerY: number
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
  const [drag, setDrag] = useState<BarDragState | null>(null)
  const { width: canvasWidth, dpr } = useCanvasWidth(containerRef)
  const { paddingX, paddingY, contentWidth } = editorCanvasInsets(canvasWidth, isMobile)
  const hash = bars.join('')
  const contentHeight = canvasHeightForBars(contentWidth, barsPerRow, bars)
  const canvasHeight = contentHeight + paddingY * 2
  const barsInPattern = Math.max(findPatternLength(bars, 8), barsPerRow)
  const highlightedBarIndex =
    activeIndex < 0 ? -1 : barsInPattern > 1 ? activeIndex % barsInPattern : activeIndex

  useLayoutEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return
    const context = setupCanvasDpi(canvas, canvasWidth, canvasHeight)
    if (!context) return

    const palette = prefersDark ? darkCanvasColors : lightCanvasColors
    context.fillStyle = palette.b0
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    const draggedBar = drag ? bars[drag.sourceIndex] : null
    const isDragPreview = drag !== null && drag.dropIndex !== drag.sourceIndex
    const barsToRender = isDragPreview
      ? previewBarsForDrag(bars, drag.sourceIndex, drag.dropIndex)
      : bars

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
    })

    canvasElementsRef.current = elements

    if (!drag && previewSelection) {
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

    if (isDragPreview && drag) {
      drawDragPreviewHighlights({
        bars,
        canvasWidth: contentWidth,
        barsPerRow,
        context,
        dark: prefersDark,
        sourceIndex: drag.sourceIndex,
        hoveredBarIndex: drag.hoveredBarIndex,
      })
    }

    if (drag && draggedBar) {
      renderGhostBar({
        bar: draggedBar,
        instrument,
        context,
        canvasWidth: contentWidth,
        barsPerRow,
        pointerX: drag.pointerX,
        pointerY: drag.pointerY,
        grabOffsetX: drag.grabOffsetX,
        grabOffsetY: drag.grabOffsetY,
        palette,
      })
    }

    context.restore()
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
    drag,
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
    const barBounds = barBoundsForBars(bars, contentWidth, barsPerRow)
    return resolveBarDropTarget(bars.length, pointerRef.current?.barIndex ?? 0, x, y, barBounds)
  }

  const updateDragPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    const state = pointerRef.current
    if (!canvas || !state?.dragging) return

    const { x, y } = contentPointFromEvent(canvas, event)

    if (isPointerOutsideCanvas(canvas, event)) {
      state.dropIndex = state.barIndex
      state.hoveredBarIndex = -1
      setDrag({
        sourceIndex: state.barIndex,
        dropIndex: state.barIndex,
        hoveredBarIndex: -1,
        pointerX: x,
        pointerY: y,
        grabOffsetX: state.grabOffsetX,
        grabOffsetY: state.grabOffsetY,
      })
      return
    }

    const { dropIndex, hoveredBarIndex } = resolveDragTarget(x, y)
    state.dropIndex = dropIndex
    state.hoveredBarIndex = hoveredBarIndex

    setDrag({
      sourceIndex: state.barIndex,
      dropIndex,
      hoveredBarIndex,
      pointerX: x,
      pointerY: y,
      grabOffsetX: state.grabOffsetX,
      grabOffsetY: state.grabOffsetY,
    })
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
    const { grabOffsetX, grabOffsetY } = grabOffsetForBar(
      barIndex,
      bars,
      contentWidth,
      barsPerRow,
      x,
      y,
    )

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
      setDrag({
        sourceIndex: state.barIndex,
        dropIndex: state.barIndex,
        hoveredBarIndex: state.barIndex,
        pointerX: x,
        pointerY: y,
        grabOffsetX: state.grabOffsetX,
        grabOffsetY: state.grabOffsetY,
      })
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
      setDrag(null)
      releasePointer(event)
      return
    }

    if (allowBarDrag && state.dragging) {
      const canvas = getCanvas()
      if (!canvas || isPointerOutsideCanvas(canvas, event)) {
        setDrag(null)
        releasePointer(event)
        return
      }

      const { x, y } = contentPointFromEvent(canvas, event)
      const { dropIndex } = resolveBarDropTarget(
        bars.length,
        state.barIndex,
        x,
        y,
        barBoundsForBars(bars, contentWidth, barsPerRow),
      )

      if (dropIndex !== state.barIndex) {
        onReorderBar(state.barIndex, dropIndex)
      }

      setDrag(null)
      releasePointer(event)
      return
    }

    setDrag(null)

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
    setDrag(null)
    releasePointer(event)
  }

  return (
    <div ref={containerRef} className="w-full min-w-0 flex-1">
      <canvas
        id={canvasId}
        className={cn(
          'h-auto w-full bg-zinc-50 dark:bg-zinc-950',
          !isMobile && 'touch-none',
          drag ? 'cursor-grabbing' : allowBarDrag ? 'cursor-grab' : 'cursor-pointer',
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
    prev.bars.join('') === next.bars.join('') &&
    prev.selectionMode === next.selectionMode,
)
