import type { SwingTableRow } from '@/features/learn/swing/swing-article.types'

export const compareRow = (
  label: string,
  percent: string,
  note: string,
  highlight = false,
): SwingTableRow => ({ label, percent, note, highlight })

/**
 * Tick → percent helpers (12 ticks per eighth cell).
 * Binary beat = 24 ticks; ternary beat = 36 ticks.
 *
 * Binary late offsets (Long : Short):
 *   +1 → 54.2:45.8   +2 → 58.3:41.7   +3 → 62.5:37.5   +4 → 66.7:33.3
 *
 * Ternary late pairs (L : S₁ : S₂), downbeat locked:
 *   +2,+1 → 38.9:30.6:30.6
 *   +2,+2 → 38.9:33.3:27.8
 *   +3,+2 → 41.7:30.6:27.8  (hypothetical; ±3 not in the app)
 *   +4,+2 → 44.4:27.8:27.8
 */
export const NGON_PERCENTS = {
  en: {
    paper: '40.8 : 30.7 : 28.5',
    late21: '38.9 : 30.6 : 30.6',
    late22: '38.9 : 33.3 : 27.8',
    late42: '44.4 : 27.8 : 27.8',
    hyp32: '41.7 : 30.6 : 27.8',
  },
  pl: {
    paper: '40,8 : 30,7 : 28,5',
    late21: '38,9 : 30,6 : 30,6',
    late22: '38,9 : 33,3 : 27,8',
    late42: '44,4 : 27,8 : 27,8',
    hyp32: '41,7 : 30,6 : 27,8',
  },
} as const

export const BIRE_PERCENTS = {
  en: {
    paper: '58.6 : 41.4',
    late1: '54.2 : 45.8',
    late2: '58.3 : 41.7',
    late4: '66.7 : 33.3',
    hyp3: '62.5 : 37.5',
  },
  pl: {
    paper: '58,6 : 41,4',
    late1: '54,2 : 45,8',
    late2: '58,3 : 41,7',
    late4: '66,7 : 33,3',
    hyp3: '62,5 : 37,5',
  },
} as const
