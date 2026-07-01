import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

const FORK_TITLE_SUFFIX = / \(fork(?: [a-z0-9]+)?\)$/i

/** Base title without the fork suffix added by {@link forkRhythmToMyRhythms}. */
export const baseTitleFromFork = (title: string) => title.replace(FORK_TITLE_SUFFIX, '').trim()

/** Default publish slug: fork base title when forked, otherwise current slug. */
export const publishSlugFromRhythm = (rhythm: Rhythm) => {
  const baseTitle = baseTitleFromFork(rhythm.title)
  if (baseTitle && baseTitle !== rhythm.title) return slugFromTitle(baseTitle)
  return rhythm.slug
}
