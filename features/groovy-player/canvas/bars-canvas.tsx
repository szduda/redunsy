'use client'

import { memo, useLayoutEffect, useRef } from 'react'

import { setupCanvasDpi } from './canvas-dpi'
import { darkCanvasColors, lightCanvasColors } from './canvas-colors'
import { findPatternLength } from './find-pattern-length'
import { canvasHeightForBars, renderBars } from './renderers'
import { useCanvasWidth } from './use-canvas-width'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsDark } from '@/features/store/theme.store'
import { cn } from '@/features/theme/cn'

type BarsCanvasProps = {
  id: string
  bars: string[]
  barsPerRow: number
  activeIndex?: number
  instrument: string
}

const Bars = ({ bars, activeIndex = -1, barsPerRow, instrument, id }: BarsCanvasProps) => {
  const prefersDark = useIsDark()
  const showBarIndex = usePlayerStore((state) => state.showBarIndex)
  const markTriplets = usePlayerStore((state) => state.markTriplets)
  const canvasId = `${instrument}-canvas-${id}`
  const containerRef = useRef<HTMLDivElement>(null)
  const { width: canvasWidth, dpr } = useCanvasWidth(containerRef)
  const barsInPattern = Math.max(findPatternLength(bars, 8), barsPerRow)
  const hash = bars.join('')
  const canvasHeight = canvasHeightForBars(canvasWidth, barsPerRow, bars)
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

    renderBars({
      bars,
      instrument,
      canvas,
      context,
      canvasWidth,
      barsPerRow,
      highlightedBarIndex,
      palette,
      showBarIndex,
      markTriplets,
    })
  }, [
    hash,
    bars,
    canvasId,
    canvasWidth,
    canvasHeight,
    dpr,
    barsPerRow,
    instrument,
    highlightedBarIndex,
    prefersDark,
    showBarIndex,
    markTriplets,
  ])

  return (
    <div ref={containerRef} className="w-full min-w-0 flex-1">
      <canvas
        id={canvasId}
        className={cn('h-auto w-full bg-zinc-50 dark:bg-zinc-950', canvasWidth <= 0 && 'invisible')}
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
