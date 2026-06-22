import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { normalizeSwingPatternForMeter } from '@/features/groovy-player/player.store'

export const MY_RHYTHMS_STORAGE_KEY = 'my-rhythms'

/** Coerce a legacy string `author` (pre-`string[]`) into the current array shape. */
const normalizeAuthor = (author: Rhythm['author'] | string | undefined): string[] => {
  if (Array.isArray(author)) return author
  if (typeof author === 'string' && author.trim()) return [author.trim()]
  return []
}

const normalizeStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : []

export const normalizeRhythmSwing = (rhythm: Rhythm): Rhythm => ({
  ...rhythm,
  author: normalizeAuthor(rhythm.author),
  origin: normalizeStringArray((rhythm as Record<string, unknown>).origin),
  tags: normalizeStringArray((rhythm as Record<string, unknown>).tags),
  rhythmGroup: normalizeStringArray((rhythm as Record<string, unknown>).rhythmGroup),
  swingPattern: normalizeSwingPatternForMeter(rhythm.swingPattern, rhythm.meter),
})

const parseStoredRhythms = (): Record<string, Rhythm> => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(MY_RHYTHMS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Rhythm>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export const readMyRhythms = (): Record<string, Rhythm> => {
  const stored = parseStoredRhythms()
  let dirty = false
  const rhythms = Object.fromEntries(
    Object.entries(stored).map(([slug, rhythm]) => {
      const normalized = normalizeRhythmSwing(rhythm)
      const r = rhythm as Record<string, unknown>
      if (
        normalized.swingPattern !== rhythm.swingPattern ||
        !Array.isArray(r.author) ||
        !Array.isArray(r.origin) ||
        !Array.isArray(r.tags) ||
        !Array.isArray(r.rhythmGroup)
      ) {
        dirty = true
      }
      return [slug, normalized]
    }),
  )
  if (dirty) writeMyRhythms(rhythms)
  return rhythms
}

export const writeMyRhythms = (rhythms: Record<string, Rhythm>) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(MY_RHYTHMS_STORAGE_KEY, JSON.stringify(rhythms))
}

export const saveRhythm = (rhythm: Rhythm, previousSlug?: string) => {
  const rhythms = readMyRhythms()
  const normalized = normalizeRhythmSwing(rhythm)
  if (previousSlug && previousSlug !== normalized.slug) {
    delete rhythms[previousSlug]
  }
  rhythms[normalized.slug] = { ...normalized, updatedAt: Date.now(), userOwned: true }
  writeMyRhythms(rhythms)
  return rhythms
}

export const deleteRhythm = (slug: string) => {
  const rhythms = readMyRhythms()
  delete rhythms[slug]
  writeMyRhythms(rhythms)
  return rhythms
}

export const listMyRhythms = () => Object.values(readMyRhythms())
