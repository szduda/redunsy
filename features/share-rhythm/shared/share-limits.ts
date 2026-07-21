export const SHARE_LIMITS = {
  maxEncodedLength: 12_000,
  maxTitleLength: 200,
  maxDescriptionLength: 2_000,
  maxStringItemLength: 100,
  maxStringArrayLength: 50,
  maxBarsPerTrack: 240,
  maxBarLength: 72,
  maxTracks: 10,
  minTempo: 40,
  maxTempo: 300,
  maxSlugLength: 120,
} as const

export const SHARED_WITH_ME_TAG = 'shared with me'
