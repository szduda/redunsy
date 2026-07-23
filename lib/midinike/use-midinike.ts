'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DRUMS, soundMapForInstrument } from './audio/drums-config'
import { DEFAULT_INSTRUMENT_VOLUME_LEVEL } from './instrument-volume'
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

const barIndexForBeat = (beatIndex: number, offsets: number[]) => {
  for (let index = offsets.length - 1; index >= 0; index -= 1) {
    if (beatIndex >= offsets[index]) return index
  }
  return 0
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
  const [activeBarIndex, setActiveBarIndex] = useState(-1)

  const beatsRef = useRef<BeatMatrix>([])
  const compileRef = useRef(
    compileGroove({
      bars: [emptyBar(resolvedInitialGroove.length)],
      groove: resolvedInitialGroove,
    }),
  )
  const noteIndexRef = useRef(0)
  const pausedAtRef = useRef(0)
  const lastBarsRef = useRef<string[]>([])
  const lastTracksRef = useRef<PlayTracks>({})
  const lastInstrumentRef = useRef<string | undefined>(undefined)
  const instrumentVolumeRef = useRef<Record<string, number>>({})
  const playingRef = useRef(false)
  const activeBarIndexRef = useRef(-1)
  const currentBeatIndex = useCallback(
    () => midiSounds.current?.getBeatIndex() ?? noteIndexRef.current,
    [midiSounds],
  )

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
      const level = instrumentVolumeRef.current[instrument] ?? DEFAULT_INSTRUMENT_VOLUME_LEVEL
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
        const nextBarIndex = barIndexForBeat(index, compileRef.current.barSlotOffsets)
        if (nextBarIndex !== activeBarIndexRef.current) {
          activeBarIndexRef.current = nextBarIndex
          setActiveBarIndex(nextBarIndex)
        }
        if (!loop && index >= beatsRef.current.length - 1) {
          player.stopPlayLoop()
          setPlaying(false)
          setPaused(false)
          playingRef.current = false
          activeBarIndexRef.current = -1
          setActiveBarIndex(-1)
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
    (bars: string[], groovePattern: string, soundMap?: Record<string, number | null>) =>
      compileGroove({ bars, groove: groovePattern, soundMap }),
    [],
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

      const layerCompiled = entries.map(([name, cfg]) => ({
        name,
        compiled: compileGroove({
          bars: prolongBars(tracks[name], masterBarCount),
          groove: groovePattern,
          soundMap: soundMapForInstrument(cfg.instrument),
        }),
      }))
      const primaryCompiled = layerCompiled.find(({ name }) => name === primaryName)?.compiled
      if (!primaryCompiled) return null

      const merged = layerCompiled.reduce<BeatMatrix>(
        (acc, { compiled }) =>
          acc.length ? mergeBeatMatrices(acc, compiled.beats) : compiled.beats,
        [],
      )

      return {
        primaryBars,
        compiled: { ...primaryCompiled, beats: merged },
      }
    },
    [layerEntries],
  )

  const storeCompiled = useCallback(
    (compiled: ReturnType<typeof compileGroove>, primaryBars?: string[]) => {
      compileRef.current = compiled
      beatsRef.current = compiled.beats
      if (primaryBars) lastBarsRef.current = primaryBars
    },
    [],
  )

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
    pausedAtRef.current = currentBeatIndex()
    midiSounds.current?.stopPlayLoop()
    setPlaying(false)
    setPaused(true)
    playingRef.current = false
  }, [currentBeatIndex, midiSounds])

  const stop = useCallback(() => {
    midiSounds.current?.stopPlayLoop()
    noteIndexRef.current = 0
    pausedAtRef.current = 0
    lastTracksRef.current = {}
    setPlaying(false)
    setPaused(false)
    playingRef.current = false
    activeBarIndexRef.current = -1
    setActiveBarIndex(-1)
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
      recompileActivePattern(pattern, currentBeatIndex())
    },
    [currentBeatIndex, groove, recompileActivePattern],
  )

  useEffect(() => {
    if (!playingRef.current) return
    const player = midiSounds.current
    if (!player) return
    const { cellsPerBar: barCells, cellCount, beats, preGrooveSlots } = compileRef.current
    const playbackTempo = calcPlaybackTempo(
      barCells,
      cellCount,
      preGrooveSlots,
      beats.length,
      tempo,
    )
    player.setPlayLoopTempo(playbackTempo)
  }, [midiSounds, tempo])

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
    activeBarIndex,
    swingModifier,
    compile: compileBars,
    ...layerHandles,
  }
}
