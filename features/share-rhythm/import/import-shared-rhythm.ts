import { readMyRhythms, saveRhythm } from '@/features/rhythm/my-rhythms-storage'
import { randomHash, slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { decodeSharePayload } from '@/features/share-rhythm/import/decode-rhythm'
import { validateSharedRhythm } from '@/features/share-rhythm/import/validate-shared-rhythm'
import { SHARED_WITH_ME_TAG } from '@/features/share-rhythm/shared/share-limits'

const uniqueSharedSlug = (rhythm: Rhythm) => {
  const rhythms = readMyRhythms()
  if (!rhythms[rhythm.slug]) return rhythm.slug

  let title = rhythm.title
  let slug = slugFromTitle(title)
  while (rhythms[slug]) {
    title = `${rhythm.title} (${randomHash(3)})`
    slug = slugFromTitle(title)
  }

  return slug
}

const withSharedTag = (tags: string[]) =>
  tags.includes(SHARED_WITH_ME_TAG) ? tags : [...tags, SHARED_WITH_ME_TAG]

export const importSharedRhythm = (encodedRhythm: string): Rhythm | null => {
  try {
    const payload = decodeSharePayload(encodedRhythm)
    const validated = validateSharedRhythm(payload)
    if (!validated) return null

    const now = Date.now()
    const slug = uniqueSharedSlug(validated)
    const rhythm: Rhythm = {
      ...validated,
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
