import { decompressFromEncodedURIComponent } from 'lz-string'

import { SHARE_LIMITS } from '@/features/share-rhythm/shared/share-limits'

export const decodeSharePayload = (encodedRhythm: string): unknown => {
  if (!encodedRhythm || encodedRhythm.length > SHARE_LIMITS.maxEncodedLength) {
    throw new Error('Share link is too long or empty')
  }

  const decoded = decompressFromEncodedURIComponent(encodedRhythm)
  if (!decoded) {
    throw new Error('Share link could not be decoded')
  }

  return JSON.parse(decoded) as unknown
}
