import type { SwingArticleCopy } from '@/features/learn/swing/swing-article.types'
import {
  SWING_BIRE_ROWS,
  SWING_ON3_ROWS,
  SWING_ON4_ROWS,
  row,
} from '@/features/learn/swing/swing-table-data'

export const SWING_ARTICLE_EN: SwingArticleCopy = {
  locale: 'en',
  eyebrow: 'Learn · Research',
  title: 'Timing and swing in Mande drumming',
  lead: [
    'This note summarizes Rainer Polak and Justin London’s 2014 study Timing and Meter in Mande Drumming from Mali, then places dunsy.app’s existing swing patterns next to the beat-subdivision ratios those authors measured from studio recordings.',
    'The research goal was comparative: how do the swing shapes currently available in dunsy.app line up with real, recorded, and chronometrically measured beat subdivisions — not as a product roadmap, but as a shared reading for players and teachers.',
  ],
  sourceLabel: 'Source',
  sourceHref: 'https://mtosmt.org/issues/mto.14.20.1/mto.14.20.1.polak-london.php',
  sourceText: 'Polak & London, Music Theory Online 20/1 (2014)',
  languagePanel: {
    message: 'This article is also available in Polish. / Ten artykuł jest też dostępny po polsku.',
    action: 'Read in Polish',
    targetLocale: 'pl',
  },
  sections: [
    {
      id: 'corpus',
      title: 'What the paper studied',
      paragraphs: [
        'Polak recorded Bamana bòn drumming and Khasonka dundunba drumming in Mali in 2012. Two socially important, stylistically typical pieces were analyzed in detail: Ngòn Fariman (Bamana) and Bire (Khasonka). About forty minutes of multi-track studio performances were marked for more than 20,000 onsets, then checked by hand.',
        'Ensemble texture is organized in three functional layers: a short, dense accompaniment that articulates beat subdivision; a longer hook that identifies the piece; and a lead drum that improvises, regulates the event, and often drives the characteristic large-scale accelerando.',
      ],
    },
    {
      id: 'findings',
      title: 'Main findings',
      paragraphs: [
        'At the tactus level, beats are essentially isochronous — nearly perfectly even. Inside each beat, however, subdivisions are stably non-isochronous. That unevenness is not casual “humanizing” of an equal grid; it is part of the meter itself.',
        'Two qualitative duration categories dominate: Long (L) and Short (S). In denser lead figures a Very Short (s) category also appears. Smaller continuous differences around those categories vary by performer, ensemble, instrumental role, phrase position, and sometimes tempo.',
        'The authors’ strongest claim is that accompaniment timing patterns are “not simply durational proportions … but direct expressions of metrical structure.”',
      ],
    },
    {
      id: 'ngon',
      title: 'Ngòn — L–S–S',
      paragraphs: [
        'The kèngèbu accompaniment spans one beat with three strokes, low–high–high, ordered L–S–S. The grand average ratio across six performances is 40.8 : 30.7 : 28.5 — neither a perfect triplet (33:33:33) nor a 2:1:1 quadruplet feel (50:25:25).',
        'Lead phrases often divide only the Long, producing a denser s–s–S–S composite. The original Shorts stay in place. Locals tend to hear the grouping as anacrustic — starting from the two short offbeats and landing on the long onbeat — even though measurements are usually reported from the beat onset.',
      ],
    },
    {
      id: 'bire',
      title: 'Bire — L–S',
      paragraphs: [
        'Bire’s accompaniment bell is a two-stroke L–S figure averaging 58.6 : 41.4 (about 1.42:1, not 2:1). Performer-specific ranges sit roughly between 57:43 and 60:40.',
        'In denser lead openings the Long is subdivided unevenly into s–S₁–S₂ (about 25.4 : 35.3 : 40.4), while the accompaniment Short remains the final Short of that denser figure. Added jembe accompaniment tracks the bell extremely tightly (R = .958).',
      ],
    },
    {
      id: 'theory',
      title: 'Categories, not one universal swing',
      paragraphs: [
        'Ngòn and Bire are quantitatively multivalent: Bire can be binary (L–S) and ternary (s–S–S) at once; Ngòn can be ternary (L–S–S) and quaternary (s–s–S–S). That is nesting through the same uneven structure, not a meter change.',
        'The paper therefore supports London’s “many meters” idea: listeners acquire timing templates tied to genres, styles, tempo ranges, performers, and pieces. Related families can share a profile — Ngòn with Sunun (L–S–S), Bire with Manjanin (L–S) — but one global swing amount does not describe the repertoire.',
        'Caveat: the empirical corpus is two deliberately chosen pieces and ten performances. Exact averages are study means, not universal laws for all Mande music.',
      ],
    },
    {
      id: 'dunsy',
      title: 'How dunsy.app patterns compare',
      paragraphs: [
        'In dunsy.app, swing is written as a short character string over eighth-note cells. Visual chevrons mark how far a cell is pulled early or late on a 12-tick grid: . is straight; < / << / <<< pull earlier; > / >> / >>> push later. Main downbeats stay straight.',
        'The tables below convert selected patterns into inter-onset intervals (IOIs) as percentages of one beat — the same language Polak and London use — and set them beside the paper’s measured averages. Beat length here follows dunsy’s main-pulse marking: three cells in on 3, four cells in on 4.',
      ],
    },
  ],
  symbolMapTitle: 'Symbol map',
  symbolMapCaption:
    'Visual swing marks as shown to players, with the stored character and tick offset.',
  symbolMapHeaders: ['Visual', 'Stored', 'Offset (ticks)'],
  symbolMapRows: [
    ['.', '-', '0'],
    ['< / << / <<<', '( / < / {', '−1 / −2 / −4'],
    ['> / >> / >>>', ') / > / }', '+1 / +2 / +4'],
  ],
  tables: [
    {
      id: 'on3',
      title: 'On 3 — three subdivisions per beat (36 ticks)',
      caption:
        'Late ternary . >> > is the closest dunsy shape to Ngòn’s onbeat L–S–S. Early . << < yields a short-first profile — the opposite phase from Bu–Kèn–Gè measured from the downbeat.',
      headers: ['Feel', 'Pattern', 'Onsets', 'IOI', '% of beat', 'Note'],
      rows: [
        row('dunsy early', SWING_ON3_ROWS.early, 'S–L–L; not Ngòn from the downbeat'),
        row('dunsy late', SWING_ON3_ROWS.late, 'Δ vs Ngòn: −1.9 / −0.1 / +2.1 pp'),
        row('Paper Ngòn', SWING_ON3_ROWS.ngon, 'Reference average'),
        row(
          'Nearest grid',
          SWING_ON3_ROWS.quantized,
          '* Needs offsets +3/+2 — outside dunsy’s ±1/±2/±4 ladder',
        ),
      ],
    },
    {
      id: 'on4',
      title: 'On 4 — four subdivisions per beat (48 ticks)',
      caption:
        'Neither listed four-cell pattern reproduces Bire’s binary L–S. Read as two pairs, . > . > is only 54.2:45.8 per half-beat — farther from Bire than a simple . >> pair.',
      headers: ['Feel', 'Pattern', 'Onsets', 'IOI', '% of beat', 'Note'],
      rows: [
        row('dunsy late', SWING_ON4_ROWS.late, 'Weak repeated long–short pairs'),
        row(
          'dunsy early',
          SWING_ON4_ROWS.early,
          'Closer to dense / samba-like shapes than to Bire',
        ),
        row('Ngòn dense', SWING_ON4_ROWS.ngonDense, 'Equal split of Ngòn’s Long'),
        row(
          'Samba Bahia',
          SWING_ON4_ROWS.samba,
          'Cited in the paper as a related non-isochronous dialect',
        ),
      ],
    },
    {
      id: 'bire-binary',
      title: 'Bire context — two subdivisions per beat (24 ticks)',
      caption:
        'The paper measures a binary L–S inside one beat. dunsy’s . >> pair lands almost exactly on the study average.',
      headers: ['Feel', 'Pattern', 'Onsets', 'IOI', '% of beat', 'Note'],
      rows: [
        row('dunsy', SWING_BIRE_ROWS.strong, 'Δ vs Bire: −0.3 / +0.3 pp'),
        row('Paper Bire', SWING_BIRE_ROWS.paper, 'Reference average'),
        row('dunsy weak', SWING_BIRE_ROWS.weak, 'Δ vs Bire: −4.4 / +4.4 pp'),
      ],
    },
  ],
  closingTitle: 'Reading the comparison',
  closingParagraphs: [
    'Swings that sound similar are not necessarily the same meter. Bire’s binary L–S and Ngòn’s ternary L–S–S are different categorical templates; denser lead figures nest inside them without erasing the accompaniment Shorts.',
    'Against that backdrop, dunsy’s present patterns already capture one measured case with striking accuracy: the late binary . >> pair versus Bire. Ternary late . >> > approximates Ngòn’s Long and first Short, while equalizing the two Shorts and leaving the Long slightly short of the study mean.',
    'Treat the paper averages as evidence from specific Malian performances, and the dunsy columns as what the app’s current swing alphabet can express on its 12-tick grid — a side-by-side research comparison for anyone curious how notation swing relates to recorded feel.',
  ],
}
