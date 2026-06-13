import { symbolToSampleId } from '../audio/drums-config'

import { barCellCount, isGroupGlue } from './cell-duration'

import type { CellHit, ParsedCell } from '../types'

const createToHit =
  (soundMap?: Record<string, number | null>) =>
  (sound: string): CellHit => ({
    sound,
    sampleId:
      sound === '-'
        ? null
        : soundMap
          ? (soundMap[sound] ?? null)
          : symbolToSampleId(sound),
  })

const emptyCell = (kind: ParsedCell['kind'] = 'eighth'): ParsedCell => ({
  kind,
  hits: [],
  slotIndexes: [],
})

const placeTripletGroup = (chars: string, toHit: (sound: string) => CellHit): ParsedCell[] => {
  const notes = [...chars].map(toHit)
  while (notes.length < 3) notes.push(toHit('-'))

  return [
    { kind: 'triplet', hits: [], slotIndexes: [], tripletNotes: notes },
    { kind: 'triplet-pair', hits: [], slotIndexes: [] },
  ]
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
      cells.push(...sixteenthCellsFrom(bar.slice(index + 1, end), toHit))
      index = end + 1
      continue
    }
    if (char === '{') {
      const end = bar.indexOf('}', index)
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

export const parseBar = (
  bar: string,
  grooveLength: number,
  soundMap?: Record<string, number | null>,
): ParsedCell[] => {
  const toHit = createToHit(soundMap)
  const cells = parseSegment(bar, toHit)
  const count = barCellCount(bar)
  if (count > grooveLength) {
    throw new Error(`Bar "${bar}" has ${count} cells, more than groove length ${grooveLength}`)
  }
  return cells
}

export const parseBars = (bars: string[], groove: string): ParsedCell[] =>
  bars.flatMap((bar) => parseBar(bar, groove.length))
