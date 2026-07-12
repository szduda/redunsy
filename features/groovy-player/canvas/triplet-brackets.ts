import {
  parseGroupedNotation,
  type GroupedBarGlyph,
} from '@/lib/midinike/notation/grouped-notation'

import type { BarGlyph } from './bar-layout'
import type { CanvasElement } from './types'

export type TripletBracketLayout = {
  barEl: Pick<CanvasElement, 'top' | 'left' | 'width'>
  noteElements: Array<Required<CanvasElement>>
  glyphs: BarGlyph[]
}

export type TripletBracketSpan = {
  left: number
  right: number
  y: number
  showLabel: boolean
}

const barStartCells = (barCellCounts: number[]) => {
  const starts: number[] = []
  let cursor = 0
  barCellCounts.forEach((count) => {
    starts.push(cursor)
    cursor += count
  })
  return starts
}

const noteCenterX = (left: number, width: number) => left + width / 2

const findGlyphNote = (
  layout: TripletBracketLayout,
  segmentGlyph: GroupedBarGlyph,
  barStart: number,
) => {
  const localPosition = segmentGlyph.position - barStart
  const glyphIndex = layout.glyphs.findIndex(
    (glyph) =>
      glyph.note === segmentGlyph.note &&
      glyph.kind === segmentGlyph.kind &&
      Math.abs(glyph.position - localPosition) < 0.01,
  )
  if (glyphIndex < 0) return null
  return layout.noteElements[glyphIndex] ?? null
}

const tripletUnitGlyphs = (glyphs: GroupedBarGlyph[]) => glyphs.slice(0, 3)

const isCrossBarTriplet = (openBar: number, closeBar: number | undefined) =>
  closeBar !== undefined && closeBar !== openBar

export const tripletBracketSpans = (
  bars: string[],
  layouts: TripletBracketLayout[],
  barsPerRow: number,
): TripletBracketSpan[] => {
  const { segments, barCellCounts } = parseGroupedNotation(bars)
  const barStarts = barStartCells(barCellCounts)
  const spans: TripletBracketSpan[] = []

  segments.forEach((segment) => {
    if (segment.kind !== 'group' || segment.descriptor.kind !== 'triplet') return

    const unitGlyphs = tripletUnitGlyphs(segment.glyphs)
    if (unitGlyphs.length < 3) return

    const openBar = segment.openRef.barIndex
    const closeBar = segment.closeRef?.barIndex ?? openBar
    const openLayout = layouts[openBar]
    const closeLayout = layouts[closeBar]
    if (!openLayout) return

    const openNotes = unitGlyphs
      .filter((glyph) => glyph.barIndex === openBar)
      .map((glyph) => findGlyphNote(openLayout, glyph, barStarts[openBar] ?? 0))
      .filter((note): note is NonNullable<typeof note> => note !== null)

    const closeNotes =
      closeBar === openBar || !closeLayout
        ? []
        : unitGlyphs
            .filter((glyph) => glyph.barIndex === closeBar)
            .map((glyph) => findGlyphNote(closeLayout, glyph, barStarts[closeBar] ?? 0))
            .filter((note): note is NonNullable<typeof note> => note !== null)

    const bracketY = openLayout.barEl.top + 5

    if (!isCrossBarTriplet(openBar, closeBar)) {
      const first = openNotes[0]
      const last = openNotes[openNotes.length - 1]
      if (!first || !last) return
      spans.push({
        left: noteCenterX(first.left, first.width),
        right: noteCenterX(last.left, last.width),
        y: bracketY,
        showLabel: true,
      })
      return
    }

    const splitAcrossRows = openBar % barsPerRow === barsPerRow - 1

    if (splitAcrossRows) {
      const firstOpen = openNotes[0]
      if (firstOpen) {
        spans.push({
          left: noteCenterX(firstOpen.left, firstOpen.width),
          right: openLayout.barEl.left + openLayout.barEl.width,
          y: bracketY,
          showLabel: true,
        })
      }

      const lastClose = closeNotes[closeNotes.length - 1]
      if (lastClose && closeLayout) {
        spans.push({
          left: closeLayout.barEl.left,
          right: noteCenterX(lastClose.left, lastClose.width),
          y: closeLayout.barEl.top + 5,
          showLabel: true,
        })
      }
      return
    }

    const first = openNotes[0]
    const last = closeNotes[closeNotes.length - 1] ?? openNotes[openNotes.length - 1]
    if (!first || !last) return

    spans.push({
      left: noteCenterX(first.left, first.width),
      right: noteCenterX(last.left, last.width),
      y: bracketY,
      showLabel: true,
    })
  })

  return spans
}

export const drawTripletBracket = (context: CanvasRenderingContext2D, span: TripletBracketSpan) => {
  const tickHeight = 3
  context.beginPath()
  context.moveTo(span.left, span.y)
  context.lineTo(span.right, span.y)
  context.moveTo(span.left, span.y)
  context.lineTo(span.left, span.y + tickHeight)
  context.moveTo(span.right, span.y)
  context.lineTo(span.right, span.y + tickHeight)
  context.stroke()

  if (span.showLabel) {
    context.fillText('3', (span.left + span.right) / 2, span.y - 1)
  }
}
