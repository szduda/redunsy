import { useEffect } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'

const METRONOME_SHAKER_INSTRUMENT = 'shaker'

export const useMetronomeShakerVolume = (
  setInstrumentVolume: (instrument: string, level: number) => void,
) => {
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)

  useEffect(() => {
    setInstrumentVolume(METRONOME_SHAKER_INSTRUMENT, hasMetronome ? 100 : 0)
  }, [hasMetronome, setInstrumentVolume])
}
