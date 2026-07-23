export type GrooveSymbol = '-' | '<' | '(' | '>' | ')'

/** Weak early/late shift in scheduler ticks (audible but lighter than strong). */
export const WEAK_GROOVE_OFFSET = 2

/** Strong early/late shift — twice weak so `<`/`>` read clearly louder than `(`/`)`. */
export const STRONG_GROOVE_OFFSET = 4

/** Tick offset on the per-eighth grid; pairs are equal strength, opposite sign. */
const GROOVE_OFFSETS: Record<GrooveSymbol, number> = {
  '-': 0,
  '<': -STRONG_GROOVE_OFFSET,
  '(': -WEAK_GROOVE_OFFSET,
  '>': STRONG_GROOVE_OFFSET,
  ')': WEAK_GROOVE_OFFSET,
}

export const grooveOffset = (symbol: string, forceStraight = false): number => {
  if (forceStraight) return 0
  return GROOVE_OFFSETS[symbol as GrooveSymbol] ?? 0
}

/** Groove shifts happen inside fixed cells; bar length no longer expands. */
export const swingModifierFromGroove = (_groove: string): number => 1
