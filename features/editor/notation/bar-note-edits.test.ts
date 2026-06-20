import { describe, expect, it } from 'vitest'

import {
  convertToEighth,
  convertToSixteenth,
  convertToTriplet,
  flattenBarNotes,
  navigateSelection,
  setNoteAtGlyph,
} from '@/features/editor/notation/bar-note-edits'
import { barCellCount } from '@/lib/midinike/notation/cell-duration'

describe('bar-note-edits', () => {
  it('flattens glyphs across bars', () => {
    const flat = flattenBarNotes(['tt', '[ss]'])
    expect(flat).toHaveLength(4)
    expect(flat[2]?.kind).toBe('eighth')
    expect(flat[3]?.kind).toBe('sixteenth')
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

  it('updates a plain note', () => {
    expect(setNoteAtGlyph('tsb', 1, 't')).toBe('ttb')
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
