import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const ZOOM_STEPS = [1, 2, 3, 4, 6, 8] as const

export type ZoomBarsPerRow = (typeof ZOOM_STEPS)[number]

export const DEFAULT_TEMPO = 110

export const DEFAULT_BAR_SIZE = 8

export const DEFAULT_SWING_PATTERN = '-<(-<('

export const barSizeFromBars = (bars: string[]) => bars[0]?.length ?? DEFAULT_BAR_SIZE

export const barSizeFromTrackBars = (trackBars: Record<string, string[]>) => {
  const bars = Object.values(trackBars).find((trackBarsList) => trackBarsList.length > 0)
  return barSizeFromBars(bars ?? [])
}

export const isSwingPatternEmpty = (pattern: string) =>
  pattern.length === 0 || [...pattern].every((char) => char === '-')

export const isSwingPatternIncorrect = (pattern: string, barSize: number) =>
  !isSwingPatternEmpty(pattern) && pattern.length !== barSize

export const fitSwingPattern = (pattern: string, barSize: number) =>
  pattern.slice(0, barSize).padEnd(barSize, '-')

export const straightGroovePattern = (barSize: number) => '-'.repeat(barSize)

export const resolveGroovePattern = (
  swingPattern: string,
  barSize: number,
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
  trackBars: Record<string, string[]>
  initTrackBars: (tracks: { id: string; bars: string[] }[]) => void
  hasMetronome: boolean
  toggleHasMetronome: () => void
  showBarIndex: boolean
  setShowBarIndex: (showBarIndex: boolean) => void
  markTriplets: boolean
  setMarkTriplets: (markTriplets: boolean) => void
  fullBleed: boolean
  setFullBleed: (fullBleed: boolean) => void
}

type PersistedPlayerState = Pick<
  PlayerState,
  | 'barsPerRow'
  | 'tempo'
  | 'swingPattern'
  | 'swingEnabled'
  | 'trackBars'
  | 'hasMetronome'
  | 'showBarIndex'
  | 'markTriplets'
  | 'fullBleed'
>

const isZoomBarsPerRow = (value: unknown): value is ZoomBarsPerRow =>
  typeof value === 'number' && (ZOOM_STEPS as readonly number[]).includes(value)

const seedTrackBars = (tracks: { id: string; bars: string[] }[]) =>
  Object.fromEntries(tracks.map((track) => [track.id, track.bars]))

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
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
      setSwingPattern: (swingPattern) => {
        const barSize = barSizeFromTrackBars(get().trackBars)
        set({ swingPattern: swingPattern.slice(0, barSize) })
      },
      swingEnabled: true,
      toggleSwingEnabled: () => {
        const state = get()
        const barSize = barSizeFromTrackBars(state.trackBars)
        if (isSwingPatternIncorrect(state.swingPattern, barSize)) return
        set({ swingEnabled: !state.swingEnabled })
      },
      trackBars: {},
      initTrackBars: (tracks) => {
        const { trackBars } = get()
        if (Object.keys(trackBars).length) return

        const seeded = seedTrackBars(tracks)
        const barSize = barSizeFromBars(tracks[0]?.bars ?? [])
        const swingIncorrect = isSwingPatternIncorrect(get().swingPattern, barSize)
        set({
          trackBars: seeded,
          swingEnabled: swingIncorrect ? false : get().swingEnabled,
        })
      },
      hasMetronome: false,
      toggleHasMetronome: () => set({ hasMetronome: !get().hasMetronome }),
      showBarIndex: true,
      setShowBarIndex: (showBarIndex) => set({ showBarIndex }),
      markTriplets: true,
      setMarkTriplets: (markTriplets) => set({ markTriplets }),
      fullBleed: false,
      setFullBleed: (fullBleed) => set({ fullBleed }),
    }),
    {
      name: 'redunsy-player',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedPlayerState => ({
        barsPerRow: state.barsPerRow,
        tempo: state.tempo,
        swingPattern: state.swingPattern,
        swingEnabled: state.swingEnabled,
        trackBars: state.trackBars,
        hasMetronome: state.hasMetronome,
        showBarIndex: state.showBarIndex,
        markTriplets: state.markTriplets,
        fullBleed: state.fullBleed,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedPlayerState> & { markFirstBeat?: boolean }
        return {
          ...current,
          ...saved,
          barsPerRow: isZoomBarsPerRow(saved.barsPerRow) ? saved.barsPerRow : current.barsPerRow,
          tempo: typeof saved.tempo === 'number' ? saved.tempo : current.tempo,
          swingPattern:
            typeof saved.swingPattern === 'string' ? saved.swingPattern : current.swingPattern,
          trackBars:
            saved.trackBars && typeof saved.trackBars === 'object'
              ? saved.trackBars
              : current.trackBars,
          showBarIndex:
            typeof saved.showBarIndex === 'boolean'
              ? saved.showBarIndex
              : typeof saved.markFirstBeat === 'boolean'
                ? saved.markFirstBeat
                : current.showBarIndex,
          fullBleed: typeof saved.fullBleed === 'boolean' ? saved.fullBleed : current.fullBleed,
        }
      },
    },
  ),
)
