'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DRUMS, soundMapForInstrument } from './audio/drums-config'
import { useMidiSounds } from './audio/provider'
import { compileGroove } from './groove/compile-groove'
import { mergeBeatMatrices } from './groove/merge-beat-matrices'
import { calcPlaybackTempo } from './groove/playback-tempo'
import { swingModifierFromGroove } from './groove/groove-symbols'
import { validateBarsForGroove } from './notation/fit-bar'

import type { BeatMatrix, LayerConfig, MidinikeOptions, PlayTracks } from './types'

const DENSITY = 1 / 16

const isLayerConfig = (value: unknown): value is LayerConfig =>
  typeof value === 'object' && value !== null && 'instrument' in value && 'sounds' in value

const emptyBar = (grooveLength: number) => '-'.repeat(grooveLength)

const barsFitGroove = (bars: string[], grooveLength: number) => {
  try {
    validateBarsForGroove(bars, grooveLength)
    return true
  } catch {
    return false
  }
}

type LayerPlayer = {
  play: (bars: string[], groovePattern?: string) => void
}

const prolongBars = (bars: string[], targetCount: number) =>
  Array.from({ length: targetCount }, (_, index) => bars[index % bars.length])

export const useMidinike = (options: MidinikeOptions) => {
  const midiSounds = useMidiSounds()
  const { loop = true, tempo: initialTempo = 110, getOverlayBars, ...rest } = options

  const layerEntries = useMemo(
    () =>
      Object.entries(rest).filter((entry): entry is [string, LayerConfig] =>
        isLayerConfig(entry[1]),
      ),
    [],
  )

  const [tempo, setTempo] = useState(initialTempo)
  const tempoRef = useRef(initialTempo)
  const initialGroove = layerEntries[0]?.[1].grooves?.[0] ?? '------'
  const [groove, setGrooveState] = useState(initialGroove)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [beatIndex, setBeatIndex] = useState(-1)

  const beatsRef = useRef<BeatMatrix>([])
  const compileRef = useRef(
    compileGroove({ bars: [emptyBar(initialGroove.length)], groove: initialGroove }),
  )
  const noteIndexRef = useRef(0)
  const pausedAtRef = useRef(0)
  const lastBarsRef = useRef<string[]>([])
  const lastTracksRef = useRef<PlayTracks>({})
  const lastInstrumentRef = useRef<string | undefined>(undefined)
  const instrumentVolumeRef = useRef<Record<string, number>>({})
  const playingRef = useRef(false)

  const activeBarIndex = useMemo(() => {
    if (beatIndex < 0) return -1
    const offsets = compileRef.current.barSlotOffsets
    for (let i = offsets.length - 1; i >= 0; i -= 1) {
      if (beatIndex >= offsets[i]) return i
    }
    return 0
  }, [beatIndex, groove])

  const swingModifier = swingModifierFromGroove(groove)

  const applyInstrumentVolume = useCallback(
    (instrument: string, level: number) => {
      instrumentVolumeRef.current[instrument] = level
      Object.values(DRUMS)
        .filter((drum) => drum.instrument === instrument)
        .forEach(({ sampleId, volume }) => {
          midiSounds.current?.setDrumVolume(sampleId, volume * (level / 100))
        })
    },
    [midiSounds],
  )

  const setVolumes = useCallback(() => {
    Object.values(DRUMS).forEach(({ sampleId, volume, instrument }) => {
      const layer = layerEntries.find(([, cfg]) => cfg.instrument === instrument)
      if (!layer) return
      const level = instrumentVolumeRef.current[instrument] ?? 100
      midiSounds.current?.setDrumVolume(sampleId, volume * (level / 100))
    })
  }, [layerEntries, midiSounds])

  const startLoop = useCallback(
    (fromBeat = 0) => {
      const player = midiSounds.current
      if (!player || beatsRef.current.length === 0) return
      const { cellsPerBar: barCells, cellCount, beats, preGrooveSlots } = compileRef.current
      const playbackTempo = calcPlaybackTempo(
        barCells,
        cellCount,
        preGrooveSlots,
        beats.length,
        tempoRef.current,
      )
      setVolumes()
      player.startPlayLoop(beatsRef.current, playbackTempo, DENSITY, fromBeat, (index) => {
        noteIndexRef.current = index
        setBeatIndex(index)
        if (!loop && index >= beatsRef.current.length - 1) {
          player.stopPlayLoop()
          setPlaying(false)
          setPaused(false)
          playingRef.current = false
          setBeatIndex(-1)
        }
      })
      setPlaying(true)
      setPaused(false)
      playingRef.current = true
    },
    [loop, midiSounds, setVolumes],
  )

  const startLoopRef = useRef(startLoop)

  useEffect(() => {
    tempoRef.current = tempo
  }, [tempo])

  useEffect(() => {
    startLoopRef.current = startLoop
  }, [startLoop])

  const buildBeats = useCallback(
    (bars: string[], groovePattern: string, soundMap?: Record<string, number | null>) => {
      const compiled = compileGroove({ bars, groove: groovePattern, soundMap })
      const overlayBars = getOverlayBars?.(bars, groovePattern)
      if (!overlayBars?.length) return compiled
      const overlay = compileGroove({
        bars: overlayBars,
        groove: groovePattern,
        soundMap: soundMapForInstrument('shaker'),
      })
      return { ...compiled, beats: mergeBeatMatrices(compiled.beats, overlay.beats) }
    },
    [getOverlayBars],
  )

  const buildMergedBeats = useCallback(
    (tracks: PlayTracks, groovePattern: string) => {
      const entries = layerEntries.filter(([name]) => tracks[name]?.length)
      if (!entries.length) return null

      const masterBarCount = Math.max(...entries.map(([name]) => tracks[name].length))
      const primaryName = entries.reduce(
        (best, [name]) => (tracks[name].length >= tracks[best].length ? name : best),
        entries[0][0],
      )
      const primaryBars = prolongBars(tracks[primaryName], masterBarCount)

      let merged: BeatMatrix = []
      entries.forEach(([name, cfg]) => {
        const compiled = compileGroove({
          bars: prolongBars(tracks[name], masterBarCount),
          groove: groovePattern,
          soundMap: soundMapForInstrument(cfg.instrument),
        })
        merged = merged.length ? mergeBeatMatrices(merged, compiled.beats) : compiled.beats
      })

      const overlayBars = getOverlayBars?.(primaryBars, groovePattern)
      if (overlayBars?.length) {
        const overlay = compileGroove({
          bars: overlayBars,
          groove: groovePattern,
          soundMap: soundMapForInstrument('shaker'),
        })
        merged = mergeBeatMatrices(merged, overlay.beats)
      }

      const primaryCompiled = compileGroove({
        bars: primaryBars,
        groove: groovePattern,
        soundMap: soundMapForInstrument(
          entries.find(([name]) => name === primaryName)?.[1].instrument ?? entries[0][1].instrument,
        ),
      })
      return {
        primaryBars,
        compiled: { ...primaryCompiled, beats: merged },
      }
    },
    [getOverlayBars, layerEntries],
  )

  const compileBars = useCallback(
    (bars: string[], groovePattern = groove, soundMap?: Record<string, number | null>) => {
      const compiled = buildBeats(bars, groovePattern, soundMap)
      compileRef.current = compiled
      beatsRef.current = compiled.beats
      return compiled
    },
    [buildBeats, groove],
  )

  const playLayer = useCallback(
    (bars: string[], groovePattern?: string, instrument?: string) => {
      const pattern = groovePattern ?? groove
      if (instrument) lastInstrumentRef.current = instrument
      lastTracksRef.current = {}
      lastBarsRef.current = bars
      if (groovePattern) setGrooveState(groovePattern)
      const soundMap = lastInstrumentRef.current
        ? soundMapForInstrument(lastInstrumentRef.current)
        : undefined
      const compiled = compileBars(bars, pattern, soundMap)
      startLoop(paused ? pausedAtRef.current : 0)
      return compiled
    },
    [compileBars, groove, paused, startLoop],
  )

  const play = useCallback(
    (tracks: PlayTracks, groovePattern?: string) => {
      const pattern = groovePattern ?? groove
      if (groovePattern) setGrooveState(groovePattern)
      const result = buildMergedBeats(tracks, pattern)
      if (!result) return null
      lastTracksRef.current = tracks
      lastBarsRef.current = result.primaryBars
      compileRef.current = result.compiled
      beatsRef.current = result.compiled.beats
      startLoop(paused ? pausedAtRef.current : 0)
      return result.compiled
    },
    [buildMergedBeats, groove, paused, startLoop],
  )

  const pause = useCallback(() => {
    pausedAtRef.current = noteIndexRef.current
    midiSounds.current?.stopPlayLoop()
    setPlaying(false)
    setPaused(true)
    playingRef.current = false
  }, [midiSounds])

  const stop = useCallback(() => {
    midiSounds.current?.stopPlayLoop()
    noteIndexRef.current = 0
    pausedAtRef.current = 0
    lastTracksRef.current = {}
    setPlaying(false)
    setPaused(false)
    playingRef.current = false
    setBeatIndex(-1)
  }, [midiSounds])

  const restart = useCallback(() => {
    noteIndexRef.current = 0
    pausedAtRef.current = 0
    setPaused(false)
    const tracks = lastTracksRef.current
    if (Object.keys(tracks).length) {
      const result = buildMergedBeats(tracks, groove)
      if (!result) return null
      lastBarsRef.current = result.primaryBars
      compileRef.current = result.compiled
      beatsRef.current = result.compiled.beats
      startLoop(0)
      return result.compiled
    }
    const bars = lastBarsRef.current
    if (!bars.length) return null
    const soundMap = lastInstrumentRef.current
      ? soundMapForInstrument(lastInstrumentRef.current)
      : undefined
    const compiled = buildBeats(bars, groove, soundMap)
    compileRef.current = compiled
    beatsRef.current = compiled.beats
    startLoop(0)
    return compiled
  }, [buildBeats, buildMergedBeats, groove, startLoop])

  const goTo = useCallback(
    (barIndex: number) => {
      const offset = compileRef.current.barSlotOffsets[barIndex] ?? 0
      pausedAtRef.current = offset
      noteIndexRef.current = offset
      if (playingRef.current) startLoop(offset)
    },
    [startLoop],
  )

  const setGroove = useCallback((pattern: string) => {
    setGrooveState(pattern)
  }, [])

  useEffect(() => {
    const tracks = lastTracksRef.current
    if (Object.keys(tracks).length) {
      const result = buildMergedBeats(tracks, groove)
      if (!result || !barsFitGroove(result.primaryBars, groove.length)) {
        if (playingRef.current) {
          midiSounds.current?.stopPlayLoop()
          setPlaying(false)
          setPaused(false)
          playingRef.current = false
        }
        return
      }
      lastBarsRef.current = result.primaryBars
      compileRef.current = result.compiled
      beatsRef.current = result.compiled.beats
      if (playingRef.current) startLoopRef.current(noteIndexRef.current)
      return
    }

    const bars = lastBarsRef.current
    if (!bars.length) return
    if (!barsFitGroove(bars, groove.length)) {
      if (playingRef.current) {
        midiSounds.current?.stopPlayLoop()
        setPlaying(false)
        setPaused(false)
        playingRef.current = false
      }
      return
    }
    const soundMap = lastInstrumentRef.current
      ? soundMapForInstrument(lastInstrumentRef.current)
      : undefined
    const compiled = buildBeats(bars, groove, soundMap)
    compileRef.current = compiled
    beatsRef.current = compiled.beats
    if (playingRef.current) startLoopRef.current(noteIndexRef.current)
  }, [buildBeats, buildMergedBeats, groove, midiSounds])

  useEffect(() => {
    if (!playingRef.current) return
    startLoopRef.current(noteIndexRef.current)
  }, [tempo])

  const layerHandles = useMemo(
    () =>
      Object.fromEntries(
        layerEntries.map(([name, cfg]) => [
          name,
          {
            play: (bars: string[], groovePattern?: string) =>
              playLayer(bars, groovePattern, cfg.instrument),
          },
        ]),
      ) as Record<string, LayerPlayer>,
    [layerEntries, playLayer],
  )

  return {
    play,
    pause,
    stop,
    restart,
    goTo,
    setGroove,
    setTempo,
    setInstrumentVolume: applyInstrumentVolume,
    playing,
    paused,
    groove,
    tempo,
    beatIndex,
    activeBarIndex,
    swingModifier,
    compile: compileBars,
    ...layerHandles,
  }
}
