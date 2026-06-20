import { isGroupGlue } from '@/lib/midinike/notation/cell-duration'

export type PlainGlyphLocation = { kind: 'plain'; charIndex: number }

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

export type GlyphLocation = PlainGlyphLocation | SixteenthGlyphLocation | TripletGlyphLocation

export const getGlyphLocations = (bar: string): GlyphLocation[] => {
  const locations: GlyphLocation[] = []
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
        locations.push({ kind: 'plain', charIndex: index })
        index += 1
        continue
      }
      const content = bar.slice(index + 1, end)
      for (let pair = 0; pair < content.length; pair += 2) {
        locations.push({
          kind: 'sixteenth',
          groupStart: index,
          groupEnd: end,
          charIndex: index + 1 + pair,
          pairIndex: 0,
        })
        if (pair + 1 < content.length) {
          locations.push({
            kind: 'sixteenth',
            groupStart: index,
            groupEnd: end,
            charIndex: index + 1 + pair + 1,
            pairIndex: 1,
          })
        }
      }
      index = end + 1
      continue
    }

    if (char === '{') {
      const end = bar.indexOf('}', index)
      if (end === -1) {
        locations.push({ kind: 'plain', charIndex: index })
        index += 1
        continue
      }
      const content = bar.slice(index + 1, end)
      for (let group = 0; group < content.length; group += 3) {
        for (let tripletIndex = 0; tripletIndex < 3; tripletIndex += 1) {
          locations.push({
            kind: 'triplet',
            groupStart: index,
            groupEnd: end,
            charIndex: index + 1 + group + tripletIndex,
            tripletIndex: tripletIndex as 0 | 1 | 2,
          })
        }
      }
      index = end + 1
      continue
    }

    locations.push({ kind: 'plain', charIndex: index })
    index += 1
  }

  return locations
}
