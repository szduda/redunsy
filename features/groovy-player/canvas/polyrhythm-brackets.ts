import { polyrhythmLaneAt } from '@/lib/midinike/notation/polyrhythm-positions'
import {
  parseGroupedNotation,
  type GroupedBarGlyph,
} from '@/lib/midinike/notation/grouped-notation'

import type { BarGlyph } from './bar-layout'
import type { CanvasElement } from './types'

export type PolyrhythmBracketLayout = {
  barEl: Pick<CanvasElement, 'top' | 'left' | 'width'>
  noteElements: Array<Required<CanvasElement>>
  glyphs: BarGlyph[]
}

export type PolyrhythmBracketEndCaps = 'both' | 'start' | 'end'

export type PolyrhythmBracketSpan = {
  left: number
  right: number
  y: number
  showLabel: boolean
  endCaps: PolyrhythmBracketEndCaps
}

const POLYRHYTHM_SCALE = 0.75
const LANE_OFFSET = 0.33

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
  layout: PolyrhythmBracketLayout,
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

const polyrhythmUnitGlyphs = (glyphs: GroupedBarGlyph[]) => glyphs.slice(0, 6)

const isCrossBarPolyrhythm = (openBar: number, closeBar: number | undefined) =>
  closeBar !== undefined && closeBar !== openBar

export const polyrhythmBracketSpans = (
  bars: string[],
  layouts: PolyrhythmBracketLayout[],
  barsPerRow: number,
): PolyrhythmBracketSpan[] => {
  const { segments, barCellCounts } = parseGroupedNotation(bars)
  const barStarts = barStartCells(barCellCounts)
  const spans: PolyrhythmBracketSpan[] = []

  segments.forEach((segment) => {
    if (segment.kind !== 'group' || segment.descriptor.kind !== 'polyrhythm') return

    const unitGlyphs = polyrhythmUnitGlyphs(segment.glyphs)
    if (unitGlyphs.length < 6) return

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

    if (!isCrossBarPolyrhythm(openBar, closeBar)) {
      const first = openNotes[0]
      const last = openNotes[openNotes.length - 1]
      if (!first || !last) return
      spans.push({
        left: noteCenterX(first.left, first.width),
        right: noteCenterX(last.left, last.width),
        y: bracketY,
        showLabel: true,
        endCaps: 'both',
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
          endCaps: 'start',
        })
      }

      const lastClose = closeNotes[closeNotes.length - 1]
      if (lastClose && closeLayout) {
        spans.push({
          left: closeLayout.barEl.left,
          right: noteCenterX(lastClose.left, lastClose.width),
          y: closeLayout.barEl.top + 5,
          showLabel: true,
          endCaps: 'end',
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
      endCaps: 'both',
    })
  })

  return spans
}

export const drawPolyrhythmBracket = (
  context: CanvasRenderingContext2D,
  span: PolyrhythmBracketSpan,
) => {
  const tickHeight = 3
  const drawStartCap = span.endCaps === 'both' || span.endCaps === 'start'
  const drawEndCap = span.endCaps === 'both' || span.endCaps === 'end'

  context.beginPath()
  context.moveTo(span.left, span.y)
  context.lineTo(span.right, span.y)
  if (drawStartCap) {
    context.moveTo(span.left, span.y)
    context.lineTo(span.left, span.y + tickHeight)
  }
  if (drawEndCap) {
    context.moveTo(span.right, span.y)
    context.lineTo(span.right, span.y + tickHeight)
  }
  context.stroke()

  if (span.showLabel) {
    context.fillText('4:3', (span.left + span.right) / 2, span.y - 1)
  }
}

export const scaledPolyrhythmNoteRect = (
  note: Required<CanvasElement>,
  glyph: BarGlyph,
): Pick<Required<CanvasElement>, 'left' | 'top' | 'width' | 'height'> => {
  if (glyph.kind !== 'polyrhythm' && glyph.polyrhythmIndex === undefined) {
    return { left: note.left, top: note.top, width: note.width, height: note.height }
  }

  const index = glyph.polyrhythmIndex ?? 0
  const lane = polyrhythmLaneAt(index)
  const width = note.width * POLYRHYTHM_SCALE
  const height = note.height * POLYRHYTHM_SCALE
  const left = note.left + (note.width - width) / 2
  const laneCenterRatio =
    lane === 'shared' ? 0.5 : lane === 'sixteenth' ? LANE_OFFSET : 1 - LANE_OFFSET
  const top = note.top + note.height * laneCenterRatio - height / 2

  return { left, top, width, height }
}
