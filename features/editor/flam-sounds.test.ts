import { describe, expect, it } from 'vitest'

import {
  defaultFlamForNote,
  DJEMBE_FLAMS,
  flamMainNote,
  flamSymbolsForInstrument,
  isFlamSymbol,
} from '@/features/editor/flam-sounds'

describe('flam-sounds', () => {
  it('lists djembe flam combinations without bass-main flams', () => {
    expect(flamSymbolsForInstrument('djembe')).toHaveLength(6)
    expect(DJEMBE_FLAMS.map((flam) => `${flam.grace}${flam.main}`)).toEqual([
      'ss',
      'tt',
      'ts',
      'st',
      'bt',
      'bs',
    ])
  })

  it('maps legacy r and f symbols to tone and slap doubles', () => {
    expect(flamMainNote('r')).toBe('t')
    expect(flamMainNote('f')).toBe('s')
  })

  it('returns the main stroke when disabling flam on mixed flams', () => {
    expect(flamMainNote('c')).toBe('t')
    expect(flamMainNote('g')).toBe('s')
  })

  it('assigns default double flams for tone and slap only', () => {
    expect(defaultFlamForNote('b')).toBeNull()
    expect(defaultFlamForNote('t')).toBe('r')
    expect(defaultFlamForNote('s')).toBe('f')
  })

  it('recognises flam symbols only for djembe', () => {
    expect(isFlamSymbol('r', 'djembe')).toBe(true)
    expect(isFlamSymbol('r', 'dundunba')).toBe(false)
  })
})
