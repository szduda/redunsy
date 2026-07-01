import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { RhythmMeter } from '@/features/rhythm/rhythm.types'

export const DESKTOP_BARS_PER_ROW_STEPS = [1, 2, 3, 4, 6, 8] as const

export const MOBILE_BARS_PER_ROW_STEPS = [1, 2, 3] as const

export type DesktopBarsPerRow = (typeof DESKTOP_BARS_PER_ROW_STEPS)[number]

export type MobileBarsPerRow = (typeof MOBILE_BARS_PER_ROW_STEPS)[number]

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

/**
 * Scheduler groove width for playback. 6/8 bars (meter=3) compile on an eight-cell
 * timeline so cell timing matches the demo player stretch; notation stays six cells.
 */
export const playbackGrooveLengthForMeter = (meter: RhythmMeter) =>
  meter === 3 ? PLAYER_GROOVE_LENGTH : swingBarSizeForMeter(meter)

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

/** Valid groove cell symbols (see {@link import('@/lib/midinike').grooveOffset}). */
const GROOVE_CHARS = new Set(['-', '<', '(', '>', ')'])

/** Drop invalid characters and fit to the groove length — used on input blur/enter. */
export const sanitizeSwingPattern = (pattern: string, barSize: number) =>
  fitSwingPattern([...pattern].filter((char) => GROOVE_CHARS.has(char)).join(''), barSize)

/** Eight-cell playback swing derived from {@link DEFAULT_SWING_PATTERN}. */
export const DEMO_SWING_PATTERN = fitSwingPattern(DEFAULT_SWING_PATTERN, PLAYER_GROOVE_LENGTH)

/** Six-cell swing shown in demo player settings (3/4 notation). */
export const DEMO_NOTATION_SWING_PATTERN = fitSwingPattern(
  DEFAULT_SWING_PATTERN,
  swingBarSizeForMeter(3),
)

export const normalizeSwingPattern = (pattern: string, barSize: number) =>
  pattern.length === barSize ? pattern : straightGroovePattern(barSize)

export const normalizeSwingPatternForMeter = (pattern: string, meter: RhythmMeter) =>
  normalizeSwingPattern(pattern, swingBarSizeForMeter(meter))

export const resolveGroovePattern = (
  swingPattern: string,
  barSize: number,
  swingEnabled: boolean,
) => (swingEnabled ? fitSwingPattern(swingPattern, barSize) : straightGroovePattern(barSize))

const stepForward = <const T extends readonly number[]>(
  steps: T,
  current: T[number],
): T[number] => {
  const index = steps.indexOf(current)
  return steps[(index + 1) % steps.length] as T[number]
}

const stepBackward = <const T extends readonly number[]>(
  steps: T,
  current: T[number],
): T[number] => {
  const index = steps.indexOf(current)
  return steps[(index - 1 + steps.length) % steps.length] as T[number]
}

const isStepValue = <const T extends readonly number[]>(
  steps: T,
  value: unknown,
): value is T[number] => typeof value === 'number' && (steps as readonly number[]).includes(value)

type PlayerState = {
  desktopBarsPerRow: DesktopBarsPerRow
  mobileBarsPerRow: MobileBarsPerRow
  nextDesktopBarsPerRow: () => void
  prevDesktopBarsPerRow: () => void
  nextMobileBarsPerRow: () => void
  prevMobileBarsPerRow: () => void
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
  setSwingEnabled: (swingEnabled: boolean) => void
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
  showKeyboardHints: boolean
  setShowKeyboardHints: (showKeyboardHints: boolean) => void
}

type PersistedPlayerState = Pick<
  PlayerState,
  | 'desktopBarsPerRow'
  | 'mobileBarsPerRow'
  | 'tempo'
  | 'swingPattern'
  | 'swingBarSize'
  | 'swingEnabled'
  | 'hasMetronome'
  | 'showBarIndex'
  | 'markTriplets'
  | 'fullBleed'
  | 'preventScreenSleep'
  | 'showKeyboardHints'
>

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      desktopBarsPerRow: 4,
      mobileBarsPerRow: 2,
      nextDesktopBarsPerRow: () =>
        set({
          desktopBarsPerRow: stepForward(DESKTOP_BARS_PER_ROW_STEPS, get().desktopBarsPerRow),
        }),
      prevDesktopBarsPerRow: () =>
        set({
          desktopBarsPerRow: stepBackward(DESKTOP_BARS_PER_ROW_STEPS, get().desktopBarsPerRow),
        }),
      nextMobileBarsPerRow: () =>
        set({ mobileBarsPerRow: stepForward(MOBILE_BARS_PER_ROW_STEPS, get().mobileBarsPerRow) }),
      prevMobileBarsPerRow: () =>
        set({ mobileBarsPerRow: stepBackward(MOBILE_BARS_PER_ROW_STEPS, get().mobileBarsPerRow) }),
      tempo: DEFAULT_TEMPO,
      setTempo: (tempo) => set({ tempo }),
      isPlaying: false,
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      beatIndex: -1,
      setBeatIndex: (beatIndex) => set({ beatIndex }),
      swingPattern: DEMO_NOTATION_SWING_PATTERN,
      swingBarSize: swingBarSizeForMeter(3),
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
      setSwingEnabled: (swingEnabled) => set({ swingEnabled }),
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
      showKeyboardHints: false,
      setShowKeyboardHints: (showKeyboardHints) => set({ showKeyboardHints }),
    }),
    {
      name: 'redunsy-player',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedPlayerState => ({
        desktopBarsPerRow: state.desktopBarsPerRow,
        mobileBarsPerRow: state.mobileBarsPerRow,
        tempo: state.tempo,
        swingPattern: state.swingPattern,
        swingBarSize: state.swingBarSize,
        swingEnabled: state.swingEnabled,
        hasMetronome: state.hasMetronome,
        showBarIndex: state.showBarIndex,
        markTriplets: state.markTriplets,
        fullBleed: state.fullBleed,
        preventScreenSleep: state.preventScreenSleep,
        showKeyboardHints: state.showKeyboardHints,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedPlayerState> & { markFirstBeat?: boolean }
        return {
          ...current,
          ...saved,
          desktopBarsPerRow: isStepValue(DESKTOP_BARS_PER_ROW_STEPS, saved.desktopBarsPerRow)
            ? saved.desktopBarsPerRow
            : current.desktopBarsPerRow,
          mobileBarsPerRow: isStepValue(MOBILE_BARS_PER_ROW_STEPS, saved.mobileBarsPerRow)
            ? saved.mobileBarsPerRow
            : current.mobileBarsPerRow,
          tempo: typeof saved.tempo === 'number' ? saved.tempo : current.tempo,
          swingBarSize:
            typeof saved.swingBarSize === 'number' ? saved.swingBarSize : current.swingBarSize,
          swingPattern:
            typeof saved.swingPattern === 'string'
              ? fitSwingPattern(
                  saved.swingPattern,
                  typeof saved.swingBarSize === 'number'
                    ? saved.swingBarSize
                    : current.swingBarSize,
                )
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
          showKeyboardHints:
            typeof saved.showKeyboardHints === 'boolean'
              ? saved.showKeyboardHints
              : current.showKeyboardHints,
        }
      },
    },
  ),
)
