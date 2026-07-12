import { barCellCount } from '../notation/cell-duration'
import { barsCellCounts } from '../notation/grouped-notation'
import { parseBar, barNeedsCrossBarContext } from '../notation/parse-bar'

import { applyGrooveToBar } from './apply-groove'
import { barPreGrooveSlots } from './build-bar-slots'
import { swingModifierFromGroove } from './groove-symbols'

import type { CompileGrooveInput, CompileGrooveResult } from '../types'

const buildBarOffsets = (beatsPerBar: number[]): number[] => {
  const offsets = [0]
  let cursor = 0
  for (let bar = 0; bar < beatsPerBar.length - 1; bar += 1) {
    cursor += beatsPerBar[bar] ?? 0
    offsets.push(cursor)
  }
  return offsets
}

const compileBar = (
  bar: string,
  groove: string,
  soundMap?: Record<string, number | null>,
  bars?: string[],
  barIndex?: number,
) => {
  const grooveLength = groove.length
  const notationCells =
    bars !== undefined && barIndex !== undefined && barNeedsCrossBarContext(bars, barIndex)
      ? (barsCellCounts(bars)[barIndex] ?? 0)
      : barCellCount(bar)
  const cells = parseBar(bar, grooveLength, soundMap, bars, barIndex)
  const beats = applyGrooveToBar(cells, groove, notationCells, grooveLength)
  return { beats, preGrooveSlots: barPreGrooveSlots(grooveLength) }
}

export const compileGroove = ({
  bars,
  groove,
  soundMap,
}: CompileGrooveInput): CompileGrooveResult => {
  if (!groove.length) throw new Error('Groove pattern cannot be empty')

  const cellsPerBar = groove.length
  const compiledBars = bars.map((bar, barIndex) =>
    compileBar(bar, groove, soundMap, bars, barIndex),
  )
  const beats = compiledBars.flatMap((bar) => bar.beats)
  const preGrooveSlots = compiledBars.reduce((sum, bar) => sum + bar.preGrooveSlots, 0)
  const swingModifier = swingModifierFromGroove(groove)
  const cellCount = bars.length * cellsPerBar

  return {
    beats,
    cellsPerBar,
    cellCount,
    preGrooveSlots,
    swingModifier,
    barSlotOffsets: buildBarOffsets(compiledBars.map((bar) => bar.beats.length)),
  }
}
