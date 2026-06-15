'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import { DEMO_TRACKS } from '@/features/groovy-player/demo-tracks'
import { MetronomeToggle } from '@/features/groovy-player/metronome-toggle'
import { PlayerTransport } from '@/features/groovy-player/player-transport'
import {
  barSizeFromTrackBars,
  DEFAULT_SWING_PATTERN,
  DEFAULT_TEMPO,
  resolveGroovePattern,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { SwingToggle } from '@/features/groovy-player/swing-toggle'
import { TempoSlider } from '@/features/groovy-player/tempo-slider'
import { Track } from '@/features/groovy-player/track/track'
import { Text } from '@/features/theme/text'
import { metronomeBarForGrooveLength, useMidinike, validateBarsForGroove } from '@/lib/midinike'

const LAYER_CONFIG = {
  instrument: 'djembe',
  sounds: ['b', 't', 's', 'f'],
  lengths: ['8th', '16th', '8th triplet'] as ('8th' | '16th' | '8th triplet')[],
  grooves: [DEFAULT_SWING_PATTERN],
}

export const GroovyPlayer = () => {
  const barsPerRow = usePlayerStore((state) => state.barsPerRow)
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const trackBars = usePlayerStore((state) => state.trackBars)
  const barSize = barSizeFromTrackBars(trackBars)
  const initTrackBars = usePlayerStore((state) => state.initTrackBars)
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setBeatIndex = usePlayerStore((state) => state.setBeatIndex)
  const [playError, setPlayError] = useState<string | null>(null)

  useLayoutEffect(() => {
    initTrackBars(DEMO_TRACKS)
  }, [initTrackBars])

  const groovePattern = resolveGroovePattern(swingPattern, barSize, swingEnabled)

  const getOverlayBars = useCallback(
    (patternBars: string[], _groove: string) => {
      if (!hasMetronome) return null
      const metronomeBar = metronomeBarForGrooveLength(barSize)
      return patternBars.map(() => metronomeBar)
    },
    [barSize, hasMetronome],
  )

  const { play, pause, stop, restart, setGroove, setTempo, setInstrumentVolume, playing, activeBarIndex, beatIndex } =
    useMidinike({
      djembe: LAYER_CONFIG,
      dundunba: { ...LAYER_CONFIG, instrument: 'dundunba', sounds: ['o', 'x'], lengths: ['8th'] },
      sangban: { ...LAYER_CONFIG, instrument: 'sangban', sounds: ['o', 'x'], lengths: ['8th'] },
      kenkeni: { ...LAYER_CONFIG, instrument: 'kenkeni', sounds: ['o', 'x'], lengths: ['8th'] },
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
    setGroove(groovePattern)
  }, [groovePattern, setGroove])

  useEffect(() => {
    setTempo(tempo)
  }, [setTempo, tempo])

  const validateTrackBars = () => {
    DEMO_TRACKS.forEach((track) => {
      const bars = trackBars[track.id]
      if (!bars?.length) return
      validateBarsForGroove(bars, barSize)
    })
  }

  const onTogglePlayPause = () => {
    if (isPlaying) {
      pause()
      return
    }
    try {
      validateTrackBars()
      setPlayError(null)
      play(trackBars, groovePattern)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
    }
  }

  const onRestart = () => {
    try {
      validateTrackBars()
      setPlayError(null)
      restart() ?? play(trackBars, groovePattern)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not restart pattern')
    }
  }

  const trackActiveIndex = activeBarIndex

  const onVolumeLevelChange = useCallback(
    (instrument: string, level: number) => setInstrumentVolume(instrument, level),
    [setInstrumentVolume],
  )

  return (
    <section className="flex w-full max-w-4xl flex-col gap-4 bg-zinc-900/60 md:rounded-xl">
      <div className="flex flex-col md:py-2 lg:py-4">
        {DEMO_TRACKS.map((track) => (
          <Track
            activeIndex={trackActiveIndex}
            bars={trackBars[track.id] ?? track.bars}
            barsPerRow={barsPerRow}
            id={track.id}
            instrument={track.instrument}
            key={track.id}
            name={track.name}
            onVolumeLevelChange={onVolumeLevelChange}
          />
        ))}
      </div>

      {playError ? <Text variant="mono">{playError}</Text> : null}

      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 py-2">
        <PlayerTransport
          isPlaying={isPlaying}
          onPlayPause={onTogglePlayPause}
          onRestart={onRestart}
          onStop={stop}
        />

        <div className="flex flex-wrap items-end gap-3">
          <TempoSlider />
          <MetronomeToggle />
          <SwingToggle />
        </div>
      </div>
    </section>
  )
}
