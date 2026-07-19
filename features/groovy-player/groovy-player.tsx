'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { DEMO_TRACKS, demoTrackBars } from '@/features/groovy-player/demo-tracks'
import { forkPlayerDemoToMyRhythms, PLAYER_DEMO_METER } from '@/features/groovy-player/demo-rhythm'
import { PlayerBottomNav } from '@/features/groovy-player/player-bottom-nav'
import { PlayerDemoBanner } from '@/features/groovy-player/player-demo-banner'
import { useScreenWakeLock } from '@/features/groovy-player/use-screen-wake-lock'
import { BackIcon } from '@/features/icons/back-icon'
import { EditIcon } from '@/features/icons/edit-icon'
import { ForkIcon } from '@/features/icons/fork-icon'
import { FixedSideActions } from '@/features/layout/fixed-side-actions'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import {
  DEFAULT_TEMPO,
  DEMO_NOTATION_SWING_PATTERN,
  DEMO_SWING_PATTERN,
  isSwingPatternEmpty,
  playbackGrooveLengthForMeter,
  resolveGroovePattern,
  swingBarSizeForMeter,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { useBarsPerRow } from '@/features/groovy-player/use-bars-per-row'
import { useFullBleedActive } from '@/features/groovy-player/use-full-bleed-active'
import { useMetronomeShakerVolume } from '@/features/groovy-player/use-metronome-shaker-volume'
import { Track } from '@/features/groovy-player/track/track'
import { usePlayerPlaybackControl } from '@/features/groovy-player/use-player-playback-control'
import { PageBottomNav } from '@/features/layout/page-bottom-nav'
import { findRhythmBySlug, forkRhythmToMyRhythms } from '@/features/rhythm/rhythm-catalog'
import { trackBarsRecord, tracksFromRecord } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import {
  tracksMatchGrooveLength,
  useMidinike,
  validateBarsForGroove,
  withMetronomeShakerTrack,
} from '@/lib/midinike'

const LAYER_CONFIG = {
  instrument: 'djembe',
  sounds: ['b', 't', 's', 'f'],
  lengths: ['8th', '16th', '8th triplet', 'polyrhythm'] as (
    | '8th'
    | '16th'
    | '8th triplet'
    | 'polyrhythm'
  )[],
  grooves: [DEMO_SWING_PATTERN],
}

type GroovyPlayerProps = {
  /** Build-time rhythm for static `/rhythm/[slug]` pages (no browser DB access). */
  rhythm?: Rhythm
  /** Hide title and subtitle — used when the page renders metadata separately. */
  hideHeader?: boolean
}

export const GroovyPlayer = ({ rhythm, hideHeader = false }: GroovyPlayerProps = {}) => {
  useTopNavSticky(false)
  const router = useRouter()

  const searchParams = useSearchParams()
  // Slug and localStorage rhythm resolve only after mount so SSR and hydration match.
  const [clientState, setClientState] = useState<{
    slug: string | null
    rhythm: Rhythm | null
  }>({ slug: null, rhythm: null })
  const [clientResolved, setClientResolved] = useState(Boolean(rhythm))

  useEffect(() => {
    const slug = searchParams.get('rhythm')
    setClientState({ slug, rhythm: slug ? findRhythmBySlug(slug) : null })
    setClientResolved(true)
  }, [searchParams])

  const rhythmSlug = clientState.slug
  const loadedRhythm = rhythm ?? clientState.rhythm
  const isPlayerDemo = clientResolved && !rhythm && !rhythmSlug && !loadedRhythm

  const barsPerRow = useBarsPerRow()
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)
  const setSwingEnabled = usePlayerStore((state) => state.setSwingEnabled)
  const setTempo = usePlayerStore((state) => state.setTempo)
  const fullBleedActive = useFullBleedActive()
  const preventScreenSleep = usePlayerStore((state) => state.preventScreenSleep)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setSwingBarSize = usePlayerStore((state) => state.setSwingBarSize)
  const [playError, setPlayError] = useState<string | null>(null)

  const displayTracks = loadedRhythm ? tracksFromRecord(loadedRhythm.instruments) : DEMO_TRACKS
  const playbackTracks = useMemo(
    () => (loadedRhythm ? trackBarsRecord(loadedRhythm) : demoTrackBars()),
    [loadedRhythm],
  )
  const notationGrooveLength = loadedRhythm
    ? swingBarSizeForMeter(loadedRhythm.meter)
    : swingBarSizeForMeter(PLAYER_DEMO_METER)
  const playbackGrooveLength = loadedRhythm
    ? playbackGrooveLengthForMeter(loadedRhythm.meter)
    : playbackGrooveLengthForMeter(PLAYER_DEMO_METER)
  const playbackTracksWithShaker = useMemo(
    () => withMetronomeShakerTrack(playbackTracks, playbackGrooveLength),
    [playbackGrooveLength, playbackTracks],
  )
  const groovePattern = resolveGroovePattern(swingPattern, playbackGrooveLength, swingEnabled)

  useLayoutEffect(() => {
    if (swingPattern.length === notationGrooveLength) return
    setSwingPattern(swingPattern, notationGrooveLength)
  }, [notationGrooveLength, setSwingPattern, swingPattern])

  useEffect(() => {
    if (!isPlayerDemo) return
    setSwingPattern(DEMO_NOTATION_SWING_PATTERN, swingBarSizeForMeter(PLAYER_DEMO_METER))
    setSwingEnabled(true)
  }, [isPlayerDemo, setSwingEnabled, setSwingPattern])

  useEffect(() => {
    if (!loadedRhythm) return
    setSwingPattern(loadedRhythm.swingPattern, notationGrooveLength)
    setSwingEnabled(!isSwingPatternEmpty(loadedRhythm.swingPattern))
    setTempo(loadedRhythm.tempo)
  }, [notationGrooveLength, loadedRhythm, setSwingEnabled, setSwingPattern, setTempo])

  const {
    play,
    pause,
    stop,
    restart,
    setGroove,
    setTempo: setMidinikeTempo,
    setInstrumentVolume,
    playing,
    activeBarIndex,
  } = useMidinike({
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
    initialGroove: groovePattern,
    loop: true,
    tempo: loadedRhythm?.tempo ?? DEFAULT_TEMPO,
  })

  useMetronomeShakerVolume(setInstrumentVolume)

  useEffect(() => {
    if (isPlaying !== playing) setIsPlaying(playing)
  }, [isPlaying, playing, setIsPlaying])

  useEffect(() => {
    setSwingBarSize(notationGrooveLength)
  }, [notationGrooveLength, setSwingBarSize])

  useScreenWakeLock({ active: playing, enabled: preventScreenSleep })

  useEffect(() => {
    setGroove(groovePattern)
  }, [groovePattern, setGroove])

  useEffect(() => {
    setMidinikeTempo(tempo)
  }, [setMidinikeTempo, tempo])

  const validatePlaybackTracks = useCallback(() => {
    displayTracks.forEach((track) => validateBarsForGroove(track.bars, notationGrooveLength))
    if (loadedRhythm && !tracksMatchGrooveLength(playbackTracks, notationGrooveLength)) {
      throw new Error(
        `Each bar must fill ${notationGrooveLength} cells for beat size ${loadedRhythm.meter}`,
      )
    }
  }, [displayTracks, loadedRhythm, notationGrooveLength, playbackTracks])

  const startPlayback = useCallback(() => {
    try {
      validatePlaybackTracks()
      setPlayError(null)
      play(playbackTracksWithShaker, groovePattern)
      return true
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
      return false
    }
  }, [groovePattern, playbackTracksWithShaker, play, validatePlaybackTracks])

  const restartPlayback = useCallback(() => {
    try {
      validatePlaybackTracks()
      setPlayError(null)
      return Boolean(restart())
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not restart pattern')
      return false
    }
  }, [restart, validatePlaybackTracks])

  const { mediaAudio, onRestart, onStop, onTogglePlayPause } = usePlayerPlaybackControl({
    artist: loadedRhythm?.author.join(', '),
    isPlaying,
    pause,
    playing,
    restartPlayback,
    sessionKey: loadedRhythm?.slug,
    startPlayback,
    stop,
    title: loadedRhythm?.title ?? (isPlayerDemo ? 'Player demo' : undefined),
  })

  const onVolumeLevelChange = useCallback(
    (instrument: string, level: number) => setInstrumentVolume(instrument, level),
    [setInstrumentVolume],
  )

  const onFork = () => {
    if (!loadedRhythm) return
    const source = findRhythmBySlug(loadedRhythm.slug) ?? loadedRhythm
    const forked = forkRhythmToMyRhythms(source)
    router.push(`/editor/${forked.slug}`)
  }

  const onForkDemo = () => {
    const forked = forkPlayerDemoToMyRhythms(tempo, swingPattern)
    router.push(`/editor/${forked.slug}`)
  }

  if (!clientResolved && !rhythm) {
    return <div className="flex w-full flex-col gap-3 lg:pt-4 xl:pt-6" aria-busy />
  }

  if (clientResolved && rhythmSlug && !loadedRhythm) {
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
      {mediaAudio}
      <div
        className={cn(
          'flex w-full flex-col gap-3',
          !fullBleedActive && !hideHeader && 'lg:pt-4 xl:px-4 xl:pt-6',
        )}
      >
        {isPlayerDemo ? <PlayerDemoBanner onFork={onForkDemo} /> : null}

        {!isPlayerDemo ? (
          <FixedSideActions placement={fullBleedActive ? 'above' : 'side'}>
            <Button
              className="!justify-start"
              href={rhythmSlug ? '/editor' : '/garage'}
              variant="subtle"
            >
              <BackIcon className="mr-1 size-4" />
              {rhythmSlug ? 'Back to My Rhythms' : 'Back to garage'}
            </Button>
            {loadedRhythm ? (
              <>
                <Button className="!justify-start" onClick={onFork} variant="subtle">
                  <ForkIcon className="mr-1 size-4" /> Fork
                </Button>
                {loadedRhythm.userOwned ? (
                  <Button
                    className="!justify-start"
                    href={`/editor/${loadedRhythm.slug}`}
                    variant="subtle"
                  >
                    <EditIcon className="mr-1 size-4" /> Edit
                  </Button>
                ) : null}
              </>
            ) : null}
          </FixedSideActions>
        ) : null}

        <section
          className={cn(
            'flex w-full flex-col gap-4 bg-white dark:bg-zinc-900/60 overflow-hidden',
            fullBleedActive
              ? 'md:rounded-none md:border-0'
              : 'md:rounded-xl md:border md:border-zinc-100 dark:border-transparent max-w-4xl mx-auto',
          )}
        >
          {loadedRhythm && !hideHeader ? (
            <div className="px-4 pt-4">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {loadedRhythm.title}
              </h1>
              <Text className="mt-0.5" variant="mono">
                {loadedRhythm.meter}/4
                {loadedRhythm.author.length ? ` · ${loadedRhythm.author.join(', ')}` : ''}
                {loadedRhythm.userOwned ? ' · private' : ''}
              </Text>
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

          {playError ? (
            <Text className="px-4 pb-2" variant="mono">
              {playError}
            </Text>
          ) : null}
        </section>
      </div>

      <PageBottomNav>
        <PlayerBottomNav
          isPlaying={isPlaying}
          onPlayPause={onTogglePlayPause}
          onRestart={onRestart}
          onStop={onStop}
        />
      </PageBottomNav>
    </>
  )
}
