import { barCellCount, isGroupGlue } from '@/lib/midinike/notation/cell-duration'

export type GlyphKind = 'eighth' | 'sixteenth' | 'triplet'

export type BarGlyph = {
  note: string
  position: number
  kind: GlyphKind
}

export type BarLayout = {
  cellCount: number
  glyphs: BarGlyph[]
}

const sixteenthGlyphs = (content: string, cellIndex: number): BarGlyph[] => {
  const glyphs: BarGlyph[] = []
  for (let index = 0; index < content.length; index += 2) {
    const base = cellIndex + index / 2
    glyphs.push({ note: content[index], position: base, kind: 'eighth' })
    glyphs.push({ note: content[index + 1], position: base + 0.5, kind: 'sixteenth' })
  }
  return glyphs
}

const tripletGlyphs = (content: string, cellIndex: number): BarGlyph[] => {
  const glyphs: BarGlyph[] = []
  const span = 2

  for (let index = 0; index < content.length; index += 3) {
    const base = cellIndex + (index / 3) * span
    const group = content.slice(index, index + 3)
    glyphs.push({ note: group[0], position: base, kind: 'eighth' })
    glyphs.push({ note: group[1], position: base + span / 3, kind: 'triplet' })
    glyphs.push({ note: group[2], position: base + (span * 2) / 3, kind: 'triplet' })
  }

  return glyphs
}

export const parseBarLayout = (bar: string): BarLayout => {
  const glyphs: BarGlyph[] = []
  let cellIndex = 0
  let index = 0

  while (index < bar.length) {
    if (isGroupGlue(bar, index)) {
      index += 1
      continue
    }

    const char = bar[index]

    if (char === '[') {
      const end = bar.indexOf(']', index)
      if (end === -1) {
        glyphs.push({ note: char, position: cellIndex, kind: 'eighth' })
        cellIndex += 1
        index += 1
        continue
      }
      const content = bar.slice(index + 1, end)
      glyphs.push(...sixteenthGlyphs(content, cellIndex))
      cellIndex += content.length / 2
      index = end + 1
      continue
    }

    if (char === '{') {
      const end = bar.indexOf('}', index)
      if (end === -1) {
        glyphs.push({ note: char, position: cellIndex, kind: 'eighth' })
        cellIndex += 1
        index += 1
        continue
      }
      const content = bar.slice(index + 1, end)
      glyphs.push(...tripletGlyphs(content, cellIndex))
      cellIndex += Math.ceil(content.length / 3) * 2
      index = end + 1
      continue
    }

    glyphs.push({ note: char, position: cellIndex, kind: 'eighth' })
    cellIndex += 1
    index += 1
  }

  return { cellCount: barCellCount(bar), glyphs }
}

export const onBeatCellIndexes = (cellCount: number) => {
  if (cellCount % 6 === 0) return [0, 3]
  if (cellCount % 9 === 0) return [0, 3, 6]
  return [0, 4]
}
