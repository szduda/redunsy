import { describe, expect, it } from 'vitest'

import { keyboardSounds, soundForDigit, digitForSound } from '@/features/editor/instrument-sounds'
import { flamSymbolsForInstrument } from '@/features/editor/flam-sounds'

describe('editor keyboard sounds', () => {
  it('keeps pause out of digit-mapped keyboard sounds', () => {
    expect(keyboardSounds('djembe')).not.toContain('-')
    expect(soundForDigit('djembe', 0)).toBeNull()
  })

  it('includes all djembe flam symbols in the instrument font', () => {
    const sounds = keyboardSounds('djembe')
    flamSymbolsForInstrument('djembe').forEach((symbol) => {
      expect(sounds).toContain(symbol)
    })
  })

  it('maps digits to keyboard sounds', () => {
    expect(soundForDigit('djembe', 1)).toBe('b')
    expect(digitForSound('djembe', 'b')).toBe('1')
    expect(digitForSound('djembe', 't')).toBe('2')
  })
})
