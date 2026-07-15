'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { PublishGate } from '@/features/admin/publish-gate'
import { CollapsibleMetadata } from '@/features/editor/collapsible-metadata'
import { replaceEditorSlugUrl } from '@/features/editor/editor-url'
import { BackIcon } from '@/features/icons/back-icon'
import { Note16Icon } from '@/features/icons/note-16-icon'
import { InstrumentTabs } from '@/features/editor/instrument-tabs'
import { EditableBarsCanvas } from '@/features/editor/editable-bars-canvas'
import { EditorKeyboard } from '@/features/editor/keyboard/editor-keyboard'
import { useEditorStore } from '@/features/editor/editor.store'
import { useEditorKeyboard } from '@/features/editor/use-editor-keyboard'
import { useFlamMode } from '@/features/editor/use-flam-mode'
import { useNoteEditor } from '@/features/editor/use-note-editor'
import { useBarsPerRow } from '@/features/groovy-player/use-bars-per-row'
import { PlayerBottomNav } from '@/features/groovy-player/player-bottom-nav'
import {
  defaultSwingPatternForMeter,
  isSwingPatternEmpty,
  playbackGrooveLengthForMeter,
  resolveGroovePattern,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { useMetronomeShakerVolume } from '@/features/groovy-player/use-metronome-shaker-volume'
import { TrackVolume } from '@/features/groovy-player/track/track-volume'
import { useSyncInstrumentVolumes } from '@/features/groovy-player/track/use-sync-instrument-volumes'
import { useTrackVolume } from '@/features/groovy-player/track/use-track-volume'
import { usePlayerPlaybackControl } from '@/features/groovy-player/use-player-playback-control'
import { PageBottomNav } from '@/features/layout/page-bottom-nav'
import { FixedSideActions } from '@/features/layout/fixed-side-actions'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import { slugFromTitle, trackBarsRecord } from '@/features/rhythm/rhythm-helpers'
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
}

export const RhythmEditor = () => {
  useTopNavSticky(false)
  const router = useRouter()

  const activeSlug = useEditorStore((state) => state.activeSlug)
  const rhythm = useEditorStore((state) => state.rhythms[activeSlug ?? ''])
  const focusedTrackId = useEditorStore((state) => state.focusedTrackId)
  const setFocusedTrackId = useEditorStore((state) => state.setFocusedTrackId)
  const patchActiveRhythm = useEditorStore((state) => state.patchActiveRhythm)
  const updateTrackBars = useEditorStore((state) => state.updateTrackBars)
  const updateRhythmInstruments = useEditorStore((state) => state.updateRhythmInstruments)
  const backToPicker = useEditorStore((state) => state.backToPicker)

  const barsPerRow = useBarsPerRow()
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)
  const setSwingEnabled = usePlayerStore((state) => state.setSwingEnabled)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setTempo = usePlayerStore((state) => state.setTempo)
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const [playError, setPlayError] = useState<string | null>(null)

  const barSize = rhythm ? rhythm.meter * 2 : 8
  const playbackGrooveLength = rhythm ? playbackGrooveLengthForMeter(rhythm.meter) : 8
  const groovePattern = resolveGroovePattern(swingPattern, playbackGrooveLength, swingEnabled)
  const trackBars = useMemo(() => (rhythm ? trackBarsRecord(rhythm) : {}), [rhythm])
  const playbackTrackBars = useMemo(
    () => (rhythm ? withMetronomeShakerTrack(trackBars, playbackGrooveLength) : {}),
    [playbackGrooveLength, rhythm, trackBars],
  )
  const tracks = rhythm ? Object.values(rhythm.instruments) : []
  const focusedTrack = tracks.find((track) => track.id === focusedTrackId) ?? tracks[0]

  const noteEditor = useNoteEditor(
    focusedTrack?.id ?? '',
    focusedTrack?.bars ?? [],
    barSize,
    (bars) => focusedTrack && updateTrackBars(focusedTrack.id, bars),
  )

  const flam = useFlamMode(
    focusedTrack?.instrument ?? 'djembe',
    focusedTrack?.bars ?? [],
    noteEditor.selection,
    noteEditor.setSound,
    noteEditor.selectionMode === 'note',
  )

  useEditorKeyboard(focusedTrack?.instrument ?? 'djembe', {
    selection: noteEditor.selection,
    selectionMode: noteEditor.selectionMode,
    previewNavigate: noteEditor.previewNavigate,
    commitSelection: noteEditor.commitSelection,
    setSelectionMode: noteEditor.setSelectionMode,
    setSound: noteEditor.setSound,
    toggleFlam: flam.toggleFlam,
    convertToSixteenth: noteEditor.convertToSixteenth,
    convertToTriplet: noteEditor.convertToTriplet,
    convertToPolyrhythm: noteEditor.convertToPolyrhythm,
    convertToEighth: noteEditor.convertToEighth,
  })

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
    shaker: { instrument: 'shaker', sounds: ['x'], lengths: ['8th'] },
    initialGroove: groovePattern,
    strictGrooveLength: true,
    loop: true,
    tempo: rhythm?.tempo ?? 110,
  })

  useMetronomeShakerVolume(setInstrumentVolume)

  useEffect(() => {
    if (!rhythm) return
    setTempo(rhythm.tempo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, rhythm?.tempo, setTempo])

  useEffect(() => {
    if (!rhythm) return
    const empty = isSwingPatternEmpty(rhythm.swingPattern)
    const pattern = empty ? defaultSwingPatternForMeter(rhythm.meter) : rhythm.swingPattern
    setSwingPattern(pattern, barSize)
    setSwingEnabled(!empty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, barSize, rhythm?.meter, rhythm?.swingPattern, setSwingEnabled, setSwingPattern])

  useEffect(() => {
    setMidinikeTempo(tempo)
  }, [setMidinikeTempo, tempo])

  useEffect(() => {
    if (isPlaying !== playing) setIsPlaying(playing)
  }, [isPlaying, playing, setIsPlaying])

  useEffect(() => {
    setGroove(groovePattern)
  }, [groovePattern, setGroove])

  const rhythmInstruments = useMemo(
    () => [...new Set(tracks.map((track) => track.instrument))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rhythm],
  )

  useSyncInstrumentVolumes(rhythmInstruments, setInstrumentVolume)

  const focusedTrackVolume = useTrackVolume(focusedTrack?.instrument ?? '')

  const startPlayback = useCallback(() => {
    if (!rhythm) return false
    try {
      Object.values(rhythm.instruments).forEach((track) =>
        validateBarsForGroove(track.bars, barSize),
      )
      if (!tracksMatchGrooveLength(trackBars, barSize)) {
        throw new Error(`Each bar must fill ${barSize} cells for beat size ${rhythm.meter}`)
      }
      setPlayError(null)
      play(playbackTrackBars, groovePattern)
      return true
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
      return false
    }
  }, [barSize, groovePattern, play, playbackTrackBars, rhythm, trackBars])

  const restartPlayback = useCallback(() => {
    if (!rhythm) return false
    try {
      Object.values(rhythm.instruments).forEach((track) =>
        validateBarsForGroove(track.bars, barSize),
      )
      if (!tracksMatchGrooveLength(trackBars, barSize)) {
        throw new Error(`Each bar must fill ${barSize} cells for beat size ${rhythm.meter}`)
      }
      setPlayError(null)
      return Boolean(restart())
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not restart pattern')
      return false
    }
  }, [barSize, restart, rhythm, trackBars])

  const { mediaAudio, onRestart, onStop, onTogglePlayPause } = usePlayerPlaybackControl({
    artist: rhythm?.author.join(', '),
    isPlaying,
    pause,
    playing,
    restartPlayback,
    sessionKey: rhythm?.slug,
    startPlayback,
    stop,
    title: rhythm?.title,
  })

  if (!rhythm || !focusedTrack) return null

  const onBackToPicker = () => {
    backToPicker()
    router.replace('/editor')
  }

  const onTitleBlur = (title: string) => {
    const previousSlug = activeSlug
    patchActiveRhythm({ title })
    const nextSlug = slugFromTitle(title)
    if (nextSlug !== previousSlug) {
      replaceEditorSlugUrl(nextSlug)
    }
  }

  return (
    <>
      {mediaAudio}
      <div className={cn('flex w-full flex-col gap-3', !fullBleed && 'lg:pt-4 xl:px-4 xl:pt-6')}>
        {!fullBleed ? (
          <FixedSideActions>
            <Button onClick={onBackToPicker} variant="subtle" className="!justify-start">
              <BackIcon className="size-4 mr-1" /> Back to My Rhythms
            </Button>
            <Button
              href={`/player?rhythm=${rhythm.slug}`}
              variant="subtle"
              className="!justify-start"
            >
              <Note16Icon className="mr-1 size-4" /> Show in Player
            </Button>
            <PublishGate rhythm={rhythm} />
          </FixedSideActions>
        ) : null}

        <section
          className={cn(
            'flex w-full flex-col gap-2 overflow-hidden bg-editor-surface',
            fullBleed
              ? 'md:rounded-none md:border-0'
              : 'mx-auto max-w-4xl md:rounded-xl md:border md:border-zinc-100 dark:border-transparent xl:max-w-5xl',
          )}
        >
          <CollapsibleMetadata
            onChange={patchActiveRhythm}
            onTitleBlur={onTitleBlur}
            rhythm={rhythm}
          />

          <InstrumentTabs
            focusedTrackId={focusedTrack.id}
            onFocusTrack={setFocusedTrackId}
            onUpdateInstruments={updateRhythmInstruments}
            rhythm={rhythm}
            tracks={tracks}
            trailing={
              <TrackVolume
                compact
                className="m-0 mr-1 -translate-y-1 shrink-0"
                muted={focusedTrackVolume.muted}
                onToggleMute={focusedTrackVolume.onToggleMute}
                onVolumeChange={focusedTrackVolume.onVolumeChange}
                volume={focusedTrackVolume.volume}
              />
            }
          />

          <section className="flex flex-col gap-2 pb-36">
            <EditableBarsCanvas
              activeIndex={activeBarIndex}
              bars={focusedTrack.bars}
              barsPerRow={barsPerRow}
              beatSize={rhythm.meter}
              id={focusedTrack.id}
              instrument={focusedTrack.instrument}
              onReorderBar={noteEditor.reorderBarAt}
              onSelectBar={noteEditor.selectBar}
              onSelectNote={noteEditor.selectNote}
              selectionMode={noteEditor.selectionMode}
            />
          </section>

          {playError ? (
            <Text className="px-4 pb-2" variant="mono">
              {playError}
            </Text>
          ) : null}
        </section>
      </div>

      <EditorKeyboard
        bars={focusedTrack.bars}
        canFlam={flam.canFlam}
        flamMode={flam.flamMode}
        flamSymbols={flam.flamSymbols}
        instrument={focusedTrack.instrument}
        onConvertToEighth={noteEditor.convertToEighth}
        onConvertToPolyrhythm={noteEditor.convertToPolyrhythm}
        onConvertToSixteenth={noteEditor.convertToSixteenth}
        onConvertToTriplet={noteEditor.convertToTriplet}
        onFlamToggle={flam.toggleFlam}
        onNavigate={noteEditor.navigate}
        onRunBarModeAction={noteEditor.runBarModeAction}
        onSelectionModeChange={noteEditor.setSelectionMode}
        onSelectSound={noteEditor.setSound}
        selection={noteEditor.selection}
        selectionMode={noteEditor.selectionMode}
      />

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
