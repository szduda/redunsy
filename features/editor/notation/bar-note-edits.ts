import { parseBarLayout, type GlyphKind } from '@/features/groovy-player/canvas/bar-layout'
import { getGlyphLocationsInBars } from '@/features/editor/notation/glyph-locations'
import { parseGroupedNotation } from '@/lib/midinike/notation/grouped-notation'

export type NoteSelection = {
  barIndex: number
  glyphIndex: number
}

export type FlatNote = NoteSelection & {
  kind: GlyphKind
  note: string
}

export const getSelectionEditKind = (bars: string[], selection: NoteSelection) => {
  const location = getGlyphLocationsInBars(bars, selection.barIndex)[selection.glyphIndex]
  return location?.kind ?? 'plain'
}

export const flattenBarNotes = (bars: string[]): FlatNote[] =>
  bars.flatMap((bar, barIndex) => {
    const { glyphs } = parseBarLayout(bar, bars, barIndex)
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
  const { glyphs } = parseBarLayout(bar, bars, selection.barIndex)
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

export const lastNoteSelection = (bars: string[]): NoteSelection | null => {
  const flat = flattenBarNotes(bars)
  if (!flat.length) return null
  const last = flat[flat.length - 1]
  return { barIndex: last.barIndex, glyphIndex: last.glyphIndex }
}

export const clampSelectionForTrack = (
  bars: string[],
  selection: NoteSelection | null,
  mode: 'note' | 'bar',
): NoteSelection | null => {
  if (!bars.length) return null

  if (mode === 'bar') {
    const barIndex = selection ? Math.min(Math.max(0, selection.barIndex), bars.length - 1) : 0
    return { barIndex, glyphIndex: 0 }
  }

  if (!selection) return null
  if (getSelectedFlatNote(bars, selection)) return selection

  if (selection.barIndex < 0 || selection.barIndex >= bars.length) {
    return lastNoteSelection(bars)
  }

  const locations = getGlyphLocationsInBars(bars, selection.barIndex)
  if (!locations.length) return lastNoteSelection(bars)

  return {
    barIndex: selection.barIndex,
    glyphIndex: Math.min(selection.glyphIndex, locations.length - 1),
  }
}

const replaceCharAt = (bar: string, charIndex: number, note: string) =>
  `${bar.slice(0, charIndex)}${note}${bar.slice(charIndex + 1)}`

export const setNoteAtGlyphInBar = (bar: string, glyphIndex: number, note: string) =>
  setNoteAtGlyph([bar], { barIndex: 0, glyphIndex }, note)[0] ?? bar

export const setNoteAtGlyph = (bars: string[], selection: NoteSelection, note: string) => {
  const locations = getGlyphLocationsInBars(bars, selection.barIndex)
  const location = locations[selection.glyphIndex]
  if (!location) return bars

  const nextBars = [...bars]
  const bar = nextBars[selection.barIndex]
  if (!bar) return bars
  nextBars[selection.barIndex] = replaceCharAt(bar, location.charIndex, note)
  return nextBars
}

const nextPlainGlyphIndex = (bars: string[], selection: NoteSelection) => {
  const locationsByBar = bars.map((_, barIndex) => getGlyphLocationsInBars(bars, barIndex))
  const flat = locationsByBar.flatMap((locations, barIndex) =>
    locations.map((location, glyphIndex) => ({ barIndex, glyphIndex, location })),
  )

  const currentIndex = flat.findIndex(
    (entry) => entry.barIndex === selection.barIndex && entry.glyphIndex === selection.glyphIndex,
  )
  if (currentIndex < 0) return null

  for (let index = currentIndex + 1; index < flat.length; index += 1) {
    if (flat[index].location.kind === 'plain') return index
    return null
  }
  return null
}

type PlainPair = {
  firstBarIndex: number
  firstCharIndex: number
  secondBarIndex: number
  secondCharIndex: number
  first: string
  second: string
}

const plainEighthPairAt = (bars: string[], selection: NoteSelection): PlainPair | null => {
  const locations = getGlyphLocationsInBars(bars, selection.barIndex)
  const location = locations[selection.glyphIndex]
  if (!location || location.kind !== 'plain') return null

  const locationsByBar = bars.map((_, barIndex) => getGlyphLocationsInBars(bars, barIndex))
  const flat = locationsByBar.flatMap((entries, barIndex) =>
    entries.map((entry, glyphIndex) => ({ barIndex, glyphIndex, location: entry })),
  )

  const nextIndex = nextPlainGlyphIndex(bars, selection)
  if (nextIndex === null) return null

  const second = flat[nextIndex]
  if (!second || second.location.kind !== 'plain') return null

  return {
    firstBarIndex: selection.barIndex,
    firstCharIndex: location.charIndex,
    secondBarIndex: second.barIndex,
    secondCharIndex: second.location.charIndex,
    first: bars[selection.barIndex]?.[location.charIndex] ?? '-',
    second: bars[second.barIndex]?.[second.location.charIndex] ?? '-',
  }
}

const convertToTripletInBar = (bar: string, glyphIndex: number) => {
  const pair = plainEighthPairAt([bar], { barIndex: 0, glyphIndex })
  if (!pair || pair.firstBarIndex !== pair.secondBarIndex) return bar

  const group = `{${pair.first}${pair.second}-}`
  return `${bar.slice(0, pair.firstCharIndex)}${group}${bar.slice(pair.secondCharIndex + 1)}`
}

const appendEmptyBar = (bars: string[], barSize: number) => [...bars, '-'.repeat(barSize)]

export const convertBarsToTriplet = (bars: string[], selection: NoteSelection, barSize: number) => {
  let workingBars = [...bars]
  let pair = plainEighthPairAt(workingBars, selection)

  if (!pair) {
    const locations = getGlyphLocationsInBars(workingBars, selection.barIndex)
    const location = locations[selection.glyphIndex]
    if (!location || location.kind !== 'plain') return workingBars

    const locationsByBar = workingBars.map((_, barIndex) =>
      getGlyphLocationsInBars(workingBars, barIndex),
    )
    const flat = locationsByBar.flatMap((entries, barIndex) =>
      entries.map((entry, glyphIndex) => ({ barIndex, glyphIndex, location: entry })),
    )
    const currentIndex = flat.findIndex(
      (entry) => entry.barIndex === selection.barIndex && entry.glyphIndex === selection.glyphIndex,
    )
    const isLastPlain = currentIndex === flat.length - 1
    if (!isLastPlain) return workingBars

    workingBars = appendEmptyBar(workingBars, barSize)
    pair = {
      firstBarIndex: selection.barIndex,
      firstCharIndex: location.charIndex,
      secondBarIndex: workingBars.length - 1,
      secondCharIndex: 0,
      first: workingBars[selection.barIndex]?.[location.charIndex] ?? '-',
      second: '-',
    }
  }

  const nextBars = [...workingBars]
  const firstBar = nextBars[pair.firstBarIndex] ?? ''
  const secondBar = nextBars[pair.secondBarIndex] ?? ''

  if (pair.firstBarIndex === pair.secondBarIndex) {
    const group = `{${pair.first}${pair.second}-}`
    nextBars[pair.firstBarIndex] =
      `${firstBar.slice(0, pair.firstCharIndex)}${group}${firstBar.slice(pair.secondCharIndex + 1)}`
    return nextBars
  }

  nextBars[pair.firstBarIndex] =
    `${firstBar.slice(0, pair.firstCharIndex)}{${pair.first}${pair.second}${firstBar.slice(pair.firstCharIndex + 1)}`
  nextBars[pair.secondBarIndex] = `-}${secondBar.slice(pair.secondCharIndex + 1)}`

  return nextBars
}

export const convertBarsToSixteenth = (bars: string[], selection: NoteSelection) => {
  const locations = getGlyphLocationsInBars(bars, selection.barIndex)
  const location = locations[selection.glyphIndex]
  if (!location || location.kind !== 'plain') return bars

  const bar = bars[selection.barIndex]
  if (!bar) return bars
  const note = bar[location.charIndex]
  const group = `[${note}-]`
  const nextBars = [...bars]
  nextBars[selection.barIndex] =
    `${bar.slice(0, location.charIndex)}${group}${bar.slice(location.charIndex + 1)}`
  return nextBars
}

export const convertToSixteenth = (bar: string, glyphIndex: number) => {
  const nextBars = convertBarsToSixteenth([bar], { barIndex: 0, glyphIndex })
  return nextBars[0] ?? bar
}

export const convertToTriplet = (bar: string, glyphIndex: number) =>
  convertToTripletInBar(bar, glyphIndex)

export const convertBarsToEighth = (bars: string[], selection: NoteSelection) => {
  const locations = getGlyphLocationsInBars(bars, selection.barIndex)
  const location = locations[selection.glyphIndex]
  if (!location) return bars

  const nextBars = [...bars]

  if (location.kind === 'sixteenth') {
    const bar = nextBars[selection.barIndex] ?? ''
    const innerStart = location.groupStart + 1
    const innerEnd = location.groupEnd
    const inner = bar.slice(innerStart, innerEnd)
    const unitIndex = Math.floor((location.charIndex - innerStart) / 2)
    const unitOffset = unitIndex * 2
    const first = inner[unitOffset] ?? '-'
    const nextInner = `${inner.slice(0, unitOffset)}${first}${inner.slice(unitOffset + 2)}`

    if (nextInner.length <= 1) {
      nextBars[selection.barIndex] =
        `${bar.slice(0, location.groupStart)}${nextInner}${bar.slice(location.groupEnd + 1)}`
      return nextBars
    }

    nextBars[selection.barIndex] =
      `${bar.slice(0, location.groupStart)}[${nextInner}]${bar.slice(location.groupEnd + 1)}`
    return nextBars
  }

  if (location.kind === 'triplet') {
    const { segments } = parseGroupedNotation(bars)
    const tripletSegment = segments.find(
      (segment) =>
        segment.kind === 'group' &&
        segment.descriptor.kind === 'triplet' &&
        segment.locations.some(
          (entry) =>
            entry.barIndex === selection.barIndex && entry.charIndex === location.charIndex,
        ),
    )

    if (!tripletSegment || tripletSegment.kind !== 'group') {
      const bar = nextBars[selection.barIndex] ?? ''
      const content = bar.slice(location.groupStart + 1, location.groupEnd)
      const first = content[0] ?? '-'
      const second = content[1] ?? '-'
      nextBars[selection.barIndex] =
        `${bar.slice(0, location.groupStart)}${first}${second}${bar.slice(location.groupEnd + 1)}`
      return nextBars
    }

    const { openRef, closeRef } = tripletSegment
    if (!closeRef || openRef.barIndex === closeRef.barIndex) {
      const bar = nextBars[selection.barIndex] ?? ''
      const content = bar.slice(location.groupStart + 1, location.groupEnd)
      const first = content[0] ?? '-'
      const second = content[1] ?? '-'
      nextBars[selection.barIndex] =
        `${bar.slice(0, location.groupStart)}${first}${second}${bar.slice(location.groupEnd + 1)}`
      return nextBars
    }

    const first = tripletSegment.content[0]?.char ?? '-'
    const second = tripletSegment.content[1]?.char ?? '-'

    const openBar = nextBars[openRef.barIndex] ?? ''
    nextBars[openRef.barIndex] = `${openBar.slice(0, openRef.charIndex)}${first}`

    if (closeRef) {
      const closeBar = nextBars[closeRef.barIndex] ?? ''
      nextBars[closeRef.barIndex] = `${second}${closeBar.slice(closeRef.charIndex + 1)}`
    } else {
      const secondRef = tripletSegment.content[1]
      if (secondRef) {
        const secondBar = nextBars[secondRef.barIndex] ?? ''
        nextBars[secondRef.barIndex] = `${second}${secondBar.slice(secondRef.charIndex + 1)}`
      }
    }

    return nextBars
  }

  return bars
}

export const convertToEighth = (bar: string, glyphIndex: number) => {
  const nextBars = convertBarsToEighth([bar], { barIndex: 0, glyphIndex })
  return nextBars[0] ?? bar
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
