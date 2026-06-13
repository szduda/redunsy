import type { BeatMatrix, BeatSlot } from '../types'

const emptySlot = (): BeatSlot => [[], []]

const mergeSlots = (left: BeatSlot, right: BeatSlot): BeatSlot => [
  [...left[0], ...right[0]],
  [...left[1], ...right[1]],
]

export const mergeBeatMatrices = (primary: BeatMatrix, overlay: BeatMatrix): BeatMatrix => {
  const length = Math.max(primary.length, overlay.length)
  return Array.from({ length }, (_, index) =>
    mergeSlots(primary[index] ?? emptySlot(), overlay[index] ?? emptySlot()),
  )
}
