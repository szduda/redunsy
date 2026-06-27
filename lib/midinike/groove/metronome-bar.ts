import type { PlayTracks } from '@/lib/midinike/types'

export const metronomeBarForGrooveLength = (grooveLength: number) => {
  if (grooveLength <= 0) return ''
  const pulseIndex = Math.floor(grooveLength / 2)
  return Array.from({ length: grooveLength }, (_, index) =>
    index === 0 || index === pulseIndex ? 'x' : '-',
  ).join('')
}

export const metronomeShakerBarsForTracks = (tracks: PlayTracks, grooveLength: number) => {
  const barCount = Math.max(0, ...Object.values(tracks).map((bars) => bars.length))
  if (barCount === 0) return []
  const bar = metronomeBarForGrooveLength(grooveLength)
  return Array.from({ length: barCount }, () => bar)
}

/** Always-on shaker metronome layer — mute/unmute via instrument volume, not beat recompilation. */
export const withMetronomeShakerTrack = (tracks: PlayTracks, grooveLength: number): PlayTracks => ({
  ...tracks,
  shaker: metronomeShakerBarsForTracks(tracks, grooveLength),
})
