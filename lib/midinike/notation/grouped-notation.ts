export type GlyphKind = 'eighth' | 'sixteenth' | 'triplet'

export type GroupKind = 'triplet' | 'sixteenth'

export type GroupDescriptor = {
  kind: GroupKind
  open: '{' | '['
  close: '}' | ']'
  symbolsPerUnit: number
  cellsPerUnit: number
  glyphKind: GlyphKind
}

export const GROUP_DESCRIPTORS: readonly GroupDescriptor[] = [
  {
    kind: 'triplet',
    open: '{',
    close: '}',
    symbolsPerUnit: 3,
    cellsPerUnit: 2,
    glyphKind: 'triplet',
  },
  {
    kind: 'sixteenth',
    open: '[',
    close: ']',
    symbolsPerUnit: 2,
    cellsPerUnit: 1,
    glyphKind: 'sixteenth',
  },
]

export type CharRef = {
  barIndex: number
  charIndex: number
  char: string
}

export type GroupGlyphLocation = {
  kind: 'sixteenth' | 'triplet'
  barIndex: number
  charIndex: number
  groupStartBar: number
  groupStartChar: number
  groupEndBar: number
  groupEndChar: number
  subdivIndex: number
}

export type PlainGlyphLocation = {
  kind: 'plain'
  barIndex: number
  charIndex: number
}

export type GroupedGlyphLocation = PlainGlyphLocation | GroupGlyphLocation

export type GroupedBarGlyph = {
  note: string
  position: number
  kind: GlyphKind
  barIndex: number
  charIndex: number
}

export type GroupedBarLayout = {
  cellCount: number
  glyphs: GroupedBarGlyph[]
}

export type NotationToken = {
  text: string
  cells: number
  charRefs: CharRef[]
}

type Segment =
  | { kind: 'plain'; ref: CharRef; globalCell: number }
  | {
      kind: 'group'
      descriptor: GroupDescriptor
      openRef: CharRef
      closeRef: CharRef | null
      content: CharRef[]
      globalStartCell: number
      cells: number
      cellsByBar: number[]
      glyphs: GroupedBarGlyph[]
      locations: GroupedGlyphLocation[]
    }

export type GroupedSegment = Segment

export type GroupedNotation = {
  bars: string[]
  barCellCounts: number[]
  barLayouts: GroupedBarLayout[]
  glyphLocationsByBar: GroupedGlyphLocation[][]
  tokens: NotationToken[]
  segments: Segment[]
}

const descriptorForOpen = (open: string) =>
  GROUP_DESCRIPTORS.find((descriptor) => descriptor.open === open)

const cellsForGroup = (descriptor: GroupDescriptor, contentLength: number) => {
  const units = Math.max(1, Math.ceil(contentLength / descriptor.symbolsPerUnit))
  return units * descriptor.cellsPerUnit
}

const flattenBars = (bars: string[]): CharRef[] =>
  bars.flatMap((bar, barIndex) =>
    [...bar].map((char, charIndex) => ({ barIndex, charIndex, char })),
  )

const findGroupClose = (chars: CharRef[], openIndex: number, close: string) => {
  for (let index = openIndex + 1; index < chars.length; index += 1) {
    if (chars[index].char === close) return index
  }
  return -1
}

/** `-` before `[` or `{` links a plain symbol to a group — not a rest. */
const isGroupGlue = (bar: string, index: number) => {
  const next = bar[index + 1]
  const prev = bar[index - 1]
  if (bar[index] !== '-' || (next !== '[' && next !== '{')) return false
  if (!prev || prev === '-' || prev === '}' || prev === ']') return false

  if (next === '[') {
    const open = index + 1
    const end = bar.indexOf(']', open)
    if (end === -1) return false
    if (end - open - 1 <= 2) return false
  }

  if (next === '{') {
    const end = bar.indexOf('}', index + 1)
    if (end === -1) return false
    const inner = bar.slice(index + 2, end)
    const hasConvertedTripletRest =
      inner.length >= 2 && /[a-zA-Z]/.test(inner) && inner.endsWith('-')
    if (hasConvertedTripletRest) return false
  }

  return true
}

const isGlueAt = (bars: string[], ref: CharRef) => isGroupGlue(bars[ref.barIndex], ref.charIndex)

const barsTouchedByGroup = (openRef: CharRef, closeRef: CharRef | null, content: CharRef[]) => {
  const bars = new Set<number>([openRef.barIndex])
  content.forEach((ref) => bars.add(ref.barIndex))
  if (closeRef) bars.add(closeRef.barIndex)
  return [...bars].sort((left, right) => left - right)
}

const splitGroupCellsAcrossBars = (
  openRef: CharRef,
  closeRef: CharRef | null,
  content: CharRef[],
  totalCells: number,
  barCount: number,
) => {
  const cellsByBar = Array.from({ length: barCount }, () => 0)
  const spanBars = barsTouchedByGroup(openRef, closeRef, content)

  if (spanBars.length <= 1) {
    cellsByBar[openRef.barIndex] = totalCells
    return cellsByBar
  }

  let remaining = totalCells
  spanBars.forEach((barIndex, index) => {
    const share = index === spanBars.length - 1 ? remaining : Math.min(1, remaining)
    cellsByBar[barIndex] += share
    remaining -= share
  })

  return cellsByBar
}

const groupGlyphs = (
  descriptor: GroupDescriptor,
  content: CharRef[],
  globalStartCell: number,
): GroupedBarGlyph[] => {
  const span = descriptor.cellsPerUnit
  const glyphs: GroupedBarGlyph[] = []

  for (let index = 0; index < content.length; index += descriptor.symbolsPerUnit) {
    const unit = content.slice(index, index + descriptor.symbolsPerUnit)
    const base = globalStartCell + (index / descriptor.symbolsPerUnit) * span

    unit.forEach((ref, subdivIndex) => {
      const position =
        subdivIndex === 0 ? base : base + (subdivIndex * span) / descriptor.symbolsPerUnit

      glyphs.push({
        note: ref.char,
        position,
        kind: subdivIndex === 0 ? 'eighth' : descriptor.glyphKind,
        barIndex: ref.barIndex,
        charIndex: ref.charIndex,
      })
    })
  }

  return glyphs
}

const groupLocations = (
  descriptor: GroupDescriptor,
  openRef: CharRef,
  closeRef: CharRef,
  content: CharRef[],
): GroupedGlyphLocation[] =>
  content.map((ref, subdivIndex) => ({
    kind: descriptor.kind,
    barIndex: ref.barIndex,
    charIndex: ref.charIndex,
    groupStartBar: openRef.barIndex,
    groupStartChar: openRef.charIndex,
    groupEndBar: closeRef.barIndex,
    groupEndChar: closeRef.charIndex,
    subdivIndex,
  }))

const parseSegments = (bars: string[]): { segments: Segment[]; barCellCounts: number[] } => {
  const chars = flattenBars(bars)
  const segments: Segment[] = []
  const barCount = bars.length
  const barCellCounts = Array.from({ length: barCount }, () => 0)
  let index = 0

  const globalCellOffset = () => barCellCounts.reduce((sum, count) => sum + count, 0)

  while (index < chars.length) {
    const ref = chars[index]

    if (isGlueAt(bars, ref)) {
      index += 1
      continue
    }

    const descriptor = descriptorForOpen(ref.char)
    if (descriptor) {
      const closeIndex = findGroupClose(chars, index, descriptor.close)
      const hasClose = closeIndex >= 0
      const content = hasClose ? chars.slice(index + 1, closeIndex) : chars.slice(index + 1)
      const closeRef = hasClose ? chars[closeIndex] : null
      const totalCells = cellsForGroup(descriptor, content.length)
      const globalStartCell = globalCellOffset()
      const cellsByBar = splitGroupCellsAcrossBars(ref, closeRef, content, totalCells, barCount)
      cellsByBar.forEach((count, barIndex) => {
        barCellCounts[barIndex] += count
      })

      segments.push({
        kind: 'group',
        descriptor,
        openRef: ref,
        closeRef,
        content,
        globalStartCell,
        cells: totalCells,
        cellsByBar,
        glyphs: groupGlyphs(descriptor, content, globalStartCell),
        locations: closeRef
          ? groupLocations(descriptor, ref, closeRef, content)
          : groupLocations(descriptor, ref, ref, content),
      })

      index = hasClose ? closeIndex + 1 : chars.length
      continue
    }

    const globalCell = globalCellOffset()
    barCellCounts[ref.barIndex] += 1
    segments.push({ kind: 'plain', ref, globalCell })
    index += 1
  }

  return { segments, barCellCounts }
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

const glyphsForBar = (
  segments: Segment[],
  barIndex: number,
  barCellCount: number,
  barStart: number,
) => {
  const glyphs: GroupedBarGlyph[] = []

  segments.forEach((segment) => {
    if (segment.kind === 'plain') {
      if (segment.ref.barIndex !== barIndex) return
      glyphs.push({
        note: segment.ref.char,
        position: segment.globalCell - barStart,
        kind: 'eighth',
        barIndex,
        charIndex: segment.ref.charIndex,
      })
      return
    }

    segment.glyphs
      .filter((glyph) => glyph.barIndex === barIndex)
      .forEach((glyph) => {
        glyphs.push({
          ...glyph,
          position: glyph.position - barStart,
        })
      })
  })

  return { cellCount: barCellCount, glyphs }
}

const locationsForBar = (segments: Segment[], barIndex: number) => {
  const locations: GroupedGlyphLocation[] = []

  segments.forEach((segment) => {
    if (segment.kind === 'plain') {
      if (segment.ref.barIndex === barIndex) {
        locations.push({
          kind: 'plain',
          barIndex,
          charIndex: segment.ref.charIndex,
        })
      }
      return
    }

    segment.locations
      .filter((location) => location.barIndex === barIndex)
      .forEach((location) => locations.push(location))
  })

  return locations
}

const expandTokens = (segments: Segment[]): NotationToken[] => {
  const tokens: NotationToken[] = []

  segments.forEach((segment) => {
    if (segment.kind === 'plain') {
      tokens.push({
        text: segment.ref.char,
        cells: 1,
        charRefs: [segment.ref],
      })
      return
    }

    const { descriptor, openRef, closeRef, content, cellsByBar } = segment
    const spanBars = barsTouchedByGroup(openRef, closeRef, content)

    if (spanBars.length > 1) {
      spanBars.forEach((barIndex) => {
        const cells = cellsByBar[barIndex]
        if (!cells) return

        const refsInBar = [
          ...(openRef.barIndex === barIndex ? [openRef] : []),
          ...content.filter((ref) => ref.barIndex === barIndex),
          ...(closeRef && closeRef.barIndex === barIndex ? [closeRef] : []),
        ]
        const text = refsInBar.map((ref) => ref.char).join('')
        tokens.push({ text, cells, charRefs: refsInBar })
      })
      return
    }

    const inner = content.map((ref) => ref.char).join('')

    for (let unit = 0; unit < inner.length || unit === 0; unit += descriptor.symbolsPerUnit) {
      const unitChars = inner.slice(unit, unit + descriptor.symbolsPerUnit)
      const unitRefs = content.slice(unit, unit + descriptor.symbolsPerUnit)
      const isFirst = unit === 0
      const isLast = unit + descriptor.symbolsPerUnit >= inner.length
      const hasClose = closeRef !== null && isLast

      const text = isFirst
        ? `${descriptor.open}${unitChars}${hasClose ? descriptor.close : ''}`
        : `${unitChars}${hasClose ? descriptor.close : ''}`

      tokens.push({
        text,
        cells: descriptor.cellsPerUnit,
        charRefs: isFirst ? [openRef, ...unitRefs] : unitRefs,
      })

      if (unit + descriptor.symbolsPerUnit >= inner.length) break
    }
  })

  return tokens
}

export const parseGroupedNotation = (bars: string[]): GroupedNotation => {
  const { segments, barCellCounts } = parseSegments(bars)
  const starts = barStartCells(barCellCounts)
  const barLayouts = bars.map((_, barIndex) =>
    glyphsForBar(segments, barIndex, barCellCounts[barIndex], starts[barIndex]),
  )
  const glyphLocationsByBar = bars.map((_, barIndex) => locationsForBar(segments, barIndex))
  const tokens = expandTokens(segments)

  return {
    bars,
    barCellCounts,
    barLayouts,
    glyphLocationsByBar,
    tokens,
    segments,
  }
}

export const barsCellCounts = (bars: string[]) => parseGroupedNotation(bars).barCellCounts

export const barCellCountInBars = (bars: string[], barIndex: number) =>
  barsCellCounts(bars)[barIndex] ?? 0

export const joinedNotation = (bars: string[]) => bars.join('')

export { isGroupGlue }
