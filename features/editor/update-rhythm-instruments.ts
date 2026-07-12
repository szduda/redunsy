import { createTrack } from '@/features/rhythm/rhythm-helpers'
import type { RhythmInstrument, RhythmMeter, Track } from '@/features/rhythm/rhythm.types'

export const updateRhythmInstrumentsMap = (
  instruments: Record<string, Track>,
  layers: RhythmInstrument[],
  meter: RhythmMeter,
): Record<string, Track> =>
  Object.fromEntries(
    layers.map((instrument) => [
      instrument,
      instruments[instrument] ?? createTrack(instrument, meter),
    ]),
  )
