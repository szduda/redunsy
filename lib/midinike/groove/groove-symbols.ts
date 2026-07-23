export type GrooveSymbol = '-' | '(' | '<' | '{' | ')' | '>' | '}'

/**
 * End weights on the 12-tick eighth grid (no extra multiplier).
 * Visual `<` / `<<` / `<<<` → force 1 / 2 / 4.
 */
export const FORCE_1_OFFSET = 1
export const FORCE_2_OFFSET = 2
export const FORCE_3_OFFSET = 4

/** @deprecated Prefer FORCE_1_OFFSET — kept for existing audit call sites. */
export const WEAK_GROOVE_OFFSET = FORCE_1_OFFSET

/** @deprecated Prefer FORCE_2_OFFSET — kept for existing audit call sites. */
export const STRONG_GROOVE_OFFSET = FORCE_2_OFFSET

/** Tick offset on the per-eighth grid; pairs are equal strength, opposite sign. */
const GROOVE_OFFSETS: Record<GrooveSymbol, number> = {
  '-': 0,
  '(': -FORCE_1_OFFSET,
  '<': -FORCE_2_OFFSET,
  '{': -FORCE_3_OFFSET,
  ')': FORCE_1_OFFSET,
  '>': FORCE_2_OFFSET,
  '}': FORCE_3_OFFSET,
}

export const grooveOffset = (symbol: string, forceStraight = false): number => {
  if (forceStraight) return 0
  return GROOVE_OFFSETS[symbol as GrooveSymbol] ?? 0
}

/** Groove shifts happen inside fixed cells; bar length no longer expands. */
export const swingModifierFromGroove = (_groove: string): number => 1
