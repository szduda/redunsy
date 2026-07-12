import type { Rhythm, RhythmInstrument, RhythmPattern } from '@/features/rhythm/rhythm.types'

const RHYTHM_INSTRUMENT_SET = new Set<string>(['djembe', 'dundunba', 'sangban', 'kenkeni', 'bell'])

const normalizeInstrument = (instrument: string): RhythmInstrument | null =>
  RHYTHM_INSTRUMENT_SET.has(instrument) ? (instrument as RhythmInstrument) : null

export const rhythmToPatterns = (rhythm: Rhythm): RhythmPattern[] =>
  Object.values(rhythm.instruments).map((track) => ({
    id: track.id,
    name: track.name,
    instrument: track.instrument,
    title: track.name,
    pattern: track.bars.join(''),
    bars: track.bars,
  }))

export const rhythmInstrumentList = (patterns: RhythmPattern[]): RhythmInstrument[] => {
  const seen = new Set<RhythmInstrument>()
  for (const pattern of patterns) {
    const instrument = normalizeInstrument(pattern.instrument)
    if (instrument) seen.add(instrument)
  }
  return [...seen]
}

export type PublishedRhythmRow = {
  slug: string
  title: string
  meter: Rhythm['meter']
  instruments: RhythmInstrument[]
  description: string
  author: string[]
  origin: string[]
  tags: string[]
  rhythmGroup: string[]
  swingPattern: string
  tempo: number
  signalPattern: string
  patterns: RhythmPattern[]
  updatedAt: Date
}

export const rhythmToPublishedRow = (slug: string, rhythm: Rhythm): PublishedRhythmRow => ({
  slug,
  title: rhythm.title.trim() || slug,
  meter: rhythm.meter,
  instruments: rhythmInstrumentList(rhythmToPatterns(rhythm)),
  description: rhythm.description ?? '',
  author: rhythm.author ?? [],
  origin: rhythm.origin ?? [],
  tags: rhythm.tags ?? [],
  rhythmGroup: rhythm.rhythmGroup ?? [],
  swingPattern: rhythm.swingPattern ?? '',
  tempo: rhythm.tempo ?? 0,
  signalPattern: rhythm.signalPattern ?? '',
  patterns: rhythmToPatterns(rhythm),
  updatedAt: new Date(),
})
