export type GrooveSymbol = '-' | '(' | '<' | '{' | ')' | '>' | '}'

/** Base tick shift per force unit on the 12-tick eighth grid. */
export const GROOVE_FORCE_TICK = 2

/** Visual `<` / `>` — lightest push/pull. */
export const FORCE_1_OFFSET = GROOVE_FORCE_TICK * 1

/** Visual `<<` / `>>` — medium push/pull. */
export const FORCE_2_OFFSET = GROOVE_FORCE_TICK * 2

/** Visual `<<<` / `>>>` — strongest push/pull. */
export const FORCE_3_OFFSET = GROOVE_FORCE_TICK * 3

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
