'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { DEMO_TRACKS, demoTrackBars } from '@/features/groovy-player/demo-tracks'
import { PlayerBottomNav } from '@/features/groovy-player/player-bottom-nav'
import { useScreenWakeLock } from '@/features/groovy-player/use-screen-wake-lock'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import {
  DEFAULT_TEMPO,
  DEMO_SWING_PATTERN,
  PLAYER_GROOVE_LENGTH,
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
  grooves: [DEMO_SWING_PATTERN],
}

export const GroovyPlayer = () => {
  useTopNavSticky(false)

  const barsPerRow = usePlayerStore((state) => state.barsPerRow)
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const storeBeatIndex = usePlayerStore((state) => state.beatIndex)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const preventScreenSleep = usePlayerStore((state) => state.preventScreenSleep)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setBeatIndex = usePlayerStore((state) => state.setBeatIndex)
  const [playError, setPlayError] = useState<string | null>(null)

  const playbackTracks = useMemo(() => demoTrackBars(), [])
  const grooveLength = PLAYER_GROOVE_LENGTH
  const groovePattern = resolveGroovePattern(swingPattern, grooveLength, swingEnabled)

  useLayoutEffect(() => {
    if (swingPattern.length === PLAYER_GROOVE_LENGTH) return
    setSwingPattern(swingPattern, PLAYER_GROOVE_LENGTH)
  }, [setSwingPattern, swingPattern])

  const getOverlayBars = useCallback(
    (patternBars: string[], _groove: string) => {
      if (!hasMetronome) return null
      const metronomeBar = metronomeBarForGrooveLength(grooveLength)
      return patternBars.map(() => metronomeBar)
    },
    [grooveLength, hasMetronome],
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
        grooves: [DEMO_SWING_PATTERN],
      },
      getOverlayBars,
      initialGroove: groovePattern,
      loop: true,
      tempo: DEFAULT_TEMPO,
    })

  useEffect(() => {
    if (isPlaying !== playing) setIsPlaying(playing)
  }, [isPlaying, playing, setIsPlaying])

  useEffect(() => {
    if (storeBeatIndex !== beatIndex) setBeatIndex(beatIndex)
  }, [beatIndex, setBeatIndex, storeBeatIndex])

  useEffect(() => () => stop(), [stop])

  useScreenWakeLock({ active: playing, enabled: preventScreenSleep })

  useLayoutEffect(() => {
    setGroove(groovePattern)
  }, [groovePattern, setGroove])

  useEffect(() => {
    setTempo(tempo)
  }, [setTempo, tempo])

  const validatePlaybackTracks = () => {
    DEMO_TRACKS.forEach((track) => {
      validateBarsForGroove(track.bars, grooveLength)
    })
  }

  const onTogglePlayPause = () => {
    if (isPlaying) {
      pause()
      return
    }
    try {
      validatePlaybackTracks()
      setPlayError(null)
      play(playbackTracks, groovePattern)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
    }
  }

  const onRestart = () => {
    try {
      validatePlaybackTracks()
      setPlayError(null)
      restart() ?? play(playbackTracks, groovePattern)
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
              bars={track.bars}
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
