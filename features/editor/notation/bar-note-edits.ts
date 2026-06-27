import { parseBarLayout, type GlyphKind } from '@/features/groovy-player/canvas/bar-layout'
import { getGlyphLocations } from '@/features/editor/notation/glyph-locations'

export type NoteSelection = {
  barIndex: number
  glyphIndex: number
}

export type FlatNote = NoteSelection & {
  kind: GlyphKind
  note: string
}

export const getSelectionEditKind = (bar: string, glyphIndex: number) => {
  const location = getGlyphLocations(bar)[glyphIndex]
  return location?.kind ?? 'plain'
}

export const flattenBarNotes = (bars: string[]): FlatNote[] =>
  bars.flatMap((bar, barIndex) => {
    const { glyphs } = parseBarLayout(bar)
    return glyphs.map((glyph, glyphIndex) => ({
      barIndex,
      glyphIndex,
      kind: glyph.kind,
      note: glyph.note,
    }))
  })

export const getSelectedFlatNote = (
  bars: string[],
  selection: NoteSelection | null,
): FlatNote | null => {
  if (!selection) return null
  const bar = bars[selection.barIndex]
  if (!bar) return null
  const { glyphs } = parseBarLayout(bar)
  const glyph = glyphs[selection.glyphIndex]
  if (!glyph) return null
  return { ...selection, kind: glyph.kind, note: glyph.note }
}

export const navigateBarSelection = (
  bars: string[],
  selection: NoteSelection | null,
  direction: -1 | 1,
): NoteSelection | null => {
  if (!bars.length) return null

  if (!selection) {
    const barIndex = direction < 0 ? bars.length - 1 : 0
    return { barIndex, glyphIndex: 0 }
  }

  const nextBarIndex = selection.barIndex + direction
  if (nextBarIndex < 0 || nextBarIndex >= bars.length) return selection
  return { barIndex: nextBarIndex, glyphIndex: 0 }
}

export const navigateSelection = (
  bars: string[],
  selection: NoteSelection | null,
  direction: -1 | 1,
): NoteSelection | null => {
  const flat = flattenBarNotes(bars)
  if (!flat.length) return null

  if (!selection) {
    const target = direction < 0 ? flat[flat.length - 1] : flat[0]
    return { barIndex: target.barIndex, glyphIndex: target.glyphIndex }
  }

  const currentIndex = flat.findIndex(
    (note) => note.barIndex === selection.barIndex && note.glyphIndex === selection.glyphIndex,
  )
  if (currentIndex < 0) return selection

  const nextIndex = currentIndex + direction
  if (nextIndex < 0 || nextIndex >= flat.length) return selection
  const next = flat[nextIndex]
  return { barIndex: next.barIndex, glyphIndex: next.glyphIndex }
}

export const defaultNoteSelection = (bars: string[]): NoteSelection | null =>
  navigateSelection(bars, null, 1)

const replaceCharAt = (bar: string, charIndex: number, note: string) =>
  `${bar.slice(0, charIndex)}${note}${bar.slice(charIndex + 1)}`

export const setNoteAtGlyph = (bar: string, glyphIndex: number, note: string) => {
  const locations = getGlyphLocations(bar)
  const location = locations[glyphIndex]
  if (!location) return bar
  return replaceCharAt(bar, location.charIndex, note)
}

const nextPlainGlyphIndex = (
  glyphIndex: number,
  locations: ReturnType<typeof getGlyphLocations>,
) => {
  for (let index = glyphIndex + 1; index < locations.length; index += 1) {
    if (locations[index].kind === 'plain') return index
    return null
  }
  return null
}

const plainEighthPairAt = (bar: string, glyphIndex: number) => {
  const locations = getGlyphLocations(bar)
  const location = locations[glyphIndex]
  if (!location || location.kind !== 'plain') return null

  const nextIndex = nextPlainGlyphIndex(glyphIndex, locations)
  if (nextIndex === null) return null

  const nextLocation = locations[nextIndex]
  if (nextLocation.kind !== 'plain') return null

  const first = bar[location.charIndex]
  const second = bar[nextLocation.charIndex]
  const start = location.charIndex
  const end = nextLocation.charIndex + 1

  return { start, end, first, second }
}

export const convertToSixteenth = (bar: string, glyphIndex: number) => {
  const locations = getGlyphLocations(bar)
  const location = locations[glyphIndex]
  if (!location || location.kind !== 'plain') return bar

  const note = bar[location.charIndex]
  const group = `[${note}-]`
  return `${bar.slice(0, location.charIndex)}${group}${bar.slice(location.charIndex + 1)}`
}

export const convertToTriplet = (bar: string, glyphIndex: number) => {
  const pair = plainEighthPairAt(bar, glyphIndex)
  if (!pair) return bar

  const group = `{${pair.first}${pair.second}-}`
  return `${bar.slice(0, pair.start)}${group}${bar.slice(pair.end)}`
}

export const convertToEighth = (bar: string, glyphIndex: number) => {
  const locations = getGlyphLocations(bar)
  const location = locations[glyphIndex]
  if (!location) return bar

  if (location.kind === 'sixteenth') {
    const content = bar.slice(location.groupStart + 1, location.groupEnd)
    const first = content[0] ?? '-'
    return `${bar.slice(0, location.groupStart)}${first}${bar.slice(location.groupEnd + 1)}`
  }

  if (location.kind === 'triplet') {
    const content = bar.slice(location.groupStart + 1, location.groupEnd)
    const first = content[0] ?? '-'
    const second = content[1] ?? '-'
    return `${bar.slice(0, location.groupStart)}${first}${second}${bar.slice(location.groupEnd + 1)}`
  }

  return bar
}

export const updateBarAtSelection = (
  bars: string[],
  selection: NoteSelection,
  updater: (bar: string, glyphIndex: number) => string,
) => {
  const nextBars = [...bars]
  const bar = nextBars[selection.barIndex]
  if (!bar) return bars
  nextBars[selection.barIndex] = updater(bar, selection.glyphIndex)
  return nextBars
}
