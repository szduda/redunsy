import { readMyRhythms, saveRhythm } from '@/features/rhythm/my-rhythms-storage'
import { randomHash, slugFromTitle } from '@/features/rhythm/rhythm-helpers'
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

const uniqueForkTitle = (rhythm: Rhythm) => {
  const rhythms = readMyRhythms()
  let title = `${rhythm.title} (fork)`
  let slug = slugFromTitle(title)
  while (rhythms[slug]) {
    title = `${rhythm.title} (fork ${randomHash(3)})`
    slug = slugFromTitle(title)
  }
  return { title, slug }
}

export const forkRhythmToMyRhythms = (rhythm: Rhythm): Rhythm => {
  const now = Date.now()
  const { title, slug } = uniqueForkTitle(rhythm)
  const fork: Rhythm = {
    ...rhythm,
    title,
    slug,
    userOwned: true,
    createdAt: now,
    updatedAt: now,
  }
  saveRhythm(fork)
  return fork
}
