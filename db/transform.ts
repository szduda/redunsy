import type { RhythmInsert } from '@/db/schema'
import {
  RHYTHM_INSTRUMENTS,
  type RhythmInstrument,
  type RhythmMeter,
  type RhythmPattern,
} from '@/features/rhythm/rhythm.types'

/** Raw instrument pattern as it appears in the Firestore export. */
type FirestorePattern = {
  _id?: string
  instrument?: string
  title?: string
  pattern?: string
}

/** Raw rhythm ("drum") document as it appears in the Firestore export. */
type FirestoreDrum = {
  _id: string
  slug?: string
  title?: string
  description?: string
  tempo?: number | string
  swing?: string
  signal?: string
  tags?: string[]
  patterns?: FirestorePattern[]
  published?: boolean
  author?: string
  authorUid?: string
  createdAt?: string
  updatedAt?: string
}

export type FirestoreExport = {
  drums: FirestoreDrum[]
  patterns?: FirestorePattern[]
}

const DEFAULT_TEMPO = 110

/** Meter signatures (in tags) that imply a compound / "on 3" feel. */
const COMPOUND_METERS = new Set(['6/8', '9/8', '12/8', '3/4'])
const SIMPLE_METERS = new Set(['4/4', '2/4'])
const METER_TAG = /^\d+\/\d+$/

/** Generic / structural tags that describe form rather than a rhythm family. */
const NON_GROUP_TAGS = new Set([
  'dundun set',
  'dundun',
  'intro',
  'outro',
  'break',
  'variation',
  'variations',
  'sequential',
  'short loop',
  'rapide',
  'popular',
  'jam',
  'modern',
  'traditional',
  'groove',
])

const meterFromTags = (tags: string[]): RhythmMeter => {
  if (tags.some((tag) => COMPOUND_METERS.has(tag))) return 3
  if (tags.some((tag) => SIMPLE_METERS.has(tag))) return 4
  return 4
}

const barSizeForMeter = (meter: RhythmMeter) => meter * 2

/** Split a flat notation string into fixed-width bars, padding the final bar. */
const splitBars = (pattern: string, barSize: number): string[] => {
  if (!pattern) return []
  const bars: string[] = []
  for (let i = 0; i < pattern.length; i += barSize) {
    bars.push(pattern.slice(i, i + barSize).padEnd(barSize, '-'))
  }
  return bars
}

const normalizeInstrument = (raw: string): RhythmInstrument | null => {
  const value = raw.toLowerCase().trim()
  if ((RHYTHM_INSTRUMENTS as readonly string[]).includes(value)) {
    return value as RhythmInstrument
  }
  // Variants such as "kenkeni2" or "kenkeni (high)" collapse to their base drum.
  const base = value
    .replace(/[0-9].*$/, '')
    .replace(/\s*\(.*\)$/, '')
    .trim()
  if ((RHYTHM_INSTRUMENTS as readonly string[]).includes(base)) {
    return base as RhythmInstrument
  }
  return null
}

const normalizeTempo = (tempo: FirestoreDrum['tempo']): number => {
  const value = typeof tempo === 'string' ? Number.parseInt(tempo, 10) : tempo
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : DEFAULT_TEMPO
}

const toDate = (iso?: string): Date => {
  if (!iso) return new Date(0)
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

const deriveRhythmGroup = (tags: string[]): string[] =>
  tags.filter((tag) => !METER_TAG.test(tag) && !NON_GROUP_TAGS.has(tag.toLowerCase()))

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const uniqueSlug = (candidate: string, fallback: string, taken: Set<string>): string => {
  const base = candidate || fallback
  let slug = base
  let suffix = 2
  while (taken.has(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  taken.add(slug)
  return slug
}

const toRhythmPatterns = (patterns: FirestorePattern[], barSize: number): RhythmPattern[] =>
  patterns.map((pattern, index) => {
    const instrument = (pattern.instrument ?? '').trim() || 'djembe'
    const title = (pattern.title ?? instrument).trim()
    const notation = pattern.pattern ?? ''
    return {
      id: pattern._id ?? `${instrument}-${index}`,
      name: title || instrument,
      instrument,
      title,
      pattern: notation,
      bars: splitBars(notation, barSize),
    }
  })

const cardInstruments = (patterns: RhythmPattern[]): RhythmInstrument[] => {
  const seen = new Set<RhythmInstrument>()
  for (const pattern of patterns) {
    const instrument = normalizeInstrument(pattern.instrument)
    if (instrument) seen.add(instrument)
  }
  return [...seen]
}

const toRhythmRow = (drum: FirestoreDrum, taken: Set<string>): RhythmInsert => {
  const tags = drum.tags ?? []
  const meter = meterFromTags(tags)
  const barSize = barSizeForMeter(meter)
  const patterns = toRhythmPatterns(drum.patterns ?? [], barSize)
  const createdAt = toDate(drum.createdAt)
  const updatedAt = drum.updatedAt ? toDate(drum.updatedAt) : createdAt

  return {
    id: drum._id,
    slug: uniqueSlug(slugify(drum.slug ?? ''), slugify(drum.title ?? '') || drum._id, taken),
    title: (drum.title ?? '').trim() || 'Untitled',
    description: (drum.description ?? '').trim(),
    meter,
    author: (drum.author ?? '').trim(),
    origin: [],
    tags,
    rhythmGroup: deriveRhythmGroup(tags),
    instruments: cardInstruments(patterns),
    longestTrack: Math.max(0, ...patterns.map((pattern) => pattern.bars.length)),
    swing: drum.swing ?? '',
    swingPattern: '-'.repeat(barSize),
    tempo: normalizeTempo(drum.tempo),
    signalPattern: drum.signal ?? '',
    published: drum.published === true,
    patterns,
    createdAt,
    updatedAt,
  }
}

/** Convert a full Firestore export into ordered, slug-deduped rhythm rows. */
export const transformFirestoreExport = (data: FirestoreExport): RhythmInsert[] => {
  const taken = new Set<string>()
  return data.drums.map((drum) => toRhythmRow(drum, taken))
}
