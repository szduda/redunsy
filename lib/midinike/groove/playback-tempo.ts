import { TICKS_PER_EIGHTH } from '../notation/cell-duration'

/** Scheduler step size passed to {@link import('../audio/player').createMidiPlayer}. */
export const PLAYBACK_SLOT_DENSITY = 1 / 16

/** Seconds between consecutive compiled groove slots at the given playback tempo. */
export const playbackSlotIntervalSeconds = (playbackTempo: number) =>
  PLAYBACK_SLOT_DENSITY * ((4 * 60) / playbackTempo)

type CompiledTiming = {
  beats: { length: number }
  cellsPerBar: number
  cellCount: number
  preGrooveSlots: number
}

/** Wall-clock seconds for one loop of a compiled pattern at the user-facing BPM. */
export const compiledPatternDurationSeconds = (compiled: CompiledTiming, userTempo: number) => {
  const playbackTempo = calcPlaybackTempo(
    compiled.cellsPerBar,
    compiled.cellCount,
    compiled.preGrooveSlots,
    compiled.beats.length,
    userTempo,
  )
  return compiled.beats.length * playbackSlotIntervalSeconds(playbackTempo)
}

/** Expected bar duration from meter and user-facing BPM (quarter-note based). */
export const expectedBarDurationSeconds = (beatSize: number, userTempo: number) =>
  (beatSize * 60) / userTempo

/**
 * Maps user-facing BPM to the tempo value consumed by the MIDI scheduler.
 *
 * Each compiled slot advances by `PLAYBACK_SLOT_DENSITY` of a whole note at this
 * tempo. User BPM follows the legacy dunsy convention: quarter-note rate scaled
 * by beat size and the 12-tick eighth grid (`TICKS_PER_EIGHTH`), independent of
 * how many notation cells fill a bar.
 */
export const calcPlaybackTempo = (
  cellsPerBar: number,
  cellCount: number,
  preGrooveSlots: number,
  slotCount: number,
  tempo: number,
) => {
  if (cellCount === 0) return tempo
  const beatSize = cellsPerBar / 2
  const swingFactor = preGrooveSlots > 0 ? slotCount / preGrooveSlots : 1
  return (beatSize / 4) * tempo * TICKS_PER_EIGHTH * swingFactor
}
