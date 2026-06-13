import { create } from 'zustand'

export const ZOOM_STEPS = [1, 2, 3, 4, 6, 8] as const

export type ZoomBarsPerRow = (typeof ZOOM_STEPS)[number]

export const DEFAULT_TEMPO = 110

export const DEFAULT_SWING_PATTERN = '-<(-<('

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
  setSwingPattern: (swingPattern) => set({ swingPattern }),
  hasMetronome: false,
  toggleHasMetronome: () => set({ hasMetronome: !get().hasMetronome }),
}))
