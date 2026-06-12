import { TICKS_PER_EIGHTH } from '../notation/cell-duration'

/** Groove shifts notes inside fixed eighth cells; slot count matches pre-groove length. */
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
