'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import { DEMO_TRACKS } from '@/features/groovy-player/demo-tracks'
import { PlayerBottomNav } from '@/features/groovy-player/player-bottom-nav'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import {
  barSizeFromTrackBars,
  DEFAULT_SWING_PATTERN,
  DEFAULT_TEMPO,
  resolveGroovePattern,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { Track } from '@/features/groovy-player/track/track'
import { PageBottomNav } from '@/features/layout/page-bottom-nav'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { metronomeBarForGrooveLength, useMidinike, validateBarsForGroove } from '@/lib/midinike'

const LAYER_CONFIG = {
  instrument: 'djembe',
  sounds: ['b', 't', 's', 'f'],
  lengths: ['8th', '16th', '8th triplet'] as ('8th' | '16th' | '8th triplet')[],
  grooves: [DEFAULT_SWING_PATTERN],
}

export const GroovyPlayer = () => {
  useTopNavSticky(false)

  const barsPerRow = usePlayerStore((state) => state.barsPerRow)
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const trackBars = usePlayerStore((state) => state.trackBars)
  const barSize = barSizeFromTrackBars(trackBars)
  const initTrackBars = usePlayerStore((state) => state.initTrackBars)
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const fullBleed = usePlayerStore((state) => state.fullBleed)
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
    <>
      <section
        className={cn(
          'flex w-full flex-col gap-4 bg-white dark:bg-zinc-900/60',
          fullBleed
            ? 'md:rounded-none md:border-0'
            : 'max-w-4xl md:rounded-xl md:border md:border-zinc-100 dark:border-transparent',
        )}
      >
        <div className="flex flex-col">
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

        {playError ? <Text className="px-4 pb-2" variant="mono">{playError}</Text> : null}
      </section>

      <PageBottomNav>
        <PlayerBottomNav
          isPlaying={isPlaying}
          onPlayPause={onTogglePlayPause}
          onRestart={onRestart}
          onStop={stop}
        />
      </PageBottomNav>
    </>
  )
}
