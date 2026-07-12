import { describe, expect, it } from 'vitest'

import {
  convertBarsToEighth,
  convertBarsToTriplet,
  convertToEighth,
  convertToSixteenth,
  convertToTriplet,
  defaultNoteSelection,
  flattenBarNotes,
  navigateBarSelection,
  navigateSelection,
  setNoteAtGlyphInBar,
} from '@/features/editor/notation/bar-note-edits'
import { barCellCount } from '@/lib/midinike/notation/cell-duration'
import { barsCellCounts } from '@/lib/midinike/notation/grouped-notation'

describe('bar-note-edits', () => {
  it('flattens glyphs across bars', () => {
    const flat = flattenBarNotes(['tt', '[ss]'])
    expect(flat).toHaveLength(4)
    expect(flat[2]?.kind).toBe('eighth')
    expect(flat[3]?.kind).toBe('sixteenth')
  })

  it('defaults to the first note of the first bar', () => {
    expect(defaultNoteSelection(['tsb', '---'])).toEqual({ barIndex: 0, glyphIndex: 0 })
    expect(defaultNoteSelection([])).toBeNull()
  })

  it('navigates between notes', () => {
    const bars = ['tt', 'ss']
    const first = navigateSelection(bars, null, 1)
    expect(first).toEqual({ barIndex: 0, glyphIndex: 0 })
    const second = navigateSelection(bars, first, 1)
    expect(second).toEqual({ barIndex: 0, glyphIndex: 1 })
    const third = navigateSelection(bars, second, 1)
    expect(third).toEqual({ barIndex: 1, glyphIndex: 0 })
  })

  it('navigates between bars', () => {
    const bars = ['tt', 'ss', 'bb']
    const first = navigateBarSelection(bars, null, 1)
    expect(first).toEqual({ barIndex: 0, glyphIndex: 0 })
    const second = navigateBarSelection(bars, first, 1)
    expect(second).toEqual({ barIndex: 1, glyphIndex: 0 })
    const third = navigateBarSelection(bars, second, 1)
    expect(third).toEqual({ barIndex: 2, glyphIndex: 0 })
    expect(navigateBarSelection(bars, third, 1)).toEqual(third)
    expect(navigateBarSelection(bars, first, -1)).toEqual(first)
  })

  it('updates a sixteenth rest inside a group', () => {
    expect(setNoteAtGlyphInBar('[t-]sb', 1, 'r')).toBe('[tr]sb')
  })

  it('updates a plain note', () => {
    expect(setNoteAtGlyphInBar('tsb', 1, 't')).toBe('ttb')
  })

  it('converts plain 8th to 16th group without changing bar length', () => {
    const bar = 'tsb'
    const next = convertToSixteenth(bar, 0)
    expect(next).toBe('[t-]sb')
    expect(barCellCount(next)).toBe(barCellCount(bar))
  })

  it('converts two plain 8ths to a triplet group without changing bar length', () => {
    const bar = 'tsb'
    const next = convertToTriplet(bar, 0)
    expect(next).toBe('{ts-}b')
    expect(barCellCount(next)).toBe(barCellCount(bar))
  })

  it('converts a later plain 8th pair into a triplet group', () => {
    const bar = 'tsb'
    const next = convertToTriplet(bar, 1)
    expect(next).toBe('t{sb-}')
    expect(barCellCount(next)).toBe(barCellCount(bar))
  })

  it('does not convert a lone trailing 8th to triplet', () => {
    expect(convertToTriplet('tsb', 2)).toBe('tsb')
  })

  it('converts 16th group to single 8th using first note', () => {
    const bar = '[tt]ss'
    const next = convertToEighth(bar, 1)
    expect(next).toBe('tss')
    expect(barCellCount(next)).toBe(barCellCount(bar))
  })

  it('converts triplet group to two 8th notes without changing bar length', () => {
    const bar = 's{tts}'
    const next = convertToEighth(bar, 2)
    expect(next).toBe('stt')
    expect(barCellCount(next)).toBe(barCellCount(bar))
  })
})

describe('cross-bar conversions', () => {
  it('converts the last plain 8th and first plain 8th of the next bar into a split triplet', () => {
    const bars = ['-----t', 't-----']
    const lastGlyph = flattenBarNotes(bars).findIndex(
      (note) => note.barIndex === 0 && note.glyphIndex === flattenBarNotes(['-----t']).length - 1,
    )
    const next = convertBarsToTriplet(bars, { barIndex: 0, glyphIndex: lastGlyph }, 6)
    expect(next).toEqual(['-----{tt', '-}-----'])
    expect(barsCellCounts(next)).toEqual([6, 6])
  })

  it('validates converted cross-bar triplets for playback cell counts', () => {
    const bars = ['sss-s{ss', 's}-----']
    expect(barsCellCounts(bars)).toEqual([6, 6])
  })

  it('appends a bar when converting the final plain 8th without a next bar', () => {
    const bars = ['-----t']
    const lastGlyph = flattenBarNotes(bars).length - 1
    const next = convertBarsToTriplet(bars, { barIndex: 0, glyphIndex: lastGlyph }, 6)
    expect(next).toHaveLength(2)
    expect(next[0]).toBe('-----{t-')
    expect(next[1]).toBe('-}-----')
    expect(barsCellCounts(next)).toEqual([6, 6])
  })

  it('preserves joined notation across bar boundaries', () => {
    const bars = ['-----t', 't-----']
    const lastGlyph = flattenBarNotes(['-----t']).length - 1
    const converted = convertBarsToTriplet(bars, { barIndex: 0, glyphIndex: lastGlyph }, 6)
    expect(converted.join('')).toBe('-----{tt-}-----')
  })

  it('unwraps only the selected sixteenth unit inside a multi-unit bracket group', () => {
    const bars = ['-}st-t{tt', '-}-s[ttt-s-]', '[ttt-]ssbt']
    const next = convertBarsToEighth(bars, { barIndex: 1, glyphIndex: 3 })
    expect(next[1]).toBe('-}-s[tt-s-]')
    expect(next[1]).not.toBe('-}-st')
    expect(barsCellCounts(next)[1]).toBe(6)
  })

  it('converts a plain pair after a cross-bar triplet continuation using bar context', () => {
    const bars = ['-}st-t{tt', '-}-s[ttt-s-]', '[ttt-]ssbt']
    const next = convertBarsToTriplet(bars, { barIndex: 1, glyphIndex: 1 }, 6)
    expect(next[1]).toBe('-}{-s-}[ttt-s-]')
    expect(next[1]).not.toContain('-{}--')
  })

  it('keeps trailing symbols on the first bar during cross-bar triplet conversion', () => {
    const bars = ['ttt-st', 't-----']
    const next = convertBarsToTriplet(bars, { barIndex: 0, glyphIndex: 4 }, 6)
    expect(next[0]).toBe('ttt-{st-}')
    expect(next[1]).toBe('t-----')
    expect(barsCellCounts(next)).toEqual([6, 6])
  })
})
