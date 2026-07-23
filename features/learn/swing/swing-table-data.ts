import type { SwingTableRow } from '@/features/learn/swing/swing-article.types'

export const compareRow = (
  label: string,
  percent: string,
  note: string,
  highlight = false,
): SwingTableRow => ({ label, percent, note, highlight })

/**
 * Tick → percent helpers (12 ticks per eighth cell).
 * Binary beat = 24 ticks; ternary beat = 36 ticks; quaternary beat = 48 ticks.
 *
 * Binary late offsets (Long : Short), one beat:
 *   +1 → 54.2:45.8   +2 → 58.3:41.7   +3 → 62.5:37.5   +4 → 66.7:33.3
 * In the 4/4 swing UI those beat-groups repeat: `->` → `->->` (visual `. >> . >>`).
 *
 * Ternary late pairs (L : S₁ : S₂), downbeat locked:
 *   +2,+1 → 38.9:30.6:30.6
 *   +2,+2 → 38.9:33.3:27.8
 *   +3,+2 → 41.7:30.6:27.8  (hypothetical; ±3 not in the app)
 *   +4,+2 → 44.4:27.8:27.8
 *
 * Ternary early pairs for denser Bire s–S–S (first slice short):
 *   −2,−2 → 27.8:33.3:38.9
 *   −3,−2 → 25.0:36.1:38.9  (hypothetical)
 *
 * Quaternary early triples for denser Ngòn s–s–S–S:
 *   −2,−4,−1 → 20.8:20.8:31.3:27.1
 *   −2,−4,−2 → 20.8:20.8:29.2:29.2
 */
export const NGON_LSS_PERCENTS = {
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

/** Paper denser composite: half of L, then the two undisturbed Shorts. */
export const NGON_SSSS_PERCENTS = {
  en: {
    paper: '20.4 : 20.4 : 30.7 : 28.5',
    early241: '20.8 : 20.8 : 31.3 : 27.1',
    early242: '20.8 : 20.8 : 29.2 : 29.2',
  },
  pl: {
    paper: '20,4 : 20,4 : 30,7 : 28,5',
    early241: '20,8 : 20,8 : 31,3 : 27,1',
    early242: '20,8 : 20,8 : 29,2 : 29,2',
  },
} as const

export const BIRE_LS_PERCENTS = {
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

export const BIRE_SSS_PERCENTS = {
  en: {
    paper: '25.4 : 35.3 : 40.4',
    early22: '27.8 : 33.3 : 38.9',
    early21: '27.8 : 36.1 : 36.1',
    early42: '22.2 : 38.9 : 38.9',
    hyp32: '25.0 : 36.1 : 38.9',
  },
  pl: {
    paper: '25,4 : 35,3 : 40,4',
    early22: '27,8 : 33,3 : 38,9',
    early21: '27,8 : 36,1 : 36,1',
    early42: '22,2 : 38,9 : 38,9',
    hyp32: '25,0 : 36,1 : 38,9',
  },
} as const
