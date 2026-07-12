import { parseGroupedNotation, type GlyphKind } from '@/lib/midinike/notation/grouped-notation'

export type { GlyphKind }

export type BarGlyph = {
  note: string
  position: number
  kind: GlyphKind
}

export type BarLayout = {
  cellCount: number
  glyphs: BarGlyph[]
}

export const parseBarLayout = (bar: string, bars?: string[], barIndex?: number): BarLayout => {
  const allBars = bars ?? [bar]
  const index = barIndex ?? 0
  const { barLayouts } = parseGroupedNotation(allBars)
  const layout = barLayouts[index] ?? { cellCount: 0, glyphs: [] }
  return {
    cellCount: layout.cellCount,
    glyphs: layout.glyphs.map(({ note, position, kind }) => ({ note, position, kind })),
  }
}

export const parseBarsLayout = (bars: string[]) => parseGroupedNotation(bars).barLayouts

export const onBeatCellIndexes = (cellCount: number) => {
  if (cellCount % 6 === 0) return [0, 3]
  if (cellCount % 9 === 0) return [0, 3, 6]
  return [0, 4]
}
