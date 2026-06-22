import { readMyRhythms, saveRhythm } from '@/features/rhythm/my-rhythms-storage'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

/**
 * Owned rhythms live in localStorage. Public rhythm notation is build-time only
 * (Postgres) and served from the static `/rhythm/[slug]` pages, so the browser
 * can only resolve a full rhythm by slug when the user owns it.
 */
export const findRhythmBySlug = (slug: string): Rhythm | null => readMyRhythms()[slug] ?? null

export const copyRhythmToMyRhythms = (rhythm: Rhythm): Rhythm => {
  const now = Date.now()
  const copy: Rhythm = { ...rhythm, userOwned: true, createdAt: now, updatedAt: now }
  saveRhythm(copy)
  return copy
}
