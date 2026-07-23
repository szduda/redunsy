import { drawBarIndexLabel } from '@/features/groovy-player/bar-index-mark'
import type { CanvasColors } from './canvas-colors'
import { ensureCanvasDpi, getDevicePixelRatio, setupCanvasDpi } from './canvas-dpi'
import type { ParsedBarsNotation } from './bar-layout'
import { layoutBar, paintLaidOutBar, rowHeightsForBars, type LaidOutBar } from './renderers'
import { drawPolyrhythmBracket, polyrhythmBracketSpans } from './polyrhythm-brackets'
import { drawTripletBracket, tripletBracketSpans } from './triplet-brackets'
import type { CanvasElement } from './types'

export type StaticBarsPaintArgs = {
  staticCanvas: HTMLCanvasElement
  bars: string[]
  instrument: string
  canvasWidth: number
  canvasHeight: number
  contentWidth: number
  paddingX?: number
  paddingY: number
  barsPerRow: number
  palette: CanvasColors
  showBarIndex: boolean
  markTriplets: boolean
  parsed: ParsedBarsNotation
}

export type StaticBarsPaintResult = {
  elements: CanvasElement[]
  layouts: LaidOutBar[]
  rowHeights: number[]
}

export const paintStaticBars = ({
  staticCanvas,
  bars,
  instrument,
  canvasWidth,
  canvasHeight,
  contentWidth,
  paddingX = 0,
  paddingY,
  barsPerRow,
  palette,
  showBarIndex,
  markTriplets,
  parsed,
}: StaticBarsPaintArgs): StaticBarsPaintResult | null => {
  const context = setupCanvasDpi(staticCanvas, canvasWidth, canvasHeight)
  if (!context) return null

  context.fillStyle = palette.b0
  context.fillRect(0, 0, canvasWidth, canvasHeight)
  context.save()
  context.translate(paddingX, paddingY)

  const rowHeights = rowHeightsForBars(contentWidth, barsPerRow, bars, parsed.layouts)
  const layouts = bars.map((_, barIndex) =>
    layoutBar({
      bars,
      canvasWidth: contentWidth,
      barIndex,
      barsPerRow,
      highlighted: false,
      palette,
      rowHeights,
      layout: parsed.layouts[barIndex],
    }),
  )

  layouts.forEach((layout) => {
    paintLaidOutBar(context, instrument, layout)
  })

  if (markTriplets) {
    const bracketParsed = {
      segments: parsed.segments,
      barCellCounts: parsed.barCellCounts,
    }
    context.strokeStyle = palette.w1
    context.fillStyle = palette.w1
    context.font = '7px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'bottom'
    context.lineWidth = 1
    tripletBracketSpans(bars, layouts, barsPerRow, bracketParsed).forEach((span) =>
      drawTripletBracket(context, span),
    )
    context.lineWidth = 2
    polyrhythmBracketSpans(bars, layouts, barsPerRow, bracketParsed).forEach((span) =>
      drawPolyrhythmBracket(context, span),
    )
  }
  if (showBarIndex) {
    layouts.forEach((layout) => {
      const firstNote = layout.noteElements[0]
      if (!firstNote) return
      drawBarIndexLabel(
        context,
        firstNote.left + firstNote.width / 2,
        firstNote.top + firstNote.height,
        layout.barEl.barIndex ?? 0,
        palette.w1,
      )
    })
  }

  const elements = layouts.flatMap((layout) => [layout.barEl, ...layout.noteElements])
  context.restore()
  return { elements, layouts, rowHeights }
}

const redrawHighlightOverlays = (
  context: CanvasRenderingContext2D,
  args: {
    bars: string[]
    layouts: LaidOutBar[]
    palette: CanvasColors
    barsPerRow: number
    highlightedBarIndex: number
    showBarIndex: boolean
    markTriplets: boolean
    parsed: ParsedBarsNotation
  },
) => {
  if (args.showBarIndex) {
    const firstNote = args.layouts[args.highlightedBarIndex]?.noteElements[0]
    if (firstNote) {
      drawBarIndexLabel(
        context,
        firstNote.left + firstNote.width / 2,
        firstNote.top + firstNote.height,
        args.highlightedBarIndex,
        args.palette.w1,
      )
    }
  }
  if (!args.markTriplets) return

  const bracketParsed = {
    segments: args.parsed.segments,
    barCellCounts: args.parsed.barCellCounts,
  }
  context.strokeStyle = args.palette.w1
  context.fillStyle = args.palette.w1
  context.font = '7px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'bottom'
  context.lineWidth = 1
  tripletBracketSpans(args.bars, args.layouts, args.barsPerRow, bracketParsed).forEach((span) =>
    drawTripletBracket(context, span),
  )
  context.lineWidth = 2
  polyrhythmBracketSpans(args.bars, args.layouts, args.barsPerRow, bracketParsed).forEach((span) =>
    drawPolyrhythmBracket(context, span),
  )
}

export type BlitAndHighlightArgs = {
  visibleCanvas: HTMLCanvasElement
  staticCanvas: HTMLCanvasElement
  bars: string[]
  instrument: string
  canvasWidth: number
  canvasHeight: number
  contentWidth: number
  paddingX?: number
  paddingY: number
  barsPerRow: number
  highlightedBarIndex: number
  palette: CanvasColors
  showBarIndex: boolean
  markTriplets: boolean
  parsed: ParsedBarsNotation
  layouts: LaidOutBar[]
  rowHeights: number[]
}

/** Blit static layer; optionally paint only the playhead bar + overlays on top. */
export const blitAndHighlightBar = (args: BlitAndHighlightArgs) => {
  const {
    visibleCanvas,
    staticCanvas,
    canvasWidth,
    canvasHeight,
    paddingX = 0,
    paddingY,
    highlightedBarIndex,
  } = args
  const context = ensureCanvasDpi(visibleCanvas, canvasWidth, canvasHeight)
  if (!context) return null

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height)
  context.drawImage(staticCanvas, 0, 0)

  const dpr = getDevicePixelRatio()
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  if (highlightedBarIndex < 0) return context

  context.save()
  context.translate(paddingX, paddingY)
  const laidOut = layoutBar({
    bars: args.bars,
    canvasWidth: args.contentWidth,
    barIndex: highlightedBarIndex,
    barsPerRow: args.barsPerRow,
    highlighted: true,
    palette: args.palette,
    rowHeights: args.rowHeights,
    layout: args.parsed.layouts[highlightedBarIndex],
  })
  paintLaidOutBar(context, args.instrument, laidOut)
  redrawHighlightOverlays(context, {
    bars: args.bars,
    layouts: args.layouts,
    palette: args.palette,
    barsPerRow: args.barsPerRow,
    highlightedBarIndex,
    showBarIndex: args.showBarIndex,
    markTriplets: args.markTriplets,
    parsed: args.parsed,
  })
  context.restore()
  return context
}

export const staticBarsKey = (parts: {
  hash: string
  canvasWidth: number
  canvasHeight: number
  dpr: number
  barsPerRow: number
  instrument: string
  theme: string
  showBarIndex: boolean
  markTriplets: boolean
  paddingX: number
  paddingY: number
  contentWidth: number
}) =>
  [
    parts.hash,
    parts.canvasWidth,
    parts.canvasHeight,
    parts.dpr,
    parts.barsPerRow,
    parts.instrument,
    parts.theme,
    parts.showBarIndex ? 1 : 0,
    parts.markTriplets ? 1 : 0,
    parts.paddingX,
    parts.paddingY,
    parts.contentWidth,
  ].join('|')
