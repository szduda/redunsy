import { TICKS_PER_EIGHTH } from '../notation/cell-duration'

import { eighthCellSlots, sixteenthCellSlots, tripletGroupSlots } from './cell-slots'

import type { BeatSlot, ParsedCell } from '../types'

export type BarSlotSegment = {
  notationCellIndex: number
  notationCellSpan: number
  slots: BeatSlot[]
}

export const ticksPerNotationCell = (notationCells: number, grooveLength: number) =>
  (grooveLength / notationCells) * TICKS_PER_EIGHTH

export const barSlotSegments = (
  cells: ParsedCell[],
  notationCells: number,
  grooveLength: number,
): BarSlotSegment[] => {
  const cellTicks = ticksPerNotationCell(notationCells, grooveLength)
  const segments: BarSlotSegment[] = []
  let index = 0
  let notationIndex = 0

  while (index < cells.length) {
    const cell = cells[index]
    if (cell.kind === 'triplet') {
      const span = cell.tripletCellSpan ?? 2
      segments.push({
        notationCellIndex: notationIndex,
        notationCellSpan: span,
        slots: tripletGroupSlots(cell, cellTicks * span),
      })
      const hasPairPlaceholder = cells[index + 1]?.kind === 'triplet-pair'
      index += hasPairPlaceholder ? 2 : 1
      notationIndex += span
      continue
    }
    if (cell.kind === 'triplet-pair') {
      index += 1
      continue
    }
    if (cell.kind === 'sixteenth') {
      segments.push({
        notationCellIndex: notationIndex,
        notationCellSpan: 1,
        slots: sixteenthCellSlots(cell, cellTicks),
      })
      index += 1
      notationIndex += 1
      continue
    }
    segments.push({
      notationCellIndex: notationIndex,
      notationCellSpan: 1,
      slots: eighthCellSlots(cell, cellTicks),
    })
    index += 1
    notationIndex += 1
  }

  return segments
}

export const barPreGrooveSlots = (grooveLength: number) => grooveLength * TICKS_PER_EIGHTH
