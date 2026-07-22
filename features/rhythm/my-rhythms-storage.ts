import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { normalizeSwingPatternForMeter } from '@/features/groovy-player/player.store'

export const MY_RHYTHMS_STORAGE_KEY = 'my-rhythms'

const PERSIST_DEBOUNCE_MS = 300

let memoryCache: Record<string, Rhythm> | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null
let flushListenersBound = false

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

const clearPersistTimer = () => {
  if (persistTimer === null) return
  clearTimeout(persistTimer)
  persistTimer = null
}

const writeToLocalStorage = (rhythms: Record<string, Rhythm>) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(MY_RHYTHMS_STORAGE_KEY, JSON.stringify(rhythms))
}

/** Flush any pending debounced write to localStorage immediately. */
export const flushMyRhythms = () => {
  clearPersistTimer()
  if (!memoryCache) return
  writeToLocalStorage(memoryCache)
}

const bindFlushListeners = () => {
  if (flushListenersBound || typeof window === 'undefined') return
  if (typeof window.addEventListener !== 'function') return
  flushListenersBound = true
  const flushIfHidden = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') flushMyRhythms()
  }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', flushIfHidden)
  }
  window.addEventListener('pagehide', flushMyRhythms)
  window.addEventListener('beforeunload', flushMyRhythms)
}

const schedulePersist = () => {
  if (typeof window === 'undefined') return
  bindFlushListeners()
  clearPersistTimer()
  persistTimer = setTimeout(() => {
    persistTimer = null
    flushMyRhythms()
  }, PERSIST_DEBOUNCE_MS)
}

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

const loadNormalizedRhythms = (): Record<string, Rhythm> => {
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
  if (dirty) writeToLocalStorage(rhythms)
  return rhythms
}

export const readMyRhythms = (): Record<string, Rhythm> => {
  if (memoryCache) return memoryCache
  memoryCache = loadNormalizedRhythms()
  return memoryCache
}

export const writeMyRhythms = (rhythms: Record<string, Rhythm>) => {
  memoryCache = rhythms
  clearPersistTimer()
  writeToLocalStorage(rhythms)
}

export const saveRhythm = (rhythm: Rhythm, previousSlug?: string) => {
  const rhythms = { ...readMyRhythms() }
  const normalized = normalizeRhythmSwing(rhythm)
  const isRename = Boolean(previousSlug && previousSlug !== normalized.slug)
  if (isRename && previousSlug) {
    delete rhythms[previousSlug]
  }
  rhythms[normalized.slug] = { ...normalized, updatedAt: Date.now(), userOwned: true }
  memoryCache = rhythms
  if (isRename) {
    flushMyRhythms()
  } else {
    schedulePersist()
  }
  return rhythms
}

export const deleteRhythm = (slug: string) => {
  const rhythms = { ...readMyRhythms() }
  delete rhythms[slug]
  memoryCache = rhythms
  flushMyRhythms()
  return rhythms
}

export const listMyRhythms = () => Object.values(readMyRhythms())

/** Test-only: clear in-memory cache and pending timers. */
export const resetMyRhythmsStorageForTests = () => {
  clearPersistTimer()
  memoryCache = null
  flushListenersBound = false
}
