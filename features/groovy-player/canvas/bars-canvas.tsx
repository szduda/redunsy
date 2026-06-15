'use client'

import { memo, useLayoutEffect, useRef } from 'react'

import { setupCanvasDpi } from './canvas-dpi'
import { findPatternLength } from './find-pattern-length'
import { BAR_GAP_PX, BAR_HEIGHT_LARGE_PX, BAR_HEIGHT_PX, colors, renderBars } from './renderers'
import { useCanvasWidth } from './use-canvas-width'
import { cn } from '@/features/theme/cn'

type BarsCanvasProps = {
  id: string
  bars: string[]
  barsPerRow: number
  activeIndex?: number
  instrument: string
}

const Bars = ({ bars, activeIndex = -1, barsPerRow, instrument, id }: BarsCanvasProps) => {
  const canvasId = `${instrument}-canvas-${id}`
  const containerRef = useRef<HTMLDivElement>(null)
  const { width: canvasWidth, dpr } = useCanvasWidth(containerRef)
  const barsInPattern = Math.max(findPatternLength(bars, 8), barsPerRow)
  const barHeight = barsPerRow <= 2 ? BAR_HEIGHT_LARGE_PX : BAR_HEIGHT_PX
  const hash = bars.join('')
  const canvasHeight =
    (barHeight + 2 * BAR_GAP_PX) * Math.ceil(barsInPattern / barsPerRow) - 2 * BAR_GAP_PX
  const highlightedBarIndex =
    activeIndex < 0 ? -1 : barsInPattern > 1 ? activeIndex % barsInPattern : activeIndex

  useLayoutEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return
    const context = setupCanvasDpi(canvas, canvasWidth, canvasHeight)
    if (!context) return

    context.fillStyle = colors.b0
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    renderBars({
      bars,
      instrument,
      canvas,
      context,
      canvasWidth,
      barHeight,
      barsPerRow,
      highlightedBarIndex,
    })
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
    highlightedBarIndex,
  ])

  return (
    <div ref={containerRef} className="w-full min-w-0 flex-1">
      <canvas
        id={canvasId}
        className={cn('h-auto w-full bg-zinc-950', canvasWidth <= 0 && 'invisible')}
      />
    </div>
  )
}

export const BarsCanvas = memo(
  Bars,
  (prev, next) =>
    prev.id === next.id &&
    prev.activeIndex === next.activeIndex &&
    prev.barsPerRow === next.barsPerRow &&
    prev.bars.join('') === next.bars.join(''),
)
