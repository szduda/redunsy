'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DRUMS, soundMapForInstrument } from './audio/drums-config'
import { useMidiSounds } from './audio/provider'
import { compileGroove } from './groove/compile-groove'
import { mergeBeatMatrices } from './groove/merge-beat-matrices'
import { calcPlaybackTempo } from './groove/playback-tempo'
import { swingModifierFromGroove } from './groove/groove-symbols'
import { validateBarsForGroove, tracksMatchGrooveLength } from './notation/fit-bar'

import type { BeatMatrix, LayerConfig, MidinikeOptions, PlayTracks } from './types'

const DENSITY = 1 / 16

const DEFAULT_GROOVE_LENGTH = 8

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
  const {
    loop = true,
    tempo: initialTempo = 110,
    getOverlayBars,
    initialGroove,
    strictGrooveLength = false,
    ...rest
  } = options

  const layerEntries = useMemo(
    () =>
      Object.entries(rest).filter((entry): entry is [string, LayerConfig] =>
        isLayerConfig(entry[1]),
      ),
    [],
  )

  const [tempo, setTempo] = useState(initialTempo)
  const tempoRef = useRef(initialTempo)
  const resolvedInitialGroove =
    initialGroove ?? layerEntries[0]?.[1].grooves?.[0] ?? '-'.repeat(DEFAULT_GROOVE_LENGTH)
  const [groove, setGrooveState] = useState(resolvedInitialGroove)
  const lastGroovePatternRef = useRef(resolvedInitialGroove)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [beatIndex, setBeatIndex] = useState(-1)

  const beatsRef = useRef<BeatMatrix>([])
  const compileRef = useRef(
    compileGroove({ bars: [emptyBar(resolvedInitialGroove.length)], groove: resolvedInitialGroove }),
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

  const storeCompiled = useCallback((compiled: ReturnType<typeof compileGroove>, primaryBars?: string[]) => {
    compileRef.current = compiled
    beatsRef.current = compiled.beats
    if (primaryBars) lastBarsRef.current = primaryBars
  }, [])

  const recompileActivePattern = useCallback(
    (pattern: string, resumeBeat?: number) => {
      const tracks = lastTracksRef.current
      if (Object.keys(tracks).length) {
        if (strictGrooveLength && !tracksMatchGrooveLength(tracks, pattern.length)) {
          midiSounds.current?.stopPlayLoop()
          setPlaying(false)
          setPaused(false)
          playingRef.current = false
          lastTracksRef.current = {}
          return false
        }

        const result = buildMergedBeats(tracks, pattern)
        if (!result || !barsFitGroove(result.primaryBars, pattern.length)) {
          midiSounds.current?.stopPlayLoop()
          setPlaying(false)
          setPaused(false)
          playingRef.current = false
          return false
        }

        storeCompiled(result.compiled, result.primaryBars)
        if (resumeBeat !== undefined) startLoopRef.current(resumeBeat)
        return true
      }

      const bars = lastBarsRef.current
      if (!bars.length) return true

      if (!barsFitGroove(bars, pattern.length)) {
        midiSounds.current?.stopPlayLoop()
        setPlaying(false)
        setPaused(false)
        playingRef.current = false
        return false
      }

      const soundMap = lastInstrumentRef.current
        ? soundMapForInstrument(lastInstrumentRef.current)
        : undefined
      storeCompiled(buildBeats(bars, pattern, soundMap))
      if (resumeBeat !== undefined) startLoopRef.current(resumeBeat)
      return true
    },
    [buildBeats, buildMergedBeats, midiSounds, storeCompiled, strictGrooveLength],
  )

  const compileBars = useCallback(
    (bars: string[], groovePattern: string, soundMap?: Record<string, number | null>) => {
      const compiled = buildBeats(bars, groovePattern, soundMap)
      storeCompiled(compiled)
      return compiled
    },
    [buildBeats, storeCompiled],
  )

  const playLayer = useCallback(
    (bars: string[], groovePattern?: string, instrument?: string) => {
      const pattern = groovePattern ?? lastGroovePatternRef.current
      lastGroovePatternRef.current = pattern
      setGrooveState(pattern)
      if (instrument) lastInstrumentRef.current = instrument
      lastTracksRef.current = {}
      lastBarsRef.current = bars
      const soundMap = lastInstrumentRef.current
        ? soundMapForInstrument(lastInstrumentRef.current)
        : undefined
      const compiled = compileBars(bars, pattern, soundMap)
      startLoop(paused ? pausedAtRef.current : 0)
      return compiled
    },
    [compileBars, paused, startLoop],
  )

  const play = useCallback(
    (tracks: PlayTracks, groovePattern?: string) => {
      const pattern = groovePattern ?? lastGroovePatternRef.current
      lastGroovePatternRef.current = pattern
      setGrooveState(pattern)
      const result = buildMergedBeats(tracks, pattern)
      if (!result) return null
      lastTracksRef.current = tracks
      storeCompiled(result.compiled, result.primaryBars)
      startLoop(paused ? pausedAtRef.current : 0)
      return result.compiled
    },
    [buildMergedBeats, paused, startLoop, storeCompiled],
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
    const pattern = lastGroovePatternRef.current
    const tracks = lastTracksRef.current
    if (Object.keys(tracks).length) {
      const result = buildMergedBeats(tracks, pattern)
      if (!result) return null
      storeCompiled(result.compiled, result.primaryBars)
      startLoop(0)
      return result.compiled
    }
    const bars = lastBarsRef.current
    if (!bars.length) return null
    const soundMap = lastInstrumentRef.current
      ? soundMapForInstrument(lastInstrumentRef.current)
      : undefined
    storeCompiled(buildBeats(bars, pattern, soundMap))
    startLoop(0)
    return compileRef.current
  }, [buildBeats, buildMergedBeats, startLoop, storeCompiled])

  const goTo = useCallback(
    (barIndex: number) => {
      const offset = compileRef.current.barSlotOffsets[barIndex] ?? 0
      pausedAtRef.current = offset
      noteIndexRef.current = offset
      if (playingRef.current) startLoop(offset)
    },
    [startLoop],
  )

  const setGroove = useCallback(
    (pattern: string) => {
      if (pattern === lastGroovePatternRef.current && pattern === groove) return
      lastGroovePatternRef.current = pattern
      setGrooveState(pattern)
      if (!playingRef.current) return
      recompileActivePattern(pattern, noteIndexRef.current)
    },
    [groove, recompileActivePattern],
  )

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
