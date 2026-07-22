'use client'

import { memo, useLayoutEffect, useRef } from 'react'

import { getDevicePixelRatio } from './canvas-dpi'
import { darkCanvasColors, lightCanvasColors } from './canvas-colors'
import { findPatternLength } from './find-pattern-length'
import { cachedParseBarsNotation } from './bar-layout'
import { canvasHeightForBars, type LaidOutBar } from './renderers'
import { blitAndHighlightBar, paintStaticBars, staticBarsKey } from './static-bars-layer'
import { useCanvasWidth } from './use-canvas-width'
import { playerCanvasInsets } from './player-canvas-padding'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { useIsDark } from '@/features/store/theme.store'
import { cn } from '@/features/theme/cn'

type BarsCanvasProps = {
  id: string
  bars: string[]
  barsPerRow: number
  activeIndex?: number
  instrument: string
}

type StaticCache = {
  key: string
  layouts: LaidOutBar[]
  rowHeights: number[]
}

const Bars = ({ bars, activeIndex = -1, barsPerRow, instrument, id }: BarsCanvasProps) => {
  const prefersDark = useIsDark()
  const isMobile = useIsMobile()
  const showBarIndex = usePlayerStore((state) => state.showBarIndex)
  const markTriplets = usePlayerStore((state) => state.markTriplets)
  const canvasId = `${instrument}-canvas-${id}`
  const containerRef = useRef<HTMLDivElement>(null)
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const staticCacheRef = useRef<StaticCache | null>(null)
  const { width: canvasWidth, dpr } = useCanvasWidth(containerRef)
  const { paddingY, contentWidth } = playerCanvasInsets(canvasWidth, isMobile)
  const barsInPattern = Math.max(findPatternLength(bars, 8), barsPerRow)
  const hash = bars.join('')
  const parsed = cachedParseBarsNotation(bars, hash)
  const contentHeight = canvasHeightForBars(contentWidth, barsPerRow, bars, parsed.layouts)
  const canvasHeight = contentHeight + paddingY * 2
  const highlightedBarIndex =
    activeIndex < 0 ? -1 : barsInPattern > 1 ? activeIndex % barsInPattern : activeIndex

  useLayoutEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return

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
      paddingX: 0,
      paddingY,
      contentWidth,
    })

    if (!staticCanvasRef.current) staticCanvasRef.current = document.createElement('canvas')
    const staticCanvas = staticCanvasRef.current

    let staticCache = staticCacheRef.current
    if (!staticCache || staticCache.key !== key) {
      const painted = paintStaticBars({
        staticCanvas,
        bars,
        instrument,
        canvasWidth,
        canvasHeight,
        contentWidth,
        paddingY,
        barsPerRow,
        palette,
        showBarIndex,
        markTriplets,
        parsed,
      })
      if (!painted) return
      staticCache = { key, layouts: painted.layouts, rowHeights: painted.rowHeights }
      staticCacheRef.current = staticCache
    }

    blitAndHighlightBar({
      visibleCanvas: canvas,
      staticCanvas,
      bars,
      instrument,
      canvasWidth,
      canvasHeight,
      contentWidth,
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
    paddingY,
    contentWidth,
    parsed,
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
    prev.instrument === next.instrument &&
    prev.bars.join('') === next.bars.join(''),
)
