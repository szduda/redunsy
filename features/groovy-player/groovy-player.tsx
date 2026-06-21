'use client'

import { useSearchParams } from 'next/navigation'
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
  swingBarSizeForMeter,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { Track } from '@/features/groovy-player/track/track'
import { PageBottomNav } from '@/features/layout/page-bottom-nav'
import { findRhythmBySlug } from '@/features/rhythm/rhythm-catalog'
import { RhythmEditorButton } from '@/features/rhythm/rhythm-editor-button'
import { trackBarsRecord, tracksFromRecord } from '@/features/rhythm/rhythm-helpers'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { metronomeBarForGrooveLength, tracksMatchGrooveLength, useMidinike, validateBarsForGroove } from '@/lib/midinike'

const LAYER_CONFIG = {
  instrument: 'djembe',
  sounds: ['b', 't', 's', 'f'],
  lengths: ['8th', '16th', '8th triplet'] as ('8th' | '16th' | '8th triplet')[],
  grooves: [DEMO_SWING_PATTERN],
}

export const GroovyPlayer = () => {
  useTopNavSticky(false)

  const searchParams = useSearchParams()
  const rhythmSlug = searchParams.get('rhythm')
  const loadedRhythm = useMemo(
    () => (rhythmSlug ? findRhythmBySlug(rhythmSlug) : null),
    [rhythmSlug],
  )

  const barsPerRow = usePlayerStore((state) => state.barsPerRow)
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const storeBeatIndex = usePlayerStore((state) => state.beatIndex)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)
  const setTempo = usePlayerStore((state) => state.setTempo)
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const preventScreenSleep = usePlayerStore((state) => state.preventScreenSleep)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setBeatIndex = usePlayerStore((state) => state.setBeatIndex)
  const setSwingBarSize = usePlayerStore((state) => state.setSwingBarSize)
  const [playError, setPlayError] = useState<string | null>(null)

  const displayTracks = loadedRhythm ? tracksFromRecord(loadedRhythm.instruments) : DEMO_TRACKS
  const playbackTracks = useMemo(
    () => (loadedRhythm ? trackBarsRecord(loadedRhythm) : demoTrackBars()),
    [loadedRhythm],
  )
  const grooveLength = loadedRhythm ? swingBarSizeForMeter(loadedRhythm.meter) : PLAYER_GROOVE_LENGTH
  const groovePattern = resolveGroovePattern(swingPattern, grooveLength, swingEnabled)

  useLayoutEffect(() => {
    if (swingPattern.length === grooveLength) return
    setSwingPattern(swingPattern, grooveLength)
  }, [grooveLength, setSwingPattern, swingPattern])

  useEffect(() => {
    if (!loadedRhythm) return
    setSwingPattern(loadedRhythm.swingPattern, grooveLength)
    setTempo(loadedRhythm.tempo)
  }, [grooveLength, loadedRhythm, setSwingPattern, setTempo])

  const getOverlayBars = useCallback(
    (patternBars: string[], _groove: string) => {
      if (!hasMetronome) return null
      const metronomeBar = metronomeBarForGrooveLength(grooveLength)
      return patternBars.map(() => metronomeBar)
    },
    [grooveLength, hasMetronome],
  )

  const { play, pause, stop, restart, setGroove, setTempo: setMidinikeTempo, setInstrumentVolume, playing, activeBarIndex, beatIndex } =
    useMidinike({
      djembe: LAYER_CONFIG,
      dundunba: { ...LAYER_CONFIG, instrument: 'dundunba', sounds: ['o', 'x'], lengths: ['8th'] },
      sangban: { ...LAYER_CONFIG, instrument: 'sangban', sounds: ['o', 'x'], lengths: ['8th'] },
      kenkeni: { ...LAYER_CONFIG, instrument: 'kenkeni', sounds: ['o', 'x'], lengths: ['8th'] },
      bell: { ...LAYER_CONFIG, instrument: 'bell', sounds: ['x'], lengths: ['8th'] },
      shaker: {
        instrument: 'shaker',
        sounds: ['x'],
        lengths: ['8th'],
        grooves: [DEMO_SWING_PATTERN],
      },
      getOverlayBars,
      initialGroove: groovePattern,
      loop: true,
      tempo: loadedRhythm?.tempo ?? DEFAULT_TEMPO,
    })

  useEffect(() => {
    stop()
  }, [loadedRhythm?.slug, stop])

  useEffect(() => {
    if (isPlaying !== playing) setIsPlaying(playing)
  }, [isPlaying, playing, setIsPlaying])

  useEffect(() => {
    if (storeBeatIndex !== beatIndex) setBeatIndex(beatIndex)
  }, [beatIndex, setBeatIndex, storeBeatIndex])

  useEffect(() => () => stop(), [stop])

  useEffect(() => {
    setSwingBarSize(PLAYER_GROOVE_LENGTH)
  }, [setSwingBarSize])

  useScreenWakeLock({ active: playing, enabled: preventScreenSleep })

  useEffect(() => {
    setGroove(groovePattern)
  }, [groovePattern, setGroove])

  useEffect(() => {
    setMidinikeTempo(tempo)
  }, [setMidinikeTempo, tempo])

  const validatePlaybackTracks = () => {
    displayTracks.forEach((track) => validateBarsForGroove(track.bars, grooveLength))
    if (loadedRhythm && !tracksMatchGrooveLength(playbackTracks, grooveLength)) {
      throw new Error(`Each bar must fill ${grooveLength} cells for beat size ${loadedRhythm.meter}`)
    }
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

  const onVolumeLevelChange = useCallback(
    (instrument: string, level: number) => setInstrumentVolume(instrument, level),
    [setInstrumentVolume],
  )

  if (rhythmSlug && !loadedRhythm) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Text>Rhythm not found.</Text>
        <Button href="/garage" variant="outlined">
          Back to garage
        </Button>
      </div>
    )
  }

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
        {loadedRhythm ? (
          <div className="flex items-center justify-between gap-3 px-4 pt-4">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{loadedRhythm.title}</h1>
              <Text className="mt-0.5" variant="mono">
                {loadedRhythm.meter}/4 · {loadedRhythm.author}
                {loadedRhythm.userOwned ? ' · private' : ''}
              </Text>
            </div>
            <RhythmEditorButton slug={loadedRhythm.slug} userOwned={loadedRhythm.userOwned} />
          </div>
        ) : null}

        <div className="flex flex-col">
          {displayTracks.map((track) => (
            <Track
              activeIndex={activeBarIndex}
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
