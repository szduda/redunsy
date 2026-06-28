import type { RhythmInsert } from '@/db/schema'
import {
  RHYTHM_INSTRUMENTS,
  type RhythmInstrument,
  type RhythmMeter,
  type RhythmPattern,
} from '@/features/rhythm/rhythm.types'

import type { PlaygroundSnippet } from './playground-decode'
import type { ParsedTelegramRhythm } from './parse-export'

const DEFAULT_TEMPO = 110

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
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
  const base = value
    .replace(/[0-9].*$/, '')
    .replace(/\s*\(.*\)$/, '')
    .trim()
  if ((RHYTHM_INSTRUMENTS as readonly string[]).includes(base)) {
    return base as RhythmInstrument
  }
  return null
}

const meterFromPatterns = (patterns: Record<string, string>, beatSize?: number): RhythmMeter => {
  if (beatSize === 6) return 3
  if (beatSize === 8) return 4
  const firstLen = Object.values(patterns).find(Boolean)?.length ?? 0
  if (firstLen % 6 === 0) return 3
  return 4
}

const grooveSymbolFromSwing = (swing?: string): string | null => {
  if (!swing) return null
  for (const symbol of ['(', ')', '<', '>'] as const) {
    if (swing.includes(symbol)) return symbol
  }
  return null
}

const swingPatternFromSwing = (swing: string | undefined, barSize: number): string => {
  const symbol = grooveSymbolFromSwing(swing)
  if (!symbol) return '-'.repeat(barSize)
  return Array.from({ length: barSize }, (_, index) => (index % 2 === 1 ? symbol : '-')).join('')
}

const toRhythmPatterns = (patterns: Record<string, string>, barSize: number): RhythmPattern[] =>
  Object.entries(patterns)
    .filter(([, notation]) => Boolean(notation))
    .map(([instrument, notation], index) => ({
      id: `${instrument}-${index}`,
      name: instrument,
      instrument,
      title: instrument,
      pattern: notation,
      bars: splitBars(notation, barSize),
    }))

const cardInstruments = (patterns: RhythmPattern[]): RhythmInstrument[] => {
  const seen = new Set<RhythmInstrument>()
  for (const pattern of patterns) {
    const instrument = normalizeInstrument(pattern.instrument)
    if (instrument) seen.add(instrument)
  }
  return [...seen]
}

const normalizeTempo = (tempo?: string): number => {
  const value = Number.parseInt(tempo ?? '', 10)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TEMPO
}

export const playgroundToRhythmRow = (
  entry: ParsedTelegramRhythm,
  snippet: PlaygroundSnippet,
  takenSlugs: Set<string>,
): RhythmInsert => {
  const patternsMap = snippet.patterns ?? {}
  const meter = meterFromPatterns(patternsMap, snippet.beatSize)
  const barSize = meter * 2
  const patterns = toRhythmPatterns(patternsMap, barSize)
  const title = entry.title.trim() || 'Untitled'
  const createdAt = new Date(entry.date)
  const id = `telegram-${entry.messageId}`

  return {
    id,
    slug: uniqueSlug(slugify(title), `telegram-${entry.messageId}`, takenSlugs),
    title,
    meter,
    instruments: cardInstruments(patterns),
    description: `Imported from Telegram saved message (${entry.date.slice(0, 10)}).`,
    author: [],
    origin: [],
    tags: ['telegram-import'],
    rhythmGroup: [],
    swingPattern: swingPatternFromSwing(snippet.swing, barSize),
    tempo: normalizeTempo(snippet.tempo),
    signalPattern: snippet.signal ?? '',
    published: true,
    patterns,
    createdAt,
    updatedAt: createdAt,
  }
}

export const transformTelegramEntries = (
  entries: Array<{ entry: ParsedTelegramRhythm; snippet: PlaygroundSnippet }>,
  existingSlugs: Set<string> = new Set(),
): RhythmInsert[] => {
  const taken = new Set(existingSlugs)
  return entries.map(({ entry, snippet }) => playgroundToRhythmRow(entry, snippet, taken))
}
