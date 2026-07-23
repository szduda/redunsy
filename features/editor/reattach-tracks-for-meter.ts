import { createTrack, emptyBars } from '@/features/rhythm/rhythm-helpers'
import type { RhythmInstrument, RhythmMeter, Track } from '@/features/rhythm/rhythm.types'

/** Recreate selected tracks with empty bars sized for the new meter (preserve bar count). */
export const reattachTracksForMeter = (
  instruments: Record<string, Track>,
  meter: RhythmMeter,
  clearTrackIds: string[],
): Record<string, Track> => {
  if (clearTrackIds.length === 0) return instruments

  const clearSet = new Set(clearTrackIds)
  return Object.fromEntries(
    Object.entries(instruments).map(([id, track]) => {
      if (!clearSet.has(id)) return [id, track]
      return [
        id,
        createTrack(
          track.instrument as RhythmInstrument,
          meter,
          emptyBars(meter, track.bars.length),
        ),
      ]
    }),
  )
}
