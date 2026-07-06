'use client'

import WebAudioFontPlayer from './webaudiofont'

import type { BeatMatrix, MidiPlayer } from '../types'

const MAX_LAG_MS = 5
const DEFAULT_ECHO = 0.05

type PlayerState = {
  audioContext: AudioContext
  player: InstanceType<typeof WebAudioFontPlayer>
  equalizer: ReturnType<InstanceType<typeof WebAudioFontPlayer>['createChannel']>
  output: GainNode
  echo: ReturnType<InstanceType<typeof WebAudioFontPlayer>['createReverberator']>
  volumesDrum: Record<number, number>
  loopIntervalId?: ReturnType<typeof setInterval>
  beatIndex: number
  loopStarted: boolean
  drums: number[]
}

const contextTime = (state: PlayerState) => state.audioContext.currentTime

type SoundWindow = Window & Record<string, { zones: { keyRangeLow: number }[] } | undefined>

const soundWindow = () => window as unknown as SoundWindow

const cacheDrum = (state: PlayerState, drum: number) => {
  const info = state.player.loader.drumInfo(drum)
  if (!info) return
  const win = soundWindow()
  if (win[info.variable]) return
  state.player.loader.startLoad(state.audioContext, info.url, info.variable)
}

const volumeDrumAdjust = (state: PlayerState, drum: number) => state.volumesDrum[drum] ?? 1

const playDrum = (state: PlayerState, when: number, drum: number) => {
  const volume = volumeDrumAdjust(state, drum)
  if (volume <= 0) return

  const info = state.player.loader.drumInfo(drum)
  if (!info) return
  const win = soundWindow()
  const preset = win[info.variable]
  if (preset) {
    const pitch = preset.zones[0].keyRangeLow
    state.player.queueWaveTable(
      state.audioContext,
      state.equalizer.input,
      preset,
      when,
      pitch,
      3,
      volume,
    )
    return
  }
  cacheDrum(state, drum)
}

const playDrumsAt = (state: PlayerState, when: number, drums: number[]) => {
  drums.forEach((drum) => playDrum(state, when, drum))
}

const playBeatAt = (state: PlayerState, when: number, beat: BeatMatrix[number]) => {
  playDrumsAt(state, when, beat[0])
}

const refreshCache = (state: PlayerState) => {
  state.drums.forEach((drum) => cacheDrum(state, drum))
}

const cancelQueue = (state: PlayerState) => {
  state.player.cancelQueue(state.audioContext)
}

const stopPlayLoop = (state: PlayerState) => {
  state.loopStarted = false
  if (state.loopIntervalId) clearInterval(state.loopIntervalId)
  cancelQueue(state)
}

export const createMidiPlayer = (drums: number[]): MidiPlayer => {
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const audioContext = new AudioContextCtor()
  const player = new WebAudioFontPlayer()
  const equalizer = player.createChannel(audioContext)
  const output = audioContext.createGain()
  const echo = player.createReverberator(audioContext)
  echo.wet.gain.setTargetAtTime(DEFAULT_ECHO, 0, 0.0001)
  echo.output.connect(output)
  equalizer.output.connect(echo.input)
  output.connect(audioContext.destination)

  const state: PlayerState = {
    audioContext,
    player,
    equalizer,
    output,
    echo,
    volumesDrum: {},
    beatIndex: 0,
    loopStarted: false,
    drums,
  }

  refreshCache(state)

  return {
    startPlayLoop: (beats, bpm, density, fromBeat, onBeat) => {
      stopPlayLoop(state)
      void state.audioContext.resume()
      state.loopStarted = true
      const wholeNoteDuration = (4 * 60) / bpm
      const stepSec = density * wholeNoteDuration
      state.beatIndex = fromBeat < beats.length ? fromBeat : 0
      playBeatAt(state, contextTime(state), beats[state.beatIndex])
      let nextLoopTime = contextTime(state) + stepSec

      state.loopIntervalId = setInterval(() => {
        if (contextTime(state) <= nextLoopTime - stepSec) return
        state.beatIndex += 1
        if (state.beatIndex >= beats.length) state.beatIndex = 0
        playBeatAt(state, nextLoopTime, beats[state.beatIndex])
        nextLoopTime += stepSec
        onBeat?.(state.beatIndex)
      }, MAX_LAG_MS)
    },
    stopPlayLoop: () => stopPlayLoop(state),
    setDrumVolume: (drum, volume) => {
      state.volumesDrum[drum] = volume
    },
    playDrumsNow: (drumsToPlay) => playDrumsAt(state, contextTime(state), drumsToPlay),
  }
}
