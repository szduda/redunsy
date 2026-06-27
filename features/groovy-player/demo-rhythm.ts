import {
  DEMO_SWING_PATTERN,
  normalizeSwingPatternForMeter,
  PLAYER_DEMO_METER,
  swingBarSizeForMeter,
} from '@/features/groovy-player/player.store'
import { DEMO_TRACKS } from '@/features/groovy-player/demo-tracks'
import { forkRhythmToMyRhythms } from '@/features/rhythm/rhythm-catalog'
import type { Rhythm, Track } from '@/features/rhythm/rhythm.types'

export { PLAYER_DEMO_METER }

export const PLAYER_DEMO_TITLE = 'Soli (Player Demo)'

const demoInstruments = (): Record<string, Track> =>
  Object.fromEntries(DEMO_TRACKS.map((track) => [track.id, { ...track }]))

export const buildPlayerDemoRhythm = (tempo: number, swingPattern: string): Rhythm => {
  const now = Date.now()
  const meter = PLAYER_DEMO_METER
  const grooveLength = swingBarSizeForMeter(meter)
  const normalizedSwing = normalizeSwingPatternForMeter(
    swingPattern.length === grooveLength ? swingPattern : DEMO_SWING_PATTERN,
    meter,
  )

  return {
    slug: 'player-demo-soli',
    title: PLAYER_DEMO_TITLE,
    description: 'Player Demo — Soli-style groove with djembe solo and dundun accompaniment.',
    meter,
    author: [],
    origin: ['Guinea'],
    tags: ['soli', 'demo'],
    rhythmGroup: [],
    swingPattern: normalizedSwing.length === grooveLength ? normalizedSwing : DEMO_SWING_PATTERN,
    tempo,
    signalPattern: '',
    createdAt: now,
    updatedAt: now,
    instruments: demoInstruments(),
  }
}

export const forkPlayerDemoToMyRhythms = (tempo: number, swingPattern: string) =>
  forkRhythmToMyRhythms(buildPlayerDemoRhythm(tempo, swingPattern))
