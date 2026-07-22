'use client'

import WebAudioFontPlayer from './webaudiofont'
import {
  playbackCursorAfter,
  playbackIndexAt,
  schedulePlaybackWindow,
  type PlaybackCursor,
} from './playback-clock'

import type { BeatMatrix, MidiPlayer } from '../types'

const SCHEDULER_INTERVAL_MS = 25
const SCHEDULE_AHEAD_MS = 100
const DEFAULT_ECHO = 0.05

type LoopTiming = {
  startIndex: number
  startedAtMs: number
  stepMs: number
  density: number
}

type PlayerState = {
  audioContext: AudioContext
  player: InstanceType<typeof WebAudioFontPlayer>
  equalizer: ReturnType<InstanceType<typeof WebAudioFontPlayer>['createChannel']>
  output: GainNode
  echo: ReturnType<InstanceType<typeof WebAudioFontPlayer>['createReverberator']>
  volumesDrum: Record<number, number>
  loopIntervalId?: ReturnType<typeof setInterval>
  loopStarted: boolean
  loopGeneration: number
  beatIndex: number
  scheduleInvalidated: boolean
  loopTiming?: LoopTiming
  currentBeatIndex?: () => number
  schedulerTick?: () => void
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

const stepMsForBpm = (bpm: number, density: number) => density * ((4 * 60) / bpm) * 1000

const stopPlayLoop = (state: PlayerState) => {
  if (state.currentBeatIndex) state.beatIndex = state.currentBeatIndex()
  state.loopStarted = false
  state.loopGeneration += 1
  if (state.loopIntervalId !== undefined) clearInterval(state.loopIntervalId)
  state.loopIntervalId = undefined
  state.loopTiming = undefined
  state.currentBeatIndex = undefined
  state.schedulerTick = undefined
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
    loopStarted: false,
    loopGeneration: 0,
    beatIndex: 0,
    scheduleInvalidated: false,
    drums,
  }

  refreshCache(state)

  const resumeVisibleLoop = () => {
    if (!state.loopStarted || document.visibilityState !== 'visible') return
    void state.audioContext
      .resume()
      .then(() => state.schedulerTick?.())
      .catch(() => undefined)
  }
  const handleContextStateChange = () => {
    if (!state.loopStarted) return
    if (state.audioContext.state !== 'running') {
      state.scheduleInvalidated = true
      cancelQueue(state)
      return
    }
    if (state.audioContext.state === 'running') state.schedulerTick?.()
  }

  document.addEventListener('visibilitychange', resumeVisibleLoop)
  audioContext.addEventListener('statechange', handleContextStateChange)

  return {
    startPlayLoop: (beats, bpm, density, fromBeat, onBeat) => {
      stopPlayLoop(state)
      if (beats.length === 0) return
      state.loopStarted = true
      const startIndex = fromBeat < beats.length ? fromBeat : 0
      const generation = state.loopGeneration
      const timing: LoopTiming = {
        startIndex,
        startedAtMs: 0,
        stepMs: stepMsForBpm(bpm, density),
        density,
      }
      state.loopTiming = timing
      state.beatIndex = startIndex
      state.scheduleInvalidated = false

      void state.audioContext
        .resume()
        .then(() => {
          if (!state.loopStarted || state.loopGeneration !== generation) return
          timing.startedAtMs = performance.now()
          let lastReportedIndex = startIndex
          let cursor: PlaybackCursor = {
            nextIndex: (startIndex + 1) % beats.length,
            nextTimeMs: timing.startedAtMs + timing.stepMs,
          }
          const currentBeatIndex = () =>
            playbackIndexAt(
              timing.startIndex,
              timing.startedAtMs,
              performance.now(),
              timing.stepMs,
              beats.length,
            )
          state.currentBeatIndex = currentBeatIndex

          playBeatAt(state, contextTime(state), beats[startIndex])
          onBeat?.(startIndex)
          if (!state.loopStarted || state.loopGeneration !== generation) return

          const schedulerTick = () => {
            if (!state.loopStarted || state.loopGeneration !== generation) return
            const nowMs = performance.now()
            const currentIndex = currentBeatIndex()
            state.beatIndex = currentIndex
            if (currentIndex !== lastReportedIndex) {
              lastReportedIndex = currentIndex
              onBeat?.(currentIndex)
            }
            if (
              !state.loopStarted ||
              state.loopGeneration !== generation ||
              state.audioContext.state !== 'running'
            ) {
              return
            }

            if (state.scheduleInvalidated) {
              cursor = playbackCursorAfter(
                timing.startIndex,
                timing.startedAtMs,
                nowMs,
                timing.stepMs,
                beats.length,
              )
              state.scheduleInvalidated = false
            }
            const window = schedulePlaybackWindow({
              beatCount: beats.length,
              cursor,
              nowMs,
              scheduleUntilMs: nowMs + SCHEDULE_AHEAD_MS,
              stepMs: timing.stepMs,
            })
            cursor = window.cursor
            const audioNow = contextTime(state)
            window.scheduled.forEach(({ index, timeMs }) => {
              playBeatAt(state, audioNow + (timeMs - nowMs) / 1000, beats[index])
            })
          }

          state.schedulerTick = schedulerTick
          schedulerTick()
          if (state.loopStarted && state.loopGeneration === generation) {
            state.loopIntervalId = setInterval(schedulerTick, SCHEDULER_INTERVAL_MS)
          }
        })
        .catch(() => undefined)
    },
    setPlayLoopTempo: (bpm) => {
      const timing = state.loopTiming
      if (!state.loopStarted || !timing) return
      const nowMs = performance.now()
      const currentIndex = state.currentBeatIndex?.() ?? state.beatIndex
      timing.startIndex = currentIndex
      timing.startedAtMs = nowMs
      timing.stepMs = stepMsForBpm(bpm, timing.density)
      state.beatIndex = currentIndex
      state.scheduleInvalidated = true
      cancelQueue(state)
      state.schedulerTick?.()
    },
    stopPlayLoop: () => stopPlayLoop(state),
    getBeatIndex: () => state.currentBeatIndex?.() ?? state.beatIndex,
    dispose: () => {
      stopPlayLoop(state)
      document.removeEventListener('visibilitychange', resumeVisibleLoop)
      audioContext.removeEventListener('statechange', handleContextStateChange)
      void audioContext.close()
    },
    setDrumVolume: (drum, volume) => {
      state.volumesDrum[drum] = volume
    },
    playDrumsNow: (drumsToPlay) => playDrumsAt(state, contextTime(state), drumsToPlay),
  }
}
