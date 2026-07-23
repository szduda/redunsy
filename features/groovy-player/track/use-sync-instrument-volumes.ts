'use client'

import { useEffect } from 'react'

import { DEFAULT_INSTRUMENT_VOLUME_LEVEL } from '@/lib/midinike/instrument-volume'

import { trackVolumeLevel, useTrackVolumeStore } from './track-volume.store'

const levelsSignature = (
  instruments: string[],
  byInstrument: Record<string, { volume: number; muted: boolean }>,
) =>
  instruments
    .map((instrument) => {
      const entry = byInstrument[instrument]
      return String(entry ? trackVolumeLevel(entry) : DEFAULT_INSTRUMENT_VOLUME_LEVEL)
    })
    .join('\0')

export const useSyncInstrumentVolumes = (
  instruments: string[],
  setInstrumentVolume: (instrument: string, level: number) => void,
) => {
  const signature = useTrackVolumeStore((state) => levelsSignature(instruments, state.byInstrument))

  useEffect(() => {
    const { byInstrument } = useTrackVolumeStore.getState()
    instruments.forEach((instrument) => {
      const entry = byInstrument[instrument]
      const level = entry ? trackVolumeLevel(entry) : DEFAULT_INSTRUMENT_VOLUME_LEVEL
      setInstrumentVolume(instrument, level)
    })
  }, [signature, instruments, setInstrumentVolume])
}
