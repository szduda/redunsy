'use client'

import { type ChangeEvent, useState } from 'react'

import { BarsCanvas } from '@/features/groovy-player/canvas/bars-canvas'
import { Button } from '@/features/theme/button'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'
import { ZoomToggle, type ZoomBarsPerRow } from '@/features/zoom-toggle/zoom-toggle'
import { useMidinike, validateBarsForGroove } from '@/lib/midinike'

// const DEMO_BARS = ['ttstts', 'b--b--', 'sstsst', 'b--b--', '[tt]ts[tt]ts', 'b--b--', '{tttstt}ts', 'b--b--', 's[sf-f-b-sss]', 'b--b--', 's{tts}-{stt}', 'bs-b-b']
const DEMO_BARS= ['ttsb-s', 'b-sb-s', 'ttsb-s', 'b-sb-s', '[ss]ssstt', '-ssstt', 'ts---[tt]', '[tt]tbsb-', 'f-sf-s', 'f-sf--', 'f-tt-t', 't-tt--']
const DEFAULT_GROOVE = '-<(-<('
// const DEFAULT_GROOVE = '------'
const DEFAULT_TEMPO = 110
const MIN_TEMPO = 60
const MAX_TEMPO = 200
const TEMPO_STEP = 5

export const GroovyPlayer = () => {
  const [bars] = useState(DEMO_BARS)
  const [barsPerRow, setBarsPerRow] = useState<ZoomBarsPerRow>(4)
  const [playError, setPlayError] = useState<string | null>(null)

  const { play, pause, stop, setTempo, playing, tempo, activeBarIndex } = useMidinike({
    djembe: {
      instrument: 'djembe',
      sounds: ['b', 't', 's', 'f'],
      lengths: ['8th', '16th', '8th triplet'],
      grooves: [DEFAULT_GROOVE],
    },
    loop: true,
    tempo: DEFAULT_TEMPO,
  })

  const onTempoChange = ({ target }: ChangeEvent<HTMLInputElement>) =>
    setTempo(Number(target.value))

  const onTogglePlayPause = () => {
    if (playing) {
      pause()
      return
    }
    try {
      validateBarsForGroove(bars, DEFAULT_GROOVE.length)
      setPlayError(null)
      play.djembe(bars, DEFAULT_GROOVE)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
    }
  }

  return (
    <section className="flex w-full max-w-3xl flex-col gap-4">
      <BarsCanvas
        activeIndex={playing ? activeBarIndex : -1}
        bars={bars}
        barsPerRow={barsPerRow}
        id="groovy-player"
        instrument="djembe"
      />

      {playError ? <Text variant="mono">{playError}</Text> : null}

      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Button onClick={onTogglePlayPause} variant="primary">
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={stop}>Stop</Button>
        </div>

        <ZoomToggle onChange={setBarsPerRow} value={barsPerRow} />

        <div className="flex flex-col gap-2">
          <Text variant="mono">Tempo: {tempo} BPM</Text>
          <input
            aria-label="Tempo"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
            max={MAX_TEMPO}
            min={MIN_TEMPO}
            onChange={onTempoChange}
            step={TEMPO_STEP}
            type="range"
            value={tempo}
          />
          <div className="flex justify-between font-mono text-xs text-zinc-500">
            <span>{MIN_TEMPO}</span>
            <span>{MAX_TEMPO}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
