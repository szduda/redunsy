import { barSlotSegments } from './build-bar-slots'
import { grooveSlotIndex } from './groove-index'
import { grooveGap } from './groove-symbols'

import type { BeatMatrix, BeatSlot, ParsedCell } from '../types'

const emptySlot = (): BeatSlot => [[], []]

const expandCell = (slots: BeatSlot[], emptys: number): BeatSlot[] => {
  if (emptys === 0) return slots
  const count = slots.length
  const total = count + emptys
  const expanded = Array.from({ length: total }, () => emptySlot())
  slots.forEach((slot, index) => {
    const position = Math.floor((index * total) / count)
    expanded[position] = slot
  })
  return expanded
}

const grooveForSegment = (
  groove: string,
  notationCellIndex: number,
  notationCellSpan: number,
  notationCells: number,
  grooveLength: number,
) => {
  const gaps = Array.from({ length: notationCellSpan }, (_, offset) => {
    const grooveIndex = grooveSlotIndex(
      notationCellIndex + offset,
      notationCells,
      grooveLength,
    )
    return grooveGap(groove[grooveIndex] ?? '-', grooveIndex === 0)
  })
  return Math.max(...gaps, 0)
}

export const applyGrooveToBar = (
  cells: ParsedCell[],
  groove: string,
  notationCells: number,
  grooveLength: number,
): BeatMatrix => {
  const expanded: BeatMatrix = []

  barSlotSegments(cells, notationCells, grooveLength).forEach((segment) => {
    const gaps = grooveForSegment(
      groove,
      segment.notationCellIndex,
      segment.notationCellSpan,
      notationCells,
      grooveLength,
    )
    expanded.push(...expandCell(segment.slots, gaps))
  })

  return expanded
}
