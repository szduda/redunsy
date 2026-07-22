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

const PARSE_CACHE_MAX = 16
const parseNotationCache = new Map<string, ParsedBarsNotation>()

/** Hash-keyed parse cache for playhead ticks and multi-canvas reuse. */
export const cachedParseBarsNotation = (
  bars: string[],
  hash = bars.join(''),
): ParsedBarsNotation => {
  const hit = parseNotationCache.get(hash)
  if (hit) return hit
  const parsed = parseBarsNotation(bars)
  parseNotationCache.set(hash, parsed)
  if (parseNotationCache.size > PARSE_CACHE_MAX) {
    const oldest = parseNotationCache.keys().next().value
    if (oldest !== undefined) parseNotationCache.delete(oldest)
  }
  return parsed
}

/** Test-only: clear the notation parse cache. */
export const clearParseBarsNotationCacheForTests = () => {
  parseNotationCache.clear()
}

export const onBeatCellIndexes = (cellCount: number) => {
  if (cellCount % 6 === 0) return [0, 3]
  if (cellCount % 9 === 0) return [0, 3, 6]
  return [0, 4]
}
