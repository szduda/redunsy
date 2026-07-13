import { describe, expect, it } from 'vitest'

import { polyrhythmBracketSpans, scaledPolyrhythmNoteRect } from './polyrhythm-brackets'
import { layoutBar } from './renderers'

describe('polyrhythmBracketSpans', () => {
  it('returns one 4:3 bracket span for a self-contained polyrhythm group', () => {
    const bars = ['<fststs>----']
    const layouts = bars.map((_, barIndex) =>
      layoutBar({ bars, canvasWidth: 240, barIndex, barsPerRow: 1 }),
    )
    const spans = polyrhythmBracketSpans(bars, layouts, 1)
    expect(spans).toHaveLength(1)
    expect(spans[0]?.showLabel).toBe(true)
    expect(spans[0]?.endCaps).toBe('both')
    expect(spans[0]?.right).toBeGreaterThan(spans[0]?.left ?? 0)
  })
})

describe('scaledPolyrhythmNoteRect', () => {
  const baseNote = {
    type: 'note' as const,
    colour: '#fff',
    bgColor: '#000',
    width: 40,
    height: 30,
    top: 10,
    left: 20,
    note: 't',
    barIndex: 0,
    noteIndex: 0,
  }

  it('keeps shared slot vertically centered at 75% scale', () => {
    const rect = scaledPolyrhythmNoteRect(baseNote, {
      note: 'f',
      position: 0,
      kind: 'eighth',
      polyrhythmIndex: 0,
    })
    expect(rect.width).toBeCloseTo(30)
    expect(rect.height).toBeCloseTo(22.5)
    expect(rect.top).toBeCloseTo(13.75)
  })

  it('places sixteenth slots at 15% cell height', () => {
    const rect = scaledPolyrhythmNoteRect(baseNote, {
      note: 's',
      position: 0.5,
      kind: 'polyrhythm',
      polyrhythmIndex: 1,
    })
    expect(rect.top).toBeCloseTo(8.65)
  })

  it('places triplet slots at 85% cell height', () => {
    const rect = scaledPolyrhythmNoteRect(baseNote, {
      note: 't',
      position: 2 / 3,
      kind: 'polyrhythm',
      polyrhythmIndex: 2,
    })
    expect(rect.top).toBeCloseTo(18.85)
  })
})
