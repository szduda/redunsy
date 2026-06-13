import { create } from 'zustand'

import { detectBarSizeFromBars, reflowBarsToSize } from '@/lib/midinike/notation/reflow-bars'

export const ZOOM_STEPS = [1, 2, 3, 4, 6, 8] as const

export type ZoomBarsPerRow = (typeof ZOOM_STEPS)[number]

export const DEFAULT_TEMPO = 110

export const DEFAULT_BAR_SIZE = 8

export const BAR_SIZES = [8, 6] as const

export type BarSize = (typeof BAR_SIZES)[number]

export const DEFAULT_SWING_PATTERN = '-<(-<('

export const isSwingPatternEmpty = (pattern: string) =>
  pattern.length === 0 || [...pattern].every((char) => char === '-')

export const isSwingPatternIncorrect = (pattern: string, barSize: BarSize) =>
  !isSwingPatternEmpty(pattern) && pattern.length !== barSize

export const fitSwingPattern = (pattern: string, barSize: BarSize) =>
  pattern.slice(0, barSize).padEnd(barSize, '-')

export const straightGroovePattern = (barSize: BarSize) => '-'.repeat(barSize)

export const resolveGroovePattern = (
  swingPattern: string,
  barSize: BarSize,
  swingEnabled: boolean,
) => (swingEnabled ? fitSwingPattern(swingPattern, barSize) : straightGroovePattern(barSize))

const stepZoomForward = (current: ZoomBarsPerRow) => {
  const index = ZOOM_STEPS.indexOf(current)
  return ZOOM_STEPS[(index + 1) % ZOOM_STEPS.length]
}

const stepZoomBackward = (current: ZoomBarsPerRow) => {
  const index = ZOOM_STEPS.indexOf(current)
  return ZOOM_STEPS[(index - 1 + ZOOM_STEPS.length) % ZOOM_STEPS.length]
}

type PlayerState = {
  barsPerRow: ZoomBarsPerRow
  nextZoom: () => void
  prevZoom: () => void
  tempo: number
  setTempo: (tempo: number) => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  beatIndex: number
  setBeatIndex: (beatIndex: number) => void
  swingPattern: string
  setSwingPattern: (swingPattern: string) => void
  swingEnabled: boolean
  toggleSwingEnabled: () => void
  barSize: BarSize
  toggleBarSize: () => void
  trackBars: Record<string, string[]>
  initTrackBars: (tracks: { id: string; bars: string[] }[]) => void
  syncBarSizeFromTracks: () => void
  hasMetronome: boolean
  toggleHasMetronome: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  barsPerRow: 4,
  nextZoom: () => set({ barsPerRow: stepZoomForward(get().barsPerRow) }),
  prevZoom: () => set({ barsPerRow: stepZoomBackward(get().barsPerRow) }),
  tempo: DEFAULT_TEMPO,
  setTempo: (tempo) => set({ tempo }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  beatIndex: -1,
  setBeatIndex: (beatIndex) => set({ beatIndex }),
  swingPattern: DEFAULT_SWING_PATTERN,
  setSwingPattern: (swingPattern) => set({ swingPattern: swingPattern.slice(0, get().barSize) }),
  swingEnabled: true,
  toggleSwingEnabled: () => {
    const state = get()
    if (isSwingPatternIncorrect(state.swingPattern, state.barSize)) return
    set({ swingEnabled: !state.swingEnabled })
  },
  barSize: DEFAULT_BAR_SIZE,
  trackBars: {},
  initTrackBars: (tracks) =>
    set({ trackBars: Object.fromEntries(tracks.map((track) => [track.id, track.bars])) }),
  syncBarSizeFromTracks: () => {
    const state = get()
    const { trackBars } = state
    if (!Object.keys(trackBars).length) return
    const barSize = detectBarSizeFromBars(Object.values(trackBars))
    const swingIncorrect = isSwingPatternIncorrect(state.swingPattern, barSize)
    set({
      barSize,
      swingEnabled: swingIncorrect ? false : state.swingEnabled,
    })
  },
  toggleBarSize: () => {
    const state = get()
    const barSize = state.barSize === 8 ? 6 : 8
    const swingIncorrect = isSwingPatternIncorrect(state.swingPattern, barSize)
    set({
      barSize,
      trackBars: Object.fromEntries(
        Object.entries(state.trackBars).map(([id, bars]) => [
          id,
          reflowBarsToSize(bars, barSize),
        ]),
      ),
      swingEnabled: swingIncorrect ? false : state.swingEnabled,
    })
  },
  hasMetronome: false,
  toggleHasMetronome: () => set({ hasMetronome: !get().hasMetronome }),
}))
