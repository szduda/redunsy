import { encodeRhythmForShare } from '@/features/share-rhythm/export/encode-rhythm'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

/** Percent-encode so `+` / `$` from lz-string survive chat apps and Next.js params. */
export const buildPrivateRhythmShareUrl = (rhythm: Rhythm, origin = window.location.origin) =>
  `${origin}/share/${encodeURIComponent(encodeRhythmForShare(rhythm))}`

export const buildPublicRhythmShareUrl = () => window.location.href
