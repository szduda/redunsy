import { readMyRhythms, saveRhythm } from '@/features/rhythm/my-rhythms-storage'
import { randomHash, slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { decodeSharePayload } from '@/features/share-rhythm/import/decode-rhythm'
import { validateSharedRhythm } from '@/features/share-rhythm/import/validate-shared-rhythm'
import { SHARED_WITH_ME_TAG } from '@/features/share-rhythm/shared/share-limits'

const uniqueSharedIdentity = (rhythm: Rhythm) => {
  const rhythms = readMyRhythms()
  if (!rhythms[rhythm.slug]) return { title: rhythm.title, slug: rhythm.slug }

  let title = `${rhythm.title} (shared)`
  let slug = slugFromTitle(title)
  while (rhythms[slug]) {
    title = `${rhythm.title} (shared ${randomHash(3)})`
    slug = slugFromTitle(title)
  }

  return { title, slug }
}

const withSharedTag = (tags: string[]) => {
  const withoutShared = tags.filter((tag) => tag !== SHARED_WITH_ME_TAG)
  return [SHARED_WITH_ME_TAG, ...withoutShared]
}

export const importSharedRhythm = (encodedRhythm: string): Rhythm | null => {
  try {
    const payload = decodeSharePayload(encodedRhythm)
    const validated = validateSharedRhythm(payload)
    if (!validated) return null

    const now = Date.now()
    const { title, slug } = uniqueSharedIdentity(validated)
    const rhythm: Rhythm = {
      ...validated,
      title,
      slug,
      userOwned: true,
      tags: withSharedTag(validated.tags),
      createdAt: now,
      updatedAt: now,
    }

    saveRhythm(rhythm)
    return rhythm
  } catch (error) {
    console.warn('Failed to import shared rhythm', error)
    return null
  }
}
