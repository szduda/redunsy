import { symbolToSampleId } from '../audio/drums-config'

import { barsCellCounts, parseGroupedNotation } from './grouped-notation'
import { barCellCount, isGroupGlue } from './cell-duration'

import type { CellHit, ParsedCell } from '../types'

const createToHit =
  (soundMap?: Record<string, number | null>) =>
  (sound: string): CellHit => ({
    sound,
    sampleId: sound === '-' ? null : soundMap ? (soundMap[sound] ?? null) : symbolToSampleId(sound),
  })

const emptyCell = (kind: ParsedCell['kind'] = 'eighth'): ParsedCell => ({
  kind,
  hits: [],
  slotIndexes: [],
})

const placeTripletGroup = (
  chars: string,
  toHit: (sound: string) => CellHit,
  cellSpan = 2,
): ParsedCell[] => {
  const notes = [...chars].map(toHit)
  while (notes.length < 3) notes.push(toHit('-'))

  const triplet = {
    kind: 'triplet' as const,
    hits: [],
    slotIndexes: [],
    tripletNotes: notes,
    tripletCellSpan: cellSpan,
  }

  if (cellSpan === 1) return [triplet]

  return [triplet, { kind: 'triplet-pair' as const, hits: [], slotIndexes: [] }]
}

const tripletCellsFrom = (chars: string, toHit: (sound: string) => CellHit): ParsedCell[] => {
  const cells: ParsedCell[] = []
  for (let index = 0; index < chars.length; index += 3) {
    cells.push(...placeTripletGroup(chars.slice(index, index + 3), toHit))
  }
  return cells
}

const sixteenthCellsFrom = (chars: string, toHit: (sound: string) => CellHit): ParsedCell[] => {
  const cells: ParsedCell[] = []
  for (let index = 0; index < chars.length; index += 2) {
    const pair = [...chars.slice(index, index + 2)].map(toHit)
    cells.push({
      kind: 'sixteenth',
      hits: pair,
      slotIndexes: pair.map((_, slotIndex) => slotIndex),
    })
  }
  return cells
}

const parseSegment = (bar: string, toHit: (sound: string) => CellHit): ParsedCell[] => {
  const cells: ParsedCell[] = []
  const useSixteenthGrid = bar.includes('[')
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
        cells.push({ kind: 'eighth', hits: [toHit(char)], slotIndexes: [0] })
        index += 1
        continue
      }
      cells.push(...sixteenthCellsFrom(bar.slice(index + 1, end), toHit))
      index = end + 1
      continue
    }
    if (char === '{') {
      const end = bar.indexOf('}', index)
      if (end === -1) {
        cells.push({ kind: 'eighth', hits: [toHit(char)], slotIndexes: [0] })
        index += 1
        continue
      }
      cells.push(...tripletCellsFrom(bar.slice(index + 1, end), toHit))
      index = end + 1
      continue
    }
    cells.push(
      char === '-'
        ? emptyCell('eighth')
        : { kind: 'eighth', hits: [toHit(char)], slotIndexes: [0] },
    )
    index += 1
  }

  if (useSixteenthGrid) {
    return cells.map((cell) =>
      cell.kind === 'eighth' ? { ...cell, kind: 'sixteenth' as const } : cell,
    )
  }

  return cells
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

const cellsForBarFromSegments = (
  bars: string[],
  barIndex: number,
  toHit: (sound: string) => CellHit,
): ParsedCell[] => {
  const { segments, barCellCounts } = parseGroupedNotation(bars)
  const starts = barStartCells(barCellCounts)
  const barStart = starts[barIndex] ?? 0
  const barEnd = barStart + (barCellCounts[barIndex] ?? 0)
  const cells: ParsedCell[] = []

  segments.forEach((segment) => {
    if (segment.kind === 'plain') {
      if (segment.ref.barIndex !== barIndex) return
      if (segment.globalCell < barStart || segment.globalCell >= barEnd) return
      const char = segment.ref.char
      cells.push(
        char === '-'
          ? emptyCell('eighth')
          : { kind: 'eighth', hits: [toHit(char)], slotIndexes: [0] },
      )
      return
    }

    const groupStart = segment.globalStartCell
    const groupEnd = groupStart + segment.cells
    if (groupEnd <= barStart || groupStart >= barEnd) return

    const overlapStart = Math.max(groupStart, barStart)
    const overlapEnd = Math.min(groupEnd, barEnd)
    const overlapCells = overlapEnd - overlapStart
    if (overlapCells <= 0) return

    if (segment.descriptor.kind === 'triplet') {
      const fullNotes = segment.content.map((ref) => toHit(ref.char))
      while (fullNotes.length < 3) fullNotes.push(toHit('-'))
      const notes = fullNotes.map((note, index) => {
        const ref = segment.content[index]
        if (!ref || ref.barIndex !== barIndex) return { sound: '-', sampleId: null }
        return note
      })
      cells.push({
        kind: 'triplet',
        hits: [],
        slotIndexes: [],
        tripletNotes: notes,
        tripletCellSpan: overlapCells,
        tripletStartSubdiv: overlapStart - groupStart,
      })
      return
    }

    const contentInBar = segment.content
      .filter((ref) => ref.barIndex === barIndex)
      .map((ref) => ref.char)
      .join('')
    if (contentInBar) cells.push(...sixteenthCellsFrom(contentInBar, toHit))
  })

  const bar = bars[barIndex] ?? ''
  if (bar.includes('[')) {
    return cells.map((cell) =>
      cell.kind === 'eighth' ? { ...cell, kind: 'sixteenth' as const } : cell,
    )
  }

  return cells
}

export const usesCrossBarContext = (bars: string[]) =>
  bars.some((_, barIndex) => barNeedsCrossBarContext(bars, barIndex))

const barsTouchedBySegment = (segment: {
  openRef: { barIndex: number }
  closeRef: { barIndex: number } | null
  content: { barIndex: number }[]
}) => {
  const bars = new Set<number>([segment.openRef.barIndex])
  segment.content.forEach((ref) => bars.add(ref.barIndex))
  if (segment.closeRef) bars.add(segment.closeRef.barIndex)
  return bars
}

export const barNeedsCrossBarContext = (bars: string[], barIndex: number) => {
  const bar = bars[barIndex]
  if (!bar) return false

  const hasOpenTriplet = bar.includes('{') && !bar.includes('}')
  const hasOpenSixteenth = bar.includes('[') && !bar.includes(']')
  const continuesGroup = /^[^{\[]*[\}\]]/.test(bar)
  if (hasOpenTriplet || hasOpenSixteenth || continuesGroup) return true

  const { segments } = parseGroupedNotation(bars)
  return segments.some((segment) => {
    if (segment.kind !== 'group') return false
    const touchedBars = barsTouchedBySegment(segment)
    if (!touchedBars.has(barIndex) || touchedBars.size <= 1) return false
    return true
  })
}

export const parseBar = (
  bar: string,
  grooveLength: number,
  soundMap?: Record<string, number | null>,
  bars?: string[],
  barIndex?: number,
): ParsedCell[] => {
  const toHit = createToHit(soundMap)
  const allBars = bars ?? [bar]
  const index = barIndex ?? 0
  const needsContext =
    bars !== undefined && barIndex !== undefined && barNeedsCrossBarContext(allBars, index)
  const cells = needsContext
    ? cellsForBarFromSegments(allBars, index, toHit)
    : parseSegment(bar, toHit)
  const count = needsContext ? (barsCellCounts(allBars)[index] ?? 0) : barCellCount(bar)
  if (count > grooveLength) {
    throw new Error(`Bar "${bar}" has ${count} cells, more than groove length ${grooveLength}`)
  }
  return cells
}

export const parseBars = (
  bars: string[],
  groove: string,
  soundMap?: Record<string, number | null>,
) => bars.flatMap((bar, barIndex) => parseBar(bar, groove.length, soundMap, bars, barIndex))
