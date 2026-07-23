import type { SwingTableRow } from '@/features/learn/swing/swing-article.types'

/** Shared measured ratios — labels are localized in each article copy. */
export const SWING_ON3_ROWS = {
  early: {
    pattern: '. << <  →  -<(-<(',
    onsets: '0 · 10 · 23 · 36',
    ioi: '10:13:13',
    percent: '27.8 : 36.1 : 36.1',
  },
  late: {
    pattern: '. >> >  →  ->)->)',
    onsets: '0 · 14 · 25 · 36',
    ioi: '14:11:11',
    percent: '38.9 : 30.6 : 30.6',
  },
  ngon: {
    pattern: 'L–S–S',
    onsets: '—',
    ioi: '≈14.7:11.1:10.3',
    percent: '40.8 : 30.7 : 28.5',
  },
  quantized: {
    pattern: 'nearest 12-tick grid*',
    onsets: '0 · 15 · 26 · 36',
    ioi: '15:11:10',
    percent: '41.7 : 30.6 : 27.8',
  },
} as const

export const SWING_ON4_ROWS = {
  late: {
    pattern: '. > . >  →  -)-)-)-)',
    onsets: '0 · 13 · 24 · 37 · 48',
    ioi: '13:11:13:11',
    percent: '27.1 : 22.9 : 27.1 : 22.9',
  },
  early: {
    pattern: '. < << .  →  -(<-(<-',
    onsets: '0 · 11 · 22 · 36 · 48',
    ioi: '11:11:14:12',
    percent: '22.9 : 22.9 : 29.2 : 25.0',
  },
  ngonDense: {
    pattern: 's–s–S–S',
    onsets: '—',
    ioi: '≈9.8:9.8:14.7:13.7',
    percent: '20.4 : 20.4 : 30.7 : 28.5',
  },
  samba: {
    pattern: 'M–S–M–L',
    onsets: '—',
    ioi: '≈12:10:12:14',
    percent: '25 : 20 : 25 : 30',
  },
} as const

export const SWING_BIRE_ROWS = {
  strong: {
    pattern: '. >>  →  ->->…',
    onsets: '0 · 14 · 24',
    ioi: '14:10',
    percent: '58.3 : 41.7',
  },
  paper: {
    pattern: 'L–S',
    onsets: '—',
    ioi: '—',
    percent: '58.6 : 41.4',
  },
  weak: {
    pattern: '. >  →  -)-)…',
    onsets: '0 · 13 · 24',
    ioi: '13:11',
    percent: '54.2 : 45.8',
  },
} as const

export const row = (
  label: string,
  cells: { pattern: string; onsets: string; ioi: string; percent: string },
  note: string,
): SwingTableRow => ({ label, ...cells, note })
