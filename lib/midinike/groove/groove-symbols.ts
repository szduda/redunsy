export type GrooveSymbol = '-' | '<' | '(' | '>' | ')'

/** Tick offset on the per-eighth grid; pairs are equal strength, opposite sign. */
const GROOVE_OFFSETS: Record<GrooveSymbol, number> = {
  '-': 0,
  '<': -2,
  '(': -1,
  '>': 2,
  ')': 1,
}

export const grooveOffset = (symbol: string, forceStraight = false): number => {
  if (forceStraight) return 0
  return GROOVE_OFFSETS[symbol as GrooveSymbol] ?? 0
}

/** Groove shifts happen inside fixed cells; bar length no longer expands. */
export const swingModifierFromGroove = (_groove: string): number => 1
