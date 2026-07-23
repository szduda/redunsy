import { fitSwingPattern } from '@/features/groovy-player/player.store'
import type { GrooveSymbol } from '@/lib/midinike/groove/groove-symbols'

/** Forward cycle: dot, <, <<, >, >> */
export const SWING_PATTERN_CYCLE: readonly GrooveSymbol[] = ['-', '(', '<', ')', '>']

export const cycleSwingSymbolForward = (symbol: GrooveSymbol): GrooveSymbol => {
  const index = SWING_PATTERN_CYCLE.indexOf(symbol)
  return SWING_PATTERN_CYCLE[(index + 1) % SWING_PATTERN_CYCLE.length] ?? '-'
}

export const cycleSwingSymbolBackward = (symbol: GrooveSymbol): GrooveSymbol => {
  const index = SWING_PATTERN_CYCLE.indexOf(symbol)
  return (
    SWING_PATTERN_CYCLE[(index - 1 + SWING_PATTERN_CYCLE.length) % SWING_PATTERN_CYCLE.length] ??
    '-'
  )
}

export const parseSwingSymbol = (char: string | undefined): GrooveSymbol =>
  SWING_PATTERN_CYCLE.includes(char as GrooveSymbol) ? (char as GrooveSymbol) : '-'

/** Main downbeats stay straight; other cells use the stored symbol. */
export const swingPatternWithLockedDownbeat = (pattern: string, barSize: number) => {
  const cells = [...pattern.padEnd(barSize, '-').slice(0, barSize)]
  cells[0] = '-'
  return cells.join('')
}

export const visibleSwingCellCount = (barSize: number, beats: 1 | 2 = 1) => (barSize * beats) / 2

/** First beat-group of the full pattern — what the compact UI shows. */
export const collapseSwingPattern = (pattern: string, barSize: number, beats: 1 | 2 = 1) =>
  swingPatternWithLockedDownbeat(
    fitSwingPattern(pattern, barSize),
    visibleSwingCellCount(barSize, beats),
  )

/** Mirror the beat-group across the bar (e.g. `-<( ` → `-<(-<(`). */
export const expandSwingPattern = (collapsed: string, barSize: number, beats: 1 | 2 = 1) => {
  const unitSize = visibleSwingCellCount(barSize, beats)
  const unit = swingPatternWithLockedDownbeat(fitSwingPattern(collapsed, unitSize), unitSize)
  if (beats === 2) return unit
  const repeats = barSize / unitSize
  return Array.from({ length: repeats }, () => unit).join('')
}

export const updateSwingPatternCell = (
  pattern: string,
  barSize: number,
  beats: 1 | 2,
  index: number,
  symbol: GrooveSymbol,
) => {
  const collapsed = collapseSwingPattern(pattern, barSize, beats)
  const cells = [...collapsed]
  cells[index] = symbol
  return expandSwingPattern(cells.join(''), barSize, beats)
}
