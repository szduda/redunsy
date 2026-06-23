'use client'

import { useId, useLayoutEffect, useRef } from 'react'

import { drawSelectionBorder } from '@/features/editor/canvas/draw-selection-border'
import { setupCanvasDpi } from '@/features/groovy-player/canvas/canvas-dpi'
import { darkCanvasColors, lightCanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import {
  canvasHeightForBars,
  layoutBar,
  renderBars,
} from '@/features/groovy-player/canvas/renderers'
import { useCanvasWidth } from '@/features/groovy-player/canvas/use-canvas-width'
import { useIsDark } from '@/features/store/theme.store'
import { cn } from '@/features/theme/cn'

export const DEMO_BAR_DEFAULT_PATTERN: Record<3 | 4, string> = {
  4: 's--ss-tt',
  3: 's-ts--',
}

export type DemoBarProps = {
  meter: 3 | 4
  pattern?: string
  active?: boolean
  selected8th?: number
  instrument?: string
  className?: string
}

const clampSelected8th = (meter: 3 | 4, value: number) =>
  Math.min(meter * 2, Math.max(1, Math.round(value)))

const glyphIndexForEighth = (layout: ReturnType<typeof layoutBar>, eighth: number) => {
  const cellIndex = eighth - 1
  return layout.glyphs.findIndex(
    (glyph) => glyph.kind === 'eighth' && Math.floor(glyph.position) === cellIndex,
  )
}

export const DemoBar = ({
  meter,
  pattern,
  active = false,
  selected8th,
  instrument = 'djembe',
  className,
}: DemoBarProps) => {
  const bar = pattern ?? DEMO_BAR_DEFAULT_PATTERN[meter]
  const canvasId = useId().replace(/:/g, '')
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersDark = useIsDark()
  const { width: canvasWidth, dpr } = useCanvasWidth(containerRef)
  const bars = [bar]
  const canvasHeight = canvasHeightForBars(canvasWidth, 1, bars)
  const eighth = selected8th === undefined ? undefined : clampSelected8th(meter, selected8th)

  useLayoutEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas || canvasWidth <= 0) return
    const context = setupCanvasDpi(canvas, canvasWidth, canvasHeight)
    if (!context) return

    const palette = prefersDark ? darkCanvasColors : lightCanvasColors
    const demoBars = [bar]

    context.fillStyle = palette.b0
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    renderBars({
      bars: demoBars,
      instrument,
      canvas,
      context,
      canvasWidth,
      barsPerRow: 1,
      highlightedBarIndex: active ? 0 : -1,
      palette,
    })

    if (eighth !== undefined) {
      const layout = layoutBar({
        bars: demoBars,
        canvasWidth,
        barIndex: 0,
        barsPerRow: 1,
        highlighted: active,
        palette,
      })
      const glyphIndex = glyphIndexForEighth(layout, eighth)
      if (glyphIndex >= 0)
        drawSelectionBorder(context, layout.noteElements[glyphIndex], prefersDark)
    }
  }, [active, bar, canvasHeight, canvasId, canvasWidth, dpr, eighth, instrument, prefersDark])

  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 rounded-md border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950',
        className,
      )}
    >
      <span ref={containerRef} className="block w-52 min-w-40 sm:w-56">
        <canvas id={canvasId} className={cn('h-auto w-full', canvasWidth <= 0 && 'invisible')} />
      </span>
    </span>
  )
}
