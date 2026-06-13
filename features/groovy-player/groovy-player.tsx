'use client'

import { useCallback, useEffect, useState } from 'react'

import { BarsCanvas } from '@/features/groovy-player/canvas/bars-canvas'
import { MetronomeToggle } from '@/features/groovy-player/metronome-toggle'
import {
  DEFAULT_SWING_PATTERN,
  DEFAULT_TEMPO,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { SwingPatternInput } from '@/features/groovy-player/swing-pattern-input'
import { TempoSlider } from '@/features/groovy-player/tempo-slider'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { metronomeBarForGrooveLength, useMidinike, validateBarsForGroove } from '@/lib/midinike'

// const DEMO_BARS = ['ttstts', 'b--b--', 'sstsst', 'b--b--', '[tt]ts[tt]ts', 'b--b--', '{tttstt}ts', 'b--b--', 's[sf-f-b-sss]', 'b--b--', 's{tts}-{stt}', 'bs-b-b']
const DEMO_BARS = [
  'ttsb-s',
  'b-sb-s',
  'ttsb-s',
  'b-sb-s',
  '[ss]ssstt',
  '-ssstt',
  'ts---[tt]',
  '[tt]tbsb-',
  'f-sf-s',
  'f-sf--',
  'f-tt-t',
  't-tt--',
]

export const GroovyPlayer = () => {
  const [bars] = useState(DEMO_BARS)
  const barsPerRow = usePlayerStore((state) => state.barsPerRow)
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setBeatIndex = usePlayerStore((state) => state.setBeatIndex)
  const [playError, setPlayError] = useState<string | null>(null)

  const getOverlayBars = useCallback(
    (patternBars: string[], groove: string) => {
      if (!hasMetronome) return null
      const metronomeBar = metronomeBarForGrooveLength(groove.length)
      return patternBars.map(() => metronomeBar)
    },
    [hasMetronome],
  )

  const { play, pause, stop, setGroove, setTempo, playing, activeBarIndex, beatIndex } =
    useMidinike({
      djembe: {
        instrument: 'djembe',
        sounds: ['b', 't', 's', 'f'],
        lengths: ['8th', '16th', '8th triplet'],
        grooves: [DEFAULT_SWING_PATTERN],
      },
      shaker: {
        instrument: 'shaker',
        sounds: ['x'],
        lengths: ['8th'],
        grooves: [DEFAULT_SWING_PATTERN],
      },
      getOverlayBars,
      loop: true,
      tempo: DEFAULT_TEMPO,
    })

  useEffect(() => {
    setIsPlaying(playing)
    setBeatIndex(beatIndex)
  }, [beatIndex, playing, setBeatIndex, setIsPlaying])

  useEffect(() => {
    if (swingPattern) setGroove(swingPattern)
  }, [setGroove, swingPattern])

  useEffect(() => {
    setTempo(tempo)
  }, [setTempo, tempo])

  const onTogglePlayPause = () => {
    if (isPlaying) {
      pause()
      return
    }
    try {
      validateBarsForGroove(bars, swingPattern.length)
      setPlayError(null)
      play.djembe(bars, swingPattern)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
    }
  }

  return (
    <section className="flex w-full max-w-3xl flex-col gap-4">
      <BarsCanvas
        activeIndex={isPlaying ? activeBarIndex : -1}
        bars={bars}
        barsPerRow={barsPerRow}
        id="groovy-player"
        instrument="djembe"
      />

      {playError ? <Text variant="mono">{playError}</Text> : null}

      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Button onClick={onTogglePlayPause} variant="primary">
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={stop}>Stop</Button>
        </div>

        <div className="flex gap-4">
          <SwingPatternInput />
          <TempoSlider />
          <MetronomeToggle />
        </div>
      </div>
    </section>
  )
}
