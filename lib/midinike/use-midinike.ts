'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DRUMS } from './audio/drums-config'
import { useMidiSounds } from './audio/provider'
import { compileGroove } from './groove/compile-groove'
import { calcPlaybackTempo } from './groove/playback-tempo'
import { swingModifierFromGroove } from './groove/groove-symbols'
import { validateBarsForGroove } from './notation/fit-bar'

import type { BeatMatrix, LayerConfig, MidinikeOptions } from './types'

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

export const useMidinike = (options: MidinikeOptions) => {
  const midiSounds = useMidiSounds()
  const { loop = true, tempo: initialTempo = 110, ...rest } = options

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

  const setVolumes = useCallback(() => {
    Object.values(DRUMS).forEach(({ sampleId, volume, instrument }) => {
      const layer = layerEntries.find(([, cfg]) => cfg.instrument === instrument)
      if (!layer) return
      midiSounds.current?.setDrumVolume(sampleId, volume)
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

  const compileBars = useCallback(
    (bars: string[], groovePattern = groove) => {
      const compiled = compileGroove({ bars, groove: groovePattern })
      compileRef.current = compiled
      beatsRef.current = compiled.beats
      return compiled
    },
    [groove],
  )

  const playLayer = useCallback(
    (bars: string[], groovePattern?: string) => {
      const pattern = groovePattern ?? groove
      lastBarsRef.current = bars
      if (groovePattern) setGrooveState(groovePattern)
      const compiled = compileBars(bars, pattern)
      startLoop(paused ? pausedAtRef.current : 0)
      return compiled
    },
    [compileBars, groove, paused, startLoop],
  )

  const pause = useCallback(() => {
    pausedAtRef.current = noteIndexRef.current
    midiSounds.current?.stopPlayLoop()
    setPlaying(false)
    setPaused(true)
    playingRef.current = false
    setBeatIndex(-1)
  }, [midiSounds])

  const stop = useCallback(() => {
    midiSounds.current?.stopPlayLoop()
    noteIndexRef.current = 0
    pausedAtRef.current = 0
    setPlaying(false)
    setPaused(false)
    playingRef.current = false
    setBeatIndex(-1)
  }, [midiSounds])

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
    const compiled = compileGroove({ bars, groove })
    compileRef.current = compiled
    beatsRef.current = compiled.beats
    if (playingRef.current) startLoopRef.current(noteIndexRef.current)
  }, [groove])

  useEffect(() => {
    if (!playingRef.current) return
    startLoopRef.current(noteIndexRef.current)
  }, [tempo])

  const play = useMemo(() => {
    const handlers = Object.fromEntries(
      layerEntries.map(([name]) => [
        name,
        (bars: string[], groovePattern?: string) => playLayer(bars, groovePattern),
      ]),
    ) as Record<string, (bars: string[], groovePattern?: string) => void>
    return handlers
  }, [layerEntries, playLayer])

  const layerHandles = useMemo(
    () =>
      Object.fromEntries(
        layerEntries.map(([name]) => [
          name,
          { play: (bars: string[], groovePattern?: string) => playLayer(bars, groovePattern) },
        ]),
      ) as Record<string, LayerPlayer>,
    [layerEntries, playLayer],
  )

  return {
    play,
    pause,
    stop,
    goTo,
    setGroove,
    setTempo,
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
