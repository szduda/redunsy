import {
  parseGroupedNotation,
  type GlyphKind,
  type GroupedBarLayout,
  type GroupedSegment,
} from '@/lib/midinike/notation/grouped-notation'

export type { GlyphKind }

export type BarGlyph = {
  note: string
  position: number
  kind: GlyphKind
  polyrhythmIndex?: number
}

export type BarLayout = {
  cellCount: number
  glyphs: BarGlyph[]
}

export type ParsedBarsNotation = {
  layouts: BarLayout[]
  segments: GroupedSegment[]
  barCellCounts: number[]
}

export const toBarLayout = (layout: GroupedBarLayout): BarLayout => ({
  cellCount: layout.cellCount,
  glyphs: layout.glyphs.map(({ note, position, kind, polyrhythmIndex }) => ({
    note,
    position,
    kind,
    polyrhythmIndex,
  })),
})

export const parseBarLayout = (bar: string, bars?: string[], barIndex?: number): BarLayout => {
  const allBars = bars ?? [bar]
  const index = barIndex ?? 0
  const { barLayouts } = parseGroupedNotation(allBars)
  return toBarLayout(barLayouts[index] ?? { cellCount: 0, glyphs: [] })
}

export const parseBarsLayout = (bars: string[]): BarLayout[] =>
  parseGroupedNotation(bars).barLayouts.map(toBarLayout)

export const parseBarsNotation = (bars: string[]): ParsedBarsNotation => {
  const { barLayouts, segments, barCellCounts } = parseGroupedNotation(bars)
  return {
    layouts: barLayouts.map(toBarLayout),
    segments,
    barCellCounts,
  }
}

export const onBeatCellIndexes = (cellCount: number) => {
  if (cellCount % 6 === 0) return [0, 3]
  if (cellCount % 9 === 0) return [0, 3, 6]
  return [0, 4]
}
