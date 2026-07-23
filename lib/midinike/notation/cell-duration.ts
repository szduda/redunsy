/** Twelve scheduler ticks per eighth — seven groove positions at ±2 / ±4 / ±6. */
export const TICKS_PER_EIGHTH = 12

export const plainCharCells = (length: number) => length

export const sixteenthCells = (length: number) => {
  if (length % 2 !== 0) {
    throw new Error(`Sixteenth group must have even length, got ${length}`)
  }
  return length / 2
}

export const tripletCells = (length: number) => Math.ceil(length / 3) * 2

import { barsCellCounts, isGroupGlue } from './grouped-notation'

export { isGroupGlue }

/** Counts cells for one bar. For cross-bar groups, pass the full bars array via `barsCellCounts`. */
export const barCellCount = (bar: string) => barsCellCounts([bar])[0] ?? 0
