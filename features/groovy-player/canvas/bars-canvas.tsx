'use client'

import { memo, useLayoutEffect, useRef } from 'react'

import { findPatternLength } from './find-pattern-length'
import { BAR_GAP_PX, BAR_HEIGHT_LARGE_PX, BAR_HEIGHT_PX, colors, renderBar } from './renderers'
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
  const canvasWidth = useCanvasWidth(containerRef)
  const barsInPattern = Math.max(findPatternLength(bars, 8), barsPerRow)
  const barHeight = barsPerRow <= 2 ? BAR_HEIGHT_LARGE_PX : BAR_HEIGHT_PX
  const hash = bars.join('')
  const canvasHeight =
    (barHeight + 2 * BAR_GAP_PX) * Math.ceil(barsInPattern / barsPerRow) - 2 * BAR_GAP_PX

  const renderAll = () => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return
    const context = canvas.getContext('2d')
    if (!context) return

    context.fillStyle = colors.b0
    context.fillRect(0, 0, canvas.width, canvas.height)

    bars.forEach((_, barIndex) =>
      renderBar({
        bars,
        instrument,
        canvas,
        context,
        barHeight,
        barIndex,
        barsPerRow,
      }),
    )
  }

  useLayoutEffect(() => {
    renderAll()
  }, [hash, canvasId, canvasWidth, barsPerRow, barHeight, instrument, bars.length])

  useLayoutEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return
    const context = canvas.getContext('2d')
    if (!context) return

    if (activeIndex < 0) {
      renderAll()
      return
    }

    const mutual = { canvas, context, bars, barHeight, instrument, barsPerRow }

    if (activeIndex <= bars.length - 1) {
      renderBar({ ...mutual, barIndex: activeIndex, highlighted: true })
    }

    const previousIndex = activeIndex === 0 ? bars.length - 1 : activeIndex - 1
    if (previousIndex <= bars.length - 1) {
      renderBar({ ...mutual, barIndex: previousIndex })
    }
  }, [instrument, barsInPattern > 1 ? activeIndex % barsInPattern : -1, barsPerRow, hash, canvasWidth])

  return (
    <div ref={containerRef} className="w-full min-w-0 flex-1">
      <canvas
        id={canvasId}
        height={canvasHeight}
        width={canvasWidth || 1}
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
