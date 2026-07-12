import { create } from 'zustand'

import { DEFAULT_INSTRUMENT_VOLUME_LEVEL } from '@/lib/midinike/instrument-volume'

const DEFAULT_VOLUME = DEFAULT_INSTRUMENT_VOLUME_LEVEL

type TrackVolumeEntry = {
  volume: number
  muted: boolean
}

type TrackVolumeState = {
  byInstrument: Record<string, TrackVolumeEntry>
  setVolume: (instrument: string, volume: number) => void
  toggleMute: (instrument: string) => void
}

const defaultEntry = (): TrackVolumeEntry => ({ volume: DEFAULT_VOLUME, muted: false })

const entryFor = (byInstrument: Record<string, TrackVolumeEntry>, instrument: string) =>
  byInstrument[instrument] ?? defaultEntry()

export const useTrackVolumeStore = create<TrackVolumeState>((set) => ({
  byInstrument: {},
  setVolume: (instrument, volume) =>
    set((state) => {
      const entry = entryFor(state.byInstrument, instrument)
      return {
        byInstrument: {
          ...state.byInstrument,
          [instrument]: {
            volume,
            muted: volume > 0 ? false : entry.muted,
          },
        },
      }
    }),
  toggleMute: (instrument) =>
    set((state) => {
      const entry = entryFor(state.byInstrument, instrument)
      return {
        byInstrument: {
          ...state.byInstrument,
          [instrument]: { ...entry, muted: !entry.muted },
        },
      }
    }),
}))

export const trackVolumeLevel = (entry: TrackVolumeEntry) => (entry.muted ? 0 : entry.volume)
