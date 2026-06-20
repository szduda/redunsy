import { MOCK_RHYTHM_CARDS, MOCK_RHYTHM_TRACKS } from '@/features/garage/mock-snippets'
import type { DemoTrack } from '@/features/groovy-player/demo-tracks'
import { readMyRhythms, saveRhythm } from '@/features/rhythm/my-rhythms-storage'
import type { Rhythm, RhythmCard, Track } from '@/features/rhythm/rhythm.types'

const tracksToInstruments = (tracks: DemoTrack[]): Record<string, Track> =>
  Object.fromEntries(
    tracks.map((track) => [
      track.id,
      { id: track.id, name: track.name, instrument: track.instrument, bars: track.bars },
    ]),
  )

export const rhythmFromCardAndTracks = (card: RhythmCard, tracks: DemoTrack[]): Rhythm => ({
  slug: card.slug,
  title: card.title,
  description: card.description,
  meter: card.meter,
  author: card.author,
  origin: card.origin,
  tags: card.tags,
  swingPattern: card.swingPattern,
  tempo: card.tempo,
  signalPattern: card.signalPattern,
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
  userOwned: card.userOwned,
  instruments: tracksToInstruments(tracks),
})

export const findRhythmBySlug = (slug: string): Rhythm | null => {
  const owned = readMyRhythms()[slug]
  if (owned) return owned

  const tracks = MOCK_RHYTHM_TRACKS[slug]
  const card = MOCK_RHYTHM_CARDS.find((item) => item.slug === slug)
  if (!tracks || !card) return null

  return rhythmFromCardAndTracks(card, tracks)
}

export const copyRhythmToMyRhythms = (rhythm: Rhythm): Rhythm => {
  const now = Date.now()
  const copy: Rhythm = { ...rhythm, userOwned: true, createdAt: now, updatedAt: now }
  saveRhythm(copy)
  return copy
}
