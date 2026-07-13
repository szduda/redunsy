import { describe, expect, it } from 'vitest'

import { noteKeyShadowStyle, toneFromEditKind } from '@/features/editor/keyboard/note-length-style'

describe('note-length-style', () => {
  it('maps edit kinds to length tones', () => {
    expect(toneFromEditKind('plain')).toBe('8th')
    expect(toneFromEditKind('triplet')).toBe('triplet')
    expect(toneFromEditKind('sixteenth')).toBe('16th')
    expect(toneFromEditKind('polyrhythm')).toBe('polyrhythm')
    expect(toneFromEditKind(null)).toBe('8th')
  })

  it('omits shadows for plain 8th note keys', () => {
    const style = noteKeyShadowStyle('8th')
    expect(style.boxShadow).toBeUndefined()
  })

  it('builds stacked low-opacity shadows for subdivided note keys', () => {
    const style = noteKeyShadowStyle('triplet')
    expect(style.boxShadow).toContain('rgba(46, 130, 105')
    expect(String(style.boxShadow).match(/0 0/g)?.length).toBe(3)
  })

  it('uses red shadows for polyrhythm note keys', () => {
    const style = noteKeyShadowStyle('polyrhythm')
    expect(style.boxShadow).toContain('rgba(237, 60, 25')
  })

  it('adds flam gradient accent on top of length shadow', () => {
    const style = noteKeyShadowStyle('16th', true)
    expect(style.backgroundImage).toContain('linear-gradient')
    expect(style.boxShadow).toContain('rgba(210, 183, 105')
  })
})
