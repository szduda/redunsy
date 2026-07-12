/** Cell-coordinate positions for a 4:3 polyrhythm group spanning two eighth cells. */
export const POLYRHYTHM_POSITIONS = [0, 0.5, 2 / 3, 1, 4 / 3, 3 / 2] as const

export const POLYRHYTHM_SLOT_COUNT = POLYRHYTHM_POSITIONS.length

export const polyrhythmTickAt = (index: number, cellTicks: number) =>
  Math.floor((POLYRHYTHM_POSITIONS[index] ?? 0) * cellTicks)

export type PolyrhythmLane = 'shared' | 'sixteenth' | 'triplet'

export const polyrhythmLaneAt = (index: number): PolyrhythmLane => {
  if (index === 0) return 'shared'
  if (index === 1 || index === 3 || index === 5) return 'sixteenth'
  return 'triplet'
}
