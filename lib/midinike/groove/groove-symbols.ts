export type GrooveSymbol = '-' | '<' | '(' | '>' | ')'

const GROOVE_GAPS: Record<GrooveSymbol, number> = {
  '-': 0,
  '<': 6,
  '(': 4,
  '>': 3,
  ')': 5,
}

export const grooveGap = (symbol: string, forceStraight = false): number => {
  if (forceStraight) return 0
  return GROOVE_GAPS[symbol as GrooveSymbol] ?? 0
}

export const swingModifierFromGroove = (groove: string): number => {
  const maxGap = [...groove].reduce((max, symbol) => Math.max(max, grooveGap(symbol)), 0)
  return Math.max(1, maxGap + 1)
}
