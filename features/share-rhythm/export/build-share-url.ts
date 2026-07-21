import { encodeRhythmForShare } from '@/features/share-rhythm/export/encode-rhythm'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

export const buildPrivateRhythmShareUrl = (rhythm: Rhythm, origin = window.location.origin) =>
  `${origin}/share/${encodeRhythmForShare(rhythm)}`

export const buildPublicRhythmShareUrl = () => window.location.href
