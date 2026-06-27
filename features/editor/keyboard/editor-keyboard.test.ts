import { describe, expect, it } from 'vitest'

import { keyboardSounds } from '@/features/editor/instrument-sounds'
import { flamSymbolsForInstrument } from '@/features/editor/flam-sounds'

describe('editor keyboard sounds', () => {
  it('keeps pause out of digit-mapped keyboard sounds', () => {
    expect(keyboardSounds('djembe')).not.toContain('-')
  })

  it('includes all djembe flam symbols in the instrument font', () => {
    const sounds = keyboardSounds('djembe')
    flamSymbolsForInstrument('djembe').forEach((symbol) => {
      expect(sounds).toContain(symbol)
    })
  })

  it('separates regular strokes from flam symbols', () => {
    const flams = new Set(flamSymbolsForInstrument('djembe'))
    const regular = keyboardSounds('djembe').filter((sound) => !flams.has(sound))
    expect(regular).toEqual(['b', 't', 's'])
  })
})
