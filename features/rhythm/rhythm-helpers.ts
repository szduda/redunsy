import {
  defaultSwingPatternForMeter,
  DEFAULT_TEMPO,
  normalizeSwingPatternForMeter,
} from '@/features/groovy-player/player.store'

import type {
  Rhythm,
  RhythmCard,
  RhythmInstrument,
  RhythmMeter,
  Track,
} from '@/features/rhythm/rhythm.types'

export const barSizeForMeter = (meter: RhythmMeter) => meter * 2

export const emptyBar = (meter: RhythmMeter) => '-'.repeat(barSizeForMeter(meter))

export const emptyBars = (meter: RhythmMeter, count = 2) =>
  Array.from({ length: count }, () => emptyBar(meter))

export const longestTrackBars = (tracks: Track[]) =>
  Math.max(0, ...tracks.map((track) => track.bars.length))

export const tracksFromRecord = (instruments: Record<string, Track>) => Object.values(instruments)

export const rhythmToCard = (rhythm: Rhythm): RhythmCard => {
  const tracks = tracksFromRecord(rhythm.instruments)
  return {
    slug: rhythm.slug,
    title: rhythm.title,
    description: rhythm.description,
    meter: rhythm.meter,
    instruments: tracks.map((track) => track.instrument as RhythmInstrument),
    longestTrack: longestTrackBars(tracks),
    author: rhythm.author,
    origin: rhythm.origin,
    tags: rhythm.tags,
    rhythmGroup: rhythm.rhythmGroup,
    swingPattern: rhythm.swingPattern,
    tempo: rhythm.tempo,
    signalPattern: rhythm.signalPattern,
    createdAt: rhythm.createdAt,
    updatedAt: rhythm.updatedAt,
    userOwned: rhythm.userOwned,
  }
}

export const trackBarsRecord = (rhythm: Rhythm) =>
  Object.fromEntries(Object.values(rhythm.instruments).map((track) => [track.id, track.bars]))

const INSTRUMENT_LABELS: Record<RhythmInstrument, string> = {
  djembe: 'Djembe',
  dundunba: 'Dundunba',
  sangban: 'Sangban',
  kenkeni: 'Kenkeni',
  bell: 'Bell',
}

export const createTrack = (
  instrument: RhythmInstrument,
  meter: RhythmMeter,
  bars?: string[],
): Track => ({
  id: instrument,
  name: INSTRUMENT_LABELS[instrument],
  instrument,
  bars: bars ?? emptyBars(meter),
})

export const djembeStarterBars = (meter: RhythmMeter) => {
  const pattern = meter === 4 ? 's--ss-tt' : 's-ts--'
  return [pattern, pattern]
}

export const randomHash = (length = 5) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
    '',
  )
}

export const defaultRhythmTitle = () => `rhythm-${randomHash()}`

export const slugFromTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || defaultRhythmTitle()

type CreateRhythmInput = {
  title?: string
  description?: string
  author?: string[]
  origin?: string[]
  rhythmGroup?: string[]
  meter?: RhythmMeter
  layers?: RhythmInstrument[]
  tempo?: number
  swingPattern?: string
  signalPattern?: string
  tags?: string[]
  fillDjembe?: boolean
}

export const createRhythm = ({
  title = defaultRhythmTitle(),
  description = '',
  author = [],
  origin = [],
  rhythmGroup = [],
  meter = 4,
  layers = ['djembe'],
  tempo = DEFAULT_TEMPO,
  swingPattern = defaultSwingPatternForMeter(meter),
  signalPattern = '',
  tags = [],
  fillDjembe = false,
}: CreateRhythmInput = {}): Rhythm => {
  const now = Date.now()
  const slug = slugFromTitle(title)
  const instruments = Object.fromEntries(
    layers.map((instrument) => [
      instrument,
      createTrack(
        instrument,
        meter,
        instrument === 'djembe' && fillDjembe ? djembeStarterBars(meter) : undefined,
      ),
    ]),
  )

  return {
    slug,
    title,
    description,
    meter,
    author,
    origin,
    tags,
    rhythmGroup,
    swingPattern: normalizeSwingPatternForMeter(swingPattern, meter),
    tempo,
    signalPattern,
    createdAt: now,
    updatedAt: now,
    userOwned: true,
    instruments,
  }
}
