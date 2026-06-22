import type { RhythmRow } from '@/db/schema'
import type {
  Rhythm,
  RhythmCard,
  RhythmInstrument,
  RhythmMeter,
  RhythmPattern,
  Track,
} from '@/features/rhythm/rhythm.types'

/** Longest instrument track (bar count) — derived, never stored on the row. */
export const longestTrackFromPatterns = (patterns: RhythmPattern[]) =>
  Math.max(0, ...patterns.map((pattern) => pattern.bars.length))

/** A rhythm row reduced to the searchable card meta (no notation/patterns). */
export const rowToCard = (row: RhythmRow): RhythmCard => ({
  slug: row.slug,
  title: row.title,
  description: row.description ?? '',
  meter: row.meter as RhythmMeter,
  instruments: row.instruments as RhythmInstrument[],
  longestTrack: longestTrackFromPatterns(row.patterns ?? []),
  author: row.author ?? [],
  origin: row.origin ?? [],
  tags: row.tags ?? [],
  rhythmGroup: row.rhythmGroup ?? [],
  swingPattern: row.swingPattern ?? '',
  tempo: row.tempo ?? 0,
  signalPattern: row.signalPattern ?? '',
  createdAt: row.createdAt.getTime(),
  updatedAt: (row.updatedAt ?? row.createdAt).getTime(),
  userOwned: false,
})

/** Full rhythm card meta plus the instrument patterns for the detail page. */
export type RhythmDetail = RhythmCard & { patterns: RhythmPattern[] }

export const rowToDetail = (row: RhythmRow): RhythmDetail => ({
  ...rowToCard(row),
  patterns: row.patterns ?? [],
})

/** Build a player/editor {@link Rhythm} from a detail record, keyed by track id. */
export const detailToRhythm = (detail: RhythmDetail): Rhythm => {
  const seen = new Set<string>()
  const instruments: Record<string, Track> = {}

  for (const pattern of detail.patterns) {
    let id = pattern.instrument
    let suffix = 2
    while (seen.has(id)) {
      id = `${pattern.instrument}-${suffix}`
      suffix += 1
    }
    seen.add(id)
    instruments[id] = { id, name: pattern.name, instrument: pattern.instrument, bars: pattern.bars }
  }

  return {
    slug: detail.slug,
    title: detail.title,
    description: detail.description,
    meter: detail.meter,
    author: detail.author,
    origin: detail.origin,
    tags: detail.tags,
    rhythmGroup: detail.rhythmGroup,
    swingPattern: detail.swingPattern,
    tempo: detail.tempo,
    signalPattern: detail.signalPattern,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    userOwned: false,
    instruments,
  }
}
