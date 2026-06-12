import { describe, expect, it } from 'vitest'

import { parseBarLayout } from './bar-layout'

describe('parseBarLayout', () => {
  it('places plain 8th notes on whole cell boundaries', () => {
    const layout = parseBarLayout('ttstts')
    expect(layout.cellCount).toBe(6)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 1, 2, 3, 4, 5])
    expect(layout.glyphs.every((g) => g.kind === 'eighth')).toBe(true)
  })

  it('places 16th pair with second note midway to next 8th', () => {
    const layout = parseBarLayout('[tt]')
    expect(layout.cellCount).toBe(1)
    expect(layout.glyphs).toEqual([
      { note: 't', position: 0, kind: 'eighth' },
      { note: 't', position: 0.5, kind: 'sixteenth' },
    ])
  })

  it('places triplet notes across two 8th cells', () => {
    const layout = parseBarLayout('{ttt}')
    expect(layout.cellCount).toBe(2)
    expect(layout.glyphs).toEqual([
      { note: 't', position: 0, kind: 'eighth' },
      { note: 't', position: 2 / 3, kind: 'triplet' },
      { note: 't', position: 4 / 3, kind: 'triplet' },
    ])
  })

  it('lays out mixed 16th and 8th bar on stable 8th grid', () => {
    const layout = parseBarLayout('[tt]ts')
    expect(layout.cellCount).toBe(3)
    expect(layout.glyphs.map((g) => g.position)).toEqual([0, 0.5, 1, 2])
    expect(layout.glyphs.map((g) => g.kind)).toEqual([
      'eighth',
      'sixteenth',
      'eighth',
      'eighth',
    ])
  })

  it('renders rest between triplet groups after glue hyphen', () => {
    const layout = parseBarLayout('s{tts}-{stt}')
    expect(layout.cellCount).toBe(6)
    expect(layout.glyphs).toEqual([
      { note: 's', position: 0, kind: 'eighth' },
      { note: 't', position: 1, kind: 'eighth' },
      { note: 't', position: 1 + 2 / 3, kind: 'triplet' },
      { note: 's', position: 1 + 4 / 3, kind: 'triplet' },
      { note: '-', position: 3, kind: 'eighth' },
      { note: 's', position: 4, kind: 'eighth' },
      { note: 't', position: 4 + 2 / 3, kind: 'triplet' },
      { note: 't', position: 4 + 4 / 3, kind: 'triplet' },
    ])
  })
})
