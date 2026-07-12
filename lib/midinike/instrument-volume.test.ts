import { describe, expect, it } from 'vitest'

import { DEFAULT_INSTRUMENT_VOLUME_LEVEL } from '@/lib/midinike/instrument-volume'
import { DRUMS } from '@/lib/midinike/audio/drums-config'

const drumVolumeLevel = (
  instrumentLevels: Record<string, number | undefined>,
  instrument: string,
  drumBaseVolume: number,
) => {
  const level = instrumentLevels[instrument] ?? DEFAULT_INSTRUMENT_VOLUME_LEVEL
  return drumBaseVolume * (level / 100)
}

describe('instrument volume defaults', () => {
  it('uses 50% when an instrument has no stored level', () => {
    const djembeTone = DRUMS.djembeOpenTone
    expect(drumVolumeLevel({}, djembeTone.instrument, djembeTone.volume)).toBeCloseTo(
      djembeTone.volume * 0.5,
    )
  })

  it('applies the stored instrument level on top of drum sample gain', () => {
    const djembeTone = DRUMS.djembeOpenTone
    expect(
      drumVolumeLevel(
        { djembe: DEFAULT_INSTRUMENT_VOLUME_LEVEL },
        djembeTone.instrument,
        djembeTone.volume,
      ),
    ).toBeCloseTo(djembeTone.volume * 0.5)
  })
})
