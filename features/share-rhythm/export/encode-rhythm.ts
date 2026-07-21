import { compressToEncodedURIComponent } from 'lz-string'

import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { SHARE_LIMITS } from '@/features/share-rhythm/shared/share-limits'

export type ShareRhythmPayload = Omit<Rhythm, 'userOwned'>

export const rhythmToSharePayload = (rhythm: Rhythm): ShareRhythmPayload => {
  const payload = { ...rhythm }
  delete (payload as Partial<Rhythm>).userOwned
  return payload
}

export const encodeRhythmForShare = (rhythm: Rhythm) => {
  const encoded = compressToEncodedURIComponent(JSON.stringify(rhythmToSharePayload(rhythm)))
  if (!encoded || encoded.length > SHARE_LIMITS.maxEncodedLength) {
    throw new Error('Rhythm is too large to share')
  }
  return encoded
}
