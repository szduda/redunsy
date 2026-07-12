'use client'

import { useEffect } from 'react'

import { DEFAULT_INSTRUMENT_VOLUME_LEVEL } from '@/lib/midinike/instrument-volume'

import { trackVolumeLevel, useTrackVolumeStore } from './track-volume.store'

export const useSyncInstrumentVolumes = (
  instruments: string[],
  setInstrumentVolume: (instrument: string, level: number) => void,
) => {
  const byInstrument = useTrackVolumeStore((state) => state.byInstrument)

  useEffect(() => {
    instruments.forEach((instrument) => {
      const entry = byInstrument[instrument]
      const level = entry ? trackVolumeLevel(entry) : DEFAULT_INSTRUMENT_VOLUME_LEVEL
      setInstrumentVolume(instrument, level)
    })
  }, [byInstrument, instruments, setInstrumentVolume])
}
