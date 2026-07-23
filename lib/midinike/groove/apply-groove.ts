import { barSlotSegments } from './build-bar-slots'
import { grooveSlotIndex } from './groove-index'
import { grooveOffset } from './groove-symbols'

import type { BarSlotSegment } from './build-bar-slots'
import type { BeatMatrix, BeatSlot, ParsedCell } from '../types'

const emptySlot = (): BeatSlot => [[], []]

const notationOffsetForTick = (tick: number, span: number, notationCellSpan: number) =>
  Math.min(notationCellSpan - 1, Math.floor((tick * notationCellSpan) / span))

const notationCellForBarTick = (segments: BarSlotSegment[], barTick: number) => {
  let cursor = 0
  for (const segment of segments) {
    const span = segment.slots.length
    if (barTick < cursor + span) {
      const localTick = barTick - cursor
      const cellOffset = notationOffsetForTick(localTick, span, segment.notationCellSpan)
      return segment.notationCellIndex + cellOffset
    }
    cursor += span
  }
  return segments[segments.length - 1]?.notationCellIndex ?? 0
}

const shiftBarGroove = (
  slots: BeatSlot[],
  segments: BarSlotSegment[],
  groove: string,
  notationCells: number,
  grooveLength: number,
): BeatSlot[] => {
  const span = slots.length
  const shifted = Array.from({ length: span }, () => emptySlot())

  for (let tick = 0; tick < span; tick += 1) {
    const slot = slots[tick]
    if (slot[0].length === 0) continue

    const notationCell = notationCellForBarTick(segments, tick)
    const grooveIndex = grooveSlotIndex(notationCell, notationCells, grooveLength)
    const delta = grooveOffset(groove[grooveIndex] ?? '-', notationCell === 0)
    const newTick = Math.max(0, Math.min(span - 1, tick + delta))
    shifted[newTick] = slot
  }

  return shifted
}

export const applyGrooveToBar = (
  cells: ParsedCell[],
  groove: string,
  notationCells: number,
  grooveLength: number,
): BeatMatrix => {
  const segments = barSlotSegments(cells, notationCells, grooveLength)
  const slots = segments.flatMap((segment) => segment.slots)
  if (groove === '-'.repeat(grooveLength)) return slots
  return shiftBarGroove(slots, segments, groove, notationCells, grooveLength)
}
