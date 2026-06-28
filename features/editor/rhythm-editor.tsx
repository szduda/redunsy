'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CollapsibleMetadata } from '@/features/editor/collapsible-metadata'
import { BackIcon } from '@/features/icons/back-icon'
import { Note16Icon } from '@/features/icons/note-16-icon'
import { EditableBarsCanvas } from '@/features/editor/editable-bars-canvas'
import { EditorKeyboard } from '@/features/editor/keyboard/editor-keyboard'
import { useEditorStore } from '@/features/editor/editor.store'
import { useEditorKeyboard } from '@/features/editor/use-editor-keyboard'
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
import { useSpaceTogglePlay } from '@/features/groovy-player/use-space-toggle-play'
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
  lengths: ['8th', '16th', '8th triplet'] as ('8th' | '16th' | '8th triplet')[],
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
  const backToPicker = useEditorStore((state) => state.backToPicker)

  const barsPerRow = useBarsPerRow()
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const storeBeatIndex = usePlayerStore((state) => state.beatIndex)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)
  const setSwingEnabled = usePlayerStore((state) => state.setSwingEnabled)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setBeatIndex = usePlayerStore((state) => state.setBeatIndex)
  const setTempo = usePlayerStore((state) => state.setTempo)
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

  useEditorKeyboard(focusedTrack?.instrument ?? 'djembe', {
    selection: noteEditor.selection,
    selectionMode: noteEditor.selectionMode,
    navigate: noteEditor.navigate,
    setSound: noteEditor.setSound,
    convertToSixteenth: noteEditor.convertToSixteenth,
    convertToTriplet: noteEditor.convertToTriplet,
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
    beatIndex,
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
    stop()
  }, [rhythm?.slug, stop])

  useEffect(() => () => stop(), [stop])

  useEffect(() => {
    if (!rhythm) return
    setTempo(rhythm.tempo)
  }, [rhythm, setTempo])

  useEffect(() => {
    if (!rhythm) return
    const empty = isSwingPatternEmpty(rhythm.swingPattern)
    const pattern = empty ? defaultSwingPatternForMeter(rhythm.meter) : rhythm.swingPattern
    setSwingPattern(pattern, barSize)
    setSwingEnabled(!empty)
  }, [barSize, rhythm, setSwingEnabled, setSwingPattern])

  useEffect(() => {
    setMidinikeTempo(tempo)
  }, [setMidinikeTempo, tempo])

  useEffect(() => {
    if (isPlaying !== playing) setIsPlaying(playing)
  }, [isPlaying, playing, setIsPlaying])

  useEffect(() => {
    if (storeBeatIndex !== beatIndex) setBeatIndex(beatIndex)
  }, [beatIndex, setBeatIndex, storeBeatIndex])

  useEffect(() => {
    setGroove(groovePattern)
  }, [groovePattern, setGroove])

  const onVolumeLevelChange = useCallback(
    (instrument: string, level: number) => setInstrumentVolume(instrument, level),
    [setInstrumentVolume],
  )

  const onTogglePlayPause = () => {
    if (!rhythm) return
    if (isPlaying) {
      pause()
      return
    }
    try {
      Object.values(rhythm.instruments).forEach((track) =>
        validateBarsForGroove(track.bars, barSize),
      )
      if (!tracksMatchGrooveLength(trackBars, barSize)) {
        throw new Error(`Each bar must fill ${barSize} cells for beat size ${rhythm.meter}`)
      }
      setPlayError(null)
      play(playbackTrackBars, groovePattern)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
    }
  }

  const onRestart = () => {
    if (!rhythm) return
    try {
      Object.values(rhythm.instruments).forEach((track) =>
        validateBarsForGroove(track.bars, barSize),
      )
      if (!tracksMatchGrooveLength(trackBars, barSize)) {
        throw new Error(`Each bar must fill ${barSize} cells for beat size ${rhythm.meter}`)
      }
      setPlayError(null)
      if (!restart()) play(playbackTrackBars, groovePattern)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not restart pattern')
    }
  }

  useSpaceTogglePlay(onTogglePlayPause)

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
      router.replace(`/editor/${nextSlug}`, { scroll: false })
    }
  }

  return (
    <>
      <div className="flex w-full max-w-4xl flex-col gap-3 xl:max-w-5xl xl:px-10 2xl:px-0">
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
        </FixedSideActions>

        <section className="flex w-full flex-col gap-2 bg-white md:rounded-xl md:border md:border-zinc-100 dark:bg-zinc-900/60 dark:border-transparent">
          <CollapsibleMetadata
            onChange={patchActiveRhythm}
            onTitleBlur={onTitleBlur}
            rhythm={rhythm}
          />

          <div className="flex flex-wrap gap-2 border-b border-zinc-200/60 px-2 py-2 dark:border-zinc-800/60 md:px-4">
            {tracks.map((track) => (
              <button
                key={track.id}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  track.id === focusedTrack.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                )}
                onClick={() => setFocusedTrackId(track.id)}
                type="button"
              >
                {track.name}
              </button>
            ))}
          </div>

          <section className="flex flex-col gap-2 px-1 py-2 pb-36 md:px-4">
            <div className="flex items-center justify-between gap-2">
              <Text className="font-semibold">{focusedTrack.name}</Text>
              <TrackVolume
                compact
                muted={false}
                onToggleMute={() => onVolumeLevelChange(focusedTrack.instrument, 0)}
                onVolumeChange={(value) => onVolumeLevelChange(focusedTrack.instrument, value)}
                volume={50}
              />
            </div>

            <EditableBarsCanvas
              bars={focusedTrack.bars}
              barsPerRow={barsPerRow}
              beatSize={rhythm.meter}
              id={focusedTrack.id}
              instrument={focusedTrack.instrument}
              onReorderBar={noteEditor.reorderBarAt}
              onSelectBar={noteEditor.selectBar}
              onSelectNote={noteEditor.selectNote}
              selection={noteEditor.selection}
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
        instrument={focusedTrack.instrument}
        onConvertToEighth={noteEditor.convertToEighth}
        onConvertToSixteenth={noteEditor.convertToSixteenth}
        onConvertToTriplet={noteEditor.convertToTriplet}
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
          onStop={stop}
        />
      </PageBottomNav>
    </>
  )
}
