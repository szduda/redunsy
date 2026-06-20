const parseTrackBars = (notation: string) =>
  notation
    .split('|')
    .map((bar) => bar.trim())
    .filter((bar) => bar.length > 0)

export type DemoTrack = {
  id: string
  name: string
  instrument: string
  bars: string[]
}

export const DEMO_TRACKS: DemoTrack[] = [
  {
    id: 'djembe',
    name: 'Djembe',
    instrument: 'djembe',
    bars: [
      'ttsb-s',
      'b-sb-s',
      'ttsb-s',
      'b-sb-s',
      '[ss]ssstt',
      '-ssstt',
      'ts---[tt]',
      '[tt]tbsb-',
      'ss{ttsstt}',
      'sstss-',
      'f-sf-s',
      'f-fss-',
      'sss-ss',
      's-sss-',
      'b---[ss]s','sst--t','tsttst','t-ssbb',
      'b---[ss]s','sst--t','tst-tt','t-s[ttt-s-]',
      '[ttt-]ssbt',
      't-f---',
    ],
  },
  {
    id: 'dundunba',
    name: 'Dundunba',
    instrument: 'dundunba',
    bars: parseTrackBars('o-o---|--oo-o'),
  },
  {
    id: 'sangban',
    name: 'Sangban',
    instrument: 'sangban',
    bars: parseTrackBars('o---x-|x--o--'),
  },
  {
    id: 'kenkeni',
    name: 'Kenkeni',
    instrument: 'kenkeni',
    bars: parseTrackBars('----oo'),
  },
]

export const demoTrackBars = () =>
  Object.fromEntries(DEMO_TRACKS.map((track) => [track.id, track.bars])) as Record<string, string[]>

export const previewWindowStart = (activeIndex: number, barCount: number, collapsedBarsPerRow: number = 2) => {
  if (barCount <= collapsedBarsPerRow || activeIndex < 0) return 0
  return Math.min(Math.floor(activeIndex / collapsedBarsPerRow) * collapsedBarsPerRow, barCount - collapsedBarsPerRow)
}
