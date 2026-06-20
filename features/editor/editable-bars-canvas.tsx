'use client'

import { memo, useLayoutEffect, useRef, useState } from 'react'

import { applyBarPatternAction } from '@/features/editor/canvas/bar-pattern-actions'
import { canvasLogicalPoint, detectBarAtPoint, detectNoteAtPoint } from '@/features/editor/canvas/canvas-pointer'
import { canvasPointFromPage } from '@/features/editor/canvas/resolve-drop-index'
import {
  resolveDropIndexFromDrag,
} from '@/features/editor/canvas/resolve-drop-index'
import { drawSelectionBorder } from '@/features/editor/canvas/draw-selection-border'
import { renderEditorBarSlots, renderGhostBar } from '@/features/editor/canvas/render-editor-bars'
import { buildDragSlots } from '@/features/editor/notation/reorder-bars'
import type { NoteSelection } from '@/features/editor/notation/bar-note-edits'
import { setupCanvasDpi } from '@/features/groovy-player/canvas/canvas-dpi'
import { darkCanvasColors, lightCanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import { findPatternLength } from '@/features/groovy-player/canvas/find-pattern-length'
import { BAR_GAP_PX, barHeightForBarsPerRow, renderBars } from '@/features/groovy-player/canvas/renderers'
import { useCanvasWidth } from '@/features/groovy-player/canvas/use-canvas-width'
import { useIsDark } from '@/features/store/theme.store'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'
import type { CanvasElement } from '@/features/groovy-player/canvas/types'

const DRAG_THRESHOLD_PX = 6

type BarDragState = {
  sourceIndex: number
  dropIndex: number
  pointerX: number
  pointerY: number
}

type EditableBarsCanvasProps = {
  id: string
  bars: string[]
  barsPerRow: number
  instrument: string
  beatSize: number
  selection: NoteSelection | null
  onBarsChange: (bars: string[]) => void
  onSelectNote: (barIndex: number, glyphIndex: number) => void
  onNavigate: (direction: -1 | 1) => void
  onReorderBar: (from: number, to: number) => void
}

const EditableBars = ({
  bars,
  barsPerRow,
  instrument,
  beatSize,
  onBarsChange,
  onSelectNote,
  onNavigate,
  onReorderBar,
  selection,
  id,
}: EditableBarsCanvasProps) => {
  const prefersDark = useIsDark()
  const barSize = beatSize * 2
  const canvasId = `${instrument}-editor-canvas-${id}`
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElementsRef = useRef<CanvasElement[]>([])
  const pointerRef = useRef<{
    barIndex: number
    noteIndex: number | null
    startX: number
    startY: number
    dragging: boolean
  } | null>(null)
  const [drag, setDrag] = useState<BarDragState | null>(null)
  const { width: canvasWidth, dpr } = useCanvasWidth(containerRef)
  const barsInPattern = Math.max(findPatternLength(bars, 8), barsPerRow)
  const barHeight = barHeightForBarsPerRow(barsPerRow)
  const hash = bars.join('')
  const canvasHeight =
    (barHeight + 2 * BAR_GAP_PX) * Math.ceil(barsInPattern / barsPerRow) - 2 * BAR_GAP_PX
  const barCursor = selection?.barIndex ?? -1

  useLayoutEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return
    const context = setupCanvasDpi(canvas, canvasWidth, canvasHeight)
    if (!context) return

    const palette = prefersDark ? darkCanvasColors : lightCanvasColors
    context.fillStyle = palette.b0
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    const elements = drag
      ? renderEditorBarSlots({
          slots: buildDragSlots(bars, drag.sourceIndex, drag.dropIndex),
          instrument,
          context,
          canvasWidth,
          barHeight,
          barsPerRow,
          palette,
        })
      : renderBars({
          bars,
          instrument,
          canvas,
          context,
          canvasWidth,
          barHeight,
          barsPerRow,
          highlightedBarIndex: barCursor,
          palette,
          showBarIndex: true,
          markTriplets: true,
        })

    canvasElementsRef.current = elements

    if (!drag && selection) {
      const selected = elements.find(
        (element) =>
          element.type === 'note' &&
          element.barIndex === selection.barIndex &&
          element.noteIndex === selection.glyphIndex,
      )
      if (selected) drawSelectionBorder(context, selected)
    }

    if (drag) {
      renderGhostBar({
        bar: bars[drag.sourceIndex] ?? '',
        instrument,
        context,
        canvasWidth,
        barHeight,
        pointerX: drag.pointerX,
        pointerY: drag.pointerY,
        palette,
      })
    }
  }, [
    hash,
    canvasId,
    canvasWidth,
    canvasHeight,
    dpr,
    barsPerRow,
    barHeight,
    instrument,
    bars.length,
    barCursor,
    prefersDark,
    beatSize,
    selection,
    drag,
    bars,
  ])

  const getCanvas = () => document.getElementById(canvasId) as HTMLCanvasElement | null

  const getNoteTarget = (event: { clientX: number; clientY: number }) => {
    const canvas = getCanvas()
    if (!canvas || canvasWidth <= 0 || canvasHeight <= 0) return null
    const { x, y } = canvasLogicalPoint(canvas, event, canvasWidth, canvasHeight)
    return detectNoteAtPoint(canvasElementsRef.current, x, y)
  }

  const getBarIndexAt = (event: { clientX: number; clientY: number }) => {
    const canvas = getCanvas()
    if (!canvas || canvasWidth <= 0 || canvasHeight <= 0) return -1
    const { x, y } = canvasLogicalPoint(canvas, event, canvasWidth, canvasHeight)
    return detectBarAtPoint(canvasElementsRef.current, x, y)
  }

  const updateDragPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    const state = pointerRef.current
    if (!canvas || !state?.dragging) return

    const { x, y } = canvasPointFromPage(canvas, event, canvasWidth, canvasHeight)

    setDrag((current) => {
      const currentDrop = current?.dropIndex ?? state.barIndex
      const slots = buildDragSlots(bars, state.barIndex, currentDrop)
      const dropIndex = resolveDropIndexFromDrag(
        bars.length,
        state.barIndex,
        x,
        y,
        canvasWidth,
        barHeight,
        barsPerRow,
        slots,
        currentDrop,
      )

      return {
        sourceIndex: state.barIndex,
        dropIndex,
        pointerX: x,
        pointerY: y,
      }
    })
  }

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasWidth <= 0 || canvasHeight <= 0) return

    const noteTarget = getNoteTarget(event)
    const barIndex = noteTarget?.element?.barIndex ?? getBarIndexAt(event)
    if (barIndex < 0) return

    pointerRef.current = {
      barIndex,
      noteIndex: noteTarget?.element?.noteIndex ?? null,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = pointerRef.current
    if (!state) return

    const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY)
    if (!state.dragging && distance > DRAG_THRESHOLD_PX) {
      state.dragging = true
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      if (!canvas) return
      const { x, y } = canvasPointFromPage(canvas, event, canvasWidth, canvasHeight)
      setDrag({
        sourceIndex: state.barIndex,
        dropIndex: state.barIndex,
        pointerX: x,
        pointerY: y,
      })
    }

    if (state.dragging) updateDragPosition(event)
  }

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = pointerRef.current
    pointerRef.current = null

    if (state?.dragging) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      if (canvas) {
        const { x, y } = canvasPointFromPage(canvas, event, canvasWidth, canvasHeight)
        const currentDrop = drag?.dropIndex ?? state.barIndex
        const slots = buildDragSlots(bars, state.barIndex, currentDrop)
        const dropIndex = resolveDropIndexFromDrag(
          bars.length,
          state.barIndex,
          x,
          y,
          canvasWidth,
          barHeight,
          barsPerRow,
          slots,
          currentDrop,
        )
        onReorderBar(state.barIndex, dropIndex)
      }
      setDrag(null)
      event.currentTarget.releasePointerCapture(event.pointerId)
      return
    }

    setDrag(null)

    if (!state) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      return
    }

    if (state.noteIndex !== null) {
      onSelectNote(state.barIndex, state.noteIndex)
      event.currentTarget.releasePointerCapture(event.pointerId)
      return
    }

    const target = getNoteTarget(event)
    if (!target?.element || target.element.barIndex === undefined || target.element.noteIndex === undefined) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      return
    }

    onSelectNote(target.element.barIndex, target.element.noteIndex)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const onPointerCancel = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointerRef.current = null
    setDrag(null)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const runBarAction = (action: 'add' | 'remove') => {
    const result = applyBarPatternAction(bars, barSize, barCursor, action)
    onBarsChange(result.bars)
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
      <div ref={containerRef} className="w-full min-w-0 flex-1">
        <canvas
          id={canvasId}
          className={cn(
            'h-auto w-full bg-zinc-50 touch-none dark:bg-zinc-950',
            drag ? 'cursor-grabbing' : 'cursor-pointer',
            canvasWidth <= 0 && 'invisible',
          )}
          onContextMenu={(event) => event.preventDefault()}
          onPointerCancel={onPointerCancel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 px-1">
        {selection ? (
          <span className="font-mono text-xs text-zinc-500">
            Bar {selection.barIndex + 1}
          </span>
        ) : null}
        <Button
          className={cn(!selection && 'opacity-30 saturate-0')}
          disabled={!selection}
          onClick={() => onNavigate(-1)}
          variant="outlined"
        >
          &lt;
        </Button>
        <Button
          className={cn(!selection && 'opacity-30 saturate-0')}
          disabled={!selection}
          onClick={() => onNavigate(1)}
          variant="outlined"
        >
          &gt;
        </Button>
        <Button onClick={() => runBarAction('remove')} variant="outlined">
          − bar
        </Button>
        <Button onClick={() => runBarAction('add')} variant="outlined">
          + bar
        </Button>
      </div>
    </div>
  )
}

export const EditableBarsCanvas = memo(
  EditableBars,
  (prev, next) =>
    prev.id === next.id &&
    prev.barsPerRow === next.barsPerRow &&
    prev.beatSize === next.beatSize &&
    prev.bars.join('') === next.bars.join('') &&
    prev.selection?.barIndex === next.selection?.barIndex &&
    prev.selection?.glyphIndex === next.selection?.glyphIndex,
)
