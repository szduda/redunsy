import { decompressFromEncodedURIComponent } from 'lz-string'

import { SHARE_LIMITS } from '@/features/share-rhythm/shared/share-limits'

const decodeCandidates = (encodedRhythm: string) => {
  const candidates = [encodedRhythm]
  try {
    const uriDecoded = decodeURIComponent(encodedRhythm)
    if (uriDecoded !== encodedRhythm) candidates.push(uriDecoded)
  } catch {
    // keep the raw candidate only
  }
  return candidates
}

export const decodeSharePayload = (encodedRhythm: string): unknown => {
  if (!encodedRhythm || encodedRhythm.length > SHARE_LIMITS.maxEncodedLength) {
    throw new Error('Share link is too long or empty')
  }

  for (const candidate of decodeCandidates(encodedRhythm)) {
    const decoded = decompressFromEncodedURIComponent(candidate)
    if (decoded) return JSON.parse(decoded) as unknown
  }

  throw new Error('Share link could not be decoded')
}
