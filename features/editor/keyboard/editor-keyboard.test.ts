import { describe, expect, it } from 'vitest'

import {
  keyboardSounds,
  soundForDigit,
  digitForSound,
  soundHintLabel,
  soundHintMeta,
} from '@/features/editor/instrument-sounds'
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

  it('maps sound hint labels by instrument', () => {
    expect(soundHintLabel('djembe', 'b')).toBe('bass')
    expect(soundHintLabel('djembe', 't')).toBe('tone')
    expect(soundHintLabel('djembe', 's')).toBe('slap')
    expect(soundHintLabel('djembe', 'f')).toBe('slaps')
    expect(soundHintLabel('djembe', 'r')).toBe('tones')
    expect(soundHintLabel('djembe', 'g')).toBe('slaptones')
    expect(soundHintLabel('djembe', 'j')).toBe('')
    expect(soundHintLabel('djembe', 'c')).toBe('basstones')
    expect(soundHintLabel('djembe', 'd')).toBe('')
    expect(soundHintLabel('sangban', 'o')).toBe('open')
    expect(soundHintLabel('kenkeni', 'x')).toBe('close')
    expect(soundHintLabel('dundunba', 'o')).toBe('open')
  })

  it('maps sound hint label class names for long flam labels', () => {
    expect(soundHintMeta('djembe', 'g')).toEqual({
      label: 'slaptones',
      labelClassName: '-translate-x-[10px]',
    })
    expect(soundHintMeta('djembe', 'c')).toEqual({
      label: 'basstones',
      labelClassName: '-translate-x-[10px]',
    })
    expect(soundHintMeta('djembe', 'b')).toEqual({ label: 'bass' })
  })
})
