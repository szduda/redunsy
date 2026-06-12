import type { BeatSlot, ParsedCell } from '../types'

const emptySlot = (): BeatSlot => [[], []]

const hitToSlot = (sampleId: number): BeatSlot => [[sampleId], []]

const noteToSlot = (hit: { sampleId: number | null }): BeatSlot =>
  hit.sampleId ? hitToSlot(hit.sampleId) : emptySlot()

const emptyTicks = (count: number): BeatSlot[] => Array.from({ length: count }, () => emptySlot())

const placeHit = (slots: BeatSlot[], tick: number, hit: { sampleId: number | null }) => {
  if (!hit.sampleId || tick < 0 || tick >= slots.length) return
  slots[tick] = hitToSlot(hit.sampleId)
}

export const tripletGroupSlots = (cell: ParsedCell, spanTicks: number): BeatSlot[] => {
  const slots = emptyTicks(spanTicks)
  const notes = cell.tripletNotes ?? []
  notes.forEach((note, index) => {
    const tick = Math.floor((index * spanTicks) / 3)
    placeHit(slots, tick, note)
  })
  return slots
}

export const sixteenthCellSlots = (cell: ParsedCell, cellTicks: number): BeatSlot[] => {
  const slots = emptyTicks(cellTicks)
  const hitCount = cell.hits.length
  cell.hits.forEach((hit, index) => {
    const tick = hitCount > 0 ? Math.floor((index * cellTicks) / hitCount) : 0
    placeHit(slots, tick, hit)
  })
  return slots
}

export const eighthCellSlots = (cell: ParsedCell, cellTicks: number): BeatSlot[] => {
  const slots = emptyTicks(cellTicks)
  if (cell.hits[0]) placeHit(slots, 0, cell.hits[0])
  return slots
}
