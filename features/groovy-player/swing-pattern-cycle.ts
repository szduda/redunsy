import type { GrooveSymbol } from '@/lib/midinike/groove/groove-symbols'

/** Forward cycle order: straight, then early/late pairs from weak to strong. */
export const SWING_PATTERN_CYCLE: readonly GrooveSymbol[] = ['-', '(', '<', '>', ')']

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
