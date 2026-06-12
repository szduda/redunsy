import { TICKS_PER_EIGHTH } from '../notation/cell-duration'

import { compileGroove } from './compile-groove'

import type { BeatMatrix, CompileGrooveResult } from '../types'

export const hitTicks = (beats: BeatMatrix): number[] =>
  beats.flatMap((slot, index) => (slot[0].length > 0 ? [index] : []))

export const compileHits = (bars: string[], groove: string): number[] =>
  hitTicks(compileGroove({ bars, groove }).beats)

export const compileResult = (bars: string[], groove: string): CompileGrooveResult =>
  compileGroove({ bars, groove })

export const barLocalHits = (compiled: CompileGrooveResult, barIndex: number): number[] => {
  const start = compiled.barSlotOffsets[barIndex] ?? 0
  const end = compiled.barSlotOffsets[barIndex + 1] ?? compiled.beats.length
  return hitTicks(compiled.beats)
    .filter((tick) => tick >= start && tick < end)
    .map((tick) => tick - start)
}

export const barSlotCount = (grooveLength: number) => grooveLength * TICKS_PER_EIGHTH

export const evenSpacing = (ticks: number[]) =>
  ticks.slice(1).map((tick, index) => tick - ticks[index])

export const grooveOnCell = (groove: string, cellIndex: number) => {
  const chars = [...groove]
  return chars[cellIndex] ?? '-'
}
