import type { SwingArticleCopy } from '@/features/learn/swing/swing-article.types'
import { BIRE_PERCENTS, NGON_PERCENTS, compareRow } from '@/features/learn/swing/swing-table-data'

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
        'In dunsy.app, swing is written over eighth-note cells with visual chevrons on a 12-tick grid. A late mark lengthens the first slice of the beat and shortens what follows; an early mark does the reverse. Main downbeats stay straight.',
        'On a binary beat (two cells, 24 ticks) each late step changes the Long by about 4.2 percentage points: > → 54.2:45.8, >> → 58.3:41.7, >>> → 66.7:33.3. A hypothetical +3 step would land at 62.5:37.5 — between >> and >>>. Ternary beats (three cells, 36 ticks) combine two offbeat marks, so the three percentages move together.',
        'Below: one table per Polak piece. The highlighted first row is the measured average; the rows under it are attempts to recreate that feel with marks available in the app, plus one hypothetical ±3 step where it helps.',
      ],
    },
  ],
  symbolMapTitle: 'Symbol map',
  symbolMapCaption:
    'Visual swing marks and their tick offsets on the 12-tick eighth grid. Early and late pairs are symmetric.',
  symbolMapHeaders: ['Visual', 'Offset (ticks)'],
  symbolMapRows: [
    ['.', '0'],
    ['<', '−1'],
    ['<<', '−2'],
    ['<<<', '−4'],
    ['>', '+1'],
    ['>>', '+2'],
    ['>>>', '+4'],
  ],
  tables: [
    {
      id: 'ngon',
      title: 'Ngòn Fariman — L–S–S (ternary beat, 36 ticks)',
      caption:
        'Measured from the downbeat. Closest app pattern is . >> >; the nearest integer fit needs a +3 step the app does not have.',
      headers: ['', '% of beat', 'Notes'],
      rows: [
        compareRow(
          'Polak & London',
          NGON_PERCENTS.en.paper,
          'Grand average across six performances',
          true,
        ),
        compareRow(
          '. >> >',
          NGON_PERCENTS.en.late21,
          'Closest available pattern. Middle Short almost exact (−0.1 pp); Long short by ~1.9 pp; last Short long by ~2.1 pp',
        ),
        compareRow(
          '. >> >>',
          NGON_PERCENTS.en.late22,
          'Last Short close to 28.5 (−0.7 pp); middle Short too long (+2.6 pp)',
        ),
        compareRow(
          '. >>> >>',
          NGON_PERCENTS.en.late42,
          'Last Short near the paper (−0.7 pp); Long overshoots (+3.6 pp)',
        ),
        compareRow(
          'hypothetical . +3 +2',
          NGON_PERCENTS.en.hyp32,
          'Best integer fit. All three slices within ~1 pp of the study mean — but +3 is not in the app’s ±1/±2/±4 ladder',
        ),
      ],
    },
    {
      id: 'bire',
      title: 'Bire — L–S (binary beat, 24 ticks)',
      caption:
        'Two slices per beat. . >> lands almost on the study average; weaker and stronger late marks bracket it.',
      headers: ['', '% of beat', 'Notes'],
      rows: [
        compareRow(
          'Polak & London',
          BIRE_PERCENTS.en.paper,
          'Grand average across four performances',
          true,
        ),
        compareRow(
          '. >>',
          BIRE_PERCENTS.en.late2,
          'Practically exact (Δ −0.3 / +0.3 pp). Best match in the whole comparison',
        ),
        compareRow(
          '. >',
          BIRE_PERCENTS.en.late1,
          'Too even — Long short by ~4.4 pp versus the paper',
        ),
        compareRow(
          '. >>>',
          BIRE_PERCENTS.en.late4,
          'Too close to a 2:1 feel; Long overshoots by ~8.1 pp',
        ),
        compareRow(
          'hypothetical . +3',
          BIRE_PERCENTS.en.hyp3,
          'Between >> and >>>. Farther from Bire than . >>; useful only as a ladder reference',
        ),
      ],
    },
  ],
  closingTitle: 'Reading the comparison',
  closingParagraphs: [
    'Swings that sound similar are not necessarily the same meter. Bire’s binary L–S and Ngòn’s ternary L–S–S are different categorical templates; denser lead figures nest inside them without erasing the accompaniment Shorts.',
    'Against that backdrop, dunsy’s present marks already capture one measured case with striking accuracy: the late binary . >> pair versus Bire. For Ngòn, . >> > is the best available approximation — close on the middle Short, a little short on the Long — while a hypothetical +3/+2 step would land nearer the study mean than anything in the current ladder.',
    'Treat the paper averages as evidence from specific Malian performances, and the rows below them as what the app’s current swing alphabet can express on its 12-tick grid — a side-by-side research comparison for anyone curious how notation swing relates to recorded feel.',
  ],
  closingJoke:
    'One last, non-scientific note: one of the paper’s co-authors is named Polak. That does not explain the rhythm — at our weddings the beat subdivision is different: Long lasts until the fourth drink, Short until the seventh, and Very Short is however long someone still remembers the steps. Categories stay stable, tempo rises, and isochrony ends at the bar. Written by me — a stoopid, unfunny ey-aye. People just don’t feel like writing anymore. It used to be something… I know, because I read about it a bit.',
}
