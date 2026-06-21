import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { RhythmMeter } from '@/features/rhythm/rhythm.types'

export const ZOOM_STEPS = [1, 2, 3, 4, 6, 8] as const

export type ZoomBarsPerRow = (typeof ZOOM_STEPS)[number]

export const DEFAULT_TEMPO = 110

export const DEFAULT_BAR_SIZE = 8

/** Demo /player groove length — always eight cells (4/4), independent of bar notation width. */
export const PLAYER_GROOVE_LENGTH = DEFAULT_BAR_SIZE

/** Demo player swing — eight-cell bars only; editor rhythms use {@link defaultSwingPatternForMeter}. */
export const DEFAULT_SWING_PATTERN = '-<(-<('

export const barSizeFromBars = (bars: string[]) => bars[0]?.length ?? DEFAULT_BAR_SIZE

export const barSizeFromTrackBars = (trackBars: Record<string, string[]>) => {
  const bars = Object.values(trackBars).find((trackBarsList) => trackBarsList.length > 0)
  return barSizeFromBars(bars ?? [])
}

export const swingBarSizeForMeter = (meter: RhythmMeter) => meter * 2

export const straightGroovePattern = (barSize: number) => '-'.repeat(barSize)

export const defaultSwingPatternForMeter = (meter: RhythmMeter) =>
  straightGroovePattern(swingBarSizeForMeter(meter))

export const isSwingPatternEmpty = (pattern: string) =>
  pattern.length === 0 || [...pattern].every((char) => char === '-')

export const isSwingPatternIncorrect = (pattern: string, barSize: number) =>
  !isSwingPatternEmpty(pattern) && pattern.length !== barSize

/** Pad or trim a swing pattern to the groove length (demo player). */
export const fitSwingPattern = (pattern: string, barSize: number) =>
  pattern.slice(0, barSize).padEnd(barSize, '-')

/** Eight-cell demo swing derived from {@link DEFAULT_SWING_PATTERN}. */
export const DEMO_SWING_PATTERN = fitSwingPattern(DEFAULT_SWING_PATTERN, PLAYER_GROOVE_LENGTH)

export const normalizeSwingPattern = (pattern: string, barSize: number) =>
  pattern.length === barSize ? pattern : straightGroovePattern(barSize)

export const normalizeSwingPatternForMeter = (pattern: string, meter: RhythmMeter) =>
  normalizeSwingPattern(pattern, swingBarSizeForMeter(meter))

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
  swingBarSize: number
  setSwingPattern: (swingPattern: string, barSize?: number) => void
  setSwingBarSize: (barSize: number) => void
  swingEnabled: boolean
  toggleSwingEnabled: () => void
  hasMetronome: boolean
  toggleHasMetronome: () => void
  showBarIndex: boolean
  setShowBarIndex: (showBarIndex: boolean) => void
  markTriplets: boolean
  setMarkTriplets: (markTriplets: boolean) => void
  fullBleed: boolean
  setFullBleed: (fullBleed: boolean) => void
  preventScreenSleep: boolean
  setPreventScreenSleep: (preventScreenSleep: boolean) => void
}

type PersistedPlayerState = Pick<
  PlayerState,
  | 'barsPerRow'
  | 'tempo'
  | 'swingPattern'
  | 'swingEnabled'
  | 'hasMetronome'
  | 'showBarIndex'
  | 'markTriplets'
  | 'fullBleed'
  | 'preventScreenSleep'
>

const isZoomBarsPerRow = (value: unknown): value is ZoomBarsPerRow =>
  typeof value === 'number' && (ZOOM_STEPS as readonly number[]).includes(value)

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
      swingPattern: DEMO_SWING_PATTERN,
      swingBarSize: PLAYER_GROOVE_LENGTH,
      setSwingPattern: (swingPattern, barSize) => {
        const size = barSize ?? get().swingBarSize
        set({ swingPattern: fitSwingPattern(swingPattern, size), swingBarSize: size })
      },
      setSwingBarSize: (swingBarSize) => set({ swingBarSize }),
      swingEnabled: true,
      toggleSwingEnabled: () => {
        const state = get()
        if (isSwingPatternIncorrect(state.swingPattern, state.swingBarSize)) return
        set({ swingEnabled: !state.swingEnabled })
      },
      hasMetronome: false,
      toggleHasMetronome: () => set({ hasMetronome: !get().hasMetronome }),
      showBarIndex: true,
      setShowBarIndex: (showBarIndex) => set({ showBarIndex }),
      markTriplets: true,
      setMarkTriplets: (markTriplets) => set({ markTriplets }),
      fullBleed: false,
      setFullBleed: (fullBleed) => set({ fullBleed }),
      preventScreenSleep: true,
      setPreventScreenSleep: (preventScreenSleep) => set({ preventScreenSleep }),
    }),
    {
      name: 'redunsy-player',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedPlayerState => ({
        barsPerRow: state.barsPerRow,
        tempo: state.tempo,
        swingPattern: state.swingPattern,
        swingEnabled: state.swingEnabled,
        hasMetronome: state.hasMetronome,
        showBarIndex: state.showBarIndex,
        markTriplets: state.markTriplets,
        fullBleed: state.fullBleed,
        preventScreenSleep: state.preventScreenSleep,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedPlayerState> & { markFirstBeat?: boolean }
        return {
          ...current,
          ...saved,
          barsPerRow: isZoomBarsPerRow(saved.barsPerRow) ? saved.barsPerRow : current.barsPerRow,
          tempo: typeof saved.tempo === 'number' ? saved.tempo : current.tempo,
          swingPattern:
            typeof saved.swingPattern === 'string'
              ? fitSwingPattern(saved.swingPattern, PLAYER_GROOVE_LENGTH)
              : current.swingPattern,
          showBarIndex:
            typeof saved.showBarIndex === 'boolean'
              ? saved.showBarIndex
              : typeof saved.markFirstBeat === 'boolean'
                ? saved.markFirstBeat
                : current.showBarIndex,
          fullBleed: typeof saved.fullBleed === 'boolean' ? saved.fullBleed : current.fullBleed,
          preventScreenSleep:
            typeof saved.preventScreenSleep === 'boolean'
              ? saved.preventScreenSleep
              : current.preventScreenSleep,
        }
      },
    },
  ),
)
