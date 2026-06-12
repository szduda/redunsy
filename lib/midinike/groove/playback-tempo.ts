import { TICKS_PER_EIGHTH } from '../notation/cell-duration'

/** Six scheduler ticks per eighth-cell; swing expansion is compensated separately. */
export const calcPlaybackTempo = (
  cellsPerBar: number,
  cellCount: number,
  preGrooveSlots: number,
  slotCount: number,
  tempo: number,
) => {
  if (cellCount === 0) return tempo
  const beatSize = cellsPerBar / 2
  const swingFactor = preGrooveSlots > 0 ? slotCount / preGrooveSlots : 1
  return (beatSize / 4) * tempo * TICKS_PER_EIGHTH * swingFactor
}
