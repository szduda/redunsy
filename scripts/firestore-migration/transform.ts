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

/**
 * Known artists. Authors are *derived* — the legacy `author` field is dropped and
 * a name is only attached when it is mentioned in the title/description/tags.
 */
const AUTHOR_MATCHERS = [
  { needle: 'mamady keita', name: 'Mamady Keita' },
  { needle: 'drissa kone', name: 'Drissa Kone' },
] as const

/** Geo region / ethnicity tags — these belong in `origin`, not `tags`. */
const ORIGIN_TAGS = new Set(['susu', 'kassonke', 'wassolon'])

/**
 * Tags to discard entirely — test junk, instrument names that crept into tags,
 * or any value that is neither a descriptor nor a family name.
 */
const JUNK_TAGS = new Set(['tag', 'tag2', 'sangban', 'dundun', 'dundun set'])

/** Rhythm family names — these belong in `rhythm_group`, not `tags`. */
const RHYTHM_NAME_TAGS = new Set([
  'balakulandjan',
  'bolokonondo',
  'denaben',
  'dibon',
  'didadi',
  'dunumba',
  'djaa',
  'djagbe',
  'djansa',
  'djelidon',
  'dunungbe',
  'fula fare',
  'gine fare',
  'kassa',
  'kawa',
  'kon',
  'konkoba',
  'kudani',
  'lafe',
  'lamban',
  'madan',
  'mane',
  'marakadon',
  'mendiani',
  'ngoron',
  'sandia',
  'shemufoli',
  'sinte',
  'soboninkun',
  'soko',
  'soli',
  'toro',
  'yogui',
  'zaouli',
])

const isAuthorTag = (tag: string) => AUTHOR_MATCHERS.some((matcher) => tag === matcher.needle)

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

const GROOVE_SYMBOLS = new Set(['<', '(', '>', ')'])

/** Pick the most common groove shift symbol in a legacy `swing` shorthand. */
const dominantGrooveSymbol = (swing: string): string | null => {
  const counts = new Map<string, number>()
  for (const char of swing) {
    if (GROOVE_SYMBOLS.has(char)) counts.set(char, (counts.get(char) ?? 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  for (const [symbol, count] of counts) {
    if (count > bestCount) {
      best = symbol
      bestCount = count
    }
  }
  return best
}

/**
 * The export carried both `swing` ("<<") and a placeholder `swing_pattern`; they
 * are merged into a single barSize-wide groove. The legacy shorthand is applied
 * to the off-beat eighths (odd grid positions), straight otherwise.
 */
const swingPatternFromSwing = (swing: string | undefined, barSize: number): string => {
  const symbol = swing ? dominantGrooveSymbol(swing) : null
  if (!symbol) return '-'.repeat(barSize)
  return Array.from({ length: barSize }, (_, index) => (index % 2 === 1 ? symbol : '-')).join('')
}

type ClassifiedTags = { origin: string[]; rhythmGroup: string[]; tags: string[] }

/** Split the raw tag bag into origin / rhythm group / leftover descriptive tags. */
const classifyTags = (rawTags: string[]): ClassifiedTags => {
  const origin = new Set<string>()
  const rhythmGroup = new Set<string>()
  const tags = new Set<string>()
  for (const raw of rawTags) {
    const tag = raw.trim().toLowerCase()
    if (!tag || METER_TAG.test(tag) || isAuthorTag(tag) || JUNK_TAGS.has(tag)) continue
    if (ORIGIN_TAGS.has(tag)) origin.add(tag)
    else if (RHYTHM_NAME_TAGS.has(tag)) rhythmGroup.add(tag)
    else tags.add(tag)
  }
  return { origin: [...origin], rhythmGroup: [...rhythmGroup], tags: [...tags] }
}

const deriveAuthors = (texts: string[]): string[] => {
  const haystack = texts.join(' \u0001 ').toLowerCase()
  return AUTHOR_MATCHERS.filter((matcher) => haystack.includes(matcher.needle)).map(
    (matcher) => matcher.name,
  )
}

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
  const rawTags = drum.tags ?? []
  const { origin, rhythmGroup, tags } = classifyTags(rawTags)
  const meter = meterFromTags(rawTags)
  const barSize = barSizeForMeter(meter)
  const patterns = toRhythmPatterns(drum.patterns ?? [], barSize)
  const createdAt = toDate(drum.createdAt)
  const updatedAt = drum.updatedAt ? toDate(drum.updatedAt) : createdAt
  const title = (drum.title ?? '').trim() || 'Untitled'
  const description = (drum.description ?? '').trim()

  return {
    id: drum._id,
    slug: uniqueSlug(slugify(drum.slug ?? ''), slugify(title) || drum._id, taken),
    title,
    meter,
    instruments: cardInstruments(patterns),
    description,
    author: deriveAuthors([title, description, ...rawTags]),
    origin,
    tags,
    rhythmGroup,
    swingPattern: swingPatternFromSwing(drum.swing, barSize),
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
