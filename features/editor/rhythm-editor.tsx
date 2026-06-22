'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CollapsibleMetadata } from '@/features/editor/collapsible-metadata'
import { EditableBarsCanvas } from '@/features/editor/editable-bars-canvas'
import { useEditorStore } from '@/features/editor/editor.store'
import { NoteKeyboard } from '@/features/editor/note-keyboard'
import { useEditorKeyboard } from '@/features/editor/use-editor-keyboard'
import { useNoteEditor } from '@/features/editor/use-note-editor'
import { PlayerBottomNav } from '@/features/groovy-player/player-bottom-nav'
import {
  defaultSwingPatternForMeter,
  isSwingPatternEmpty,
  resolveGroovePattern,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { TrackVolume } from '@/features/groovy-player/track/track-volume'
import { useSpaceTogglePlay } from '@/features/groovy-player/use-space-toggle-play'
import { PageBottomNav } from '@/features/layout/page-bottom-nav'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import { trackBarsRecord } from '@/features/rhythm/rhythm-helpers'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import {
  metronomeBarForGrooveLength,
  tracksMatchGrooveLength,
  useMidinike,
  validateBarsForGroove,
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

  const barsPerRow = usePlayerStore((state) => state.barsPerRow)
  const tempo = usePlayerStore((state) => state.tempo)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const storeBeatIndex = usePlayerStore((state) => state.beatIndex)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)
  const setSwingEnabled = usePlayerStore((state) => state.setSwingEnabled)
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setBeatIndex = usePlayerStore((state) => state.setBeatIndex)
  const setTempo = usePlayerStore((state) => state.setTempo)
  const [playError, setPlayError] = useState<string | null>(null)

  const barSize = rhythm ? rhythm.meter * 2 : 8
  const groovePattern = resolveGroovePattern(swingPattern, barSize, swingEnabled)
  const trackBars = rhythm ? trackBarsRecord(rhythm) : {}
  const tracks = rhythm ? Object.values(rhythm.instruments) : []
  const focusedTrack = tracks.find((track) => track.id === focusedTrackId) ?? tracks[0]

  const noteEditor = useNoteEditor(
    focusedTrack?.id ?? '',
    focusedTrack?.bars ?? [],
    (bars) => focusedTrack && updateTrackBars(focusedTrack.id, bars),
  )

  useEditorKeyboard(focusedTrack?.instrument ?? 'djembe', {
    selection: noteEditor.selection,
    navigate: noteEditor.navigate,
    setSound: noteEditor.setSound,
    convertToSixteenth: noteEditor.convertToSixteenth,
    convertToTriplet: noteEditor.convertToTriplet,
    convertToEighth: noteEditor.convertToEighth,
  })

  const getOverlayBars = useCallback(
    (patternBars: string[]) => {
      if (!hasMetronome) return null
      return patternBars.map(() => metronomeBarForGrooveLength(barSize))
    },
    [barSize, hasMetronome],
  )

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
    getOverlayBars,
    initialGroove: groovePattern,
    strictGrooveLength: true,
    loop: true,
    tempo: rhythm?.tempo ?? 110,
  })

  useEffect(() => {
    stop()
  }, [rhythm?.slug, stop])

  useEffect(() => () => stop(), [stop])

  useEffect(() => {
    if (!rhythm) return
    setTempo(rhythm.tempo)
  }, [rhythm?.slug, rhythm?.tempo, setTempo])

  useEffect(() => {
    if (!rhythm) return
    const empty = isSwingPatternEmpty(rhythm.swingPattern)
    const pattern = empty ? defaultSwingPatternForMeter(rhythm.meter) : rhythm.swingPattern
    setSwingPattern(pattern, barSize)
    setSwingEnabled(!empty)
  }, [barSize, rhythm?.meter, rhythm?.slug, rhythm?.swingPattern, setSwingEnabled, setSwingPattern])

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
      play(trackBars, groovePattern)
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
      restart() ?? play(trackBars, groovePattern)
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

  return (
    <>
      <div className="flex w-full max-w-4xl flex-col gap-3">
        <div className="flex justify-start px-1 md:px-0">
          <Button onClick={onBackToPicker} variant="outlined">
            Back to My Rhythms
          </Button>
        </div>

        <section className="flex w-full flex-col gap-2 bg-white md:rounded-xl md:border md:border-zinc-100 dark:bg-zinc-900/60 dark:border-transparent">
          <CollapsibleMetadata onChange={patchActiveRhythm} rhythm={rhythm} />

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

          <section className="flex flex-col gap-2 px-1 py-2 md:px-4">
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
              onBarsChange={(bars) => updateTrackBars(focusedTrack.id, bars)}
              onNavigate={noteEditor.navigate}
              onReorderBar={noteEditor.reorderBarAt}
              onSelectNote={noteEditor.selectNote}
              selection={noteEditor.selection}
            />

            <NoteKeyboard
              bars={focusedTrack.bars}
              instrument={focusedTrack.instrument}
              onConvertToEighth={noteEditor.convertToEighth}
              onConvertToSixteenth={noteEditor.convertToSixteenth}
              onConvertToTriplet={noteEditor.convertToTriplet}
              onSelectSound={noteEditor.setSound}
              selection={noteEditor.selection}
            />
          </section>

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
          onStop={stop}
        />
      </PageBottomNav>
    </>
  )
}
