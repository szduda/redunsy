import {
  normalizeSwingPatternForMeter,
  swingBarSizeForMeter,
} from '@/features/groovy-player/player.store'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm, RhythmMeter, Track } from '@/features/rhythm/rhythm.types'
import {
  isRhythmInstrument,
  sanitizeBarPattern,
  sanitizeSwingPattern,
} from '@/features/share-rhythm/shared/pattern-chars'
import { SHARE_LIMITS } from '@/features/share-rhythm/shared/share-limits'

const RHYTHM_KEYS = new Set([
  'slug',
  'title',
  'description',
  'meter',
  'author',
  'origin',
  'tags',
  'rhythmGroup',
  'swingPattern',
  'tempo',
  'signalPattern',
  'createdAt',
  'updatedAt',
  'instruments',
  'userOwned',
])

const TRACK_KEYS = new Set(['id', 'name', 'instrument', 'bars'])

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readString = (
  value: unknown,
  maxLength: number,
  warn: (message: string) => void,
  fallback = '',
) => {
  if (typeof value !== 'string') {
    if (value !== undefined) warn(`Expected string, got ${typeof value}`)
    return fallback
  }
  if (value.length > maxLength) {
    warn(`String exceeded max length ${maxLength}`)
    return value.slice(0, maxLength)
  }
  return value
}

const readStringArray = (value: unknown, warn: (message: string) => void) => {
  if (!Array.isArray(value)) {
    if (value !== undefined) warn('Expected string array')
    return []
  }
  if (value.length > SHARE_LIMITS.maxStringArrayLength) {
    warn(`String array exceeded max length ${SHARE_LIMITS.maxStringArrayLength}`)
  }
  return value.slice(0, SHARE_LIMITS.maxStringArrayLength).filter((item): item is string => {
    if (typeof item !== 'string') {
      warn('Dropped non-string array item')
      return false
    }
    if (item.length > SHARE_LIMITS.maxStringItemLength) {
      warn(`Dropped string array item longer than ${SHARE_LIMITS.maxStringItemLength}`)
      return false
    }
    return true
  })
}

const readMeter = (value: unknown, warn: (message: string) => void): RhythmMeter => {
  if (value === 3 || value === 4) return value
  warn(`Invalid meter "${String(value)}", defaulting to 4`)
  return 4
}

const readTempo = (value: unknown, warn: (message: string) => void) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    warn('Invalid tempo, defaulting to 110')
    return 110
  }
  const rounded = Math.round(value)
  if (rounded < SHARE_LIMITS.minTempo || rounded > SHARE_LIMITS.maxTempo) {
    warn(`Tempo ${rounded} out of range, clamping`)
    return Math.min(SHARE_LIMITS.maxTempo, Math.max(SHARE_LIMITS.minTempo, rounded))
  }
  return rounded
}

const readTimestamp = (value: unknown, warn: (message: string) => void, fallback: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    warn('Invalid timestamp, using current time')
    return fallback
  }
  return Math.round(value)
}

const sanitizeTrack = (value: unknown, warn: (message: string) => void): Track | null => {
  if (!isRecord(value)) {
    warn('Dropped invalid track entry')
    return null
  }

  Object.keys(value).forEach((key) => {
    if (!TRACK_KEYS.has(key)) warn(`Dropped unknown track property "${key}"`)
  })

  const instrument = readString(value.instrument, SHARE_LIMITS.maxStringItemLength, warn)
  if (!isRhythmInstrument(instrument)) {
    warn(`Dropped track with invalid instrument "${instrument}"`)
    return null
  }

  const barsValue = value.bars
  if (!Array.isArray(barsValue)) {
    warn(`Dropped track "${instrument}" without bars array`)
    return null
  }

  const bars = barsValue
    .slice(0, SHARE_LIMITS.maxBarsPerTrack)
    .filter((bar): bar is string => typeof bar === 'string')
    .map((bar) =>
      sanitizeBarPattern(
        bar.length > SHARE_LIMITS.maxBarLength ? bar.slice(0, SHARE_LIMITS.maxBarLength) : bar,
        instrument,
        warn,
      ),
    )
    .filter((bar) => bar.length > 0)

  if (!bars.length) {
    warn(`Dropped track "${instrument}" with no valid bars`)
    return null
  }

  const id = readString(value.id, SHARE_LIMITS.maxStringItemLength, warn, instrument)
  const name = readString(value.name, SHARE_LIMITS.maxTitleLength, warn, instrument)

  return {
    id,
    name,
    instrument,
    bars,
  }
}

const sanitizeInstruments = (value: unknown, warn: (message: string) => void) => {
  if (!isRecord(value)) {
    warn('Invalid instruments object')
    return {}
  }

  const entries = Object.entries(value).slice(0, SHARE_LIMITS.maxTracks)
  if (Object.keys(value).length > SHARE_LIMITS.maxTracks) {
    warn(`Instruments object exceeded max tracks ${SHARE_LIMITS.maxTracks}`)
  }

  return Object.fromEntries(
    entries
      .map(([key, trackValue]) => {
        const track = sanitizeTrack(trackValue, warn)
        return track ? [key, track] : null
      })
      .filter((entry): entry is [string, Track] => entry !== null),
  )
}

export const validateSharedRhythm = (
  payload: unknown,
  warn: (message: string) => void = console.warn,
): Rhythm | null => {
  if (!isRecord(payload)) {
    warn('Shared rhythm payload must be an object')
    return null
  }

  Object.keys(payload).forEach((key) => {
    if (FORBIDDEN_KEYS.has(key)) warn(`Rejected forbidden property "${key}"`)
    else if (!RHYTHM_KEYS.has(key)) warn(`Dropped unknown rhythm property "${key}"`)
  })

  const meter = readMeter(payload.meter, warn)
  const now = Date.now()
  const title = readString(payload.title, SHARE_LIMITS.maxTitleLength, warn, 'shared-rhythm')
  const slugInput = readString(payload.slug, SHARE_LIMITS.maxSlugLength, warn, title)
  const slug = slugFromTitle(slugInput || title)
  const swingPattern = normalizeSwingPatternForMeter(
    sanitizeSwingPattern(readString(payload.swingPattern, SHARE_LIMITS.maxBarLength, warn), warn),
    meter,
  )

  if (swingPattern.length !== swingBarSizeForMeter(meter)) {
    warn('Swing pattern length mismatch after sanitization')
  }

  const instruments = sanitizeInstruments(payload.instruments, warn)
  if (!Object.keys(instruments).length) {
    warn('Shared rhythm has no valid instrument tracks')
    return null
  }

  return {
    slug,
    title,
    description: readString(payload.description, SHARE_LIMITS.maxDescriptionLength, warn),
    meter,
    author: readStringArray(payload.author, warn),
    origin: readStringArray(payload.origin, warn),
    tags: readStringArray(payload.tags, warn),
    rhythmGroup: readStringArray(payload.rhythmGroup, warn),
    swingPattern,
    tempo: readTempo(payload.tempo, warn),
    signalPattern: readString(payload.signalPattern, SHARE_LIMITS.maxBarLength, warn),
    createdAt: readTimestamp(payload.createdAt, warn, now),
    updatedAt: readTimestamp(payload.updatedAt, warn, now),
    instruments,
  }
}
