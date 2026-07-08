'use client'

import { useEffect } from 'react'

import { useTrackVolumeStore } from '@/features/groovy-player/track/track-volume.store'

const DEFAULT_VOLUME = 50

export const useTrackVolume = (
  instrument: string,
  onVolumeLevelChange?: (instrument: string, level: number) => void,
) => {
  const volume = useTrackVolumeStore(
    (state) => state.byInstrument[instrument]?.volume ?? DEFAULT_VOLUME,
  )
  const muted = useTrackVolumeStore((state) => state.byInstrument[instrument]?.muted ?? false)
  const setVolume = useTrackVolumeStore((state) => state.setVolume)
  const toggleMute = useTrackVolumeStore((state) => state.toggleMute)

  useEffect(() => {
    onVolumeLevelChange?.(instrument, muted ? 0 : volume)
  }, [instrument, muted, onVolumeLevelChange, volume])

  return {
    volume,
    muted,
    onVolumeChange: (value: number) => setVolume(instrument, value),
    onToggleMute: () => toggleMute(instrument),
  }
}
