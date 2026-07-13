import {
  parseGroupedNotation,
  type GroupedGlyphLocation,
} from '@/lib/midinike/notation/grouped-notation'

export type PlainGlyphLocation = {
  kind: 'plain'
  charIndex: number
}

export type SixteenthGlyphLocation = {
  kind: 'sixteenth'
  groupStart: number
  groupEnd: number
  charIndex: number
  pairIndex: 0 | 1
}

export type TripletGlyphLocation = {
  kind: 'triplet'
  groupStart: number
  groupEnd: number
  charIndex: number
  tripletIndex: 0 | 1 | 2
}

export type PolyrhythmGlyphLocation = {
  kind: 'polyrhythm'
  groupStart: number
  groupEnd: number
  charIndex: number
  polyrhythmIndex: 0 | 1 | 2 | 3 | 4 | 5
}

export type GlyphLocation =
  | PlainGlyphLocation
  | SixteenthGlyphLocation
  | TripletGlyphLocation
  | PolyrhythmGlyphLocation

const toBarLocalLocation = (
  bars: string[],
  barIndex: number,
  location: GroupedGlyphLocation,
): GlyphLocation => {
  if (location.kind === 'plain') {
    return { kind: 'plain', charIndex: location.charIndex }
  }

  const bar = bars[barIndex] ?? ''
  const groupStart = location.groupStartBar === barIndex ? location.groupStartChar : 0
  const groupEnd = location.groupEndBar === barIndex ? location.groupEndChar : bar.length - 1

  if (location.kind === 'sixteenth') {
    return {
      kind: 'sixteenth',
      groupStart,
      groupEnd,
      charIndex: location.charIndex,
      pairIndex: (location.subdivIndex % 2) as 0 | 1,
    }
  }

  if (location.kind === 'polyrhythm') {
    return {
      kind: 'polyrhythm',
      groupStart,
      groupEnd,
      charIndex: location.charIndex,
      polyrhythmIndex: location.subdivIndex as 0 | 1 | 2 | 3 | 4 | 5,
    }
  }

  return {
    kind: 'triplet',
    groupStart,
    groupEnd,
    charIndex: location.charIndex,
    tripletIndex: location.subdivIndex as 0 | 1 | 2,
  }
}

export const getGlyphLocations = (bar: string, bars?: string[], barIndex?: number) => {
  const allBars = bars ?? [bar]
  const index = barIndex ?? 0
  const { glyphLocationsByBar } = parseGroupedNotation(allBars)
  return (glyphLocationsByBar[index] ?? []).map((location) =>
    toBarLocalLocation(allBars, index, location),
  )
}

export const getGlyphLocationsInBars = (bars: string[], barIndex: number) =>
  getGlyphLocations(bars[barIndex] ?? '', bars, barIndex)
